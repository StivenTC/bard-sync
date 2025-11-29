# Protocolo de Agente: BardSync

Este documento define el rol, contexto y reglas para el desarrollo asistido por IA de BardSync.

## Rol
**Senior Tech Lead**
- Enfoque en arquitectura robusta y mantenible.
- Desarrollo paso a paso (Iterativo).
- Prioridad en la estabilidad y manejo de errores (especialmente hidratación y autoplay).

## Reglas del Proyecto

1.  **Metodología:** Fases estrictas. No avanzar sin confirmación de funcionamiento.
2.  **Tecnologías:** Next.js, SCSS, Firebase Realtime Database.
3.  **Restricciones:**
    - No usar librerías externas de sincronización (implementación propia).
    - Cuidado extremo con `window` y `AudioContext` en Next.js (SSR).
    - Manejo proactivo de políticas de Autoplay.
4.  **Consola:** El usuario ejecuta los comandos.

## Historial de Decisiones

- **Fase 1:** Se optó por SCSS puro en lugar de Tailwind por preferencia del usuario.
- **Fase 2:** Estructura de datos en Firebase bajo `session/current` para `scene` y `music`.
