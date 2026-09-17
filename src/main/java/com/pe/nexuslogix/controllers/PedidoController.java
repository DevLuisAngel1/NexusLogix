package com.pe.nexuslogix.controllers;

import com.pe.nexuslogix.models.DetallePedido;
import com.pe.nexuslogix.models.Pedido;
import com.pe.nexuslogix.repositories.DetallePedidoRepository;
import com.pe.nexuslogix.repositories.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper =
            com.fasterxml.jackson.databind.json.JsonMapper.builder()
                    .findAndAddModules()
                    .build();

    @GetMapping
    public List<Pedido> listarPedidos(@RequestParam(required = false) String estado) {
        if (estado != null && !estado.isEmpty()) {
            return pedidoRepository.findByEstado(estado);
        }
        return pedidoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPedidoConDetalles(@PathVariable Long id) {
        Pedido pedido = pedidoRepository.findById(id).orElse(null);
        if (pedido == null) {
            return ResponseEntity.notFound().build();
        }
        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoId(id);
        
        return ResponseEntity.ok(Map.of(
            "cabecera", pedido,
            "detalle_pedidos", detalles
        ));
    }

    @PostMapping
    public Pedido crearPedido(@RequestBody Map<String, Object> payload) {
        Pedido pedido = objectMapper.convertValue(payload.get("pedido"), Pedido.class);
        if (pedido.getUsuario() == null) {
            pedido.setUsuario(1L);
        }
        
        List<?> rawDetalles = (List<?>) payload.get("detalles");
        List<DetallePedido> detalles = (rawDetalles != null) ? rawDetalles.stream()
                .map(item -> objectMapper.convertValue(item, DetallePedido.class))
                .toList() : List.of();

        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setEstado("PENDIENTE");

        double subtotalGeneral = 0.0;
        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        for (DetallePedido detalle : detalles) {
            detalle.setPedido(pedidoGuardado);
            double subdet = detalle.getCantidad() * detalle.getPrecioUnitario();
            detalle.setSubtotal(subdet);
            detalle.setEstadoPicking("PENDIENTE");
            detallePedidoRepository.save(detalle);
            subtotalGeneral += subdet;
        }

        // Cálculo automático de IGV (18%) y Total
        double igv = subtotalGeneral * 0.18;
        double total = subtotalGeneral + igv;

        pedidoGuardado.setSubtotal(subtotalGeneral);
        pedidoGuardado.setIgv(igv);
        pedidoGuardado.setTotal(total);

        return pedidoRepository.save(pedidoGuardado);
    }

    @RequestMapping(value = "/{id}/estado", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<Pedido> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        String nuevoEstado = body.get("estado");
        if ("PREPARADO".equalsIgnoreCase(nuevoEstado)) {
            nuevoEstado = "EN_PREPARACION";
        }
        pedido.setEstado(nuevoEstado);
        return ResponseEntity.ok(pedidoRepository.save(pedido));
    }
}
