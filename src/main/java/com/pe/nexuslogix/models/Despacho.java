package com.pe.nexuslogix.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "despachos")
@Data
public class Despacho {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Column(name = "operador_id", nullable = false)
    private Long operador = 1L;

    public void setOperadorId(Long operadorId) {
        if (operadorId != null) this.operador = operadorId;
    }

    public Long getOperadorId() {
        return this.operador;
    }
    
    @Column(unique = true, nullable = false)
    private String guiaRemision;
    
    private String transportistaRazonSocial;
    private String transportistaRuc;
    private String placaVehiculo;
    private String conductorNombre;
    private String conductorLicencia;
    
    @Column(columnDefinition = "TEXT")
    private String codigoQr;
    
    private LocalDateTime fechaSalida;
    private LocalDateTime fechaEntregaReal;
    private String conformidadRecepcion;
    private String estado;
    
    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
