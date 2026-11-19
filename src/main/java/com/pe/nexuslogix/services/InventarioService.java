package com.pe.nexuslogix.services;

import java.util.List;

import com.pe.nexuslogix.models.MovimientoInventario;
import com.pe.nexuslogix.models.TipoMovimiento;
import com.pe.nexuslogix.dto.MovimientoInventarioResponse;
import java.time.LocalDate;

public interface InventarioService {
    MovimientoInventario registrarMovimiento(
            Long productoId,
            TipoMovimiento tipoMovimiento,
            Integer cantidad,
            String referenciaDocumento,
            String motivo
    );

    MovimientoInventario registrarMovimiento(
            Long productoId,
            TipoMovimiento tipoMovimiento,
            Integer cantidad,
            String referenciaDocumento,
            String motivo,
            Long usuarioId
    );

    List<MovimientoInventario> obtenerKardex(Long productoId);

    List<MovimientoInventario> obtenerKardexAscendente(Long productoId);

    List<MovimientoInventario> listarMovimientos();

    List<MovimientoInventario> listarPorTipo(
            TipoMovimiento tipoMovimiento
    );

    List<MovimientoInventarioResponse> buscarKardex(Long productoId, TipoMovimiento tipo,
            Long usuarioId, LocalDate desde, LocalDate hasta);
}
