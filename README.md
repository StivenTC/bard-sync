# BardSync

**Tablero de Sonido Sincronizado para D&D (GM Console & Player View)**

BardSync es una herramienta web diseñada para Game Masters de Dungeons & Dragons (y otros TTRPGs) que permite controlar de forma remota y sincronizada la atmósfera audiovisual de la sesión de juego.

## Características Principales

- **Consola del GM:** Panel de control para gestionar escenas (imágenes de fondo) y música (YouTube).
- **Vista del Jugador:** Interfaz inmersiva que se actualiza en tiempo real según las acciones del GM.
- **Sincronización:** Uso de Firebase Realtime Database para latencia mínima.
- **Audio:** Integración con YouTube para música y efectos de sonido.

## Stack Tecnológico

- **Frontend:** Next.js (App Router), TypeScript, SCSS.
- **Backend/DB:** Firebase Realtime Database.
- **Despliegue:** Vercel (previsto).

## Configuración Local

1.  Clonar el repositorio.
2.  Instalar dependencias: `npm install`.
3.  Configurar variables de entorno en `.env.local` (ver `.env.example` o documentación interna).
4.  Ejecutar servidor de desarrollo: `npm run dev`.

## Roadmap

- [x] Fase 1: Configuración y conexión Firebase.
- [ ] Fase 2: Consola del GM.
- [ ] Fase 3: Vista del Jugador.
- [ ] Fase 4: Audio y SFX.
