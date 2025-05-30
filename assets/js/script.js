const clpInput = document.getElementById("clp-input");
const currencySelect = document.getElementById("currency-select");
const converterButton = document.getElementById("converter-button");
const resultP = document.getElementById("result-p");

async function obtenerMonedas() {
    const res = await fetch("https://mindicador.cl/api/");
    const data = await res.json();
    
    const monedas = [
        data.dolar,
        data.euro,
        data.uf,
    ]
    
    for (let moneda of monedas) {
        const opciones = document.createElement("option")
        opciones.textContent = moneda.codigo
        currencySelect.appendChild(opciones)
    }
    
}

obtenerMonedas()