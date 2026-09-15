package com.pe.nexuslogix.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "online");
        response.put("servicio", "NexusLogix WMS API Backend (Spring Boot)");
        response.put("version", "1.0.0");
        response.put("empresa", "NexusLogix Perú S.A.C.");
        response.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(response);
    }
}
