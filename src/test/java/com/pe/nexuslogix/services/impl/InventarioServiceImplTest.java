package com.pe.nexuslogix.services.impl;

import com.pe.nexuslogix.models.MovimientoInventario;
import com.pe.nexuslogix.models.Producto;
import com.pe.nexuslogix.models.TipoMovimiento;
import com.pe.nexuslogix.repositories.MovimientoInventarioRepository;
import com.pe.nexuslogix.repositories.ProductoRepository;
import com.pe.nexuslogix.repositories.UserRepository;
import com.pe.nexuslogix.models.User;
import java.time.LocalDate;
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
    @Mock UserRepository userRepository;
    InventarioServiceImpl service;

    @BeforeEach void setUp() { service = new InventarioServiceImpl(productoRepository, movimientoRepository, userRepository); }

    @Test void ingresoActualizaStockYGuardaMovimiento() {
        Producto producto = productoConStock(0);
        when(productoRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(producto));
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
        when(productoRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(producto));
        when(movimientoRepository.save(any(MovimientoInventario.class))).thenAnswer(call -> call.getArgument(0));
        service.registrarMovimiento(1L, TipoMovimiento.SALIDA, 5, null, null);
        assertEquals(0, producto.getStockActual());
        assertEquals("AGOTADO", producto.getEstadoInventario().name());
    }

    @Test void salidaQueDejaStockNegativoSeRechaza() {
        Producto producto = productoConStock(2);
        when(productoRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(producto));
        assertThrows(IllegalArgumentException.class, () -> service.registrarMovimiento(1L, TipoMovimiento.SALIDA, 3, null, null));
        assertEquals(2, producto.getStockActual());
        verify(productoRepository, never()).save(any());
        verify(movimientoRepository, never()).save(any());
    }

    @Test void cantidadNulaCeroYNegativaSeRechazan() {
        assertThrows(IllegalArgumentException.class, () -> service.registrarMovimiento(1L, TipoMovimiento.INGRESO, null, null, null));
        assertThrows(IllegalArgumentException.class, () -> service.registrarMovimiento(1L, TipoMovimiento.INGRESO, 0, null, null));
        assertThrows(IllegalArgumentException.class, () -> service.registrarMovimiento(1L, TipoMovimiento.INGRESO, -1, null, null));
        verifyNoInteractions(productoRepository, movimientoRepository);
    }

    @Test void productoInexistenteSeRechaza() {
        when(productoRepository.findByIdForUpdate(404L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.registrarMovimiento(404L, TipoMovimiento.INGRESO, 2, null, null));
        verify(movimientoRepository, never()).save(any());
    }

    @Test void kardexAplicaFiltrosYOrdenamientoDelRepositorio() {
        when(movimientoRepository.buscarKardex(1L, TipoMovimiento.INGRESO, 2L,
                LocalDate.of(2026, 1, 1).atStartOfDay(), LocalDate.of(2026, 1, 2).plusDays(1).atStartOfDay().minusNanos(1)))
                .thenReturn(java.util.List.of());
        when(userRepository.findAllById(java.util.List.of())).thenReturn(java.util.List.of());
        assertTrue(service.buscarKardex(1L, TipoMovimiento.INGRESO, 2L,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 2)).isEmpty());
    }

    @Test void rangoDeFechasInvertidoSeRechaza() {
        assertThrows(IllegalArgumentException.class, () -> service.buscarKardex(null, null, null,
                LocalDate.of(2026, 2, 1), LocalDate.of(2026, 1, 1)));
    }

    private Producto productoConStock(int stock) {
        Producto producto = new Producto();
        producto.setStockActual(stock);
        producto.setStockMinimo(5);
        producto.setEstado(true);
        return producto;
    }
}
