package com.visnex.commerceservice.controller;

import com.visnex.commerceservice.domain.OrderStatus;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.entity.SalesOrder;
import com.visnex.commerceservice.repository.SalesOrderRepository;
import com.visnex.commerceservice.service.implementation.SalesOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * API de pedidos.
 *
 * Sigue la convencion del proyecto: todo POST, versionado /v2, cabecera lng.
 */
@RestController
@RequestMapping("/v2/order")
@RequiredArgsConstructor
@Tag(name = "Pedidos", description = "Ciclo de vida de los pedidos de venta")
public class SalesOrderController {

    private final SalesOrderService orderService;
    private final SalesOrderRepository orderRepository;

    @PostMapping("/all")
    @Operation(summary = "Lista pedidos, opcionalmente filtrados por estado")
    public ResultDTO all(@RequestBody Map<String, Object> body,
                         @RequestHeader(name = "lng", defaultValue = "es") String lng) {
        Long companyId = asLong(body.get("idCompany"));
        if (companyId == null) {
            return new ResultDTO(false, "idCompany es obligatorio", 120);
        }

        int page = body.get("page") == null ? 0 : Integer.parseInt(body.get("page").toString());
        int size = body.get("size") == null ? 20 : Math.min(200, Integer.parseInt(body.get("size").toString()));
        OrderStatus status = OrderStatus.fromString((String) body.get("status"));

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "creation"));

        Page<SalesOrder> result = status == null
                ? orderRepository.findByCompanyIdAndActive(companyId, true, pageable)
                : orderRepository.findByCompanyIdAndStatusAndActive(companyId, status, true, pageable);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("page", result.getNumber());
        payload.put("size", result.getSize());
        payload.put("totalPage", result.getTotalPages());
        payload.put("list", result.getContent());
        return new ResultDTO(payload);
    }

    @PostMapping("/get/{id}")
    @Operation(summary = "Detalle de un pedido")
    public ResultDTO get(@PathVariable Long id,
                         @RequestHeader(name = "lng", defaultValue = "es") String lng) {
        return orderRepository.findById(id)
                .map(ResultDTO::new)
                .orElseGet(() -> new ResultDTO(false, "Order not found", 102));
    }

    /**
     * Cola de confirmacion.
     *
     * Es la pantalla mas importante de la operacion diaria: cada pedido que
     * lleva horas aqui sin confirmar es un pedido con probabilidad creciente
     * de perderse.
     */
    @PostMapping("/pending-confirmation")
    @Operation(summary = "Pedidos nuevos esperando confirmacion con el cliente")
    public ResultDTO pendingConfirmation(@RequestBody Map<String, Object> body,
                                         @RequestHeader(name = "lng", defaultValue = "es") String lng) {
        Long companyId = asLong(body.get("idCompany"));
        if (companyId == null) {
            return new ResultDTO(false, "idCompany es obligatorio", 120);
        }
        return new ResultDTO(orderService.pendingConfirmation(companyId));
    }

    @PostMapping("/confirm")
    @Operation(summary = "Marca el pedido como confirmado con el cliente")
    public ResultDTO confirm(@RequestBody Map<String, Object> body,
                             @RequestHeader(name = "lng", defaultValue = "es") String lng) {
        return orderService.confirm(asLong(body.get("id")), asLong(body.get("idModifiedBy")));
    }

    @PostMapping("/cancel")
    @Operation(summary = "Cancela el pedido (requiere motivo)")
    public ResultDTO cancel(@RequestBody Map<String, Object> body,
                            @RequestHeader(name = "lng", defaultValue = "es") String lng) {
        return orderService.cancel(
                asLong(body.get("id")),
                (String) body.get("reason"),
                asLong(body.get("idModifiedBy")));
    }

    @PostMapping("/transition")
    @Operation(summary = "Cambia el estado validando la maquina de estados")
    public ResultDTO transition(@RequestBody Map<String, Object> body,
                                @RequestHeader(name = "lng", defaultValue = "es") String lng) {
        OrderStatus target = OrderStatus.fromString((String) body.get("status"));
        if (target == null) {
            return new ResultDTO(false, "Estado no valido", 102);
        }
        return orderService.transition(
                asLong(body.get("id")),
                target,
                (String) body.get("reason"),
                asLong(body.get("idModifiedBy")));
    }

    /**
     * Tasa de entrega y CPA real.
     *
     * Es la metrica que decide si la operacion gana o pierde plata, y la que
     * ningun panel de dropshipping muestra: el CPA que reporta Meta es por
     * PEDIDO, no por venta entregada.
     */
    @PostMapping("/metrics")
    @Operation(summary = "Tasa de entrega y CPA real del periodo")
    public ResultDTO metrics(@RequestBody Map<String, Object> body,
                             @RequestHeader(name = "lng", defaultValue = "es") String lng) {
        Long companyId = asLong(body.get("idCompany"));
        if (companyId == null) {
            return new ResultDTO(false, "idCompany es obligatorio", 120);
        }

        LocalDateTime to = body.get("to") == null
                ? LocalDateTime.now()
                : LocalDateTime.parse(body.get("to").toString());
        LocalDateTime from = body.get("from") == null
                ? to.minusDays(30)
                : LocalDateTime.parse(body.get("from").toString());

        BigDecimal adSpend = body.get("adSpend") == null
                ? null
                : new BigDecimal(body.get("adSpend").toString());

        return new ResultDTO(orderService.deliveryMetrics(companyId, from, to, adSpend));
    }

    private static Long asLong(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return Long.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
