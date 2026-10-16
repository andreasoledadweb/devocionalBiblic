const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwu-POfY62YGv6Aoa_kVp3Jtg7-_4hmUcyGNDJz8F85R5rFMeehBRJGt0hI7dAQ37wlRg/exec";

let datosGlobales = {};
let testamentoActualSeleccionado = "";

document.addEventListener("DOMContentLoaded", () => {
  cargarDatosIniciales();
});

async function cargarDatosIniciales() {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getData`);
    datosGlobales = await res.json();
    
    poblarSelectores();
  } catch (error) {
    console.error("Error al cargar datos de Sheets:", error);
  }
}

function poblarSelectores() {
  // 1. Llenar Moods
  const selectMood = document.getElementById("select-mood");
  const selectMoodPractica = document.getElementById("select-mood-practica");
  
  if (datosGlobales.moods) {
    datosGlobales.moods.forEach(m => {
      selectMood.innerHTML += `<option value="${m}">${m}</option>`;
      selectMoodPractica.innerHTML += `<option value="${m}">${m}</option>`;
    });
  }
}

function mostrarSeccion(tipo) {
  document.getElementById("seccion-agregar").classList.add("oculto");
  document.getElementById("seccion-practicar").classList.add("oculto");

  if (tipo === 'agregar') {
    document.getElementById("seccion-agregar").classList.remove("oculto");
  } else if (tipo === 'practicar') {
    document.getElementById("seccion-practicar").classList.remove("oculto");
  }
}

function mostrarPractica(subtipo) {
  document.getElementById("practica-orden").classList.add("oculto");
  document.getElementById("practica-versiculos").classList.add("oculto");

  if (subtipo === 'orden-biblia') {
    document.getElementById("practica-orden").classList.remove("oculto");
  } else if (subtipo === 'versiculos') {
    document.getElementById("practica-versiculos").classList.remove("oculto");
  }
}

// Lógica de "Agregar"
async function guardarRegistro(event) {
  event.preventDefault();
  const mood = document.getElementById("select-mood").value;
  const fuente = document.getElementById("input-fuente").value;
  const contenido = document.getElementById("textarea-contenido").value;
  const mensaje = document.getElementById("mensaje-estado");

  mensaje.innerText = "Guardando...";

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "agregar", mood, fuente, contenido })
    });
    const resultado = await res.json();

    if (resultado.status === "success") {
      mensaje.innerText = "¡Guardado exitosamente en Sheets!";
      limpiarAgregar();
      cargarDatosIniciales(); // Recargar datos actualizados
    } else {
      mensaje.innerText = "Error al guardar.";
    }
  } catch (err) {
    mensaje.innerText = "Error de conexión.";
  }
}

function limpiarAgregar() {
  document.getElementById("select-mood").value = "";
  document.getElementById("input-fuente").value = "";
  document.getElementById("textarea-contenido").value = "";
}

// Lógica de "Orden Biblia"
function cargarTestamento(testamento) {
  testamentoActualSeleccionado = testamento;
  document.getElementById("form-orden-container").classList.remove("oculto");
  document.getElementById("titulo-testamento").innerText = testamento === 'antiguotestamento' ? "Antiguo Testamento" : "Nuevo Testamento";

  const selectGrupo = document.getElementById("select-grupo");
  selectGrupo.innerHTML = '<option value="">-- Selecciona un grupo --</option>';

  const listaGrupos = datosGlobales[testamento] || [];
  listaGrupos.forEach(item => {
    selectGrupo.innerHTML += `<option value="${item.grupo}">${item.grupo}</option>`;
  });
}

function verificarOrdenBiblia() {
  const grupoSeleccionado = document.getElementById("select-grupo").value;
  if (!grupoSeleccionado) return;

  const listaGrupos = datosGlobales[testamentoActualSeleccionado] || [];
  const encontrado = listaGrupos.find(item => item.grupo === grupoSeleccionado);

  if (encontrado) {
    document.getElementById("resultado-orden").classList.remove("oculto");
    document.getElementById("texto-respuesta-correcta").innerText = encontrado.respuesta;
  }
}

function limpiarOrdenBiblia() {
  document.getElementById("select-grupo").value = "";
  document.getElementById("input-respuesta-usuario").value = "";
  document.getElementById("resultado-orden").classList.add("oculto");
}

// Lógica de "Versículos Aprendidos"
function filtrarFuentesPorMood() {
  const moodSeleccionado = document.getElementById("select-mood-practica").value;
  const selectFuente = document.getElementById("select-fuente-practica");
  selectFuente.innerHTML = '<option value="">-- Selecciona una fuente --</option>';

  if (datosGlobales.registrosGuardados) {
    const filtrados = datosGlobales.registrosGuardados.filter(r => r.mood === moodSeleccionado);
    filtrados.forEach(f => {
      selectFuente.innerHTML += `<option value="${f.fuente}">${f.fuente}</option>`;
    });
  }
}

function verificarVersiculoAprendido() {
  const fuenteSeleccionada = document.getElementById("select-fuente-practica").value;
  if (!fuenteSeleccionada) return;

  const encontrado = datosGlobales.registrosGuardados.find(r => r.fuente === fuenteSeleccionada);
  if (encontrado) {
    document.getElementById("resultado-versiculo").classList.remove("oculto");
    document.getElementById("texto-respuesta-versiculo").innerText = encontrado.contenido;
  }
}

function limpiarVersiculosAprendidos() {
  document.getElementById("select-mood-practica").value = "";
  document.getElementById("select-fuente-practica").innerHTML = '<option value="">-- Selecciona una fuente --</option>';
  document.getElementById("textarea-contenido-practica").value = "";
  document.getElementById("resultado-versiculo").classList.add("oculto");
}