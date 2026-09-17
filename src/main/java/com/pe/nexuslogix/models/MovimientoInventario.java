package com.pe.nexuslogix.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity 
@Table (name = "movimiento_inventario")
public class MovimientoInventario {

    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name = "producto_id", nullable = false)
    private Producto producto;

    @Enumerated (EnumType.STRING)
    @Column (nullable = false, length = 20)
    private TipoMovimiento tipoMovimiento;

    @Column (nullable = false)
    private int cantidad;
    
    @Column (nullable = false)
    private int stockAnterior;

    @Column (nullable = false)
    private int stockPosterior;

    @Column (length = 100)
    private String referenciaDocumento;

    @Column (length = 500)
    private String motivo;

    @Column (nullable = false)
    private LocalDateTime fecha;

    //constructor vacio para JPA
    public MovimientoInventario() {
    }

    public MovimientoInventario(Producto producto, TipoMovimiento tipoMovimiento, int cantidad, int stockAnterior, int stockPosterior, String referenciaDocumento, String motivo, LocalDateTime fecha) {
        this.producto = producto;
        this.tipoMovimiento = tipoMovimiento;
        this.cantidad = cantidad;
        this.stockAnterior = stockAnterior;
        this.stockPosterior = stockPosterior;
        this.referenciaDocumento = referenciaDocumento;
        this.motivo = motivo;
        this.fecha = fecha;
    }

    // Getters and Setters
    public long getId() {
        return id;
    }
    public void setId(long id) {
        this.id = id;
    }
    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public TipoMovimiento getTipoMovimiento() {
        return tipoMovimiento;
    }

    public void setTipoMovimiento(TipoMovimiento tipoMovimiento) {
        this.tipoMovimiento = tipoMovimiento;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public Integer getStockAnterior() {
        return stockAnterior;
    }

    public void setStockAnterior(int stockAnterior) {
        this.stockAnterior = stockAnterior;
    }

    public Integer getStockPosterior() {
        return stockPosterior;
    }

    public void setStockPosterior(int stockPosterior) {
        this.stockPosterior = stockPosterior;
    }

    public String getReferenciaDocumento() {
        return referenciaDocumento;
    }

    public void setReferenciaDocumento(String referenciaDocumento) {
        this.referenciaDocumento = referenciaDocumento;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}

