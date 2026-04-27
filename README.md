# Temporizador de Productividad

Aplicación web responsiva desarrollada con HTML, CSS y JavaScript para gestionar sesiones de trabajo y descanso mediante ciclos configurables.

## Descripción

Este proyecto permite al usuario definir un tiempo de trabajo, un tiempo de descanso y una cantidad de ciclos para organizar actividades que requieren enfoque y pausas controladas.

La aplicación está pensada para distintos contextos de uso, como estudio, entrenamiento físico, lectura, trabajo profundo o actividades domésticas, permitiendo configurar minutos y segundos de forma flexible.

El temporizador muestra en pantalla el estado actual de la sesión, el tiempo restante y el avance de los ciclos, además de incorporar una alerta de sonido al cambiar de fase.

## Objetivo del proyecto

Desarrollar una base funcional para una aplicación web de productividad enfocada en la gestión del tiempo por bloques, con una interfaz clara, adaptable a distintos dispositivos y preparada para evolucionar hacia funciones más avanzadas en futuras fases.

## Alcance de esta versión

Esta primera versión incluye el núcleo funcional del sistema.

Permite configurar:

- tiempo de trabajo
- tiempo de descanso
- cantidad de ciclos

También permite:

- iniciar la sesión
- pausar el temporizador
- reanudar la sesión
- reiniciar la configuración
- visualizar el tiempo restante
- visualizar el estado actual de la sesión
- visualizar el ciclo actual
- escuchar una alerta de sonido al cambiar de fase

## Funcionalidades principales

- Configuración de tiempo de trabajo en minutos y segundos.
- Configuración de tiempo de descanso en minutos y segundos.
- Configuración de cantidad de ciclos.
- Cuenta regresiva visible en pantalla.
- Cambio automático entre trabajo y descanso.
- Indicador de estado actual.
- Indicador de ciclo actual.
- Resumen rápido de la sesión configurada.
- Botones de control para iniciar, pausar, reanudar y reiniciar.
- Diseño responsivo para escritorio, laptop y dispositivos móviles.
- Reproducción de alerta de sonido al cambiar de fase.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript

## Estructura del proyecto

```bash
temporizador-productividad/
│
├── index.html
├── README.md
│
└── assets/
    ├── css/
    │   └── styles.css
    ├── js/
    │   └── index.js
    ├── images/
    │   ├── timer.svg
    │   └── favicon/
    └── sounds/
        └── alarm.mp3