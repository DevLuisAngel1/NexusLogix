package com.pe.nexuslogix.controllers;

import com.pe.nexuslogix.models.Despacho;
import com.pe.nexuslogix.repositories.DespachoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/despachos")
public class DespachoController {

    @Autowired
    private DespachoRepository despachoRepository;

    @Autowired
    private com.pe.nexuslogix.repositories.PedidoRepository pedidoRepository;

    @GetMapping
    public List<Despacho> listarDespachos() {
        return despachoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Despacho> obtenerDespachoPorId(@PathVariable Long id) {
        return despachoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Despacho generarDespacho(@RequestBody Despacho despacho) {
        if (despacho.getOperador() == null) {
            despacho.setOperador(1L);
        }
        if (despacho.getPedido() != null && despacho.getPedido().getId() != null) {
            com.pe.nexuslogix.models.Pedido pedido = pedidoRepository.findById(despacho.getPedido().getId())
                    .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + despacho.getPedido().getId()));
            despacho.setPedido(pedido);
        }
        despacho.setFechaSalida(LocalDateTime.now());
        if (despacho.getEstado() == null || "EN_TRANSITO".equalsIgnoreCase(despacho.getEstado())) {
            despacho.setEstado("EN_RUTA");
        }
        return despachoRepository.save(despacho);
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<Despacho> consultarPorPedido(@PathVariable Long pedidoId) {
        return despachoRepository.findByPedidoId(pedidoId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/entregar")
    public ResponseEntity<Despacho> marcarEntregado(@PathVariable Long id, @RequestBody Despacho datosEntrega) {
        Despacho despacho = despachoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Despacho no encontrado"));
        
        despacho.setFechaEntregaReal(LocalDateTime.now());
        despacho.setConformidadRecepcion(datosEntrega.getConformidadRecepcion());
        despacho.setEstado("ENTREGADO");
        despacho.setObservaciones(datosEntrega.getObservaciones());
        
        return ResponseEntity.ok(despachoRepository.save(despacho));
    }
}
