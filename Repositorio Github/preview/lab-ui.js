"use strict";

const labMeta = {
  "fibonakis.html": { name: "Fibonakis", index: "#003" },
  "gotitas.html": { name: "Chispas", index: "#002" },
  "curvas.html": { name: "Curvaturas", index: "#001" },
};
const currentFile = window.location.pathname.split("/").pop() || "gotitas.html";
const currentShader = labMeta[currentFile] || labMeta["gotitas.html"];
const topbar = document.querySelector(".topbar");
const panel = document.querySelector(".panel");

if (topbar) {
  topbar.classList.add("is-ready");
}

if (panel) {
  const header = document.createElement("header");
  header.className = "panel-header";
  header.innerHTML = `<h1>${currentShader.name}</h1>`;
  panel.prepend(header);
}

document.querySelectorAll(".control-section").forEach((section, index) => {
  section.open = index < 3;
});
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion && window.gsap) {
  const timeline = window.gsap.timeline({ defaults: { ease: "power3.out" } });
  timeline
    .from(".topbar", { y: -18, opacity: 0, duration: 0.7 })
    .from(".stage", { scale: 0.96, opacity: 0, duration: 0.8 }, "-=0.35")
    .from(".projection-view", { y: 28, opacity: 0, stagger: 0.1, duration: 0.65 }, "-=0.5")
    .from(".panel", { x: 28, opacity: 0, duration: 0.7 }, "-=0.6");
  document.querySelectorAll(".control-section").forEach((section) => {
    section.addEventListener("toggle", () => {
      if (section.open) {
        window.gsap.from(section.querySelectorAll(".field, .color-field"), {
          y: 8, opacity: 0, stagger: 0.025, duration: 0.28, ease: "power2.out",
        });
      }
    });
  });
}
