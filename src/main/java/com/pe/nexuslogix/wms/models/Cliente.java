package com.pe.nexuslogix.wms.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "clientes")
@Data
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 11)
    private String ruc;
    
    @Column(nullable = false)
    private String razonSocial;
    
    private String direccionFiscal;
    private String telefono;
    private String contactoNombre;
    private String email;
    private String sectorIndustrial;
    private String estado;
}
