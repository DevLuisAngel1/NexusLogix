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

    private Long usuario;
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
