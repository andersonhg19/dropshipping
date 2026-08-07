package com.visnex.commerceservice.service.implementation;

import com.visnex.commerceservice.domain.OrderStatus;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.entity.SalesOrder;
import com.visnex.commerceservice.repository.SalesOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Ciclo de vida de los pedidos.
 *
 * Todas las transiciones pasan por aqui. Ningun otro sitio escribe
 * directamente el campo `status`: asi la maquina de estados no se puede
 * saltar desde la UI ni desde un webhook.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderRepository orderRepository;

    /* =====================================================================
       Transicion generica
       ================================================================== */

    /**
     * Cambia el estado de un pedido validando la transicion.
     *
     * @param reason motivo, obligatorio al cancelar o devolver: sin el no se
     *               puede saber por que se pierde el 20-25% de los pedidos, y
     *               sin saberlo no se puede mejorar.
     */
    @Transactional
    public ResultDTO transition(Long orderId, OrderStatus target, String reason, Long userId) {
        Optional<SalesOrder> opt = orderRepository.findById(orderId);
        if (opt.isEmpty()) {
            return new ResultDTO(false, "Order not found", 102);
        }

        SalesOrder order = opt.get();
        OrderStatus current = order.getStatus();

        if (current == target) {
            // Idempotente: repetir la misma transicion no es un error. Los
            // webhooks se reintentan y no deben romper nada.
            return new ResultDTO(Map.of("id", order.getId(), "status", current.name(), "changed", false));
        }

        if (!current.canTransitionTo(target)) {
            String allowed = current.allowedNext().isEmpty()
                    ? "ninguno (estado final)"
                    : current.allowedNext().toString();
            return new ResultDTO(false,
                    "Transicion no permitida: " + current + " -> " + target + ". Permitidos: " + allowed, 102);
        }

        if (target.isLost() && (reason == null || reason.isBlank())) {
            return new ResultDTO(false, "Se requiere un motivo para " + target, 120);
        }

        order.setStatus(target);
        order.setIdModifiedBy(userId);

        switch (target) {
            case CONFIRMADA -> order.setConfirmedAt(LocalDateTime.now());
            case ENTREGADA -> order.setDeliveredAt(LocalDateTime.now());
            case CANCELADA, DEVUELTA -> order.setCloseReason(reason);
            default -> { /* sin efectos adicionales */ }
        }

        orderRepository.save(order);
        log.info("Pedido {} : {} -> {}{}", order.getId(), current, target,
                reason != null ? " (" + reason + ")" : "");

        return new ResultDTO(Map.of("id", order.getId(), "status", target.name(), "changed", true));
    }

    /* =====================================================================
       Atajos con nombre de negocio
       ================================================================== */

    /**
     * Confirmar es el paso que no se puede saltar: es lo que evita despachar
     * mercancia a alguien que no la va a recibir.
     */
    @Transactional
    public ResultDTO confirm(Long orderId, Long userId) {
        return transition(orderId, OrderStatus.CONFIRMADA, null, userId);
    }

    @Transactional
    public ResultDTO cancel(Long orderId, String reason, Long userId) {
        return transition(orderId, OrderStatus.CANCELADA, reason, userId);
    }

    @Transactional
    public ResultDTO markShipped(Long orderId, String supplierOrderId, Long userId) {
        ResultDTO result = transition(orderId, OrderStatus.ENVIADA_PROVEEDOR, null, userId);
        if (result.isCorrect() && supplierOrderId != null) {
            orderRepository.findById(orderId).ifPresent(o -> {
                o.setSupplierOrderId(supplierOrderId);
                orderRepository.save(o);
            });
        }
        return result;
    }

    @Transactional
    public ResultDTO markInTransit(Long orderId, String tracking, String carrier, String trackingUrl, Long userId) {
        ResultDTO result = transition(orderId, OrderStatus.EN_TRANSITO, null, userId);
        if (result.isCorrect()) {
            orderRepository.findById(orderId).ifPresent(o -> {
                o.setTrackingNumber(tracking);
                o.setCarrier(carrier);
                o.setTrackingUrl(trackingUrl);
                orderRepository.save(o);
            });
        }
        return result;
    }

    /* =====================================================================
       Cola de confirmacion
       ================================================================== */

    /** Pedidos nuevos esperando confirmacion, del mas antiguo al mas reciente. */
    @Transactional(readOnly = true)
    public List<SalesOrder> pendingConfirmation(Long companyId) {
        return orderRepository.findByCompanyIdAndStatusAndActiveOrderByCreationAsc(
                companyId, OrderStatus.NUEVA, true);
    }

    /* =====================================================================
       Metricas
       ================================================================== */

    /**
     * Tasa de entrega y CPA real del periodo.
     *
     * El CPA que reporta Meta es el CPA por PEDIDO, no por venta. Si el 25% de
     * los pedidos no se entrega, el costo real de adquirir un cliente es
     * CPA / tasa de entrega. Esta es la metrica que decide si la operacion
     * gana o pierde dinero, y es la que ningun panel de dropshipping muestra.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> deliveryMetrics(Long companyId, LocalDateTime from, LocalDateTime to, BigDecimal adSpend) {
        List<Object[]> rows = orderRepository.countByStatusBetween(companyId, from, to);

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            byStatus.put(s.name(), 0L);
        }

        long total = 0;
        long delivered = 0;
        long lost = 0;
        long open = 0;

        for (Object[] row : rows) {
            OrderStatus status = (OrderStatus) row[0];
            long count = ((Number) row[1]).longValue();
            byStatus.put(status.name(), count);
            total += count;
            if (status.isRevenue()) {
                delivered += count;
            } else if (status.isLost()) {
                lost += count;
            } else {
                open += count;
            }
        }

        // La tasa se calcula solo sobre pedidos CERRADOS. Incluir los que aun
        // estan en transito la subestima y hace tomar malas decisiones de pauta.
        long closed = delivered + lost;
        BigDecimal deliveryRate = closed == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(delivered)
                    .divide(BigDecimal.valueOf(closed), 4, RoundingMode.HALF_UP);

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("byStatus", byStatus);
        metrics.put("total", total);
        metrics.put("delivered", delivered);
        metrics.put("lost", lost);
        metrics.put("open", open);
        metrics.put("closed", closed);
        metrics.put("deliveryRate", deliveryRate);
        metrics.put("deliveryRatePercent", deliveryRate.multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_UP));

        if (adSpend != null && adSpend.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal reportedCpa = total == 0
                    ? BigDecimal.ZERO
                    : adSpend.divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);

            BigDecimal realCpa = delivered == 0
                    ? BigDecimal.ZERO
                    : adSpend.divide(BigDecimal.valueOf(delivered), 2, RoundingMode.HALF_UP);

            metrics.put("adSpend", adSpend);
            metrics.put("cpaReported", reportedCpa);
            metrics.put("cpaReal", realCpa);
            metrics.put("cpaGap", realCpa.subtract(reportedCpa));
        }

        return metrics;
    }
}
