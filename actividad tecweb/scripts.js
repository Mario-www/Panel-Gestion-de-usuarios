// Variables globales
let usuarios = [];
let editando = false;

// Referencias al DOM
const formulario = document.getElementById('formulario-usuario');
const inputId = document.getElementById('id');
const inputNombre = document.getElementById('nombre');
const inputCorreo = document.getElementById('correo');
const inputCiudad = document.getElementById('ciudad');
const btnSubmit = document.getElementById('btn-submit');
const cuerpoTabla = document.getElementById('cuerpo-tabla');
const buscador = document.getElementById('buscador');
const mensajeEstado = document.getElementById('mensaje-estado');

// Función para mostrar mensajes dinámicos usando switch (requisito de validación)
const mostrarMensaje = (tipo, texto) => {
    switch (tipo) {
        case 'carga':
            mensajeEstado.textContent = texto;
            mensajeEstado.style.color = "blue";
            break;
        case 'error':
            mensajeEstado.textContent = `Error: ${texto}`;
            mensajeEstado.style.color = "red";
            break;
        case 'exito':
            mensajeEstado.textContent = texto;
            mensajeEstado.style.color = "green";
            break;
        case 'validacion':
            mensajeEstado.textContent = texto;
            mensajeEstado.style.color = "orange";
            break;
        default:
            mensajeEstado.textContent = "";
    }
    
    // Limpiar mensaje después de 3 segundos si no es de carga
    if (tipo !== 'carga') {
        setTimeout(() => {
            mensajeEstado.textContent = "";
        }, 3000);
    }
};

// Requisito: Uso de al menos un bucle (contar usuarios por ciudad)
const analizarUsuariosPorCiudad = () => {
    let contadorCiudades = {};
    for (let i = 0; i < usuarios.length; i++) {
        let ciudad = usuarios[i].ciudad;
        contadorCiudades[ciudad] = (contadorCiudades[ciudad] || 0) + 1;
    }
    console.log("Análisis de usuarios por ciudad (Bucle for):", contadorCiudades);
};

// Carga inicial de datos desde la API
const cargarUsuarios = async () => {
    mostrarMensaje('carga', "Cargando usuarios desde la API...");
    try {
        const respuesta = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!respuesta.ok) throw new Error("No se pudo conectar a la API");
        
        const datosGenerales = await respuesta.json();
        
        // Transformar los datos usando map() y destructuring
        usuarios = datosGenerales.map(usuario => {
            const { id, name, email, address: { city } } = usuario;
            return { id, nombre: name, correo: email, ciudad: city };
        });

        console.log("Arreglo completo de usuarios cargado:", JSON.stringify(usuarios, null, 2));
        analizarUsuariosPorCiudad();
        dibujarTabla(usuarios);
        mostrarMensaje('exito', "Usuarios cargados correctamente");
        
    } catch (error) {
        mostrarMensaje('error', error.message);
    }
};

// Redibujar la tabla dinámicamente con el DOM
const dibujarTabla = (datos) => {
    cuerpoTabla.innerHTML = ''; // Limpiar tabla
    
    datos.forEach(usuario => {
        const { id, nombre, correo, ciudad } = usuario; // Destructuring
        
        const fila = document.createElement('tr');
        // Uso de template strings
        fila.innerHTML = `
            <td>${id}</td>
            <td>${nombre}</td>
            <td>${correo}</td>
            <td>${ciudad}</td>
            <td>
                <button class="btn-editar" data-id="${id}">Editar</button>
                <button class="btn-eliminar" data-id="${id}">Eliminar</button>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });
};

// Evento: Búsqueda en vivo usando filter()
buscador.addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase();
    const usuariosFiltrados = usuarios.filter(usuario => 
        usuario.nombre.toLowerCase().includes(termino)
    );
    dibujarTabla(usuariosFiltrados); // Redibuja sin afectar el array original
});

// Evento: Delegación de eventos para botones Editar y Eliminar
cuerpoTabla.addEventListener('click', (e) => {
    // ELIMINAR
    if (e.target.classList.contains('btn-eliminar')) {
        const idEliminar = parseInt(e.target.dataset.id);
        
        if (confirm(`¿Estás seguro de que deseas eliminar al usuario con ID ${idEliminar}?`)) {
            // Eliminar del array usando filter
            usuarios = usuarios.filter(u => u.id !== idEliminar);
            
            console.log("Arreglo tras eliminación:", usuarios);
            dibujarTabla(usuarios);
            mostrarMensaje('exito', "Usuario eliminado correctamente");
        }
    }

    // EDITAR (Cargar datos)
    if (e.target.classList.contains('btn-editar')) {
        const idEditar = parseInt(e.target.dataset.id);
        const usuarioAEditar = usuarios.find(u => u.id === idEditar);
        
        if (usuarioAEditar) {
            inputId.value = usuarioAEditar.id;
            inputId.disabled = true; // Bloquear ID
            inputNombre.value = usuarioAEditar.nombre;
            inputCorreo.value = usuarioAEditar.correo;
            inputCiudad.value = usuarioAEditar.ciudad;
            
            editando = true;
            btnSubmit.textContent = "Guardar cambios";
        }
    }
});

// Evento: Enviar formulario (Agregar o Modificar)
formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const idVal = parseInt(inputId.value);
    const nombreVal = inputNombre.value.trim();
    const correoVal = inputCorreo.value.trim();
    const ciudadVal = inputCiudad.value.trim();

    // Validaciones estrictas con condicionales
    if (!idVal || !nombreVal || !correoVal || !ciudadVal) {
        mostrarMensaje('validacion', "Todos los campos son obligatorios.");
        return;
    }
    
    if (!correoVal.includes('@')) {
        mostrarMensaje('validacion', "El correo debe ser válido y contener '@'.");
        return;
    }

    if (editando) {
        // Modificar: Mapear el arreglo para actualizar el usuario modificado
        usuarios = usuarios.map(u => 
            u.id === idVal ? { id: idVal, nombre: nombreVal, correo: correoVal, ciudad: ciudadVal } : u
        );
        
        mostrarMensaje('exito', "Usuario modificado correctamente");
        
        // Resetear estado de edición
        editando = false;
        inputId.disabled = false;
        btnSubmit.textContent = "Agregar Usuario";
    } else {
        // Agregar: Validar que el ID no exista en el array
        const idExiste = usuarios.some(u => u.id === idVal);
        
        if (idExiste) {
            mostrarMensaje('validacion', `Ya existe un usuario con el ID ${idVal}. Por favor ingresa otro.`);
            return;
        }

        // Agregar al array
        usuarios.push({ id: idVal, nombre: nombreVal, correo: correoVal, ciudad: ciudadVal });
        mostrarMensaje('exito', "Usuario agregado correctamente");
    }

    console.log("Arreglo actualizado:", usuarios);
    analizarUsuariosPorCiudad(); // Ejecuta el bucle de conteo nuevamente
    dibujarTabla(usuarios);
    formulario.reset();
});

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', cargarUsuarios);