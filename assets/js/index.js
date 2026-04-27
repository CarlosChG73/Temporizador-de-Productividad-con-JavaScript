// #### Referencias del DOM ####

// Formulario principal
const formularioTemporizador = document.getElementById("formulario-temporizador");

// Campos de trabajo
const inputTrabajoMinutos = document.getElementById("trabajo-minutos");
const inputTrabajoSegundos = document.getElementById("trabajo-segundos");

// Campos de descanso
const inputDescansoMinutos = document.getElementById("descanso-minutos");
const inputDescansoSegundos = document.getElementById("descanso-segundos");

// Campo de ciclos
const inputCantidadCiclos = document.getElementById("cantidad-ciclos");

// Botones de control
const btnIniciar = document.getElementById("btn-iniciar");
const btnPausar = document.getElementById("btn-pausar");
const btnReanudar = document.getElementById("btn-reanudar");
const btnReiniciar = document.getElementById("btn-reiniciar");

// Elementos visuales del temporizador
const bloqueEstado = document.getElementById("bloque-estado");
const estadoActual = document.getElementById("estado-actual");
const tiempoRestante = document.getElementById("tiempo-restante");
const cicloActual = document.getElementById("ciclo-actual");
const mensajeApoyo = document.getElementById("mensaje-apoyo");

// Resumen rápido
const resumenTrabajo = document.getElementById("resumen-trabajo");
const resumenDescanso = document.getElementById("resumen-descanso");
const resumenCiclos = document.getElementById("resumen-ciclos");

// Audio de alerta
const audioAlerta = document.getElementById("audio-alerta");


// #### Estado global de la aplicación ####

// Identificador del intervalo activo.
// Se utiliza con setInterval y clearInterval.
let intervaloTemporizador = null;

// Configuración de la sesión expresada en segundos.
let duracionTrabajoSegundos = 0;
let duracionDescansoSegundos = 0;
let totalCiclos = 0;

// Variables de control del flujo.
let cicloEnCurso = 0;
let esTrabajo = true;
let estaPausado = false;
let sesionIniciada = false;

// Tiempo restante de la fase actual, expresado en segundos.
let tiempoRestanteSegundos = 0;


// #### Funciones de apoyo ####

// Convierte minutos y segundos a segundos totales.
function convertirASegundos(minutos, segundos) {
  return (minutos * 60) + segundos;
}

// Formatea un valor en segundos a MM:SS.
function formatearTiempo(segundosTotales) {
  const minutos = Math.floor(segundosTotales / 60);
  const segundos = segundosTotales % 60;

  const minutosFormateados = String(minutos).padStart(2, "0");
  const segundosFormateados = String(segundos).padStart(2, "0");

  return `${minutosFormateados}:${segundosFormateados}`;
}

// Actualiza el contador principal en pantalla.
function actualizarContador() {
  tiempoRestante.textContent = formatearTiempo(tiempoRestanteSegundos);
}

// Actualiza el resumen de configuración.
function actualizarResumen() {
  resumenTrabajo.textContent = formatearTiempo(duracionTrabajoSegundos);
  resumenDescanso.textContent = formatearTiempo(duracionDescansoSegundos);
  resumenCiclos.textContent = totalCiclos;
}

// Actualiza el indicador del ciclo actual.
function actualizarCicloVisual() {
  cicloActual.textContent = `${cicloEnCurso} de ${totalCiclos}`;
}

// Elimina las clases visuales de estado.
function limpiarEstadosVisuales() {
  bloqueEstado.classList.remove("estado-trabajo", "estado-descanso", "estado-pausado");
}

// Reproduce el audio de alerta.
// Algunos navegadores pueden bloquear la reproducción automática.
function reproducirAlerta() {
  if (!audioAlerta) return;

  audioAlerta.currentTime = 0;

  audioAlerta.play().catch(() => {
    // Si el navegador bloquea el audio, la aplicación continúa.
  });
}

