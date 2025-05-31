const clpInput = document.getElementById("clp-input");
const currencySelect = document.getElementById("currency-select");
const converterButton = document.getElementById("converter-button");
const resultP = document.getElementById("result-p");

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
            opciones.value = moneda.codigo;
            opciones.textContent = moneda.codigo;
            currencySelect.appendChild(opciones);
        };
    }
    catch (error) {
        console.log(error);
    };
};

//Ejecutar la función al cargar la página
obtenerMonedas();

// Onclick para hacer la conversion
converterButton.addEventListener("click", () => {

    //Buscar la moneda seleccionada en el select
    const monedaSeleccionada = monedas.find(moneda => moneda.codigo === currencySelect.value);
    const valor = monedaSeleccionada.valor;

    //Calcular la conversión desde CLP
    const conversion = clpInput.value / valor;

    //Mostrar resultado en la página
    resultP.innerHTML = conversion.toFixed(2);

    renderGrafica(monedaSeleccionada.codigo)
});

// Función para llamar a la API y obtener los datos de la variación los últimos 10 días

async function obtenerVariación(moneda) {
    try {
        const res = await fetch(`https://mindicador.cl/api/${moneda}`)
        const resultado = await res.json()

        // Solo últimos 10 días
        const ultimosDiezDias = resultado.serie.slice(0,10)

        // Labels para eje X
        const labels = ultimosDiezDias.map((dia)=> {
            return dia.fecha
        })

        // Valores para el eje Y
        const data = ultimosDiezDias.map ((dia) => {
            const valor = dia.valor
            return valor
        })
        
        const datasets = [
            {
                label: "Valor",
                borderColor: "rgb(255, 99, 132)",
                data,
            }
        ]
        return {labels, datasets}
    }
    catch (error) {
        console.log(error);
        
    }
}

// Funcion para renderizar el gráfico
async function renderGrafica(moneda) {
    const data = await obtenerVariación(moneda)
    
    const config = {
        type: "line",
        data
    }
    const myChart = document.getElementById("myChart")
    myChart.style.backgroundColor = "white"
    new Chart(myChart, config)
}
