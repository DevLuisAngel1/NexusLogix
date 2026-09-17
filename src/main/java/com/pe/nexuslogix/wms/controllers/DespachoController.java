package com.pe.nexuslogix.wms.controllers;

import com.pe.nexuslogix.wms.models.Despacho;
import com.pe.nexuslogix.wms.repositories.DespachoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/despachos")
public class DespachoController {

    @Autowired
    private DespachoRepository despachoRepository;

    @PostMapping
    public Despacho generarDespacho(@RequestBody Despacho despacho) {
        despacho.setFechaSalida(LocalDateTime.now());
        despacho.setEstado("EN_TRANSITO");
        return despachoRepository.save(despacho);
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<Despacho> consultarPorPedido(@PathVariable Long pedidoId) {
        return despachoRepository.findByPedidoId(pedidoId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/entregar")
    public ResponseEntity<Despacho> marcarEntregado(@PathVariable Long id, @Requesgit tBody Despacho datosEntrega) {
        Despacho despacho = despachoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Despacho no encontrado"));
        
        despacho.setFechaEntregaReal(LocalDateTime.now());
        despacho.setConformidadRecepcion(datosEntrega.getConformidadRecepcion());
        despacho.setEstado("ENTREGADO");
        despacho.setObservaciones(datosEntrega.getObservaciones());
        
        return ResponseEntity.ok(despachoRepository.save(despacho));
    }
}
