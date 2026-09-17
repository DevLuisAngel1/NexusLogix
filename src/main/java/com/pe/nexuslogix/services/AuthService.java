package com.pe.nexuslogix.services;

import com.pe.nexuslogix.dto.LoginRequestDTO;
import com.pe.nexuslogix.dto.LoginResponseDTO;
import com.pe.nexuslogix.dto.UserResponseDTO;

import java.util.List;

public interface AuthService {

    LoginResponseDTO authenticate(LoginRequestDTO request);

    UserResponseDTO getUserProfile(Long id);

    List<UserResponseDTO> listAllUsers();
}
