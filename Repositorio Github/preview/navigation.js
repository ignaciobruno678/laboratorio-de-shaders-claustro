"use strict";

const shaderSelect = document.querySelector("#shaderSelect");

if (shaderSelect) {
  const currentPage = window.location.pathname.split("/").pop();
  shaderSelect.value = currentPage || "gotitas.html";
  shaderSelect.addEventListener("change", () => {
    window.location.assign(shaderSelect.value);
  });
}
