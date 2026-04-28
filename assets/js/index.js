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

// Intervalo del temporizador principal.
let intervaloTemporizador = null;

// Intervalo usado para la cuenta previa de inicio.
let intervaloCuentaPrevia = null;

// Intervalo usado para la secuencia final de alertas.
let intervaloAlertaFinal = null;

// Token de control para invalidar procesos asíncronos anteriores.
// Se incrementa cada vez que se inicia o reinicia la sesión.
let tokenSesion = 0;

// Configuración de la sesión expresada en segundos.
let duracionTrabajoSegundos = 0;
let duracionDescansoSegundos = 0;
let totalCiclos = 0;

// Variables de control del flujo.
let cicloEnCurso = 0;
let esTrabajo = true;
let estaPausado = false;
let sesionIniciada = false;
let cuentaPreviaActiva = false;

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

// Reproduce el audio una sola vez.
function reproducirAlertaUnaVez() {
  if (!audioAlerta) return;

  audioAlerta.currentTime = 0;

  audioAlerta.play().catch(() => {
    // Si el navegador bloquea el audio, la aplicación continúa.
  });
}

// Reproduce la secuencia final: 3 sonidos, uno por segundo.
function reproducirSecuenciaFinal() {
  detenerAlertaFinal();

  let repeticionesRealizadas = 0;

  reproducirAlertaUnaVez();
  repeticionesRealizadas++;

  intervaloAlertaFinal = setInterval(() => {
    reproducirAlertaUnaVez();
    repeticionesRealizadas++;

    if (repeticionesRealizadas >= 3) {
      detenerAlertaFinal();
    }
  }, 1000);
}

// Actualiza el estado textual y visual del temporizador.
function actualizarEstadoVisual() {
  limpiarEstadosVisuales();

  if (cuentaPreviaActiva) {
    estadoActual.textContent = "Preparando inicio";
    mensajeApoyo.textContent = "La sesión comenzará en unos segundos.";
    return;
  }

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

// Detiene el intervalo del temporizador principal.
function detenerTemporizador() {
  if (intervaloTemporizador !== null) {
    clearInterval(intervaloTemporizador);
    intervaloTemporizador = null;
  }
}

// Detiene la cuenta previa.
function detenerCuentaPrevia() {
  if (intervaloCuentaPrevia !== null) {
    clearInterval(intervaloCuentaPrevia);
    intervaloCuentaPrevia = null;
  }

  cuentaPreviaActiva = false;
}

// Detiene la secuencia final de alertas.
function detenerAlertaFinal() {
  if (intervaloAlertaFinal !== null) {
    clearInterval(intervaloAlertaFinal);
    intervaloAlertaFinal = null;
  }
}

// Detiene cualquier proceso activo relacionado con el flujo.
function detenerProcesosActivos() {
  detenerTemporizador();
  detenerCuentaPrevia();
  detenerAlertaFinal();
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

  if (trabajoSegundos > 59 || descansoSegundos > 59) {
    alert("Los segundos deben estar entre 0 y 59.");
    return false;
  }

  if (trabajoMinutos === 0 && trabajoSegundos === 0) {
    alert("Debes configurar un tiempo de trabajo mayor que cero.");
    return false;
  }

  if (descansoMinutos === 0 && descansoSegundos === 0) {
    alert("Debes configurar un tiempo de descanso mayor que cero.");
    return false;
  }

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
  cuentaPreviaActiva = false;
  tiempoRestanteSegundos = duracionTrabajoSegundos;

  actualizarResumen();
  actualizarCicloVisual();
  actualizarContador();
  actualizarEstadoVisual();

  return true;
}


// #### Cuenta previa de inicio ####

// Ejecuta una cuenta de 3 segundos con sonido antes de iniciar la sesión.
function ejecutarCuentaPrevia(tokenActual) {
  return new Promise((resolve) => {
    detenerCuentaPrevia();

    cuentaPreviaActiva = true;
    actualizarEstadoVisual();

    let segundosCuenta = 3;

    tiempoRestante.textContent = formatearTiempo(segundosCuenta);
    reproducirAlertaUnaVez();

    intervaloCuentaPrevia = setInterval(() => {
      // Si el token cambió, la operación ya no es válida.
      if (tokenActual !== tokenSesion) {
        detenerCuentaPrevia();
        resolve(false);
        return;
      }

      segundosCuenta--;

      if (segundosCuenta > 0) {
        tiempoRestante.textContent = formatearTiempo(segundosCuenta);
        reproducirAlertaUnaVez();
      } else {
        detenerCuentaPrevia();
        tiempoRestanteSegundos = duracionTrabajoSegundos;
        actualizarContador();
        actualizarEstadoVisual();
        resolve(true);
      }
    }, 1000);
  });
}


// #### Motor del temporizador ####

// Cambia entre trabajo y descanso.
// Si se completan todos los ciclos, finaliza la sesión.
function cambiarFase() {
  if (esTrabajo) {
    esTrabajo = false;
    tiempoRestanteSegundos = duracionDescansoSegundos;
  } else {
    if (cicloEnCurso < totalCiclos) {
      cicloEnCurso++;
      esTrabajo = true;
      tiempoRestanteSegundos = duracionTrabajoSegundos;
    } else {
      finalizarSesion();
      return;
    }
  }

  reproducirAlertaUnaVez();
  actualizarCicloVisual();
  actualizarContador();
  actualizarEstadoVisual();
}

// Ejecuta el temporizador principal.
function ejecutarTemporizador() {
  detenerTemporizador();

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
  detenerTemporizador();

  sesionIniciada = false;
  estaPausado = false;
  cuentaPreviaActiva = false;

  limpiarEstadosVisuales();
  estadoActual.textContent = "Sesión completada";
  mensajeApoyo.textContent = "Has completado todos los ciclos configurados.";
  cicloActual.textContent = `${totalCiclos} de ${totalCiclos}`;
  tiempoRestante.textContent = "00:00";

  reproducirSecuenciaFinal();
}


// #### Acciones del usuario ####

// Inicia una nueva sesión con cuenta previa.
async function iniciarSesion(event) {
  event.preventDefault();

  detenerProcesosActivos();

  tokenSesion++;
  const tokenActual = tokenSesion;

  const configuracionCorrecta = configurarSesion();

  if (!configuracionCorrecta) {
    return;
  }

  const cuentaPreviaCompletada = await ejecutarCuentaPrevia(tokenActual);

  if (!cuentaPreviaCompletada) {
    return;
  }

  if (tokenActual !== tokenSesion || !sesionIniciada) {
    return;
  }

  ejecutarTemporizador();
}

// Pausa una sesión en ejecución.
function pausarSesion() {
  if (!sesionIniciada || estaPausado || cuentaPreviaActiva) {
    return;
  }

  detenerTemporizador();
  estaPausado = true;
  actualizarEstadoVisual();
}

// Reanuda una sesión pausada.
function reanudarSesion() {
  if (!sesionIniciada || !estaPausado || cuentaPreviaActiva) {
    return;
  }

  estaPausado = false;
  actualizarEstadoVisual();
  ejecutarTemporizador();
}

// Reinicia la aplicación al estado inicial.
function reiniciarSesion() {
  tokenSesion++;
  detenerProcesosActivos();

  duracionTrabajoSegundos = 0;
  duracionDescansoSegundos = 0;
  totalCiclos = 0;

  cicloEnCurso = 0;
  esTrabajo = true;
  estaPausado = false;
  sesionIniciada = false;
  cuentaPreviaActiva = false;
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
