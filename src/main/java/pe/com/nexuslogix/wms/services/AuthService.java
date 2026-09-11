package pe.com.nexuslogix.wms.services;

import pe.com.nexuslogix.wms.dto.LoginRequestDTO;
import pe.com.nexuslogix.wms.dto.LoginResponseDTO;
import pe.com.nexuslogix.wms.dto.RegisterRequestDTO;
import pe.com.nexuslogix.wms.dto.UserResponseDTO;

import java.util.List;

public interface AuthService {
    LoginResponseDTO authenticateUser(LoginRequestDTO loginRequest);
    UserResponseDTO registerUser(RegisterRequestDTO registerRequest);
    UserResponseDTO getUserProfile(Long id);
    List<UserResponseDTO> getAllUsers();
}
