# Hardware y Redes para Todos

Plataforma educativa e interactiva para aprender los fundamentos del hardware y las redes de computadores.

## ¿Qué incluye?

El proyecto original es una experiencia web que reúne:

- Introducción al hardware y a los componentes de un computador.
- Exploración interactiva de partes y conceptos.
- Modelo 3D de computador mediante `computadoraa.glb`.
- Recursos de aprendizaje y prácticas interactivas.
- Experiencias de visualización inmersiva cuando el dispositivo y el navegador son compatibles.
- Diseño instalable como aplicación web progresiva (PWA), con manifiesto, service worker e iconos.

> Este repositorio busca apoyar el aprendizaje. No es un producto gubernamental ni una iniciativa política.

## Estructura del proyecto

La versión inicial entregada contiene una aplicación web estática y sus recursos. Entre los archivos principales están:

- `index.html`: interfaz y lógica de la experiencia educativa.
- `manifest.webmanifest`: metadatos de instalación PWA.
- `sw.js`: service worker para funciones offline.
- `computadoraa.glb`: modelo 3D.
- `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`: iconos de la aplicación.
- `LEEME-INSTALAR.txt`: indicaciones originales de instalación.

## Ejecutar localmente

Como es una aplicación web estática, sirve los archivos desde un servidor HTTP local. Por ejemplo, con la extensión **Live Server** de Visual Studio Code:

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Inicia Live Server desde `index.html`.
3. Abre la dirección local que muestra la extensión.

No se recomienda abrir directamente el HTML con `file://`, porque algunas funciones del navegador —como service workers, instalación PWA y permisos— requieren un contexto seguro servido por HTTP o HTTPS.

## Publicación

Puede publicarse como sitio estático mediante GitHub Pages o cualquier hosting estático. La configuración final debe comprobar las rutas de recursos, el modelo 3D, el service worker y el comportamiento offline en la URL publicada.

## Accesibilidad, compatibilidad y seguridad

Las mejoras se deben validar en móvil y escritorio, con teclado y lector de pantalla cuando corresponda. Las funciones de cámara, AR/VR, micrófono u otros permisos deben solicitarse solo cuando el usuario active la función que los necesita y deben explicar claramente su propósito.

## Estado del proyecto

Este repositorio está en preparación. La siguiente etapa es incorporar los archivos completos de la aplicación original y revisar su funcionamiento antes de aplicar cambios de diseño, rendimiento, accesibilidad, PWA y documentación.

## Contribuciones

Las propuestas de mejora son bienvenidas. Describe el problema, los pasos para reproducirlo y el navegador/dispositivo donde ocurre.
