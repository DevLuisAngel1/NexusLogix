package com.pe.nexuslogix.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.pe.nexuslogix.dto.LoginRequestDTO;
import com.pe.nexuslogix.dto.LoginResponseDTO;
import com.pe.nexuslogix.dto.UserResponseDTO;
import com.pe.nexuslogix.services.AuthService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        LoginResponseDTO response = authService.authenticate(request);
        if (!response.isSuccess()) {
            if ("Credenciales inválidas.".equals(response.getMensaje())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            if ("El usuario se encuentra inactivo.".equals(response.getMensaje())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable Long id) {
        UserResponseDTO user = authService.getUserProfile(id);
        Map<String, Object> response = new HashMap<>();
        if (user == null) {
            response.put("success", false);
            response.put("mensaje", "Usuario con ID " + id + " no encontrado.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.put("success", true);
        response.put("data", user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        List<UserResponseDTO> users = authService.listAllUsers();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("total", users.size());
        response.put("data", users);
        return ResponseEntity.ok(response);
    }
}
