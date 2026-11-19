package com.pe.nexuslogix;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.boot.test.context.SpringBootTest;
import com.pe.nexuslogix.dto.LoginRequestDTO;
import com.pe.nexuslogix.dto.LoginResponseDTO;
import com.pe.nexuslogix.services.AuthService;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
class NexuslogixApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    void kardexRequiereAutenticacion() throws Exception {
        mockMvc.perform(get("/api/inventario/kardex"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testAuthAdminWithShortPassword() {
        LoginResponseDTO response = authService.authenticate(new LoginRequestDTO("admin", "admin", "admin123"));
        assertTrue(response.isSuccess(), "Admin con admin123 debe autenticar exitosamente");
        assertNotNull(response.getToken(), "Debe retornar un token JWT");
    }

    @Test
    void testAuthAdminWithLegacyPassword() {
        LoginResponseDTO response = authService.authenticate(new LoginRequestDTO("admin", "admin", "admin123password"));
        assertTrue(response.isSuccess(), "Admin con admin123password debe autenticar exitosamente");
        assertNotNull(response.getToken(), "Debe retornar un token JWT");
    }

    @Test
    void testAuthAlmacenero() {
        LoginResponseDTO response = authService.authenticate(new LoginRequestDTO("almacenero", "almacenero", "almacen123"));
        assertTrue(response.isSuccess(), "Almacenero con almacen123 debe autenticar exitosamente");
        assertNotNull(response.getToken(), "Debe retornar un token JWT");
    }

    @Test
    void testAuthSupervisor() {
        LoginResponseDTO response = authService.authenticate(new LoginRequestDTO("supervisor", "supervisor", "super123"));
        assertTrue(response.isSuccess(), "Supervisor con super123 debe autenticar exitosamente");
        assertNotNull(response.getToken(), "Debe retornar un token JWT");
    }

    @Test
    void testAuthInvalidUserHandlesRollbackGracefully() {
        LoginResponseDTO response = authService.authenticate(new LoginRequestDTO("usuario_no_existe", "usuario_no_existe", "clave_falsa"));
        assertFalse(response.isSuccess(), "Usuario inexistente debe retornar isSuccess = false");
        assertTrue(response.getMensaje().contains("Credenciales inválidas"), "Debe indicar credenciales inválidas sin lanzar UnexpectedRollbackException");
    }
}
