# NexusLogix — Frontend (React + Vite + Tailwind CSS)

Módulo frontend para el sistema de gestión de almacenes y logística **NexusLogix (WMS)**.

## 🚀 Tecnologías Utilizadas

- **React 19** + **Vite 8**
- **React Router DOM 7** (Enrutamiento y rutas protegidas)
- **Tailwind CSS v4** (Diseño moderno y responsivo)
- **Lucide React** (Iconografía consistente con el mockup)
- **Axios** (Cliente HTTP con interceptores JWT Bearer)

---

## 📂 Estructura del Proyecto

```text
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── axios.js           # Cliente Axios con interceptor de Authorization Bearer token
│   │   └── authService.js     # Servicios de Login, Usuarios y Métricas
│   ├── components/
│   │   ├── Sidebar.jsx        # Menú lateral con branding NexusLogix y navegación
│   │   ├── Navbar.jsx         # Barra superior con buscador y perfil de usuario
│   │   ├── DashboardLayout.jsx # Layout envolvente para páginas autenticadas
│   │   └── ProtectedRoute.jsx # Guardián de rutas autenticadas
│   ├── context/
│   │   └── AuthContext.jsx    # Proveedor global de autenticación y sesión
│   ├── pages/
│   │   ├── Login.jsx          # Pantalla 1: Inicio de sesión (Mockup)
│   │   ├── Dashboard.jsx      # Pantalla 2: Panel de control y métricas
│   │   ├── Users.jsx          # Pantalla 3: Gestión de usuarios
│   │   ├── Profile.jsx        # Pantalla 11: Mi perfil
│   │   ├── ProductsPlaceholder.jsx # Pantallas 4-6 (Integrante 2)
│   │   ├── OrdersPlaceholder.jsx   # Pantallas 7-8 (Integrante 3)
│   │   ├── DispatchPlaceholder.jsx # Pantallas 9-10 (Integrante 3)
│   │   └── ReportsPlaceholder.jsx  # Reportes y estadísticas
│   ├── App.jsx                # Configuración de rutas de la aplicación
│   ├── index.css              # Configuración base de Tailwind CSS v4
│   └── main.jsx               # Punto de entrada de la aplicación
├── package.json
└── vite.config.js             # Configuración de proxy /api -> http://localhost:8090
```

---

## 🛠️ Instrucciones de Ejecución

### 1. Iniciar el Backend (Spring Boot)
Asegurarse de que el backend esté corriendo en el puerto `8090`:
```bash
# Desde la raíz del repositorio NexusLogix
./mvnw spring-boot:run
```

### 2. Iniciar el Frontend
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
La aplicación estará disponible en: [http://localhost:5173](http://localhost:5173).

---

## 🔐 Credenciales de Prueba (Semilla de Base de Datos)

| Rol | Usuario | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin` | `admin123` |
| **Almacenero** | `almacenero` | `almacen123` |
| **Supervisor** | `supervisor` | `super123` |
