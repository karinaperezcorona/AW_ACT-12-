
const seccionLogin = document.getElementById("seccionLogin");
const formLogin = document.getElementById("formLogin");
const loginNombre = document.getElementById("loginNombre");
const loginRol = document.getElementById("loginRol");
const barraSesion = document.getElementById("barraSesion");
const sesionNombre = document.getElementById("sesionNombre");
const sesionRol = document.getElementById("sesionRol");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

// Elementos del Panel Jefe de Área
const panelJefe = document.getElementById("panelJefe");
const formEquipo = document.getElementById("formEquipo");
const nombreEquipo = document.getElementById("nombreEquipo");
const listaInventario = document.getElementById("listaInventario");
const listaPrestamosJefe = document.getElementById("listaPrestamosJefe");

// Elementos del Panel Enfermero/a
const panelEnfermero = document.getElementById("panelEnfermero");
const listaDisponibles = document.getElementById("listaDisponibles");
const listaPrestamosEnfermero = document.getElementById("listaPrestamosEnfermero");


document.addEventListener("DOMContentLoaded", () => {
  inicializarDatos();
  enrutarSesion();
});


function inicializarDatos() {
  if (!localStorage.getItem("inventarioEquipos")) {
    const inventarioInicial = [
      { id: 1, nombre: "Desfibrilador A", disponible: true },
      { id: 2, nombre: "Electrocardiógrafo B", disponible: true },
      { id: 3, nombre: "Monitor de Signos Vitales C", disponible: true }
    ];
    localStorage.setItem("inventarioEquipos", JSON.stringify(inventarioInicial));
  }

  if (!localStorage.getItem("prestamosActivos")) {
    localStorage.setItem("prestamosActivos", JSON.stringify([]));
  }
}


formLogin.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = loginNombre.value.trim();
  const rol = loginRol.value;

  if (!nombre || !rol) {
    alert("Por favor completa todos los campos.");
    return;
  }


  const usuarioSesion = { nombre, rol };
  sessionStorage.setItem("usuarioSesion", JSON.stringify(usuarioSesion));

  formLogin.reset();
  enrutarSesion();
});


btnCerrarSesion.addEventListener("click", () => {
  sessionStorage.removeItem("usuarioSesion");
  enrutarSesion();
});


function enrutarSesion() {
  const usuarioSesion = JSON.parse(sessionStorage.getItem("usuarioSesion"));


  if (!usuarioSesion) {
    seccionLogin.classList.remove("d-none");
    barraSesion.classList.add("d-none");
    panelJefe.classList.add("d-none");
    panelEnfermero.classList.add("d-none");
    return;
  }

 
  seccionLogin.classList.add("d-none");
  barraSesion.classList.remove("d-none");
  sesionNombre.textContent = usuarioSesion.nombre;
  sesionRol.textContent = usuarioSesion.rol;

  if (usuarioSesion.rol === "Jefe de Area") {
    panelJefe.classList.remove("d-none");
    panelEnfermero.classList.add("d-none");
    mostrarInventarioJefe();
    mostrarPrestamosJefe();
  } else if (usuarioSesion.rol === "Enfermero/a") {
    panelJefe.classList.add("d-none");
    panelEnfermero.classList.remove("d-none");
    mostrarDisponibles();
    mostrarPrestamosEnfermero();
  }
}


formEquipo.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = nombreEquipo.value.trim();

  if (!nombre) {
    alert("Por favor ingresa el nombre del equipo.");
    return;
  }

  let inventario = JSON.parse(localStorage.getItem("inventarioEquipos")) || [];

  const nuevoEquipo = {
    id: Date.now(),
    nombre: nombre,
    disponible: true
  };

  inventario.push(nuevoEquipo);
  localStorage.setItem("inventarioEquipos", JSON.stringify(inventario));

  formEquipo.reset();
  mostrarInventarioJefe();
  alert("Equipo agregado correctamente al inventario.");
});


function mostrarInventarioJefe() {
  let inventario = JSON.parse(localStorage.getItem("inventarioEquipos")) || [];
  listaInventario.innerHTML = "";

  if (inventario.length === 0) {
    listaInventario.innerHTML = "<p class='text-muted'>No hay equipos registrados en el inventario.</p>";
    return;
  }

  inventario.forEach((equipo) => {
    const estadoBadge = equipo.disponible
      ? '<span class="badge bg-success">Disponible</span>'
      : '<span class="badge bg-danger">En préstamo</span>';

    listaInventario.innerHTML += `
      <div class="card mb-2 shadow-sm">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">${equipo.nombre}</h5>
            <p class="mb-0"><strong>Estado:</strong> ${estadoBadge}</p>
          </div>
          <div>
            <button class="btn btn-sm btn-danger" onclick="eliminarEquipo(${equipo.id})">Eliminar 🗑️</button>
          </div>
        </div>
      </div>
    `;
  });
}


function eliminarEquipo(idEquipo) {
  let inventario = JSON.parse(localStorage.getItem("inventarioEquipos")) || [];
  const equipo = inventario.find(eq => eq.id === idEquipo);

  if (equipo && !equipo.disponible) {
    alert("No puedes eliminar un equipo que se encuentra actualmente en préstamo.");
    return;
  }

  if (confirm("¿Deseas eliminar este equipo del inventario?")) {
    inventario = inventario.filter(eq => eq.id !== idEquipo);
    localStorage.setItem("inventarioEquipos", JSON.stringify(inventario));
    mostrarInventarioJefe();
  }
}


