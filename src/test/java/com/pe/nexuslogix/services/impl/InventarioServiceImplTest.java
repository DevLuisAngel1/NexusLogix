package com.pe.nexuslogix.services.impl;

import com.pe.nexuslogix.models.MovimientoInventario;
import com.pe.nexuslogix.models.Producto;
import com.pe.nexuslogix.models.TipoMovimiento;
import com.pe.nexuslogix.repositories.MovimientoInventarioRepository;
import com.pe.nexuslogix.repositories.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventarioServiceImplTest {
    @Mock ProductoRepository productoRepository;
    @Mock MovimientoInventarioRepository movimientoRepository;
    InventarioServiceImpl service;

    @BeforeEach void setUp() { service = new InventarioServiceImpl(productoRepository, movimientoRepository); }

    @Test void ingresoActualizaStockYGuardaMovimiento() {
        Producto producto = productoConStock(0);
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(movimientoRepository.save(any(MovimientoInventario.class))).thenAnswer(call -> call.getArgument(0));
        MovimientoInventario movimiento = service.registrarMovimiento(1L, TipoMovimiento.INGRESO, 5, null, null);
        assertEquals(5, producto.getStockActual());
        assertEquals(5, movimiento.getStockPosterior());
        assertEquals("STOCK_BAJO", producto.getEstadoInventario().name());
        verify(productoRepository).save(producto);
        verify(movimientoRepository).save(any(MovimientoInventario.class));
    }

    @Test void salidaActualizaStockYAgotaProducto() {
        Producto producto = productoConStock(5);
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(movimientoRepository.save(any(MovimientoInventario.class))).thenAnswer(call -> call.getArgument(0));
        service.registrarMovimiento(1L, TipoMovimiento.SALIDA, 5, null, null);
        assertEquals(0, producto.getStockActual());
        assertEquals("AGOTADO", producto.getEstadoInventario().name());
    }

    @Test void salidaQueDejaStockNegativoSeRechaza() {
        Producto producto = productoConStock(2);
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        assertThrows(IllegalArgumentException.class, () -> service.registrarMovimiento(1L, TipoMovimiento.SALIDA, 3, null, null));
        assertEquals(2, producto.getStockActual());
        verify(productoRepository, never()).save(any());
        verify(movimientoRepository, never()).save(any());
    }

    private Producto productoConStock(int stock) {
        Producto producto = new Producto();
        producto.setStockActual(stock);
        producto.setStockMinimo(5);
        producto.setEstado(true);
        return producto;
    }
}
