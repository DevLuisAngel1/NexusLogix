package com.pe.nexuslogix.repositories;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.pe.nexuslogix.models.Categoria;

import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findByNombreIgnoreCase(String nombre);

    @Query(value = "SELECT * FROM categorias WHERE estado = 'ACTIVO' OR estado = '1' OR estado = 'true' OR estado = 1", nativeQuery = true)
    List<Categoria> findByEstadoTrue();

    boolean existsByNombreIgnoreCase(String nombre);
}