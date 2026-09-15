package com.pe.nexuslogix.repositories;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pe.nexuslogix.models.Categoria;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findByNombreIgnoreCase(String nombre);

    List<Categoria> findByEstadoTrue();

    boolean existsByNombreIgnoreCase(String nombre);
}