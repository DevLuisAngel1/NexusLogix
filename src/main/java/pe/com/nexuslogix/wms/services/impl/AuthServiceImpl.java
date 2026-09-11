package pe.com.nexuslogix.wms.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.com.nexuslogix.wms.dto.LoginRequestDTO;
import pe.com.nexuslogix.wms.dto.LoginResponseDTO;
import pe.com.nexuslogix.wms.dto.RegisterRequestDTO;
import pe.com.nexuslogix.wms.dto.UserResponseDTO;
import pe.com.nexuslogix.wms.models.ERole;
import pe.com.nexuslogix.wms.models.Role;
import pe.com.nexuslogix.wms.models.User;
import pe.com.nexuslogix.wms.repositories.RoleRepository;
import pe.com.nexuslogix.wms.repositories.UserRepository;
import pe.com.nexuslogix.wms.security.jwt.JwtUtils;
import pe.com.nexuslogix.wms.security.services.UserDetailsImpl;
import pe.com.nexuslogix.wms.services.AuthService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public LoginResponseDTO authenticateUser(LoginRequestDTO loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(item -> item.getAuthority())
                .orElse("ROLE_CLIENTE");

        return new LoginResponseDTO(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getFullName(),
                role
        );
    }

    @Override
    @Transactional
    public UserResponseDTO registerUser(RegisterRequestDTO registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new IllegalArgumentException("El nombre de usuario '" + registerRequest.getUsername() + "' ya esta registrado.");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("El correo electronico '" + registerRequest.getEmail() + "' ya esta registrado.");
        }

        ERole roleEnum = ERole.ROLE_CLIENTE;
        if (registerRequest.getRole() != null && !registerRequest.getRole().trim().isEmpty()) {
            String roleStr = registerRequest.getRole().trim().toUpperCase();
            if (!roleStr.startsWith("ROLE_")) {
                roleStr = "ROLE_" + roleStr;
            }
            try {
                roleEnum = ERole.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Rol no valido: " + registerRequest.getRole() + ". Roles validos: ROLE_ADMIN, ROLE_ALMACEN, ROLE_CLIENTE");
            }
        }

        final ERole finalRoleEnum = roleEnum;
        Role role = roleRepository.findByName(finalRoleEnum)
                .orElseGet(() -> roleRepository.save(new Role(finalRoleEnum, "Rol " + finalRoleEnum.name())));

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName());
        user.setPhone(registerRequest.getPhone());
        user.setPosition(registerRequest.getPosition());
        user.setRole(role);
        user.setActive(true);

        User savedUser = userRepository.save(user);
        return mapToUserResponseDTO(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserProfile(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        return mapToUserResponseDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponseDTO)
                .collect(Collectors.toList());
    }

    private UserResponseDTO mapToUserResponseDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getPosition(),
                user.getRole() != null ? user.getRole().getName().name() : null,
                user.getActive(),
                user.getCreatedAt()
        );
    }
}
