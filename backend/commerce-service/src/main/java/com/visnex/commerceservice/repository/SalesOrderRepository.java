package com.visnex.commerceservice.repository;

import com.visnex.commerceservice.domain.OrderStatus;
import com.visnex.commerceservice.entity.SalesOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {

    /**
     * Clave de idempotencia del webhook: WooCommerce reintenta las entregas
     * fallidas, asi que el mismo pedido puede llegar varias veces.
     */
    Optional<SalesOrder> findFirstByExternalOrderIdAndIdChannelAndActive(
            String externalOrderId, Long idChannel, Boolean active);

    Page<SalesOrder> findByCompanyIdAndActive(Long companyId, Boolean active, Pageable pageable);

    Page<SalesOrder> findByCompanyIdAndStatusAndActive(
            Long companyId, OrderStatus status, Boolean active, Pageable pageable);

    /** Cola de confirmacion: lo primero que hay que atacar cada manana. */
    List<SalesOrder> findByCompanyIdAndStatusAndActiveOrderByCreationAsc(
            Long companyId, OrderStatus status, Boolean active);

    long countByCompanyIdAndStatusAndActive(Long companyId, OrderStatus status, Boolean active);

    /**
     * Tasa de entrega por periodo — el numero que decide si el negocio gana o
     * pierde plata. El CPA real es el CPA de Meta dividido por esta tasa.
     */
    @Query("""
           SELECT o.status, COUNT(o)
           FROM SalesOrder o
           WHERE o.companyId = :companyId
             AND o.active = true
             AND o.creation BETWEEN :from AND :to
           GROUP BY o.status
           """)
    List<Object[]> countByStatusBetween(@Param("companyId") Long companyId,
                                        @Param("from") LocalDateTime from,
                                        @Param("to") LocalDateTime to);
}
