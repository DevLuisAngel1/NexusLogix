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

        // Alias de login rápido
        if (search.equals("operador") || search.equals("almacenero") || search.equals("almacen")) {
            search = "almacen.lead";
        } else if (search.equals("supervisor") || search.equals("despacho")) {
            search = "despacho.op";
        } else if (search.equals("cliente") || search.equals("minero")) {
            search = "cliente.minero";
        }

        String finalSearch = search;
        User user = userRepository.findByUsernameOrEmail(finalSearch)
                .orElseGet(() -> userRepository.findByUsernameOrEmail(identifier.trim())
                        .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con credencial: " + identifier)));

        return UserDetailsImpl.build(user);
    }
}
