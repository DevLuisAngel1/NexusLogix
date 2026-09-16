package com.pe.nexuslogix.services;

import java.util.List;
import java.util.Optional;

import com.pe.nexuslogix.models.Producto;

public interface ProductoService {
    List<Producto> listarTodos();

    List<Producto> listarActivos();

    Optional<Producto> buscarPorId(Long id);

    Optional<Producto> buscarPorSku(String sku);

    List<Producto> listarPorCategoria(Long categoriaId);

    List<Producto> listarProductosConStockBajo();

    List<Producto> buscarPorNombre(String nombre);

    Producto guardar(Producto producto);

    Producto actualizar(Long id, Producto producto);

    void eliminar(Long id);

    boolean existePorSku(String sku);
}
