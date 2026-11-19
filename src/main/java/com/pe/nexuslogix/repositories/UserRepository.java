package com.pe.nexuslogix.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.pe.nexuslogix.models.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:identifier) OR LOWER(u.email) = LOWER(:identifier)")
    Optional<User> findByUsernameOrEmail(@Param("identifier") String identifier);

    @Query(value = "SELECT " +
            "(SELECT COUNT(*) FROM despachos WHERE operador_id = :userId) + " +
            "(SELECT COUNT(*) FROM pedidos WHERE usuario_solicitante_id = :userId) + " +
            "(SELECT COUNT(*) FROM movimientos_inventario WHERE usuario_id = :userId)",
            nativeQuery = true)
    Long countUserReferences(@Param("userId") Long userId);
}
