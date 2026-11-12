# Hardware y Redes para Todos

Plataforma educativa e interactiva creada por estudiantes para acercar el hardware y las redes de computadores a todas las personas. Es un proyecto académico independiente: **no es una iniciativa política ni gubernamental**.

## Explora la aplicación

La experiencia está organizada en seis secciones:

- **Entrada:** bienvenida y acceso a la experiencia.
- **Cargar:** visor interactivo del computador en 3D, con controles de cámara y opciones inmersivas según el dispositivo.
- **Partes:** explicaciones de componentes y conceptos de hardware.
- **Caminos:** distintas formas de aprender, con apoyos visuales, auditivos y actividades.
- **Práctica:** juegos, asistente educativo, retos y ejercicios de redes.
- **Equipo:** información del proyecto y herramientas de accesibilidad.

También incluye un modelo 3D, preferencias de accesibilidad, lectura en voz alta, subtítulos de voz, modo de alto contraste, tipografía amigable, control del tamaño del texto y una instalación PWA.

## Archivos principales

| Archivo | Función |
| --- | --- |
| index.html | Aplicación, estilos y lógica interactiva |
| computadoraa.glb | Modelo 3D del computador |
| manifest.webmanifest | Configuración de instalación PWA |
| sw.js | Caché offline y actualización de recursos |
| icon-192.png, icon-512.png | Iconos de la aplicación |
| icon-maskable-512.png | Icono adaptable para instalación |
| scripts/check-project.mjs | Comprobaciones automáticas del proyecto |
| .github/workflows/pages.yml | Validación y publicación en GitHub Pages |

## Ejecutar localmente

1. Clona o descarga este repositorio.
2. Abre la carpeta en Visual Studio Code.
3. Inicia un servidor local, por ejemplo con la extensión **Live Server**.
4. Abre la dirección local que indique la extensión.

No abras el HTML directamente con file://: los service workers, la instalación PWA y algunas funciones del navegador necesitan HTTP o HTTPS.

## Publicar con GitHub Pages

El flujo de GitHub Actions verifica los archivos y la sintaxis de JavaScript. Si las comprobaciones pasan en la rama main, intenta publicar automáticamente el contenido del repositorio.

Para activar Pages la primera vez:

1. En GitHub abre **Settings → Pages**.
2. En **Build and deployment**, selecciona **GitHub Actions** como fuente.
3. Revisa la pestaña **Actions** y espera a que finalice el flujo **Verificar y publicar Hardware y Redes**.
4. La dirección del sitio aparecerá en **Settings → Pages** y en el resumen del despliegue.

Cada nuevo cambio que llegue a main volverá a ejecutar la verificación y la publicación.

## Recursos opcionales y compatibilidad

- El visor intenta cargar vendor/model-viewer.min.js y cuenta con una alternativa CDN. La carpeta vendor/ no está incluida actualmente; por eso la primera carga del visor puede necesitar conexión a internet.
- La lección de Lengua de Señas Colombiana reserva el espacio para videos/ram-lsc.mp4. Ese video no está incluido todavía; la aplicación muestra un aviso en su lugar.
- Las funciones de realidad aumentada, realidad virtual, cámara, voz y otros permisos dependen del navegador, del dispositivo y de HTTPS. Si una función no está disponible, se debe poder continuar con el contenido educativo principal.
- El service worker precarga los recursos esenciales y conserva una copia para uso sin conexión después de la primera visita.

## Verificación automática

Antes de publicar, el flujo revisa que existan los archivos esenciales, que el manifiesto sea JSON válido, que no haya IDs HTML duplicados, que los scripts JavaScript embebidos no tengan errores de sintaxis y que el modelo tenga cabecera GLB válida.

Para ejecutar la misma comprobación localmente, usa Node.js 22 o superior:

```bash
node scripts/check-project.mjs
```

## Accesibilidad y contribuciones

El proyecto busca ser usable con teclado, lectores de pantalla, controles de tamaño de texto, alto contraste y reducción de movimiento. Las mejoras deben mantener esas opciones y solicitar permisos solo cuando la persona active una función que los necesite.

Para reportar un problema, indica qué sección estabas usando, qué esperabas que ocurriera, qué ocurrió realmente y el navegador/dispositivo utilizado.
