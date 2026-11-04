# 🍒 Pixel Maze Arcade (1980 Edition)

[![Deploy to GitHub Pages](https://github.com/Jlpineda12/pixel-maze-arcade/actions/workflows/deploy.yml/badge.svg)](https://github.com/Jlpineda12/pixel-maze-arcade/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Demo-Play%20Now-orange?style=flat&logo=google-chrome)](https://jlpineda12.github.io/pixel-maze-arcade/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Juego Arcade retro de Pac-Man / Maze Chaser** desarrollado con JavaScript Vanilla (ES6+) y síntesis musical chiptune en tiempo real con **Web Audio API** (sin librerías ni MP3 externos).

Diseñado con la estética arcade Game Boy / CRT de referencia: perspectiva en 4 paredes, monitor CRT 4:3 con filtro dot-matrix LCD, deck decorativo con palanca y botones, y sistema interactivo de controles dentro del monitor.

🎮 **Jugar en vivo:** [https://jlpineda12.github.io/pixel-maze-arcade/](https://jlpineda12.github.io/pixel-maze-arcade/)

---

## 🕹️ Controles (Dentro del Menú)

| Tecla / Input | Acción |
| :--- | :--- |
| **`[C]`** | Abrir pantalla **HOW TO PLAY / CONTROLES** |
| **`←` `↑` `→` `↓` o `[W, A, S, D]`** | Navegar por el laberinto con giro asistido (input buffering) |
| **Swipe / Deslizar** | Control táctil en dispositivos móviles |
| **`[P]` o `[ESC]`** | Pausar partida |
| **`[ENTER]` o `[ESPACIO]`** | Iniciar partida / Confirmar menú |

---

## 👻 Inteligencia Artificial de los 4 Fantasmas

- **Blinky (Rojo):** *Shadow* — Persigue directamente la posición de Pac-Man.
- **Pinky (Rosa):** *Speedy* — Se anticipa emboscando 4 casillas adelante del rumbo de Pac-Man.
- **Inky (Cian):** *Bashful* — Vector de flanqueo dinámico coordinado con Blinky.
- **Clyde (Ámbar):** *Pokey* — Se acerca si está lejos (>8 baldosas) y se retira a su esquina cuando está cerca.
- **Modo Vulnerable (Frightened):** Al comer un Energizador (`3`), los fantasmas se vuelven azules durante 8s y pueden ser devorados para combos multiplicadores de +200, +400, +800 y +1600 pts.
- **Túneles de Teletransporte (Warp Tunnels):** En la fila 9 permiten cruzar instantáneamente de un extremo al otro de la pantalla.

---

## 🎵 Audio Chiptune Procedural con Web Audio API

- **Efecto Waka-Waka Real:** Síntesis alternada de frecuencias 440 Hz y 330 Hz con rampa descendente.
- **Sirena y Alarma Frightened:** Modulación en frecuencia de osciladores para tensión creciente.
- **Espiral de Muerte Retro:** Secuencia de 13 notas descendentes con explosión de ruido blanco.
- **Banda Sonora a 120 BPM:** Bajo pulsante staccato y arpegios armónicos en escala menor.

---

## 🧪 Pruebas Automatizadas de QA

Para ejecutar la suite de pruebas unitarias y de simulación de IA:

```bash
npm test
```

---

## 👤 Autor

**Jose Luis Pineda ([@Jlpineda12](https://github.com/Jlpineda12))**  
Estudiante de Ingeniería en Multimedia  
Especializado en interfaces interactivas, sistemas de audio procedural y motores de juegos 2D.
