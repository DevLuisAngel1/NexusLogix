package com.pe.nexuslogix.services.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.pe.nexuslogix.dto.LoginRequestDTO;
import com.pe.nexuslogix.dto.LoginResponseDTO;
import com.pe.nexuslogix.dto.UserResponseDTO;
import com.pe.nexuslogix.models.Role;
import com.pe.nexuslogix.models.User;
import com.pe.nexuslogix.repositories.RoleRepository;
import com.pe.nexuslogix.repositories.UserRepository;
import com.pe.nexuslogix.security.jwt.JwtUtils;
import com.pe.nexuslogix.security.services.UserDetailsImpl;
import com.pe.nexuslogix.services.AuthService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           JwtUtils jwtUtils,
                           PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public LoginResponseDTO authenticate(LoginRequestDTO request) {
        String identifier = (request.getUsername() != null && !request.getUsername().isBlank())
                ? request.getUsername().trim()
                : (request.getEmail() != null ? request.getEmail().trim() : null);

        if (identifier == null || request.getPassword() == null || request.getPassword().isBlank()) {
            return new LoginResponseDTO(false, "Debe ingresar un usuario o correo y su contraseña.", null, null);
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findById(userDetails.getId()).orElse(null);

            UserResponseDTO userResponse = (user != null) ? new UserResponseDTO(user) : null;

            return new LoginResponseDTO(true, "Autenticación satisfactoria.", jwt, userResponse);
        } catch (BadCredentialsException e) {
            return new LoginResponseDTO(false, "Credenciales inválidas. Verifica tu usuario y contraseña.", null, null);
        } catch (DisabledException | LockedException e) {
            return new LoginResponseDTO(false, "El usuario se encuentra inactivo.", null, null);
        } catch (Exception e) {
            return new LoginResponseDTO(false, "Error durante la autenticación: " + e.getMessage(), null, null);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserProfile(Long id) {
        return userRepository.findById(id)
                .map(UserResponseDTO::new)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> listAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponseDTO createUser(Map<String, Object> data) {
        String email = (String) data.get("email");
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("El correo electrónico es obligatorio.");
        }

        String username = (String) data.get("username");
        if (username == null || username.isBlank()) {
            username = email.split("@")[0].trim().toLowerCase();
        }

        if (userRepository.findByUsername(username.trim()).isPresent()) {
            throw new IllegalArgumentException("El identificador de usuario '" + username + "' ya existe.");
        }
        if (userRepository.findByEmail(email.trim()).isPresent()) {
            throw new IllegalArgumentException("El correo electrónico '" + email + "' ya está registrado.");
        }

        String fullName = (String) data.get("nombre");
        String nombre = fullName;
        String apellido = "-";
        if (fullName != null && fullName.trim().contains(" ")) {
            int idx = fullName.trim().indexOf(" ");
            nombre = fullName.substring(0, idx).trim();
            apellido = fullName.substring(idx + 1).trim();
        }

        String rolName = (String) data.get("rol");
        Role role = resolveRole(rolName);

        String rawPassword = (String) data.get("password");
        if (rawPassword == null || rawPassword.isBlank()) {
            rawPassword = "admin123password";
        }

        String estado = (String) data.getOrDefault("estado", "ACTIVO");

        User user = new User();
        user.setUsername(username.trim());
        user.setEmail(email.trim());
        user.setNombre(nombre != null ? nombre : username);
        user.setApellido(apellido);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setEstado(estado.toUpperCase());
        user.setArea("Operaciones");

        User saved = userRepository.save(user);
        return new UserResponseDTO(saved);
    }

    @Override
    @Transactional
    public UserResponseDTO updateUser(Long id, Map<String, Object> data) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        if (data.containsKey("nombre")) {
            String fullName = (String) data.get("nombre");
            if (fullName != null && fullName.trim().contains(" ")) {
                int idx = fullName.trim().indexOf(" ");
                user.setNombre(fullName.substring(0, idx).trim());
                user.setApellido(fullName.substring(idx + 1).trim());
            } else if (fullName != null) {
                user.setNombre(fullName.trim());
            }
        }

        if (data.containsKey("email")) {
            String email = (String) data.get("email");
            if (email != null && !email.isBlank()) {
                user.setEmail(email.trim());
            }
        }

        if (data.containsKey("rol")) {
            String rolName = (String) data.get("rol");
            Role role = resolveRole(rolName);
            user.setRole(role);
        }

        if (data.containsKey("estado")) {
            String estado = (String) data.get("estado");
            if (estado != null) {
                user.setEstado(estado.toUpperCase());
            }
        }

        if (data.containsKey("password")) {
            String pass = (String) data.get("password");
            if (pass != null && !pass.isBlank()) {
                user.setPassword(passwordEncoder.encode(pass));
            }
        }

        User updated = userRepository.save(user);
        return new UserResponseDTO(updated);
    }

    @Override
    @Transactional
    public Map<String, Object> deleteUser(Long id) {
        Map<String, Object> response = new HashMap<>();

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            response.put("success", false);
            response.put("mensaje", "No se encontró el usuario con ID: " + id);
            return response;
        }

        if ("admin".equalsIgnoreCase(user.getUsername()) || Long.valueOf(1L).equals(user.getId())) {
            response.put("success", false);
            response.put("mensaje", "Por políticas de seguridad, no se puede eliminar la cuenta del Administrador principal.");
            return response;
        }

        // Soft delete si tiene registros relacionados para mantener integridad referencial
        Long references = userRepository.countUserReferences(id);
        if (references != null && references > 0) {
            user.setEstado("INACTIVO");
            userRepository.save(user);

            response.put("success", true);
            response.put("action", "DEACTIVATED");
            response.put("mensaje", "El usuario tiene registros históricos (despachos/pedidos). Ha sido cambiado a estado INACTIVO para proteger la integridad de los datos.");
            return response;
        }

        userRepository.delete(user);
        response.put("success", true);
        response.put("action", "DELETED");
        response.put("mensaje", "Usuario eliminado exitosamente de la base de datos.");
        return response;
    }

    private Role resolveRole(String rolName) {
        if (rolName == null) rolName = "OPERADOR";
        String r = rolName.toUpperCase().trim();

        if (r.contains("ADMIN")) {
            return roleRepository.findByNombre("ROLE_ADMINISTRADOR")
                    .orElseGet(() -> roleRepository.findById(1L).orElseThrow());
        } else if (r.contains("ALMACEN") || r.contains("JEFE")) {
            return roleRepository.findByNombre("ROLE_JEFE_ALMACEN")
                    .orElseGet(() -> roleRepository.findById(2L).orElseThrow());
        } else if (r.contains("DESPACHO") || r.contains("SUPERVISOR") || r.contains("OPERADOR")) {
            return roleRepository.findByNombre("ROLE_OPERADOR_DESPACHO")
                    .orElseGet(() -> roleRepository.findById(3L).orElseThrow());
        } else if (r.contains("CLIENTE")) {
            return roleRepository.findByNombre("ROLE_CLIENTE_COMERCIAL")
                    .orElseGet(() -> roleRepository.findById(4L).orElseThrow());
        }

        return roleRepository.findById(2L).orElseGet(() -> roleRepository.findAll().get(0));
    }
}
