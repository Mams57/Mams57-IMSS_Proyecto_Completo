// IMSS | Gestión de Citas Médicas - comportamiento Front-End
const CLAVE_USUARIO = "usuarioIMSS";
const CLAVE_CITAS = "citasIMSS";

function leerJSON(clave, defecto) {
  try { return JSON.parse(localStorage.getItem(clave)) ?? defecto; }
  catch { return defecto; }
}

function mostrarLogin() {
  const el = document.getElementById("login");
  if (el) {
    el.classList.remove("hidden");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function cerrarLogin() {
  document.getElementById("login")?.classList.add("hidden");
}

function mostrarCita() {
  document.getElementById("citas")?.scrollIntoView({ behavior: "smooth" });
}

function iniciarSesion(event) {
  event.preventDefault();
  const nss = document.getElementById("loginNss").value.trim();
  const curp = document.getElementById("loginCurp").value.trim().toUpperCase();
  const password = document.getElementById("loginPassword").value;

  if (!/^\d{11}$/.test(nss)) return alert("El NSS debe contener exactamente 11 números.");
  if (!/^[A-Z0-9]{18}$/.test(curp)) return alert("La CURP debe contener 18 caracteres alfanuméricos.");
  if (!password.trim()) return alert("Escribe tu contraseña.");

  localStorage.setItem(CLAVE_USUARIO, JSON.stringify({ nss, curp }));
  cerrarLogin();
  document.getElementById("loginForm").reset();
  actualizarPanelUsuario();
  actualizarMisCitas();
  alert("Sesión de demostración iniciada. No se verificaron credenciales con un servidor.");
  document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
}

function cerrarSesion() {
  localStorage.removeItem(CLAVE_USUARIO);
  actualizarPanelUsuario();
  actualizarMisCitas();
  alert("Se cerró la sesión de demostración.");
}

function recuperarContrasena(event) {
  event.preventDefault();
  alert("La recuperación de contraseña no está implementada en este prototipo.");
}

function obtenerCitas() {
  return leerJSON(CLAVE_CITAS, []);
}

function guardarCitas(citas) {
  localStorage.setItem(CLAVE_CITAS, JSON.stringify(citas));
}

function escapeHTML(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function actualizarMisCitas() {
  const lista = document.getElementById("listaCitas");
  const total = document.getElementById("totalCitas");
  if (!lista) return;

  const usuario = leerJSON(CLAVE_USUARIO, null);
  let citas = usuario
    ? obtenerCitas().filter(c => c.nss === usuario.nss)
    : obtenerCitas();

  if (total) total.textContent = citas.length;

  const termino = (document.getElementById("buscadorCitas")?.value || "").trim().toLowerCase();
  if (termino) {
    citas = citas.filter(c =>
      [c.folio, c.nombre, c.nss, c.especialidad, c.medico, c.unidad, c.fecha, c.hora]
        .some(campo => String(campo ?? "").toLowerCase().includes(termino))
    );
  }

  if (!citas.length) {
    const mensajeVacio = termino
      ? "No se encontraron citas que coincidan con tu búsqueda."
      : (usuario
        ? "Todavía no tienes citas registradas con este NSS."
        : "Todavía no hay citas registradas. Inicia sesión para consultar las tuyas.");
    lista.innerHTML = `<div class="list-group-item text-secondary">${mensajeVacio}</div>`;
    return;
  }

  lista.innerHTML = citas.map(c => {
    const folioEscapado = escapeHTML(c.folio);
    return `
      <div class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <strong>${escapeHTML(c.especialidad)}</strong>${c.nombre ? ` — ${escapeHTML(c.nombre)}` : ""}<br>
          <small class="text-secondary">
            ${escapeHTML(c.fecha)} · ${escapeHTML(c.hora)} · ${escapeHTML(c.medico)} · ${escapeHTML(c.unidad)}
          </small>
          ${c.motivo ? `<div class="small mt-1">Motivo: ${escapeHTML(c.motivo)}</div>` : ""}
        </div>
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <span class="badge text-bg-primary">Folio ${folioEscapado}</span>
          <button type="button" class="btn btn-sm btn-outline-info" onclick="verDetalleCita('${folioEscapado}')">
            Detalles
          </button>
          <button type="button" class="btn btn-sm btn-outline-warning" onclick="abrirEditarCita('${folioEscapado}')">
            Editar
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger" onclick="eliminarCita('${folioEscapado}')">
            Eliminar
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function verDetalleCita(folio) {
  const c = obtenerCitas().find(item => item.folio === folio);
  if (!c) return;

  document.getElementById("detalleCitaBody").innerHTML = `
    <div class="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
      <span class="badge text-bg-primary fs-6">Folio: ${escapeHTML(c.folio)}</span>
      <span class="badge text-bg-light border text-dark">${escapeHTML(c.unidad)}</span>
    </div>
    <div class="detalle-grid">
      <div class="detalle-item">
        <span class="detalle-label">Paciente</span>
        <div class="detalle-valor">${escapeHTML(c.nombre)}</div>
      </div>
      <div class="detalle-item">
        <span class="detalle-label">Especialidad</span>
        <div class="detalle-valor">${escapeHTML(c.especialidad)}</div>
      </div>
      <div class="detalle-item">
        <span class="detalle-label">NSS</span>
        <div class="detalle-valor">${escapeHTML(c.nss)}</div>
      </div>
      <div class="detalle-item">
        <span class="detalle-label">CURP</span>
        <div class="detalle-valor">${escapeHTML(c.curp)}</div>
      </div>
      <div class="detalle-item">
        <span class="detalle-label">Médico</span>
        <div class="detalle-valor">${escapeHTML(c.medico)}</div>
      </div>
      <div class="detalle-item">
        <span class="detalle-label">Fecha y hora</span>
        <div class="detalle-valor">${escapeHTML(c.fecha)} · ${escapeHTML(c.hora)}</div>
      </div>
      <div class="detalle-item full-span">
        <span class="detalle-label">Motivo de la consulta</span>
        <div class="detalle-valor">${escapeHTML(c.motivo || "Sin motivo especificado")}</div>
      </div>
    </div>
  `;

  bootstrap.Modal.getOrCreateInstance(document.getElementById("detalleCitaModal")).show();
}

function abrirEditarCita(folio) {
  const c = obtenerCitas().find(item => item.folio === folio);
  if (!c) return;

  document.getElementById("editFolioOriginal").value = c.folio;
  document.getElementById("editNss").value = c.nss;
  document.getElementById("editCurp").value = c.curp;
  document.getElementById("editNombre").value = c.nombre || "";
  document.getElementById("editEspecialidad").value = c.especialidad;
  document.getElementById("editMedico").value = c.medico;
  document.getElementById("editUnidad").value = c.unidad;
  document.getElementById("editFecha").value = c.fecha;
  document.getElementById("editHora").value = c.hora;
  document.getElementById("editMotivo").value = c.motivo || "";

  bootstrap.Modal.getOrCreateInstance(document.getElementById("editarCitaModal")).show();
}

function guardarEdicionCita(event) {
  event.preventDefault();
  const folio = document.getElementById("editFolioOriginal").value;
  const nss = document.getElementById("editNss").value.trim();
  const curp = document.getElementById("editCurp").value.trim().toUpperCase();
  const nombre = document.getElementById("editNombre").value.trim();
  const especialidad = document.getElementById("editEspecialidad").value;
  const medico = document.getElementById("editMedico").value;
  const unidad = document.getElementById("editUnidad").value;
  const fecha = document.getElementById("editFecha").value;
  const hora = document.getElementById("editHora").value;
  const motivo = document.getElementById("editMotivo").value.trim();

  if (!/^\d{11}$/.test(nss)) return alert("El NSS debe contener exactamente 11 números.");
  if (!/^[A-Z0-9]{18}$/.test(curp)) return alert("La CURP debe contener 18 caracteres alfanuméricos.");

  const citas = obtenerCitas();
  const duplicada = citas.some(
    c => c.folio !== folio && c.medico === medico && c.fecha === fecha && c.hora === hora
  );
  if (duplicada) {
    return alert("Ese médico ya tiene otra cita registrada en esa fecha y hora.");
  }

  const citasActualizadas = citas.map(c =>
    c.folio === folio
      ? { ...c, nss, curp, nombre, especialidad, medico, unidad, fecha, hora, motivo }
      : c
  );

  guardarCitas(citasActualizadas);
  actualizarMisCitas();
  bootstrap.Modal.getInstance(document.getElementById("editarCitaModal"))?.hide();
}

function eliminarCita(folio) {
  if (!confirm(`¿Seguro que deseas eliminar la cita con folio ${folio}?`)) return;
  const citasRestantes = obtenerCitas().filter(c => c.folio !== folio);
  guardarCitas(citasRestantes);
  actualizarMisCitas();
}

function actualizarPanelUsuario() {
  const u = leerJSON(CLAVE_USUARIO, null);
  const estado = document.getElementById("estadoSesion");
  const bienvenida = document.getElementById("bienvenidaUsuario");
  const cerrar = document.getElementById("cerrarSesionBtn");

  if (estado) estado.textContent = u ? "Sesión iniciada" : "Modo demostración";
  if (bienvenida) {
    bienvenida.textContent = u
      ? `Sesión local activa para NSS terminado en ${u.nss.slice(-4)}.`
      : "Puedes explorar el panel y registrar una cita de demostración.";
  }
  if (cerrar) cerrar.classList.toggle("hidden", !u);
}

function confirmarCita(event) {
  event.preventDefault();
  const form = document.getElementById("citaForm");
  if (!form.checkValidity()) return form.reportValidity();

  const nss = document.getElementById("nss").value.trim();
  const curp = document.getElementById("curp").value.trim().toUpperCase();
  const medico = document.getElementById("medico").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  if (!/^\d{11}$/.test(nss)) {
    alert("El NSS debe contener exactamente 11 números.");
    return;
  }
  if (!/^[A-Z0-9]{18}$/.test(curp)) {
    alert("La CURP debe contener 18 caracteres alfanuméricos.");
    return;
  }

  const usuario = leerJSON(CLAVE_USUARIO, null);
  if (usuario && usuario.nss !== nss) {
    alert("El NSS de la cita no coincide con la sesión actual.");
    return;
  }

  const citas = obtenerCitas();
  const horarioOcupado = citas.some(
    c => c.medico === medico && c.fecha === fecha && c.hora === hora
  );
  if (horarioOcupado) {
    alert("Ese médico ya tiene una cita registrada en esa fecha y hora. Elige otro horario.");
    return;
  }

  const cita = {
    nss,
    curp,
    nombre: document.getElementById("nombre").value.trim(),
    especialidad: document.getElementById("especialidad").value,
    medico,
    unidad: document.getElementById("unidad").value,
    fecha,
    hora,
    motivo: document.getElementById("motivo").value.trim(),
    folio: "IMSS-" + Date.now().toString().slice(-6) + "-" + Math.floor(10 + Math.random() * 90)
  };

  citas.push(cita);
  guardarCitas(citas);
  actualizarMisCitas();

  document.getElementById("folio").textContent = cita.folio;
  const success = document.getElementById("success");
  if (success) {
    success.classList.remove("hidden");
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  form.reset();
  configurarFechaMinima();
}

function configurarFechaMinima() {
  const h = new Date();
  const min = `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`;
  ["fecha", "editFecha"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.min = min;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  actualizarPanelUsuario();
  actualizarMisCitas();
  configurarFechaMinima();
  ["curp", "loginCurp", "editCurp"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", e => {
      e.target.value = e.target.value.toUpperCase();
    });
  });
});