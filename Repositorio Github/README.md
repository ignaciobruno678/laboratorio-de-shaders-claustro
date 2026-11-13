# Laboratorio de shaders / c.l.a.u.s.t.r.o

Biblioteca compartida para crear, probar y versionar shaders de láser para MadMapper.

## Shader: Gotitas

- Material nativo: [`shaders/gotitas.fs`](./shaders/gotitas.fs)
- Preview web: [`preview/gotitas.html`](./preview/gotitas.html)
- El preview en JavaScript reproduce la geometría y animación para experimentar en navegador; no ejecuta el `.fs`.

## Probar el preview

Abre `preview/gotitas.html` en un navegador moderno. No requiere instalar paquetes ni iniciar un servidor. El panel de controles se desplaza por separado para mantener visible el preview.

## Llevar Gotitas a MadMapper

Gotitas es un **Laser Material**, no un material 2D convencional: el código usa `laserMaterialFunc`, parámetros en el encabezado y una cantidad fija de puntos.

1. En MadMapper, crea o abre un **Laser Material** en el editor de código GLSL. No lo crees con la plantilla de material 2D (`materialColorForPixel`).
2. Copia el contenido completo de `shaders/gotitas.fs` al editor y revisa los mensajes de compilación.
3. Guarda el material en MadMapper y úsalo en una superficie Laser.
4. Comprueba el resultado en el preview de MadMapper antes de considerar cualquier salida física.

La ubicación exacta de las opciones puede cambiar entre versiones. La guía oficial explica el editor GLSL y los materiales: [Writing Custom GLSL Materials](https://docs.madmapper.com/madmapper/6/3.-media/writing-custom-glsl-materials). Referencia de funciones: [GLSL Shader Functions Reference](https://docs.madmapper.com/madmapper/6/14.-technical-notes/glsl-shader-functions-reference).

## VS Code y MadMapper

No encontré una integración oficial de edición en vivo entre VS Code y MadMapper. Flujo recomendado:

1. Edita y guarda `shaders/gotitas.fs` en VS Code.
2. Copia el código actualizado al editor de Laser Material de MadMapper y compila.
3. Cuando funcione, conserva ambos cambios en Git: el `.fs` y el preview web.

El `.fs` del repositorio es la fuente versionada; el material dentro de un proyecto MadMapper se guarda por separado.

## Compartir con tu socia sin instalar Git

Nombre visible: **Laboratorio de shaders / c.l.a.u.s.t.r.o**. Un nombre técnico posible para el repositorio es `laboratorio-de-shaders-claustro`.

1. En GitHub.com, pulsa **+ > New repository**, usa el nombre técnico sugerido y selecciona **Private**. Déjalo vacío: no generes otro README ni `.gitignore`.
2. En el repositorio nuevo, elige **Add file > Upload files** y arrastra la carpeta del proyecto o selecciona sus archivos. GitHub acepta cargas desde el navegador de hasta 25 MiB por archivo.
3. Escribe un mensaje como `Agrega el shader Gotitas` y pulsa **Commit changes**.
4. Invita a tu socia desde la configuración del repositorio, en **Collaborators**, usando su usuario de GitHub.
5. Para editar desde el navegador, abre el repo y pulsa `.` para entrar a **github.dev**. Allí pueden editar, crear ramas y hacer commits desde **Control de código fuente**, sin instalar Git.

La **Online Material Library** de MadMapper está pensada para compartir materiales con la comunidad; para trabajar en privado entre las dos, usen el repositorio privado de GitHub.

github.dev no incluye terminal ni ejecuta un servidor de preview. Para probar Gotitas, abre el HTML localmente o, más adelante, publiquemos el preview como sitio web. La guía de GitHub explica [cómo subir archivos desde el navegador](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository) y [cómo usar github.dev](https://docs.github.com/en/codespaces/the-githubdev-web-based-editor).

## Seguridad

Primero prueba y ajusta en la visualización de MadMapper. No habilites salida física del láser sin una instalación controlada, límites y medidas de seguridad adecuadas. Consulta [Laser Visualization & Safety](https://docs.madmapper.com/madmapper/6/7.-laser-madlaser/laser-visualization-and-safety).

