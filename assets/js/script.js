const clpInput = document.getElementById("clp-input");
const currencySelect = document.getElementById("currency-select");
const converterButton = document.getElementById("converter-button");
const resultP = document.getElementById("result-p");
const errorGrafico = document.getElementById("error-grafico")

// Diccionario para mostrar nombres de las monedas con mayúscula y acento

const nombresMonedas = {
    dolar: "Dólar",
    euro: "Euro",
    uf: "UF",
}

const pluralMonedas = {
    dolar: "Dólares",
    euro: "Euros",
    uf: "UF",
}

// Arreglo para guardar las monedas que llegan desde la API

let monedas = [];

// Función para llamar a la API y obtener los datos de las divisas
async function obtenerMonedas() {
    try {
        const res = await fetch("https://mindicador.cl/api/");
        const data = await res.json();

        // Guardar solo monedas necesarias
        monedas = [
            data.dolar,
            data.euro,
            data.uf,
        ];

        // Crear las opciones del select usando los codigos de la API
        for (let moneda of monedas) {
            const opciones = document.createElement("option");
            const nombreMoneda = nombresMonedas[moneda.codigo] || moneda.codigo;
            opciones.value = moneda.codigo;
            opciones.textContent = nombreMoneda;
            currencySelect.appendChild(opciones);
        }
    }
    catch (error) {
        console.error("Error al obtener monedas:", error.message);
        resultP.innerHTML = `No se pudieron cargar las monedas, inténtalo más tarde. Error: ${error.message}`
    };
}

//Ejecutar la función al cargar la página
obtenerMonedas();

// Onclick para hacer la conversion
converterButton.addEventListener("click", () => {
    //Validación si es número negativo o vacío
    const clpValue = Number(clpInput.value);

    if (!clpInput.value || clpValue < 0) {
        return;
    }

    //Buscar la moneda seleccionada en el select
    const monedaSeleccionada = monedas.find(moneda => moneda.codigo === currencySelect.value);
    const valor = monedaSeleccionada.valor;

    //Calcular la conversión desde CLP
    const conversion = clpInput.value / valor;

    //Mostrar resultado en la página
    const pluralMoneda = pluralMonedas[monedaSeleccionada.codigo] || monedaSeleccionada.codigo;
    resultP.innerHTML = `${clpInput.value} CLP equivalen a ${conversion.toFixed(2)} ${pluralMoneda}`;


    renderGrafica(monedaSeleccionada.codigo);
});

// Función para llamar a la API y obtener los datos de la variación los últimos 10 días

async function obtenerVariación(moneda) {
    try {
        const res = await fetch(`https://mindicador.cl/api/${moneda}`);
        const resultado = await res.json();

        // Solo últimos 10 días
        const ultimosDiezDias = resultado.serie.slice(0, 10).reverse();

        // Labels para eje X
        const labels = ultimosDiezDias.map((dia) => {
            return dia.fecha
        });

        // Valores para el eje Y
        const data = ultimosDiezDias.map((dia) => {
            const valor = dia.valor;
            return valor;
        });

        const datasets = [
            {
                label: '',
                borderColor: "#8585cf",
                backgroundColor: '#bbbbbb',
                data,
            }
        ]
        return { labels, datasets };
    }
    catch (error) {
        console.error("Error al obtener variación:", error.message);
        errorGrafico.innerHTML = `No se pudo cargar la gráfica. Error: ${error.message}`
    }
}

// Variable global para el grafico actual. Sin valor
let graficoActual = null;

// Funcion para renderizar el gráfico
async function renderGrafica(moneda) {
    try {

        const data = await obtenerVariación(moneda);

        const config = {
            type: "line",
            data,
            options: {
                layout: {
                    padding: {
                        top: 20,
                        bottom: 20,
                        right: 30,
                        left: 30,
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Fechas',
                            font: {
                                family: 'Roboto',
                                size: 16,
                            },
                            color: 'whitesmoke',
                        },
                        ticks: {
                            color: '#bbbbbb',
                            callback: function (value, index, values) {
                                return data.labels[index].slice(5, 10);
                            }
                        }
                    },
                    y: {
                        ticks: {
                            color: '#bbbbbb',
                        },
                        title: {
                            display: true,
                            text: 'Valor',
                            font: {
                                family: 'Roboto',
                                size: 16,
                            },
                            color: 'whitesmoke',
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Valor diario del ${moneda}`,
                        font: {
                            family: 'Roboto',
                            size: 24,
                            weight: 'bold'
                        },
                        color: 'whitesmoke',
                    },
                    legend: {
                        display: false,
                    }
                }
            }
        };
        const myChart = document.getElementById("myChart");
        myChart.style.backgroundColor = "#303030";

        // Si ya hay un gráfico, se borra antes de crear uno nuevo
        if (graficoActual) {
            graficoActual.destroy();
        }

        // Crear y guardar el nuevo gráfico
        graficoActual = new Chart(myChart, config);
    }
    catch (error) {
        console.error("Error al renderizar gráfica:", error.message);
        errorGrafico.innerHTML = `No se pudo mostrar la gráfica. Error: ${error.message}`
    }
}