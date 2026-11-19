package com.pe.nexuslogix.repositories;

import com.pe.nexuslogix.models.MovimientoInventario;
import com.pe.nexuslogix.models.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface MovimientoInventarioRepository
        extends JpaRepository<MovimientoInventario, Long> {

    List<MovimientoInventario> findByProductoIdOrderByFechaDesc(Long productoId);

    List<MovimientoInventario> findByProductoIdOrderByFechaAsc(Long productoId);

    List<MovimientoInventario> findByTipoMovimiento(TipoMovimiento tipoMovimiento);

    List<MovimientoInventario> findByProductoIdAndTipoMovimiento(
            Long productoId,
            TipoMovimiento tipoMovimiento
    );

    @Query("SELECT m FROM MovimientoInventario m JOIN FETCH m.producto p " +
            "WHERE (:productoId IS NULL OR p.id = :productoId) " +
            "AND (:tipo IS NULL OR m.tipoMovimiento = :tipo) " +
            "AND (:usuarioId IS NULL OR m.usuarioId = :usuarioId) " +
            "AND (:desde IS NULL OR m.fecha >= :desde) " +
            "AND (:hasta IS NULL OR m.fecha <= :hasta) " +
            "ORDER BY m.fecha DESC, m.id DESC")
    List<MovimientoInventario> buscarKardex(@Param("productoId") Long productoId,
            @Param("tipo") TipoMovimiento tipo, @Param("usuarioId") Long usuarioId,
            @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);
}
