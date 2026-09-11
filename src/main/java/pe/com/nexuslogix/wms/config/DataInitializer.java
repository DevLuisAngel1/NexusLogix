package pe.com.nexuslogix.wms.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import pe.com.nexuslogix.wms.models.ERole;
import pe.com.nexuslogix.wms.models.Role;
import pe.com.nexuslogix.wms.models.User;
import pe.com.nexuslogix.wms.repositories.RoleRepository;
import pe.com.nexuslogix.wms.repositories.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Verificando e inicializando roles y usuarios base del sistema NexusLogix WMS...");

        // 1. Inicializar los 3 Roles del Sistema
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElseGet(() -> {
            logger.info("Creando Rol: ROLE_ADMIN");
            return roleRepository.save(new Role(ERole.ROLE_ADMIN, "Administrador General y Jefe de Operaciones WMS"));
        });

        Role almacenRole = roleRepository.findByName(ERole.ROLE_ALMACEN).orElseGet(() -> {
            logger.info("Creando Rol: ROLE_ALMACEN");
            return roleRepository.save(new Role(ERole.ROLE_ALMACEN, "Jefe y Operarios de Bodega / Despacho"));
        });

        Role clienteRole = roleRepository.findByName(ERole.ROLE_CLIENTE).orElseGet(() -> {
            logger.info("Creando Rol: ROLE_CLIENTE");
            return roleRepository.save(new Role(ERole.ROLE_CLIENTE, "Cliente B2B y Ejecutivo Comercial"));
        });

        // 2. Inicializar Usuario con ROLE_ADMIN
        if (!userRepository.existsByUsername("admin.wms")) {
            User admin = new User();
            admin.setUsername("admin.wms");
            admin.setEmail("admin@nexuslogix.pe");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setFullName("Carlos Mendoza - Administrador Lead");
            admin.setPhone("+51 987654321");
            admin.setPosition("Jefe de Operaciones y TI");
            admin.setRole(adminRole);
            admin.setActive(true);
            userRepository.save(admin);
            logger.info("Usuario inicial creado: admin.wms / password123 (ROLE_ADMIN)");
        }

        // 3. Inicializar Usuario con ROLE_ALMACEN
        if (!userRepository.existsByUsername("operario.lurin")) {
            User operario = new User();
            operario.setUsername("operario.lurin");
            operario.setEmail("operaciones.lurin@nexuslogix.pe");
            operario.setPassword(passwordEncoder.encode("password123"));
            operario.setFullName("Juan Perez - Operario Bodega Lurin");
            operario.setPhone("+51 912345678");
            operario.setPosition("Operador de Picking y Bodega");
            operario.setRole(almacenRole);
            operario.setActive(true);
            userRepository.save(operario);
            logger.info("Usuario inicial creado: operario.lurin / password123 (ROLE_ALMACEN)");
        }

        // 4. Inicializar Usuario con ROLE_CLIENTE
        if (!userRepository.existsByUsername("minera.sur")) {
            User cliente = new User();
            cliente.setUsername("minera.sur");
            cliente.setEmail("compras@minerasur.com.pe");
            cliente.setPassword(passwordEncoder.encode("password123"));
            cliente.setFullName("Consorcio Minero del Sur B2B");
            cliente.setPhone("+51 955443322");
            cliente.setPosition("Cliente Corporativo B2B");
            cliente.setRole(clienteRole);
            cliente.setActive(true);
            userRepository.save(cliente);
            logger.info("Usuario inicial creado: minera.sur / password123 (ROLE_CLIENTE)");
        }

        logger.info("Inicializacion de roles y usuarios completada con exito.");
    }
}
