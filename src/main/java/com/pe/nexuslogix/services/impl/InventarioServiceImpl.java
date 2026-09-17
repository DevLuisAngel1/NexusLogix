package com.pe.nexuslogix.services.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.pe.nexuslogix.models.MovimientoInventario;
import com.pe.nexuslogix.models.Producto;
import com.pe.nexuslogix.models.TipoMovimiento;
import com.pe.nexuslogix.repositories.MovimientoInventarioRepository;
import com.pe.nexuslogix.repositories.ProductoRepository;
import com.pe.nexuslogix.services.InventarioService;
import org.springframework.transaction.annotation.Transactional;



@Service 
public class InventarioServiceImpl implements InventarioService {

    private final ProductoRepository productoRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public InventarioServiceImpl(
            ProductoRepository productoRepository,
            MovimientoInventarioRepository movimientoRepository
    ) {
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
    }

    @Override
    @Transactional 
    public MovimientoInventario registrarMovimiento(Long productoId, TipoMovimiento tipoMovimiento, Integer cantidad,
            String referenciaDocumento, String motivo) {
        return registrarMovimiento(productoId, tipoMovimiento, cantidad, referenciaDocumento, motivo, 1L);
    }

    @Override
    @Transactional 
    public MovimientoInventario registrarMovimiento(Long productoId, TipoMovimiento tipoMovimiento, Integer cantidad,
            String referenciaDocumento, String motivo, Long usuarioId) {
        // 1. Validar cantidad
        if (cantidad == null || cantidad <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad debe ser mayor a 0"
            );
        }

        // 2. Validar tipo de movimiento
        if (tipoMovimiento == null) {
            throw new IllegalArgumentException(
                    "El tipo de movimiento es obligatorio"
            );
        }

        // 3. Buscar producto
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe el producto con ID: " + productoId
                ));

        // 4. Verificar que esté activo
        if (!Boolean.TRUE.equals(producto.getEstado())) {
            throw new IllegalArgumentException(
                    "No se puede modificar el inventario de un producto inactivo"
            );
        }

        // 5. Obtener stock actual
        int stockAnterior = producto.getStockActual();

        int stockPosterior;

        // 6. Calcular nuevo stock
        switch (tipoMovimiento) {

            case INGRESO:

                stockPosterior = stockAnterior + cantidad;

                break;

            case SALIDA:

                if (cantidad > stockAnterior) {
                    throw new IllegalArgumentException(
                            "Stock insuficiente. Stock actual: "
                            + stockAnterior
                    );
                }

                stockPosterior = stockAnterior - cantidad;

                break;

            case AJUSTE:

                /*
                 * Para un AJUSTE, la cantidad representa
                 * cuánto se ajusta el inventario.
                 *
                 * Si el motivo indica una corrección positiva,
                 * se puede utilizar INGRESO.
                 *
                 * Para mantener una lógica segura, aquí
                 * tratamos AJUSTE como una reducción.
                 */
                if (cantidad > stockAnterior) {
                    throw new IllegalArgumentException(
                            "El ajuste no puede dejar el stock negativo"
                    );
                }

                stockPosterior = stockAnterior - cantidad;

                break;

            default:

                throw new IllegalArgumentException(
                        "Tipo de movimiento no válido"
                );
        }

        // 7. Actualizar stock del producto
        producto.setStockActual(stockPosterior);

        productoRepository.save(producto);

       MovimientoInventario movimiento =
        new MovimientoInventario(
                producto,
                tipoMovimiento,
                cantidad,
                stockAnterior,
                stockPosterior,
                referenciaDocumento,
                motivo,
                LocalDateTime.now(),
                usuarioId != null ? usuarioId : 1L
        );

        // 9. Guardar movimiento
        return movimientoRepository.save(movimiento);
    }

    @Override
    @Transactional (readOnly = true)
    public List<MovimientoInventario> obtenerKardex(Long productoId) {
         validarProducto(productoId);

        return movimientoRepository
                .findByProductoIdOrderByFechaDesc(productoId);
    }

    @Override
    @Transactional (readOnly = true)
    public List<MovimientoInventario> obtenerKardexAscendente(Long productoId) {
       validarProducto(productoId);

        return movimientoRepository
                .findByProductoIdOrderByFechaAsc(productoId);
    }

    @Override
    public List<MovimientoInventario> listarMovimientos() {
         return movimientoRepository.findAll();
    }

    @Override
    public List<MovimientoInventario> listarPorTipo(TipoMovimiento tipoMovimiento) {
        if (tipoMovimiento == null) {
            throw new IllegalArgumentException(
                    "El tipo de movimiento es obligatorio"
            );
        }

        return movimientoRepository
                .findByTipoMovimiento(tipoMovimiento);
    }

    private void validarProducto(Long productoId) {

    if (productoId == null) {
        throw new IllegalArgumentException(
                "El ID del producto es obligatorio"
        );
    }

    productoRepository.findById(productoId)
            .orElseThrow(() -> new IllegalArgumentException(
                    "No existe el producto con ID: " + productoId
            ));
    }   
}