// Actualiza el estado textual y visual del temporizador.
function actualizarEstadoVisual() {
  limpiarEstadosVisuales();

  if (!sesionIniciada) {
    estadoActual.textContent = "Esperando configuración";
    mensajeApoyo.textContent = "Configura tus tiempos y presiona iniciar para comenzar.";
    return;
  }

  if (estaPausado) {
    bloqueEstado.classList.add("estado-pausado");
    estadoActual.textContent = "Sesión en pausa";
    mensajeApoyo.textContent = "La sesión está pausada. Puedes reanudarla o reiniciarla.";
    return;
  }

  if (esTrabajo) {
    bloqueEstado.classList.add("estado-trabajo");
    estadoActual.textContent = "Tiempo de trabajo";
    mensajeApoyo.textContent = "Concéntrate en tu actividad actual y mantén el ritmo.";
  } else {
    bloqueEstado.classList.add("estado-descanso");
    estadoActual.textContent = "Tiempo de descanso";
    mensajeApoyo.textContent = "Haz una pausa breve antes del siguiente bloque.";
  }
}

// Detiene el intervalo activo.
function detenerIntervalo() {
  if (intervaloTemporizador !== null) {
    clearInterval(intervaloTemporizador);
    intervaloTemporizador = null;
  }
}


// #### Validación de datos ####

// Valida la configuración ingresada por el usuario.
function validarDatos(
  trabajoMinutos,
  trabajoSegundos,
  descansoMinutos,
  descansoSegundos,
  ciclos
) {
  // Verifica que todos los valores sean numéricos.
  if (
    Number.isNaN(trabajoMinutos) ||
    Number.isNaN(trabajoSegundos) ||
    Number.isNaN(descansoMinutos) ||
    Number.isNaN(descansoSegundos) ||
    Number.isNaN(ciclos)
  ) {
    alert("Debes ingresar valores válidos en todos los campos.");
    return false;
  }

  // Verifica que no existan valores negativos.
  if (
    trabajoMinutos < 0 ||
    trabajoSegundos < 0 ||
    descansoMinutos < 0 ||
    descansoSegundos < 0 ||
    ciclos <= 0
  ) {
    alert("No se permiten valores negativos y la cantidad de ciclos debe ser mayor que cero.");
    return false;
  }

  // Verifica el rango correcto de segundos.
  if (trabajoSegundos > 59 || descansoSegundos > 59) {
    alert("Los segundos deben estar entre 0 y 59.");
    return false;
  }

  // Verifica que el tiempo de trabajo no quede en cero.
  if (trabajoMinutos === 0 && trabajoSegundos === 0) {
    alert("Debes configurar un tiempo de trabajo mayor que cero.");
    return false;
  }

  // Verifica que el tiempo de descanso no quede en cero.
  if (descansoMinutos === 0 && descansoSegundos === 0) {
    alert("Debes configurar un tiempo de descanso mayor que cero.");
    return false;
  }

  // Límites razonables para esta fase del proyecto.
  if (trabajoMinutos > 480) {
    alert("El tiempo de trabajo no debe superar 480 minutos en esta versión.");
    return false;
  }

  if (descansoMinutos > 180) {
    alert("El tiempo de descanso no debe superar 180 minutos en esta versión.");
    return false;
  }

  if (ciclos > 50) {
    alert("La cantidad de ciclos no debe superar 50 en esta versión.");
    return false;
  }

  return true;
}


// #### Configuración de la sesión ####

// Toma los datos del formulario, los valida
// y prepara el estado inicial de la sesión.
function configurarSesion() {
  const trabajoMinutos = Number(inputTrabajoMinutos.value);
  const trabajoSegundos = Number(inputTrabajoSegundos.value);
  const descansoMinutos = Number(inputDescansoMinutos.value);
  const descansoSegundos = Number(inputDescansoSegundos.value);
  const ciclos = Number(inputCantidadCiclos.value);

  const datosValidos = validarDatos(
    trabajoMinutos,
    trabajoSegundos,
    descansoMinutos,
    descansoSegundos,
    ciclos
  );

  if (!datosValidos) {
    return false;
  }

  duracionTrabajoSegundos = convertirASegundos(trabajoMinutos, trabajoSegundos);
  duracionDescansoSegundos = convertirASegundos(descansoMinutos, descansoSegundos);
  totalCiclos = ciclos;

  cicloEnCurso = 1;
  esTrabajo = true;
  estaPausado = false;
  sesionIniciada = true;
  tiempoRestanteSegundos = duracionTrabajoSegundos;

  actualizarResumen();
  actualizarCicloVisual();
  actualizarContador();
  actualizarEstadoVisual();

  return true;
}


