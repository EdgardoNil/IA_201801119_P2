let datos = [];
let k = 3; // Número de clusters por defecto
let iteraciones = 100; // Número de iteraciones por defecto
let grafico; // Variable para almacenar la instancia de Chart.js

// Función para leer archivos CSV
const leerCSVKMeans = (archivo) => {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = (evento) => {
      const filas = evento.target.result
        .trim()
        .split("\n")
        .map(fila => fila.split(",").map(Number));
      resolver(filas);
    };
    lector.onerror = (error) => rechazar("Error de lectura del archivo: " + error.message);
    lector.readAsText(archivo);
  });
};

// Cargar archivo de datos
document.getElementById("data-file").addEventListener("change", async (evento) => {
  try {
    datos = (await leerCSVKMeans(evento.target.files[0])).flat();
    console.log("Datos cargados:", datos);
  } catch (error) {
    console.error(error);
  }
});

// Cargar archivo de configuración
document.getElementById("config-file").addEventListener("change", async (evento) => {
  try {
    const config = (await leerCSVKMeans(evento.target.files[0]))[0];
    k = config[0];
    iteraciones = config[1];
    console.log(`Configuración: Clusters: ${k}, Iteraciones: ${iteraciones}`);
  } catch (error) {
    console.error(error);
  }
});

// Función para ejecutar clustering y graficar los resultados
document.getElementById("btnLineal").onclick = function () {
  if (datos.length === 0 || k <= 0 || iteraciones <= 0) {
    alert("Por favor, carga los archivos de datos y configuración.");
    return;
  }

  // Ejecutar el clustering
  const es2D = Array.isArray(datos[0]);
  const kmeans = es2D ? new _2DKMeans() : new LinearKMeans();
  const datosAgrupados = kmeans.clusterize(k, datos, iteraciones);

  // Asignar colores a los clusters
  const clusters = Array.from(new Set(datosAgrupados.map(a => a[1]))).map(cluster => [
    cluster,
    `#${Math.floor(Math.random() * 16777215).toString(16)}` // Color aleatorio
  ]);

  // Visualizar resultados
  dibujarGrafico(datosAgrupados, clusters, es2D);
};

function dibujarGrafico(datosAgrupados, clusters, es2D) {
  // Destruir gráfico anterior si existe
  grafico?.destroy();

  // Preparar los datos para Chart.js
  const conjuntosDatos = clusters.map(([cluster, color]) => ({
    label: `Cluster ${cluster}`,
    data: datosAgrupados
      .filter(([_, idCluster]) => idCluster === cluster)
      .map(([punto]) => ({
        x: es2D ? punto[0] : punto,
        y: es2D ? punto[1] : 0,
      })),
    backgroundColor: color,
    pointRadius: 5,
  }));

  // Configuración del gráfico
  const ctx = document.getElementById("chartkmean").getContext("2d");
  grafico = new Chart(ctx, {
    type: "scatter",
    data: { datasets: conjuntosDatos },
    options: {
      title: { display: true, text: "Clustering K-Means" },
      scales: {
        x: {
          title: { display: true, text: "X" },
          min: Math.min(...datos.flat()) - 10,
          max: Math.max(...datos.flat()) + 10,
        },
        y: {
          title: { display: true, text: "Y" },
          min: es2D ? Math.min(...datos.flat()) - 10 : -1,
          max: es2D ? Math.max(...datos.flat()) + 10 : 1,
        },
      },
    },
  });
}
