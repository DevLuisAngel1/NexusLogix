package com.pe.nexuslogix.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pe.nexuslogix.models.Role;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByNombre(String nombre);
}
