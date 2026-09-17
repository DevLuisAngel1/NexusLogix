package com.pe.nexuslogix.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedidos")
@Data
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String codigoPedido;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(name = "usuario_solicitante_id", nullable = false)
    private Long usuario = 1L;

    public void setUsuarioId(Long usuarioId) {
        if (usuarioId != null) this.usuario = usuarioId;
    }

    public void setUsuarioSolicitanteId(Long usuarioSolicitanteId) {
        if (usuarioSolicitanteId != null) this.usuario = usuarioSolicitanteId;
    }
    
    private LocalDateTime fechaPedido;

    private Double subtotal;
    private Double igv;
    private Double total;

    private String direccionEntrega;
    private LocalDateTime fechaEntregaEstimada;
    private String estado;
    
    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
