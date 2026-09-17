package com.pe.nexuslogix.repositories;

import com.pe.nexuslogix.models.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigoSkuIgnoreCase(String codigoSku);

    boolean existsByCodigoSkuIgnoreCase(String codigoSku);

    List<Producto> findByEstadoTrue();

    List<Producto> findByCategoriaId(Long categoriaId);

    List<Producto> findByStockActualLessThanEqual(Integer stock);

    List<Producto> findByStockActualLessThanEqualAndEstadoTrue(Integer stock);

    List<Producto> findByNombreContainingIgnoreCase(String nombre);
}