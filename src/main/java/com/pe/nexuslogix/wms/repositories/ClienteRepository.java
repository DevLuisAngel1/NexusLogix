package com.pe.nexuslogix.wms.repositories;

import com.pe.nexuslogix.wms.models.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}
