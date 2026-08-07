package com.visnex.commerceservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.entity.Product;
import com.visnex.commerceservice.entity.ProductPublish;
import com.visnex.commerceservice.entity.PublishChannel;
import com.visnex.commerceservice.repository.ProductImageRepository;
import com.visnex.commerceservice.repository.ProductPublishRepository;
import com.visnex.commerceservice.repository.ProductRepository;
import com.visnex.commerceservice.repository.PublishChannelRepository;
import com.visnex.commerceservice.service.implementation.WooCommercePublishService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests de regresion de la publicacion a WooCommerce.
 *
 * El caso central es el BUG DE IDEMPOTENCIA: los intentos fallidos se guardan
 * con active=true, y la comprobacion de duplicado buscaba por active=true. Eso
 * hacia que un unico fallo de red dejara el producto imposible de republicar
 * para siempre — habia que borrar la fila a mano en la base de datos.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class WooCommercePublishServiceTest {

    private static final Long PRODUCT_ID = 7L;
    private static final Long CHANNEL_ID = 3L;
    private static final String SYNCED = "SYNCED";
    private static final String FAILED = "FAILED";

    @Mock private ProductRepository productRepository;
    @Mock private PublishChannelRepository channelRepository;
    @Mock private ProductPublishRepository publishRepository;
    @Mock private ProductImageRepository productImageRepository;
    @Mock private RestTemplate restTemplate;

    @SuppressWarnings("unused")
    private final ObjectMapper objectMapper = new ObjectMapper();

    private WooCommercePublishService service;

    @BeforeEach
    void setUp() {
        service = new WooCommercePublishService(
                productRepository, channelRepository, publishRepository,
                productImageRepository, objectMapper, restTemplate);

        Product product = new Product();
        product.setId(PRODUCT_ID);
        product.setTitle("Camisa de lino");
        product.setBasePrice(new BigDecimal("15.00"));
        product.setCompanyId(1L);
        product.setSubsidiaryId(1L);
        product.setIdModifiedBy(1L);

        PublishChannel channel = new PublishChannel();
        channel.setId(CHANNEL_ID);
        channel.setConfig("{\"siteUrl\":\"http://wordpress\",\"consumerKey\":\"ck_x\",\"consumerSecret\":\"cs_x\"}");

        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(product));
        when(channelRepository.findById(CHANNEL_ID)).thenReturn(Optional.of(channel));
        when(productImageRepository.findByIdProductAndActiveOrderBySortOrderAsc(PRODUCT_ID, true))
                .thenReturn(Collections.emptyList());
        when(publishRepository.save(any(ProductPublish.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private void noHaySynced() {
        when(publishRepository.findFirstByIdProductAndIdChannelAndSyncStatusAndActive(
                PRODUCT_ID, CHANNEL_ID, SYNCED, true)).thenReturn(Optional.empty());
    }

    private void hayFalloPrevio(ProductPublish fallo) {
        when(publishRepository.findFirstByIdProductAndIdChannelAndSyncStatusAndActive(
                PRODUCT_ID, CHANNEL_ID, FAILED, true)).thenReturn(Optional.ofNullable(fallo));
    }

    private void wcRespondeOk() {
        when(restTemplate.exchange(contains("/wp-json/wc/v3/products"), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(
                        "{\"id\":9001,\"permalink\":\"http://wordpress/producto/camisa-de-lino\"}", HttpStatus.CREATED));
    }

    // =========================================================================
    //  REGRESION: el bug de idempotencia
    // =========================================================================

    @Test
    @DisplayName("REGRESION: tras un fallo de red, el producto SI se puede volver a publicar")
    void reintentoTrasFalloFunciona() {
        // Un intento anterior fallo y quedo guardado con active=true.
        ProductPublish falloPrevio = new ProductPublish();
        falloPrevio.setId(55L);
        falloPrevio.setIdProduct(PRODUCT_ID);
        falloPrevio.setIdChannel(CHANNEL_ID);
        falloPrevio.setSyncStatus(FAILED);
        falloPrevio.setLastError("Connection timed out");
        falloPrevio.setActive(true);

        noHaySynced();
        hayFalloPrevio(falloPrevio);
        wcRespondeOk();

        ResultDTO result = service.publishProduct(PRODUCT_ID, CHANNEL_ID, "es");

        assertTrue(result.isCorrect(),
                "Un intento fallido previo NO debe bloquear el reintento. Mensaje: " + result.getMessage());
        assertNotEquals(101, result.getErrorCode(), "No debe responder 'already published'");
    }

    @Test
    @DisplayName("REGRESION: el reintento REUTILIZA la fila fallida, no acumula filas nuevas")
    void reintentoReutilizaLaFila() {
        ProductPublish falloPrevio = new ProductPublish();
        falloPrevio.setId(55L);
        falloPrevio.setSyncStatus(FAILED);
        falloPrevio.setLastError("Connection timed out");
        falloPrevio.setActive(true);

        noHaySynced();
        hayFalloPrevio(falloPrevio);
        wcRespondeOk();

        service.publishProduct(PRODUCT_ID, CHANNEL_ID, "es");

        ArgumentCaptor<ProductPublish> captor = ArgumentCaptor.forClass(ProductPublish.class);
        verify(publishRepository).save(captor.capture());
        ProductPublish guardado = captor.getValue();

        assertEquals(55L, guardado.getId(), "Debe reutilizar la fila 55, no crear otra");
        assertEquals(SYNCED, guardado.getSyncStatus());
        assertNull(guardado.getLastError(), "Al tener exito debe limpiarse el error anterior");
        assertEquals("9001", guardado.getExternalId());
    }

    @Test
    @DisplayName("Una publicacion EXITOSA previa si bloquea el duplicado")
    void publicacionExitosaBloqueaDuplicado() {
        ProductPublish yaPublicado = new ProductPublish();
        yaPublicado.setSyncStatus(SYNCED);
        yaPublicado.setExternalId("9001");
        yaPublicado.setActive(true);

        when(publishRepository.findFirstByIdProductAndIdChannelAndSyncStatusAndActive(
                PRODUCT_ID, CHANNEL_ID, SYNCED, true)).thenReturn(Optional.of(yaPublicado));

        ResultDTO result = service.publishProduct(PRODUCT_ID, CHANNEL_ID, "es");

        assertFalse(result.isCorrect());
        assertEquals(101, result.getErrorCode());
        verify(restTemplate, never()).exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class));
    }

    // =========================================================================
    //  Manejo de fallos
    // =========================================================================

    @Test
    @DisplayName("Si WooCommerce no responde, se guarda FAILED y el producto NO queda PUBLISHED")
    void falloDeRedNoMarcaPublicado() {
        noHaySynced();
        hayFalloPrevio(null);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenThrow(new ResourceAccessException("Connection timed out"));

        ResultDTO result = service.publishProduct(PRODUCT_ID, CHANNEL_ID, "es");

        assertFalse(result.isCorrect());
        assertEquals(103, result.getErrorCode());

        ArgumentCaptor<ProductPublish> captor = ArgumentCaptor.forClass(ProductPublish.class);
        verify(publishRepository).save(captor.capture());
        assertEquals(FAILED, captor.getValue().getSyncStatus());

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Un producto sin precio base no se publica")
    void sinPrecioBaseNoPublica() {
        Product sinPrecio = new Product();
        sinPrecio.setId(PRODUCT_ID);
        sinPrecio.setBasePrice(null);
        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(sinPrecio));

        ResultDTO result = service.publishProduct(PRODUCT_ID, CHANNEL_ID, "es");

        assertFalse(result.isCorrect());
        assertEquals(102, result.getErrorCode());
        verify(restTemplate, never()).exchange(anyString(), any(HttpMethod.class), any(), eq(String.class));
    }

    // =========================================================================
    //  Actualizacion (PUT) - antes no existia
    // =========================================================================

    @Test
    @DisplayName("update() envia PUT al id externo de WooCommerce")
    void updateEnviaPut() {
        ProductPublish yaPublicado = new ProductPublish();
        yaPublicado.setId(70L);
        yaPublicado.setSyncStatus(SYNCED);
        yaPublicado.setExternalId("9001");
        yaPublicado.setActive(true);

        when(publishRepository.findFirstByIdProductAndIdChannelAndSyncStatusAndActive(
                PRODUCT_ID, CHANNEL_ID, SYNCED, true)).thenReturn(Optional.of(yaPublicado));
        when(restTemplate.exchange(contains("/wp-json/wc/v3/products/9001"), eq(HttpMethod.PUT), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(
                        "{\"id\":9001,\"permalink\":\"http://wordpress/producto/camisa-de-lino\"}", HttpStatus.OK));

        ResultDTO result = service.updateProduct(PRODUCT_ID, CHANNEL_ID, "es");

        assertTrue(result.isCorrect(), "Mensaje: " + result.getMessage());
        verify(restTemplate).exchange(contains("/products/9001"), eq(HttpMethod.PUT), any(), eq(String.class));

        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) result.getObject();
        assertEquals(Boolean.TRUE, data.get("updated"));
    }

    @Test
    @DisplayName("update() sobre un producto no publicado responde error, no crea nada")
    void updateSinPublicacionPrevia() {
        noHaySynced();

        ResultDTO result = service.updateProduct(PRODUCT_ID, CHANNEL_ID, "es");

        assertFalse(result.isCorrect());
        assertEquals(102, result.getErrorCode());
        verify(restTemplate, never()).exchange(anyString(), any(HttpMethod.class), any(), eq(String.class));
    }
}
