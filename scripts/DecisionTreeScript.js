// Variables para almacenar los datos del CSV
let datosEntrenamiento = [];
let datosPrediccion = [];

// Función para leer un archivo CSV
const leerCSVID3 = async (archivo) => {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onload = (evento) => {
            const datos = evento.target.result;
            const filas = datos.trim().split("\n").map(fila => fila.split(","));
            resolve(filas);
        };
        lector.onerror = (error) => reject(error);
        lector.readAsText(archivo);
    });
};

// Función para cargar los datos de entrenamiento
const cargarDatosEntrenamiento = async () => {
    const archivo = document.getElementById("training-file").files[0];
    if (!archivo) {
        alert("Por favor selecciona un archivo CSV de entrenamiento!!");
        return;
    }
    datosEntrenamiento = await leerCSVID3(archivo);
};

// Función para cargar los datos de predicción (opcional)
const cargarDatosPrediccion = async () => {
    const archivo = document.getElementById("predict-file").files[0];
    if (archivo) {
        datosPrediccion = await leerCSVID3(archivo);
    }
};

// Función para generar el árbol y realizar la predicción
const generarArbol = () => {
    if (datosEntrenamiento.length === 0) {
        alert("Por favor carga los datos de entrenamiento antes de generar el árbol!!");
        return;
    }

    // Crear el árbol de decisión ID3 con los datos de entrenamiento
    const arbolDecision = new DecisionTreeID3(datosEntrenamiento);
    const raiz = arbolDecision.train(arbolDecision.dataset);

    // Configurar los datos para la predicción si existen
    let prediccion = null;
    if (datosPrediccion.length > 0) {
        const cabeceraPrediccion = datosEntrenamiento[0].slice(0, -1); // Excluye la última columna de la cabecera
        prediccion = arbolDecision.predict([cabeceraPrediccion, datosPrediccion[0]], raiz);
    }

    return {
        dotStr: arbolDecision.generateDotString(raiz),
        nodoPrediccion: prediccion
    };
};

// Visualiza el árbol y muestra la predicción
document.getElementById('predict').onclick = async () => {
    await cargarDatosPrediccion(); // Carga el archivo de predicción
    const grafico = document.getElementById("treed");
    const { dotStr, nodoPrediccion } = generarArbol();

    if (nodoPrediccion != null) {
        const cabecera = datosEntrenamiento[0];
        document.getElementById('prediction').innerText = `${cabecera[cabecera.length - 1]}: ${nodoPrediccion.value}`;
    } else {
        document.getElementById('prediction').innerText = "No hay predicción disponible.";
    }

    const parsDot = vis.network.convertDot(dotStr);
    const datos = {
        nodes: parsDot.nodes,
        edges: parsDot.edges
    };

    const opciones = {
        layout: {
            hierarchical: {
                levelSeparation: 100,
                nodeSpacing: 100,
                parentCentralization: true,
                direction: 'UD',
                sortMethod: 'directed'
            }
        }
    };

    new vis.Network(grafico, datos, opciones);
};

document.getElementById('btngenerate').onclick = async () => {
    await cargarDatosEntrenamiento(); // Carga el archivo de entrenamiento
    const grafico = document.getElementById("treed");
    const { dotStr, nodoPrediccion } = generarArbol();

    if (nodoPrediccion != null) {
        const cabecera = datosEntrenamiento[0];
        document.getElementById('prediction').innerText = `${cabecera[cabecera.length - 1]}: ${nodoPrediccion.value}`;
    } else {
        document.getElementById('prediction').innerText = "No hay predicción disponible.";
    }

    const parsDot = vis.network.convertDot(dotStr);
    const datos = {
        nodes: parsDot.nodes,
        edges: parsDot.edges
    };

    const opciones = {
        layout: {
            hierarchical: {
                levelSeparation: 100,
                nodeSpacing: 100,
                parentCentralization: true,
                direction: 'UD',
                sortMethod: 'directed'
            }
        }
    };

    new vis.Network(grafico, datos, opciones);
};
