package com.pe.nexuslogix.services.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.pe.nexuslogix.dto.LoginRequestDTO;
import com.pe.nexuslogix.dto.LoginResponseDTO;
import com.pe.nexuslogix.dto.UserResponseDTO;
import com.pe.nexuslogix.models.User;
import com.pe.nexuslogix.repositories.UserRepository;
import com.pe.nexuslogix.security.jwt.JwtUtils;
import com.pe.nexuslogix.security.services.UserDetailsImpl;
import com.pe.nexuslogix.services.AuthService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
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
            return new LoginResponseDTO(false, "Credenciales inválidas.", null, null);
        } catch (DisabledException | LockedException e) {
            return new LoginResponseDTO(false, "El usuario se encuentra inactivo.", null, null);
        } catch (Exception e) {
            return new LoginResponseDTO(false, "Error durante la autenticación.", null, null);
        }
    }

    @Override
    public UserResponseDTO getUserProfile(Long id) {
        return userRepository.findById(id)
                .map(UserResponseDTO::new)
                .orElse(null);
    }

    @Override
    public List<UserResponseDTO> listAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponseDTO::new)
                .collect(Collectors.toList());
    }
}
