package com.pe.nexuslogix.models;

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

    @Column(name = "producto_id", nullable = false)
    private Long producto;
    private Integer cantidad;
    private Double precioUnitario;
    private Double subtotal;
    private String estadoPicking;

    public void setProductoId(Long productoId) {
        if (productoId != null) this.producto = productoId;
    }

    public Long getProductoId() {
        return this.producto;
    }
}
