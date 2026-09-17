package com.pe.nexuslogix.repositories;

import com.pe.nexuslogix.models.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigoSkuIgnoreCase(String codigoSku);

    boolean existsByCodigoSkuIgnoreCase(String codigoSku);

    @Query(value = "SELECT * FROM productos WHERE estado IS NULL OR estado != 'DISCONTINUADO'", nativeQuery = true)
    List<Producto> findByEstadoTrue();

    List<Producto> findByCategoriaId(Long categoriaId);

    List<Producto> findByStockActualLessThanEqual(Integer stock);

    @Query(value = "SELECT * FROM productos WHERE stock_actual <= :stock AND (estado IS NULL OR estado != 'DISCONTINUADO')", nativeQuery = true)
    List<Producto> findByStockActualLessThanEqualAndEstadoTrue(@Param("stock") Integer stock);

    List<Producto> findByNombreContainingIgnoreCase(String nombre);
}