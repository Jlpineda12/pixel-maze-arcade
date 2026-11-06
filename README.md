<div align="center">

<a href="https://jlpineda12.github.io/pixel-maze-arcade/"><img src="docs/screenshots/attract.gif" alt="PIXEL MAZE — pantalla de título animada" width="560"></a>

# 🍒 PIXEL MAZE · 1980

**Laberinto, puntos y cuatro fantasmas, cada uno con su propia forma de perseguirte.**

[![Jugar ahora](https://img.shields.io/badge/▶%20JUGAR%20AHORA-fee440?style=for-the-badge&labelColor=0d0221)](https://jlpineda12.github.io/pixel-maze-arcade/)
[![Arcade Station](https://img.shields.io/badge/🕹️%20Arcade%20Station-5%20juegos-ff2e88?style=for-the-badge&labelColor=0d0221)](https://jlpineda12.github.io/arcade-station/)

[![Deploy](https://github.com/Jlpineda12/pixel-maze-arcade/actions/workflows/deploy.yml/badge.svg)](https://github.com/Jlpineda12/pixel-maze-arcade/actions/workflows/deploy.yml)
![Tests](https://img.shields.io/badge/tests-49%20passing-39ff14?style=flat-square&labelColor=0d0221)
![Dependencias](https://img.shields.io/badge/dependencias-0-00f5d4?style=flat-square&labelColor=0d0221)
![Audio](https://img.shields.io/badge/audio-Web%20Audio%20API-ff2e88?style=flat-square&labelColor=0d0221)
![License](https://img.shields.io/badge/license-MIT-fda415?style=flat-square&labelColor=0d0221)

</div>

---

## 📺 Así se ve

| Menú animado | Partida |
| :---: | :---: |
| <img src="docs/screenshots/menu.png" width="400" alt="Menú"> | <img src="docs/screenshots/gameplay.gif" width="400" alt="Gameplay"> |
| **Guía de controles** | **En el celular** |
| <img src="docs/screenshots/controls.png" width="400" alt="Controles"> | <img src="docs/screenshots/mobile.png" width="200" alt="Versión móvil"> |

La pantalla CRT flota sobre un escenario *synthwave* animado, con secuencia de arranque tipo BIOS, marquesina de neón y una barra de estado estilo terminal de los 90.

## 🕹️ Controles

| Teclado | Panel táctil (móvil) | Acción |
| :--- | :--- | :--- |
| `← ↑ → ↓ / W A S D` | Joystick | Moverse |
| `Swipe` | — | Girar (móvil) |
| `Enter / Space` | START · A | Empezar |
| `P / Esc` | B (PAUSE) | Pausa |

> En el celular aparece debajo de la pantalla un joystick y botones táctiles; en escritorio se usa el teclado.

## ✨ Características

- **Laberinto de 28×19 baldosas** con túneles que te llevan al otro lado.
- **4 fantasmas con IA distinta** (Blinky, Pinky, Inky y Clyde) y modos de persecución / dispersión.
- **Energizantes**: los fantasmas se vuelven vulnerables y valen 200 → 400 → 800 → 1600.
- **Frutas de bonificación** y niveles progresivos.
- **Input buffering**: el giro se guarda hasta que el pasillo lo permite.

## 📊 Resultados

| Métrica | Resultado |
| :--- | :--- |
| Pruebas automatizadas (`npm test`) | ✅ **49 / 49** pasan en cada despliegue |
| Archivos de audio / imagen | **0** — todo se genera con código |
| Dependencias de npm | **0** — JavaScript puro (ES modules) |
| Rendimiento | **60 FPS** estables en Canvas 2D |
| Responsivo | Escritorio y móvil (panel táctil) |

## 🏛️ Estructura del proyecto

```
pixel-maze-arcade/
├── index.html                # Página: marquesina, pantalla CRT, panel y barra de estado
├── src/
│   ├── main.js               # Arranque: audio, juego, shell y bucle a 60 FPS
│   ├── game/
│   │   ├── Game.js           # Máquina de estados (menú, partida, pausa, game over)
│   │   ├── MenuFX.js         # Menú animado: fondo temático, título en onda, attract mode
│       ├── MazeMap.js      # Mapa y baldosas
│       ├── Pacman.js       # Jugador e input buffer
│       ├── Ghost.js        # IA de los 4 fantasmas
│       ├── Fruit.js        # Frutas de bonificación
│   ├── audio/
│   │   ├── SynthEngine.js    # Osciladores, envolventes y ruido (Web Audio API)
│   │   ├── SoundEffects.js   # Efectos de sonido procedurales
│   │   └── MazeMusic.js     # Música chiptune generada en tiempo real
│   └── shell/
│       ├── RetroShell.js     # Presentación: arranque BIOS, CRT, panel táctil, terminal
│       └── shell.css         # Sistema visual synthwave / CRT compartido
├── test/qa-runner.js         # Suite de pruebas sin dependencias
├── docs/screenshots/         # Capturas y GIFs de este README
└── .github/workflows/        # Pruebas + despliegue automático a GitHub Pages
```

## 🚀 Ejecutar en local

No necesita instalar nada. Sirve la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8080
```

y abre `http://localhost:8080`. Para correr las pruebas:

```bash
npm test
```

## 👤 Autor

**Jose Luis Pineda Barrera** · [@Jlpineda12](https://github.com/Jlpineda12) · Ingeniería en Multimedia, Colombia 🇨🇴

Este juego también vive dentro de **[Arcade Station](https://github.com/Jlpineda12/arcade-station)**, el gabinete que reúne los 5 juegos.
