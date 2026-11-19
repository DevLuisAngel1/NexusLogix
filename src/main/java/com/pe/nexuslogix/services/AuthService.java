package com.pe.nexuslogix.services;

import com.pe.nexuslogix.dto.LoginRequestDTO;
import com.pe.nexuslogix.dto.LoginResponseDTO;
import com.pe.nexuslogix.dto.UserResponseDTO;

import java.util.List;
import java.util.Map;

public interface AuthService {

    LoginResponseDTO authenticate(LoginRequestDTO request);

    UserResponseDTO getUserProfile(Long id);

    List<UserResponseDTO> listAllUsers();

    UserResponseDTO createUser(Map<String, Object> data);

    UserResponseDTO updateUser(Long id, Map<String, Object> data);

    Map<String, Object> deleteUser(Long id);
}
