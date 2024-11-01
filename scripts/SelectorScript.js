document.addEventListener("DOMContentLoaded", () => {
  const selector = document.getElementById("model-selector");
  const sections = document.querySelectorAll(".model-section");

  selector.addEventListener("change", () => {
    // Ocultar todas las secciones
    sections.forEach((section) => {
      section.style.display = "none";
    });

    // Mostrar la sección seleccionada
    const selectedModel = selector.value;
    if (selectedModel) {
      document.getElementById(selectedModel).style.display = "block";
    }
  });
});
