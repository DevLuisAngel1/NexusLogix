package com.pe.nexuslogix.dto;

import com.pe.nexuslogix.models.TipoMovimiento;

public record MovimientoInventarioRequest(Long productoId, TipoMovimiento tipoMovimiento,
        Integer cantidad, String referenciaDocumento, String motivo) {}
