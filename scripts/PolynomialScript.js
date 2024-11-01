// Elementos
const archivoPolyInput = document.querySelector("#polynomial--file");
const gradoPolyInput = document.querySelector("#polynomial-degree");
const btnAjustarPoly = document.querySelector("#polynomial--btn-fit");
const btnPredecirPoly = document.querySelector("#polynomial--btn-predict");
const btnMSEPoly = document.querySelector("#polynomial--btn-mse");
const btnR2Poly = document.querySelector("#polynomial--btn-r2");

const resultadoAjustePoly = document.querySelector("#poly-fit-result");
const resultadoPrediccionPoly = document.querySelector("#poly-predict-result");
const resultadoMSEPoly = document.querySelector("#poly-mse-result");
const resultadoR2Poly = document.querySelector("#poly-r2-result");

let varsXPoli = [];
let varsYPoli = [];
let instanciaPolinomial = new PolynomialRegression();
let prediccionesPoly = [];

// Función para leer y procesar el archivo CSV
const leerCSVPoli = async (archivo) => {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = (evento) => {
      const datos = evento.target.result;
      const filas = datos.split("\n").slice(1);
      const datosX = [];
      const datosY = [];

      filas.forEach((fila) => {
        const [x, y] = fila.split(",").map(Number);
        if (!isNaN(x) && !isNaN(y)) {
          datosX.push(x);
          datosY.push(y);
        }
      });

      resolver({ varsX: datosX, varsY: datosY });
    };
    lector.onerror = (error) => rechazar(error);
    lector.readAsText(archivo);
  });
};

// Acción: Ajustar (ajustar el modelo)
const ajustarModeloPoli = async () => {
  if (!archivoPolyInput.files.length || !gradoPolyInput.value) {
    resultadoAjustePoly.textContent =
      "Por favor selecciona un archivo CSV y el grado del polinomio.";
    return;
  }

  const grado = parseInt(gradoPolyInput.value);
  const datos = await leerCSVPoli(archivoPolyInput.files[0]);
  varsXPoli = datos.varsX;
  varsYPoli = datos.varsY;

  instanciaPolinomial.fit(varsXPoli, varsYPoli, grado);

  // Habilitar el botón de predecir una vez que se ha ajustado el modelo
  btnPredecirPoly.disabled = false;
  resultadoAjustePoly.textContent = "Modelo polinomial ajustado correctamente.";
};

// Acción: Predecir
const predecirModeloPoli = () => {
  prediccionesPoly = instanciaPolinomial.predict(varsXPoli);

  // Habilitar los botones de MSE y R2 una vez que se ha hecho la predicción
  btnR2Poly.disabled = false;

  renderizarGraficoPoli();
  resultadoPrediccionPoly.textContent = "Predicciones realizadas.";
};


// Acción: Coeficiente R2
const calcularR2Poli = () => {
  const r2 = instanciaPolinomial.getError();
  resultadoR2Poly.textContent = `Coeficiente R2 del modelo es: ${r2.toFixed(4)}`;
};

// Variable para almacenar la instancia del gráfico
let graficoPoli;

// Función para renderizar el gráfico polinomial
const renderizarGraficoPoli = () => {
  const datosLineaPoli = varsXPoli.map((x, index) => ({
    x,
    y: prediccionesPoly[index],
  }));
  const datosPuntoPoli = varsXPoli.map((x, index) => ({
    x,
    y: varsYPoli[index],
  }));

  const ctx = document.querySelector("#polynomial--canva").getContext("2d");

  // Destruir el gráfico existente si ya existe
  if (graficoPoli) {
    graficoPoli.destroy();
  }

  // Crear un nuevo gráfico y almacenarlo en graficoPoli
  graficoPoli = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Regresión Polinomial",
          data: datosLineaPoli,
          type: "line",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
        {
          label: "Datos Originales",
          data: datosPuntoPoli,
          backgroundColor: "rgba(255, 99, 132, 1)",
          pointRadius: 5,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
        },
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: true,
        },
      },
    },
  });
};

// Event listeners
btnAjustarPoly.addEventListener("click", ajustarModeloPoli);
btnPredecirPoly.addEventListener("click", predecirModeloPoli);
btnR2Poly.addEventListener("click", calcularR2Poli);