function mostrarPrestamosJefe() {
  let prestamos = JSON.parse(localStorage.getItem("prestamosActivos")) || [];
  listaPrestamosJefe.innerHTML = "";

  if (prestamos.length === 0) {
    listaPrestamosJefe.innerHTML = "<p class='text-muted'>No hay préstamos activos en este momento.</p>";
    return;
  }

  prestamos.forEach((p) => {
    listaPrestamosJefe.innerHTML += `
      <div class="card mb-2 shadow-sm border-warning">
        <div class="card-body">
          <h5 class="mb-1 text-primary">${p.equipoNombre}</h5>
          <p class="mb-0"><strong>Prestado a:</strong> ${p.enfermero}</p>
          <p class="mb-0 text-muted"><small><strong>Fecha/Hora:</strong> ${p.fecha}</small></p>
        </div>
      </div>
    `;
  });
}


function mostrarDisponibles() {
  let inventario = JSON.parse(localStorage.getItem("inventarioEquipos")) || [];
  let disponibles = inventario.filter(eq => eq.disponible === true);

  listaDisponibles.innerHTML = "";

  if (disponibles.length === 0) {
    listaDisponibles.innerHTML = "<p class='text-muted'>No hay equipos disponibles en este momento.</p>";
    return;
  }

  disponibles.forEach((equipo) => {
    listaDisponibles.innerHTML += `
      <div class="card mb-2 shadow-sm">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">${equipo.nombre}</h5>
            <span class="badge bg-success">Disponible</span>
          </div>
          <div>
            <button class="btn btn-sm btn-success" onclick="solicitarPrestamo(${equipo.id})">Solicitar Préstamo 📋</button>
          </div>
        </div>
      </div>
    `;
  });
}


function solicitarPrestamo(idEquipo) {
  const usuarioSesion = JSON.parse(sessionStorage.getItem("usuarioSesion"));
  if (!usuarioSesion) {
    alert("Debes iniciar sesión para realizar una solicitud.");
    return;
  }

  let inventario = JSON.parse(localStorage.getItem("inventarioEquipos")) || [];
  let prestamos = JSON.parse(localStorage.getItem("prestamosActivos")) || [];

  const equipo = inventario.find(eq => eq.id === idEquipo);

  if (!equipo || !equipo.disponible) {
    alert("El equipo seleccionado no está disponible.");
    return;
  }

  equipo.disponible = false;

  const nuevoPrestamo = {
    id: Date.now(),
    equipoId: equipo.id,
    equipoNombre: equipo.nombre,
    enfermero: usuarioSesion.nombre,
    fecha: new Date().toLocaleString()
  };
  prestamos.push(nuevoPrestamo);


  localStorage.setItem("inventarioEquipos", JSON.stringify(inventario));
  localStorage.setItem("prestamosActivos", JSON.stringify(prestamos));

  alert(`Has solicitado el equipo "${equipo.nombre}".`);

  mostrarDisponibles();
  mostrarPrestamosEnfermero();
}


function mostrarPrestamosEnfermero() {
  let prestamos = JSON.parse(localStorage.getItem("prestamosActivos")) || [];
  listaPrestamosEnfermero.innerHTML = "";

  if (prestamos.length === 0) {
    listaPrestamosEnfermero.innerHTML = "<p class='text-muted'>No tienes o no hay préstamos activos.</p>";
    return;
  }

  prestamos.forEach((p) => {
    listaPrestamosEnfermero.innerHTML += `
      <div class="card mb-2 shadow-sm border-info">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">${p.equipoNombre}</h5>
            <p class="mb-0"><strong>Tomado por:</strong> ${p.enfermero}</p>
            <p class="mb-0 text-muted"><small><strong>Fecha:</strong> ${p.fecha}</small></p>
          </div>
          <div>
            <button class="btn btn-sm btn-warning" onclick="devolverEquipo(${p.id})">Devolver Equipo ↩️</button>
          </div>
        </div>
      </div>
    `;
  });
}


function devolverEquipo(idPrestamo) {
  let prestamos = JSON.parse(localStorage.getItem("prestamosActivos")) || [];
  let inventario = JSON.parse(localStorage.getItem("inventarioEquipos")) || [];

  const prestamoIndex = prestamos.findIndex(p => p.id === idPrestamo);

  if (prestamoIndex === -1) {
    alert("No se encontró el préstamo.");
    return;
  }

  const prestamo = prestamos[prestamoIndex];


  const equipo = inventario.find(eq => eq.id === prestamo.equipoId || eq.nombre === prestamo.equipoNombre);
  if (equipo) {
    equipo.disponible = true;
  }


  prestamos.splice(prestamoIndex, 1);


  localStorage.setItem("inventarioEquipos", JSON.stringify(inventario));
  localStorage.setItem("prestamosActivos", JSON.stringify(prestamos));

  alert(`El equipo "${prestamo.equipoNombre}" ha sido devuelto al inventario.`);

  mostrarDisponibles();
  mostrarPrestamosEnfermero();
}
