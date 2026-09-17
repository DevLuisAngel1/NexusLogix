package com.pe.nexuslogix.services;

import java.util.List;
import java.util.Optional;

import com.pe.nexuslogix.models.Categoria;

public interface CategoriaService {
    List<Categoria> listarTodas();
    
    List<Categoria> listarActivas();

    Optional<Categoria> buscarPorId(Long id);

    Optional<Categoria> buscarPorNombre(String nombre);

    Categoria guardar(Categoria categoria);

    Categoria actualizar(Long id, Categoria categoria);

    void eliminar(Long id);

    boolean existePorNombre(String nombre);
}
