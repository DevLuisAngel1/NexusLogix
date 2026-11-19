package com.pe.nexuslogix.controllers;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.pe.nexuslogix.dto.MovimientoInventarioRequest;
import com.pe.nexuslogix.dto.MovimientoInventarioResponse;
import com.pe.nexuslogix.models.MovimientoInventario;
import com.pe.nexuslogix.models.TipoMovimiento;
import com.pe.nexuslogix.security.services.UserDetailsImpl;
import com.pe.nexuslogix.services.InventarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventario")
@Validated
public class InventarioController {
    private final InventarioService inventarioService;

    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    @PostMapping("/movimientos")
    public ResponseEntity<?> registrarMovimiento(@RequestBody MovimientoInventarioRequest request,
            @AuthenticationPrincipal UserDetailsImpl usuario) {
        try {
            MovimientoInventario movimiento = inventarioService.registrarMovimiento(
                    request.productoId(), request.tipoMovimiento(), request.cantidad(),
                    request.referenciaDocumento(), request.motivo(), usuario.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(movimiento, usuario));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/kardex")
    public ResponseEntity<?> buscarKardex(@RequestParam(required = false) Long productoId,
            @RequestParam(required = false) TipoMovimiento tipoMovimiento,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) LocalDate fechaDesde,
            @RequestParam(required = false) LocalDate fechaHasta) {
        try {
            return ResponseEntity.ok(inventarioService.buscarKardex(productoId, tipoMovimiento,
                    usuarioId, fechaDesde, fechaHasta));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/kardex/{productoId}")
    public ResponseEntity<List<MovimientoInventario>> obtenerKardex(@PathVariable Long productoId) {
        try { return ResponseEntity.ok(inventarioService.obtenerKardex(productoId)); }
        catch (IllegalArgumentException e) { return ResponseEntity.notFound().build(); }
    }

    @GetMapping("/kardex/{productoId}/ascendente")
    public ResponseEntity<List<MovimientoInventario>> obtenerKardexAscendente(@PathVariable Long productoId) {
        try { return ResponseEntity.ok(inventarioService.obtenerKardexAscendente(productoId)); }
        catch (IllegalArgumentException e) { return ResponseEntity.notFound().build(); }
    }

    @GetMapping("/movimientos")
    public ResponseEntity<List<MovimientoInventario>> listarMovimientos() {
        return ResponseEntity.ok(inventarioService.listarMovimientos());
    }

    @GetMapping("/movimientos/tipo/{tipoMovimiento}")
    public ResponseEntity<List<MovimientoInventario>> listarPorTipo(@PathVariable TipoMovimiento tipoMovimiento) {
        return ResponseEntity.ok(inventarioService.listarPorTipo(tipoMovimiento));
    }

    private MovimientoInventarioResponse toResponse(MovimientoInventario m, UserDetailsImpl u) {
        return new MovimientoInventarioResponse(m.getId(), m.getProducto().getId(),
                m.getProducto().getNombre(), m.getProducto().getCodigoSku(), m.getTipoMovimiento(),
                m.getCantidad(), m.getStockAnterior(), m.getStockPosterior(), m.getReferenciaDocumento(),
                m.getMotivo(), u.getId(), (u.getNombre() + " " + u.getApellido()).trim(), m.getFecha());
    }
}
