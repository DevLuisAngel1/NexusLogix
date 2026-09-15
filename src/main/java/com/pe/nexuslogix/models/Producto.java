package com.pe.nexuslogix.models;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity 
@Table (name = "productos", uniqueConstraints = {@UniqueConstraint (columnNames = "codigoSku")})
public class Producto {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column (nullable = false, unique = true, length = 50)
    private String codigoSku;

    @Column (nullable = false, length = 150)
    private String nombre;

    @Column (length = 500)
    private String descripcion;

    @Column (nullable = false, length = 30)
    private double unidadMedida;

    
    @Column (nullable = false, precision = 10, scale = 2)
    private double precioUnitario;

    @Column (nullable = false)
    private double stockActual = 0;

    @Column (nullable = false)
    private double stockMinimo = 0;

    @Column (length = 50)
    private double ubicacionPasillo;

    @Column (precision = 10, scale = 3)
    private double pesokg;

    @Column (nullable = false)
    private Boolean estado = true;

    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name = "categoria_id", nullable = false)
    private Categoria categoria;

    @OneToMany (mappedBy = "producto")
    private List<MovimientoInventario> movimientos = new ArrayList<>();

    //constructor vacio para JPA
    public Producto() { 
    }

    public Producto(long id, String codigoSku, String nombre, String descripcion, double unidadMedida, double precioUnitario, double stockActual, double stockMinimo, double ubicacionPasillo, double pesokg, Boolean estado, Categoria categoria) {
        this.id = id;
        this.codigoSku = codigoSku;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.unidadMedida = unidadMedida;
        this.precioUnitario = precioUnitario;
        this.stockActual = stockActual;
        this.stockMinimo = stockMinimo;
        this.ubicacionPasillo = ubicacionPasillo;
        this.pesokg = pesokg;
        this.estado = estado;
        this.categoria = categoria;
    }

    //getters y setters
    public long getId() {
        return id;
    }
    public String getCodigoSku() {
        return codigoSku;
    }
    public void setCodigoSku(String codigoSku) {
        this.codigoSku = codigoSku;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public double getUnidadMedida() {
        return unidadMedida;
    }
    public void setUnidadMedida(double unidadMedida) {
        this.unidadMedida = unidadMedida;
    }
    public double getPrecioUnitario() {
        return precioUnitario;
    }
    public void setPrecioUnitario(double precioUnitario) {
        this.precioUnitario = precioUnitario;
    }
    public double getStockActual() {
        return stockActual;
    }
    public void setStockActual(double stockActual) {
        this.stockActual = stockActual;
    }
    public double getStockMinimo() {
        return stockMinimo;
    }
    public void setStockMinimo(double stockMinimo) {
        this.stockMinimo = stockMinimo;
    }
    public double getUbicacionPasillo() {
        return ubicacionPasillo;
    }
    public void setUbicacionPasillo(double ubicacionPasillo) {
        this.ubicacionPasillo = ubicacionPasillo;
    }
    public double getPesokg() {
        return pesokg;
    }
    public void setPesokg(double pesokg) {
        this.pesokg = pesokg;
    }
    public Boolean getEstado() {
        return estado;
    }
    public void setEstado(Boolean estado) {
        this.estado = estado;
    }
    public Categoria getCategoria() {
        return categoria;
    }
    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }
    public List<MovimientoInventario> getMovimientos() {
        return movimientos;
    }
    public void setMovimientos(List<MovimientoInventario> movimientos) {
        this.movimientos = movimientos;
    }
}
