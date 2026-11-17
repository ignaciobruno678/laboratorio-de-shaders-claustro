# Laboratorio de shaders / c.l.a.u.s.t.r.o

Biblioteca compartida para crear, probar y versionar shaders de láser para MadMapper.

## Shader: Gotitas

- Material nativo: [`shaders/gotitas-configurada.fs`](./shaders/gotitas-configurada.fs)
- Preview web: [`preview/gotitas.html`](./preview/gotitas.html)
- El preview en JavaScript reproduce la geometría y animación para experimentar en navegador; no ejecuta el `.fs`.

## Shader: Curvas

- Material nativo: [`shaders/curvas-configurada.fs`](./shaders/curvas-configurada.fs)
- Preview web: [`preview/curvas.html`](./preview/curvas.html)
- El preview usa la forma orgánica y reproduce su superposición y trim; no ejecuta el `.fs`.

## Shader: Fibonakis

- Material nativo: [`shaders/fibonakis-configurada.fs`](./shaders/fibonakis-configurada.fs)
- Preview web: [`preview/fibonakis.html`](./preview/fibonakis.html)
- El preview reproduce la espiral dorada, el flujo continuo, los espejos y los modos de color; no ejecuta el `.fs`.

## Shader: Relámpago

- Material nativo: [`shaders/relampago-configurada.fs`](./shaders/relampago-configurada.fs)
- Preview web: [`preview/relampago.html`](./preview/relampago.html)
- Genera un trazo quebrado entre A y B con curvatura y pliegues amplios, trim manual y seis recorridos de luz preconfigurados. Puede mostrar una figura original, dos espejadas o cuatro espejadas en ambos ejes, cada una con color independiente. **Caudal de río** ofrece un flujo lineal continuo, largo y sin rebotes. La semilla se controla manualmente y permanece fija durante la animación.
- El preview muestra un monitor en vivo de fase, recorrido, trim, velocidad, mirrors y FPS del lienzo principal y de las vistas volumétricas.

## Probar el preview

Abre `preview/gotitas.html`, `preview/curvas.html`, `preview/fibonakis.html` o `preview/relampago.html` en un navegador moderno. No requiere instalar paquetes ni iniciar un servidor. El panel de controles se desplaza por separado para mantener visible el preview.

La visualización láser principal conserva el formato rectangular original. Su zoom (hasta 600%) y desplazamiento con clic y arrastre son independientes de las vistas inferiores; al ampliar, el contenido vectorial se vuelve a dibujar para conservar la nitidez.

Los shaders permiten combinar dos colores en la figura. Los materiales nativos editables se encuentran en `shaders/`; ábrelos en MadMapper como **Laser Material**.

Las vistas de volumen 3D y perfil proyectan la figura animada desde el punto del proyector hacia la superficie: el volumen sigue su contorno en lugar de representar un cono rectangular fijo. El encuadre se mantiene fijo durante la animación; debajo de Volumen 3D, los botones circulares alternan entre grilla y suelo sólido. **Bruma** agrupa los controles de opacidad, escala y contraste; su animación conserva una velocidad fija. El patrón animado aparece tanto con grilla como con suelo sólido; el haz usa el color de la figura y las zonas oscuras se vuelven transparentes. En orientación horizontal, el punto del proyector y el plano de imagen intercambian posiciones para mostrar la proyección desde el frente. La figura se proyecta desde el lienzo principal en su resolución nativa y la bruma usa un muestreo ampliado para conservar fluidez. En **Volumen 3D** se puede acercar hasta 600% o alejar con la rueda del mouse o los botones; el render de la figura y la máscara de Bruma conservan su resolución. También se puede arrastrar para reubicar la vista y restablecer el encuadre inicial. La huella se amplifica visualmente 2,5 veces; no está a escala física. La orientación sigue disponible (cenital u horizontal); distancia y apertura quedan fijas en 2 m y 30°. El control de opacidad alcanza el 100% al llegar al valor 30 de la escala anterior. La figura de la superficie permanece visible. La interfaz y las vistas tienen fondo negro. Es una representación orientativa, no una calibración ni una verificación de seguridad de un proyector láser real.

## Identidad de los previews

Los previews comparten la identidad visual de [claustro](https://holaclaustro.com): logo local en `preview/claustro-logo.png`, tipografía Helvetica, fondo negro con acento rojo y pestañas para cambiar entre shaders. Para agregar otro preview, conserva el encabezado común y añade su enlace a la navegación de shaders en cada página existente.

Cada preview carga `lab-globals.js` antes de `projection.js`. El primer módulo inyecta Proyección, Bruma y Stats, conserva los parámetros globales al navegar entre shaders y evita duplicar esa interfaz en cada página. Para agregar un shader nuevo, incluye su JavaScript, luego `lab-globals.js`, `shader-sources.js`, `madlaser-export.js`, `projection.js` y `lab-ui.js`, en ese orden.

La misma capa global genera un fondo animado de alta resolución a partir del canvas vectorial sin grilla del shader activo. Los previews lo ocultan con negro opaco; el header, el panel paramétrico y el texto conceptual usan negro translúcido para dejarlo aparecer sin perder legibilidad.

El botón **Exportar MadLaser** toma los valores actuales del preview y los escribe como valores `DEFAULT` en una copia del material `.fs`. La primera vez, el navegador solicita elegir la carpeta de shaders de MadMapper; después intenta reutilizarla. `scripts/build-shader-sources.mjs` regenera el bundle offline `preview/shader-sources.js` y copia las fuentes nativas al paquete de despliegue.

## Llevar Gotitas a MadMapper

Gotitas es un **Laser Material**, no un material 2D convencional: el código usa `laserMaterialFunc`, parámetros en el encabezado y una cantidad fija de puntos.

1. En MadMapper, crea o abre un **Laser Material** en el editor de código GLSL. No lo crees con la plantilla de material 2D (`materialColorForPixel`).
2. Copia el contenido completo de `shaders/gotitas-configurada.fs` al editor y revisa los mensajes de compilación.
3. Guarda el material en MadMapper y úsalo en una superficie Laser.
4. Comprueba el resultado en el preview de MadMapper antes de considerar cualquier salida física.

La ubicación exacta de las opciones puede cambiar entre versiones. La guía oficial explica el editor GLSL y los materiales: [Writing Custom GLSL Materials](https://docs.madmapper.com/madmapper/6/3.-media/writing-custom-glsl-materials). Referencia de funciones: [GLSL Shader Functions Reference](https://docs.madmapper.com/madmapper/6/14.-technical-notes/glsl-shader-functions-reference).

## VS Code y MadMapper

No encontré una integración oficial de edición en vivo entre VS Code y MadMapper. Flujo recomendado:

1. Edita y guarda `shaders/gotitas-configurada.fs` en VS Code.
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

\n