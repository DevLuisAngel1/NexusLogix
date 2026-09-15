package com.pe.nexuslogix.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {

    private boolean success;
    private String mensaje;
    private String token;
    private UserResponseDTO usuario;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserResponseDTO getUsuario() {
        return usuario;
    }

    public void setUsuario(UserResponseDTO usuario) {
        this.usuario = usuario;
    }
}