// #### Motor del temporizador ####

// Cambia entre trabajo y descanso.
// Si se completan todos los ciclos, finaliza la sesión.
function cambiarFase() {
  reproducirAlerta();

  if (esTrabajo) {
    // Si termina el trabajo, cambia a descanso.
    esTrabajo = false;
    tiempoRestanteSegundos = duracionDescansoSegundos;
  } else {
    // Si termina el descanso, evalúa si aún faltan ciclos.
    if (cicloEnCurso < totalCiclos) {
      cicloEnCurso++;
      esTrabajo = true;
      tiempoRestanteSegundos = duracionTrabajoSegundos;
    } else {
      finalizarSesion();
      return;
    }
  }

  actualizarCicloVisual();
  actualizarContador();
  actualizarEstadoVisual();
}

// Ejecuta el temporizador.
// Reduce un segundo por iteración mientras la sesión esté activa.
function ejecutarTemporizador() {
  detenerIntervalo();

  intervaloTemporizador = setInterval(() => {
    if (tiempoRestanteSegundos > 0) {
      tiempoRestanteSegundos--;
      actualizarContador();
    } else {
      cambiarFase();
    }
  }, 1000);
}

// Finaliza completamente la sesión actual.
function finalizarSesion() {
  detenerIntervalo();

  sesionIniciada = false;
  estaPausado = false;

  limpiarEstadosVisuales();
  estadoActual.textContent = "Sesión completada";
  mensajeApoyo.textContent = "Has completado todos los ciclos configurados.";
  cicloActual.textContent = `${totalCiclos} de ${totalCiclos}`;
  tiempoRestante.textContent = "00:00";

  reproducirAlerta();
}


// #### Acciones del usuario ####

// Inicia una nueva sesión.
function iniciarSesion(event) {
  event.preventDefault();

  const configuracionCorrecta = configurarSesion();

  if (!configuracionCorrecta) {
    return;
  }

  ejecutarTemporizador();
}

// Pausa una sesión en ejecución.
function pausarSesion() {
  if (!sesionIniciada || estaPausado) {
    return;
  }

  detenerIntervalo();
  estaPausado = true;
  actualizarEstadoVisual();
}

// Reanuda una sesión pausada.
function reanudarSesion() {
  if (!sesionIniciada || !estaPausado) {
    return;
  }

  estaPausado = false;
  actualizarEstadoVisual();
  ejecutarTemporizador();
}

// Reinicia la aplicación al estado inicial.
function reiniciarSesion() {
  detenerIntervalo();

  duracionTrabajoSegundos = 0;
  duracionDescansoSegundos = 0;
  totalCiclos = 0;

  cicloEnCurso = 0;
  esTrabajo = true;
  estaPausado = false;
  sesionIniciada = false;
  tiempoRestanteSegundos = 0;

  formularioTemporizador.reset();

  tiempoRestante.textContent = "00:00";
  cicloActual.textContent = "0 de 0";
  resumenTrabajo.textContent = "00:00";
  resumenDescanso.textContent = "00:00";
  resumenCiclos.textContent = "0";

  limpiarEstadosVisuales();
  estadoActual.textContent = "Esperando configuración";
  mensajeApoyo.textContent = "Configura tus tiempos y presiona iniciar para comenzar.";
}


// #### Eventos ####

// Evento submit del formulario.
formularioTemporizador.addEventListener("submit", iniciarSesion);

// Eventos de botones.
btnPausar.addEventListener("click", pausarSesion);
btnReanudar.addEventListener("click", reanudarSesion);
btnReiniciar.addEventListener("click", reiniciarSesion);


// #### Estado inicial ####

// Asegura que la interfaz inicie con valores consistentes.
reiniciarSesion();