package com.pe.nexuslogix.services.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.pe.nexuslogix.models.Categoria;
import com.pe.nexuslogix.repositories.CategoriaRepository;
import com.pe.nexuslogix.services.CategoriaService;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;


@Service 
public class CategoriaServiceImpl implements CategoriaService {
    // Implementación de los métodos de la interfaz CategoriaService
    private final CategoriaRepository categoriaRepository;

    public CategoriaServiceImpl(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    @Transactional (readOnly = true)
    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    @Override
    @Transactional (readOnly = true)
    public List<Categoria> listarActivas() {
        return categoriaRepository.findByEstadoTrue();
    }

    @Override
    @Transactional (readOnly = true)
    public Optional<Categoria> buscarPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    @Override
    @Transactional (readOnly = true)
    public Optional<Categoria> buscarPorNombre(String nombre) {
        return categoriaRepository.findByNombreIgnoreCase(nombre);
    }

    @Override
    @Transactional
    public Categoria guardar(Categoria categoria) {
       if (categoriaRepository.existsByNombreIgnoreCase(categoria.getNombre())){
            throw new IllegalArgumentException("Ya existe una categoría con el nombre: " + categoria.getNombre());
        }
        
        if (categoria.getEstado() == null){
            categoria.setEstado(true);
        }

        return categoriaRepository.save(categoria);
    }

    @Override
    @Transactional
    public Categoria actualizar(Long id, Categoria categoria) {

        Categoria categoriaExistente = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe la categoría con ID: " + id
                ));

        Optional<Categoria> categoriaConMismoNombre =
                categoriaRepository.findByNombreIgnoreCase(
                        categoria.getNombre()
                );

       if (categoriaConMismoNombre.isPresent()
            && !Objects.equals(categoriaConMismoNombre.get().getId(), id)) {
            throw new IllegalArgumentException(
                "Ya existe otra categoría con el nombre: "
                 + categoria.getNombre()
         );
}


        categoriaExistente.setNombre(categoria.getNombre());
        categoriaExistente.setDescripcion(categoria.getDescripcion());

        if (categoria.getEstado() != null) {
            categoriaExistente.setEstado(categoria.getEstado());
        }

        return categoriaRepository.save(categoriaExistente);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe la categoría con ID: " + id
                ));

        /*
         * No eliminamos físicamente la categoría.
         * La desactivamos para conservar la información histórica.
         */
        categoria.setEstado(false);

        categoriaRepository.save(categoria);
    }

    @Override
    @Transactional (readOnly = true)
    public boolean existePorNombre(String nombre) {
       return categoriaRepository.existsByNombreIgnoreCase(nombre);
    }

    
}
