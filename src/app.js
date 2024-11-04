import { Camion } from "./models/Camion.js";
import { Auto } from "./models/Auto.js";
import { Vehiculo } from "./models/Vehiculo.js";

const tbodyVehiculos = document.getElementById("tbody-vehiculos");

let vehiculos = [];
let currentVehiculo = null;

function cargarLista() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://examenesutn.vercel.app/api/VehiculoAutoCamion', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                vehiculos = JSON.parse(xhr.responseText);
                mostrarLista();
            } else {
                alert("Error al cargar la lista de vehiculos");
            }
        }
    };
    xhr.send();
}

function mostrarLista() {
    tbodyVehiculos.innerHTML = "";
    vehiculos.forEach(v => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td class="col-id">${v.id || 'N/A'}</td>
            <td class="col-modelo">${v.modelo || 'N/A'}</td>
            <td class="col-anoFabricacion">${v.anoFabricacion || 'N/A'}</td>
            <td class="col-velMax">${v.velMax || 'N/A'}</td> 
            <td class="col-cantidadPuertas">${v.cantidadPuertas !== undefined ? v.cantidadPuertas : 'N/A'}</td>
            <td class="col-asientos">${v.asientos !== undefined ? v.asientos : 'N/A'}</td>
            <td class="col-carga">${v.carga !== undefined ? v.carga : 'N/A'}</td>
            <td class="col-autonomia">${v.autonomia !== undefined ? v.autonomia : 'N/A'}</td>   
            <td class="col-modificar">
                <button class="btn-modificar" onclick="modificar(${v.id})">Modificar</button>
            </td>
            <td class="col-eliminar">
                <button class="btn-eliminar" onclick="eliminar(${v.id})">Eliminar</button>
            </td>
        `;
        tbodyVehiculos.appendChild(fila);
    });
}

window.mostrarFormularioABM = function () {
    document.getElementById("form-datos").style.display = "none";
    document.getElementById("form-abm").style.display = "block";
    document.getElementById('spinner').style.display = 'none';
    limpiarForm();
}

window.alta = async function () {
    document.getElementById("form-datos").style.display = "none";
    document.getElementById("form-abm").style.display = "block";

    await realizarAlta();
}

/**
 * Realiza una peticion POST a la API para agregar un nuevo vehiculo
 * 
 * @returns {Promise<void>}
 */
async function realizarAlta() {
    document.getElementById('spinner').style.display = 'block';

    const nuevoElemento = {
        modelo: document.getElementById("txtModelo").value,
        anoFabricacion: document.getElementById("numAnoFabricacion").value,
        velMax: document.getElementById("numVelMax").value,
        cantidadPuertas: document.getElementById("numCantidadPuertas").value,
        asiestos: document.getElementById("numAsientos").value,
        carga: document.getElementById("numCarga").value,
        autonomia: document.getElementById("numAutonomia").value
    };

    try {
        const response = await fetch('https://examenesutn.vercel.app/api/VehiculoAutoCamion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoElemento)
        });

        if (response.ok) {
            const data = await response.json();

            nuevoElemento.id = data.id;

            vehiculos.push(nuevoElemento);

            mostrarLista();
        }
        else {
            throw new Error("Error en la solicitud");
        }
    }
    catch (error) {
        alert("No se pudo realizar la operacion de alta" + error.message);

        document.getElementById("spinner").style.display = "none";
        document.getElementById("form-datos").style.display = "none";
        document.getElementById("form-abm").style.display = "block";
    }
    finally {
        document.getElementById('spinner').style.display = 'none';
        document.getElementById("form-abm").style.display = "none";
        document.getElementById("form-datos").style.display = "block";

    }
}

/**
 * Cancela la operacion de alta o modificacion, escondiendo el formulario
 * de datos y mostrando el formulario de ABM.
 */
window.cancelar = function () {
    document.getElementById("form-datos").style.display = "block";
    document.getElementById("form-abm").style.display = "none";
}

/**
 * Limpia los campos del formulario de ABM
 * @returns {undefined}
 */
function limpiarForm() {
    document.getElementById("txtModelo").value = "";
    document.getElementById("numAnoFabricacion").value = "";
    document.getElementById("numVelMax").value = "";
    document.getElementById("numCantidadPuertas").value = "";
    document.getElementById("numAsientos").value = "";
    document.getElementById("numCarga").value = "";
    document.getElementById("numAutonomia").value = "";
}

window.modificar = function (id) {
    currentVehiculo = vehiculos.find(v => v.id === id);

    if(currentVehiculo) {
        document.getElementById('accion-titulo').innerHTML = 'Formulario de Modificación';
        document.getElementById("txtModelo").value = currentVehiculo.modelo;
        document.getElementById("numAnoFabricacion").value = currentVehiculo.anoFabricacion;
        document.getElementById("numVelMax").value = currentVehiculo.velMax;
        document.getElementById("numCantidadPuertas").value = currentVehiculo.cantidadPuertas || '';
        document.getElementById("numAsientos").value = currentVehiculo.asientos || '';
        document.getElementById("numCarga").value = currentVehiculo.carga || '';
        document.getElementById("numAutonomia").value = currentVehiculo.autonomia || '';

        document.getElementById("form-datos").style.display = "none";
        document.getElementById("form-abm").style.display = "block";
        document.getElementById('spinner').style.display = 'none';
    }
    else {
        alert("No se encontro el vehiculo");
    }
}

window.realizarModificacion = function () {
    document.getElementById('spinner').style.display = 'block';

    const vehiculoAModificar = {
        modelo: document.getElementById("txtModelo").value,
        anoFabricacion: document.getElementById("numAnoFabricacion").value,
        velMax: document.getElementById("numVelMax").value,
        cantidadPuertas: document.getElementById("numPuertas").value,
        asientos: document.getElementById("numAsientos").value,
        carga: document.getElementById("numCarga").value,
        autonomia: document.getElementById("numAutonomia").value
    };

    fetch(`https://examenesutn.vercel.app/api/VehiculoAutoCamion/${vehiculoAModificar.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehiculoAModificar)
    })
    .then(response => {
        if(response.status === 200) {
            return response.json();
        }
        else {
            throw new Error("Error en la solicitud de modificación");
        }
    })
    .then(data => {
        const index = vehiculos.findIndex(v => v.id === data.id);
        if(index !== -1) {
            vehiculos[index] = {...vehiculoAModificar};
        }
        mostrarLista();
        document.getElementById('spinner').style.display = 'none';
        document.getElementById("form-datos").style.display = 'none';
        document.getElementById("form-abm").style.display = 'block';
    })
    .catch(error => {
        alert('no se pudo realizar la operacion de modificación');
        document.getElementById('spinner').style.display = 'none';
        document.getElementById("form-datos").style.display = 'none';
        document.getElementById("form-abm").style.display = 'block';
    })
}

window.eliminar = function (id) {
    
}

window.onload = function () {
    cargarLista();
}
