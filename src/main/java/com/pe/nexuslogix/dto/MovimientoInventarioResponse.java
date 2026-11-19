package com.pe.nexuslogix.dto;

import java.time.LocalDateTime;
import com.pe.nexuslogix.models.TipoMovimiento;

public record MovimientoInventarioResponse(Long id, Long productoId, String productoNombre,
        String codigoSku, TipoMovimiento tipoMovimiento, Integer cantidad, Integer stockAnterior,
        Integer stockPosterior, String referenciaDocumento, String motivo, Long usuarioId,
        String responsable, LocalDateTime fecha) {}
