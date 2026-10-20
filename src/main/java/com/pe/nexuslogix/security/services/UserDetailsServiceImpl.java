package com.pe.nexuslogix.security.services;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.pe.nexuslogix.models.User;
import com.pe.nexuslogix.repositories.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        if (identifier == null || identifier.isBlank()) {
            throw new UsernameNotFoundException("Identificador de usuario vacío.");
        }

        String search = identifier.trim().toLowerCase();

        // Mapeo inteligente de alias comunes usados en frontend y pruebas
        if (search.equals("almacenero") || search.equals("almacen")) {
            search = "almacen.lead";
        } else if (search.equals("supervisor") || search.equals("despacho")) {
            search = "despacho.op";
        } else if (search.equals("cliente")) {
            search = "cliente.minero";
        }

        // 1. Buscar por el identificador o alias mapeado
        String finalSearch = search;
        User user = userRepository.findByUsernameOrEmail(finalSearch)
                // 2. Si no se encuentra, intentar con el texto original sin procesar
                .orElseGet(() -> userRepository.findByUsernameOrEmail(identifier.trim())
                        .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con credencial: " + identifier)));

        return UserDetailsImpl.build(user);
    }
}
