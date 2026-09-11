package pe.com.nexuslogix.wms.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("system", "NexusLogix WMS Backend API");
        response.put("company", "NexusLogix Peru S.A.C.");
        response.put("version", "1.0.0");
        response.put("serverTime", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}
