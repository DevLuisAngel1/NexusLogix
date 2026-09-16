package com.pe.nexuslogix.controllers;

import com.pe.nexuslogix.models.MovimientoInventario;
import com.pe.nexuslogix.models.TipoMovimiento;
import com.pe.nexuslogix.services.InventarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@Validated
public class InventarioController {

    private final InventarioService inventarioService;

    public InventarioController(
            InventarioService inventarioService
    ) {
        this.inventarioService = inventarioService;
    }

    // POST /api/inventario/movimientos
    @PostMapping("/movimientos")
    public ResponseEntity<MovimientoInventario> registrarMovimiento(
            @RequestBody MovimientoRequest request
    ) {

        try {

            MovimientoInventario movimiento =
                    inventarioService.registrarMovimiento(
                            request.getProductoId(),
                            request.getTipoMovimiento(),
                            request.getCantidad(),
                            request.getReferenciaDocumento(),
                            request.getMotivo()
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(movimiento);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    // GET /api/inventario/kardex/{productoId}
    @GetMapping("/kardex/{productoId}")
    public ResponseEntity<List<MovimientoInventario>> obtenerKardex(
            @PathVariable Long productoId
    ) {

        try {

            return ResponseEntity.ok(
                    inventarioService.obtenerKardex(productoId)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // GET /api/inventario/kardex/{productoId}/ascendente
    @GetMapping("/kardex/{productoId}/ascendente")
    public ResponseEntity<List<MovimientoInventario>>
    obtenerKardexAscendente(
            @PathVariable Long productoId
    ) {

        try {

            return ResponseEntity.ok(
                    inventarioService
                            .obtenerKardexAscendente(productoId)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // GET /api/inventario/movimientos
    @GetMapping("/movimientos")
    public ResponseEntity<List<MovimientoInventario>>
    listarMovimientos() {

        return ResponseEntity.ok(
                inventarioService.listarMovimientos()
        );
    }

    // GET /api/inventario/movimientos/tipo/INGRESO
    @GetMapping("/movimientos/tipo/{tipoMovimiento}")
    public ResponseEntity<List<MovimientoInventario>>
    listarPorTipo(
            @PathVariable TipoMovimiento tipoMovimiento
    ) {

        return ResponseEntity.ok(
                inventarioService
                        .listarPorTipo(tipoMovimiento)
        );
    }

    /*
     * DTO utilizado para registrar movimientos.
     */
    public static class MovimientoRequest {

        
        private Long productoId;

       
        private TipoMovimiento tipoMovimiento;

    
        private Integer cantidad;

        private String referenciaDocumento;

        private String motivo;

        public Long getProductoId() {
            return productoId;
        }

        public void setProductoId(Long productoId) {
            this.productoId = productoId;
        }

        public TipoMovimiento getTipoMovimiento() {
            return tipoMovimiento;
        }

        public void setTipoMovimiento(
                TipoMovimiento tipoMovimiento
        ) {
            this.tipoMovimiento = tipoMovimiento;
        }

        public Integer getCantidad() {
            return cantidad;
        }

        public void setCantidad(Integer cantidad) {
            this.cantidad = cantidad;
        }

        public String getReferenciaDocumento() {
            return referenciaDocumento;
        }

        public void setReferenciaDocumento(
                String referenciaDocumento
        ) {
            this.referenciaDocumento = referenciaDocumento;
        }

        public String getMotivo() {
            return motivo;
        }

        public void setMotivo(String motivo) {
            this.motivo = motivo;
        }
    }
}
