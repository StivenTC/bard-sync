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

## Fase Beta (Roadmap)
**Objetivo:** Transformar el MVP en un producto pulido, escalable y temático.

1.  **Arquitectura & Clean Code (Prioridad Absoluta):**
    - **Cero Parches:** No se aceptan soluciones temporales ("quick fixes"). Si algo falla, se refactoriza el componente o hook raíz.
    - **Modularidad:** Componentes pequeños y de responsabilidad única (ej. `MusicPanel`, `ScenePanel`).
    - **Tipado Estricto:** TypeScript sin `any` (salvo excepciones de librerías externas rotas).
    - **Custom Hooks:** Lógica de negocio extraída a hooks (`useSession`, `useAudio`, etc.).

2.  **Funcionalidades Clave:**
    - **Sincronización Perfecta:** Implementación robusta de `timestamp` compartido.
    - **UI "Stream Deck":** Grid de botones para SFX, Lista ordenada para Música.
    - **Inmersión:** Textos temáticos ("Tavern", "Bard") e i18n (Español prioritario).
    - **Gestión de Salas:** Login para GMs y creación de campañas dinámicas.

3.  **Estándares Modernos:**
    - Uso de características modernas de React (Hooks, Context).
    - Optimización de re-renders.
    - Accesibilidad (ARIA labels) en todos los controles.
