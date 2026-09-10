# NexusLogix WMS - Backend REST API (Spring Boot + Spring Security + JWT)

Sistema de Gestión de Almacén y Despacho para **NexusLogix Perú S.A.C.**  
Desarrollado con **Java 17+**, **Spring Boot 3.3.4**, **Spring Security 6**, **JJWT 0.12.6**, **Spring Data JPA**, **Lombok** y **MySQL 8.0**.

---

## Estructura del Equipo y Módulos

| Integrante | Rol | Módulo Asignado | Rama Git Asignada | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Integrante 1 (Lead)** | Arquitectura Backend & Auth | Autenticación, Usuarios y Seguridad JWT (`/api/auth`) | `feature/auth-users` |  Por integrar |
| **Integrante 2** | Desarrollador | Catálogo e Inventario (`/api/products`) | `feature/inventory-catalog` |  Pendiente |
| **Integrante 3** | Desarrollador | Pedidos, Portal B2B y Despacho (`/api/orders`) | `feature/orders-dispatch` |  Pendiente |

---

## Requisitos Previos

- **Java JDK 17 o superior** (Detectado JDK 26)
- **Apache Maven 3.8+** (Instalado en el sistema)
- **MySQL Server 8.0** (Base de datos: `nexuslogix_wms`)

---

## Compilación y Ejecución

1. **Compilar el proyecto con Maven:**
   ```bash
   mvn clean compile
   ```

2. **Empaquetar la aplicación en archivo JAR:**
   ```bash
   mvn clean package -DskipTests
   ```

3. **Ejecutar el servidor Spring Boot:**
   ```bash
   java -jar target/nexuslogix-wms-backend-1.0.0.jar
   ```

El servidor quedará activo en `http://localhost:3000`.

---

## Endpoints y Flujo de Seguridad JWT

| Endpoint | Método | Seguridad | Descripción |
| :--- | :---: | :---: | :--- |
| `/health` | `GET` | Público (`permitAll`) | Verificación del estado del servidor. |
| `/api/auth/login` | `POST` | Público (`permitAll`) | Autentica con `AuthenticationManager` y retorna token JWT firmado. |
| `/api/auth/users` | `GET` | Protegido (`Bearer <JWT>`) | Lista los colaboradores registrados (Rechaza con 401 si no hay token). |
| `/api/auth/profile/{id}` | `GET` | Protegido (`Bearer <JWT>`) | Consulta el perfil de un usuario específico. |

---

## Arquitectura Empresarial por Capas (Spring Boot)

```text
nexuslogix-wms-vcs/
├── pom.xml                               # Spring Boot 3, Spring Security, JJWT, JPA, Lombok, MySQL
├── database/
│   └── schema.sql                        # Script DDL y datos de prueba en MySQL (nexuslogix_wms)
├── docs/
│   ├── diagrama_bd.puml                  # Diagrama ER en PlantUML
│   ├── diagrama_bd_nexuslogix.png        # Imagen renderizada del modelo relacional
│   └── postman_collection.json           # Colección de pruebas con autenticación Bearer JWT
├── .gitignore
├── README.md
└── src/
    └── main/
        ├── java/pe/com/nexuslogix/wms/
        │   ├── NexusLogixWmsApplication.java  # Clase principal Spring Boot
        │   │
        │   ├── config/
        │   │   └── SecurityConfig.java        # Spring Security 6, CORS, PasswordEncoder y Filtro JWT
        │   │
        │   ├── security/
        │   │   ├── jwt/
        │   │   │   ├── JwtUtils.java          # Generación, validación y extracción de Claims JWT
        │   │   │   ├── AuthEntryPointJwt.java # Manejador de error 401 Unauthorized en JSON
        │   │   │   └── AuthTokenFilter.java   # Filtro OncePerRequestFilter para Bearer Token
        │   │   └── services/
        │   │       ├── UserDetailsImpl.java   # Implementación de UserDetails de Spring Security
        │   │       └── UserDetailsServiceImpl.java # Implementación de UserDetailsService
        │   │
        │   ├── models/                        # Entidades JPA con Lombok (@Getter, @Setter, @Builder)
        │   │   ├── Role.java
        │   │   └── User.java
        │   │
        │   ├── dto/                           # Data Transfer Objects con Lombok
        │   │   ├── LoginRequestDTO.java
        │   │   ├── LoginResponseDTO.java
        │   │   └── UserResponseDTO.java
        │   │
        │   ├── repositories/                  # Acceso a Datos (Spring Data JPA)
        │   │   ├── RoleRepository.java
        │   │   └── UserRepository.java
        │   │
        │   ├── services/                      # Interfaces y Lógica de Negocio
        │   │   ├── AuthService.java
        │   │   └── impl/
        │   │       └── AuthServiceImpl.java   # Autenticación con AuthenticationManager
        │   │
        │   └── controllers/                   # Controladores REST
        │       ├── AuthController.java
        │       └── HealthController.java
        │
        └── resources/
            └── application.properties         # Conexión JDBC a MySQL y configuración de secreto JWT
```
