package com.pe.nexuslogix.wms.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "detalle_pedidos")
@Data
public class DetallePedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    private Long producto;
    private Integer cantidad;
    private Double precioUnitario;
    private Double subtotal;
    private String estadoPicking;
}
