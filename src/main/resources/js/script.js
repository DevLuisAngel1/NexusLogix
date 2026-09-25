const loginForm = document.getElementById("loginForm");

const loginButton = document.getElementById("loginButton");
const buttonText = document.getElementById("buttonText");
const loader = document.getElementById("loader");

const errorMessage = document.getElementById("errorMessage");

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");


// Mostrar / ocultar contraseña
togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.textContent = "🙈";
    } else {
        passwordInput.type = "password";
        togglePassword.textContent = "👁";
    }

});


// Login
loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const usuario = document
        .getElementById("usuario")
        .value
        .trim();

    const password = passwordInput.value;


    // Limpiar error
    errorMessage.style.display = "none";
    errorMessage.textContent = "";


    // Validación
    if (!usuario || !password) {

        mostrarError("Ingresa tu usuario y contraseña.");

        return;
    }


    // Estado de carga
    loginButton.disabled = true;

    buttonText.style.display = "none";
    loader.style.display = "block";


    try {

        const response = await fetch("/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                username: usuario,

                email: usuario,

                password: password

            })

        });


        const data = await response.json();


        console.log("Respuesta del servidor:", data);


        // Login correcto
        if (response.ok && data.success) {

            // Guardamos el token si existe
            if (data.token) {
                localStorage.setItem("token", data.token);
            }


            // Guardamos los datos del usuario
            if (data.usuario) {

                localStorage.setItem(
                    "usuario",
                    JSON.stringify(data.usuario)
                );

            }


            // Redireccionar
            window.location.href = "/dashboard";

            return;
        }


        // 401
        if (response.status === 401) {

            mostrarError(
                data.mensaje || "Credenciales inválidas."
            );

            return;
        }


        // 403
        if (response.status === 403) {

            mostrarError(
                data.mensaje || "El usuario se encuentra inactivo."
            );

            return;
        }


        // Otros errores
        mostrarError(
            data.mensaje || "No se pudo iniciar sesión."
        );


    } catch (error) {

        console.error("Error:", error);

        mostrarError(
            "No se pudo conectar con el servidor."
        );

    } finally {

        loginButton.disabled = false;

        buttonText.style.display = "block";
        loader.style.display = "none";

    }

});


function mostrarError(mensaje) {

    errorMessage.textContent = mensaje;

    errorMessage.style.display = "block";

}
