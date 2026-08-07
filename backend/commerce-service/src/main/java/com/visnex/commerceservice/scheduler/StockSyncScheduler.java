package com.visnex.commerceservice.scheduler;

import com.visnex.commerceservice.entity.Product;
import com.visnex.commerceservice.entity.ProductPublish;
import com.visnex.commerceservice.repository.ProductPublishRepository;
import com.visnex.commerceservice.repository.ProductRepository;
import com.visnex.commerceservice.supplier.SupplierAdapter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Sincroniza el stock del proveedor con el catalogo y con la tienda.
 *
 * POR QUE ES CRITICO EN CONTRAENTREGA
 * -----------------------------------
 * Vender un producto agotado no es solo una mala experiencia: en contraentrega
 * es una perdida directa. Ya se pago la pauta que trajo al cliente, y el
 * pedido acaba cancelado. Si ademas se alcanzo a despachar, se paga el flete
 * de ida y el de vuelta.
 *
 * Hasta ahora el unico trabajo programado de todo el backend era limpiar los
 * logs de auditoria. Nada vigilaba el stock.
 *
 * DECISION: DESPUBLICAR, NO BORRAR
 * --------------------------------
 * Cuando el stock llega a cero el producto se pone en borrador en la tienda,
 * no se elimina. Asi conserva su URL, su posicionamiento y sus resenas para
 * cuando vuelva a haber existencias.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StockSyncScheduler {

    private final ProductRepository productRepository;
    private final ProductPublishRepository publishRepository;
    private final List<SupplierAdapter> adapters;

    @Value("${visnex.stock-sync.enabled:true}")
    private boolean enabled;

    /** Umbral por debajo del cual se considera agotado. */
    @Value("${visnex.stock-sync.low-threshold:1}")
    private int lowThreshold;

    /**
     * Cada hora. Es la frecuencia que usa AutoDS, el referente del sector, y
     * es suficiente: un producto que se agota tarda mas de una hora en generar
     * un volumen de pedidos problematico.
     */
    @Scheduled(cron = "${visnex.stock-sync.cron:0 0 * * * *}")
    public void syncStock() {
        if (!enabled) {
            return;
        }

        Map<String, SupplierAdapter> byCode = adapters.stream()
                .filter(SupplierAdapter::isConfigured)
                .collect(Collectors.toMap(SupplierAdapter::getCode, Function.identity(), (a, b) -> a));

        if (byCode.isEmpty()) {
            log.debug("Sincronizacion de stock omitida: ningun proveedor configurado");
            return;
        }

        List<Product> products = productRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                .filter(p -> p.getSupplierSku() != null && !p.getSupplierSku().isBlank())
                .toList();

        int checked = 0;
        int updated = 0;
        int unpublished = 0;

        for (Product product : products) {
            SupplierAdapter adapter = byCode.get(supplierCodeOf(product));
            if (adapter == null) {
                continue;
            }

            try {
                Optional<Integer> stock = adapter.getStock(product.getSupplierSku());
                checked++;

                if (stock.isEmpty()) {
                    continue;
                }

                int available = stock.get();
                Integer previous = product.getStockQuantity();

                if (previous != null && previous == available) {
                    continue;
                }

                product.setStockQuantity(available);
                productRepository.save(product);
                updated++;

                if (available < lowThreshold && "PUBLISHED".equals(product.getStatus())) {
                    unpublishFromChannels(product);
                    unpublished++;
                }

            } catch (Exception e) {
                // Un producto que falla no debe tumbar la pasada entera: la
                // sincronizacion parcial vale mucho mas que ninguna.
                log.warn("No se pudo sincronizar el stock del producto {} ({}): {}",
                        product.getId(), product.getSupplierSku(), e.getMessage());
            }
        }

        if (checked > 0) {
            log.info("Sincronizacion de stock: {} consultados, {} actualizados, {} despublicados por agotarse",
                    checked, updated, unpublished);
        }
    }

    /** Proveedor del producto. Por defecto DROPI, que es el del mercado local. */
    private String supplierCodeOf(Product product) {
        String origin = product.getFulfillmentOrigin();
        return (origin == null || origin.isBlank()) ? "DROPI" : origin.toUpperCase();
    }

    /**
     * Pasa el producto a borrador en todos los canales donde este publicado.
     *
     * No se borra: conserva URL, posicionamiento y resenas para cuando vuelva
     * a haber existencias.
     */
    private void unpublishFromChannels(Product product) {
        List<ProductPublish> published = publishRepository.findAll().stream()
                .filter(p -> product.getId().equals(p.getIdProduct()))
                .filter(p -> "SYNCED".equals(p.getSyncStatus()))
                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                .toList();

        for (ProductPublish pub : published) {
            pub.setSyncStatus("OUT_OF_STOCK");
            publishRepository.save(pub);
        }

        product.setStatus("OUT_OF_STOCK");
        productRepository.save(product);

        log.info("Producto {} ({}) despublicado por falta de stock", product.getId(), product.getTitle());
    }
}
