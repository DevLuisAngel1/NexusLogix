package com.pe.nexuslogix.models;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
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
    private Long id;

    @Column (nullable = false, unique = true, length = 50)
    private String codigoSku;

    @Column (nullable = false, length = 150)
    private String nombre;

    @Column (length = 500)
    private String descripcion;

    @Column (nullable = false, length = 30)
    private String unidadMedida;

    @Column (nullable = false)
    private Double precioUnitario = 0.0;

    @Column (nullable = false)
    private Integer stockActual = 0;

    @Column (nullable = false)
    private Integer stockMinimo = 0;

    @Column (length = 50)
    private String ubicacionPasillo;

    @Column (name = "peso_kg")
    private Double pesokg = 0.0;

    @Convert(converter = ProductoEstadoConverter.class)
    @Column (nullable = false)
    private Boolean estado = true;

    @ManyToOne (optional = false)
    @JoinColumn (name = "categoria_id", nullable = false)
    private Categoria categoria;

    @JsonIgnore
    @OneToMany (mappedBy = "producto")
    private List<MovimientoInventario> movimientos = new ArrayList<>();

    //constructor vacio para JPA
    public Producto() { 
    }

    public Producto(Long id, String codigoSku, String nombre, String descripcion, String unidadMedida, Double precioUnitario, Integer stockActual, Integer stockMinimo, String ubicacionPasillo, Double pesokg, Boolean estado, Categoria categoria) {
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
    public Long getId() {
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
    public String getUnidadMedida() {
        return unidadMedida;
    }
    public void setUnidadMedida(String unidadMedida) {
        this.unidadMedida = unidadMedida;
    }
    public Double getPrecioUnitario() {
        return precioUnitario != null ? precioUnitario : 0.0;
    }
    public void setPrecioUnitario(Double precioUnitario) {
        this.precioUnitario = precioUnitario;
    }
    public Integer getStockActual() {
        return stockActual != null ? stockActual : 0;
    }
    public void setStockActual(Integer stockActual) {
        this.stockActual = stockActual;
    }
    public Integer getStockMinimo() {
        return stockMinimo != null ? stockMinimo : 0;
    }
    public void setStockMinimo(Integer stockMinimo) {
        this.stockMinimo = stockMinimo;
    }
    public String getUbicacionPasillo() {
        return ubicacionPasillo;
    }
    public void setUbicacionPasillo(String ubicacionPasillo) {
        this.ubicacionPasillo = ubicacionPasillo;
    }
    public Double getPesokg() {
        return pesokg != null ? pesokg : 0.0;
    }
    public void setPesokg(Double pesokg) {
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
