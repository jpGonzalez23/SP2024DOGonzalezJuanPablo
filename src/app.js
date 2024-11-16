import { Vehiculo } from "./models/Vehiculo.js";
import { Auto } from "./models/Auto.js";
import { Camion } from "./models/Camion.js";

let dataVehiculos = [];
let modeOperacion = "agregar";

function mostrarSpinner() {
    document.getElementById("spinner").style.display = "flex";
}

function ocultarSpinner() {
    document.getElementById("spinner").style.display = "none";
}

function modeFormulario(modo = "agregar") {
    mostrarSpinner();
    habiliarCampos();

    modeOperacion = modo;

    let formListado = document.getElementById("form-datos");
    let formAbm = document.getElementById("form-abm");

    setTimeout(() => {
        if (formListado.style.display === 'none') {
            formListado.style.display = 'block';
            formAbm.style.display = 'none';
            limpiarCampos();
        }
        else {
            formListado.style.display = 'none';
            formAbm.style.display = 'block';
            if (modo === "modificar") {
                document.getElementById("accion-titulo").textContent = "Formulario de Modificacion";
            }
            else if (modo === "eliminar") {
                document.getElementById("accion-titulo").textContent = "Formulario de Eliminacion";
            }
            else {
                document.getElementById("accion-titulo").textContent = "Formulario de Alta";
            }
        }

        if (modo === "cancelar") {
            limpiarCampos();
        }
        ocultarSpinner();
    }, 500);
}

function cargar() {
    mostrarSpinner();
    var xhttp = new XMLHttpRequest();
    let url = 'https://examenesutn.vercel.app/api/VehiculoAutoCamion';
    xhttp.open("GET", url);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4) {
            ocultarSpinner();
            if (xhttp.status == 200) {
                let jsonResponse = JSON.parse(xhttp.responseText);
                if (dataVehiculos.length === 0) {
                    dataVehiculos = jsonResponse.map(v => {
                        if (v.cantidadPuertas !== undefined && v.asientos !== undefined) {
                            return new Auto(v.id, v.modelo, v.anoFabricacion, v.velMax, v.cantidadPuertas, v.asientos);
                        }
                        else if (v.carga !== undefined && v.autonomia !== undefined) {
                            return new Camion(v.id, v.modelo, v.anoFabricacion, v.velMax, v.carga, v.autonomia);
                        }
                    });
                }
                mostrarListado();
            }
            else {
                alert("no se pudo cargar: " + url + "\nError: " + xhttp.status);
            }
        }
    }
}

function mostrarListado() {
    let tabla = document.getElementById("tbody-vehiculos");
    tabla.innerHTML = "";

    dataVehiculos.forEach(v => {
        let fila = tabla.insertRow();

        fila.insertCell().innerHTML = v.id;
        fila.insertCell().innerHTML = v.modelo;
        fila.insertCell().innerHTML = v.anoFabricacion;
        fila.insertCell().innerHTML = v.velMax;
        fila.insertCell().innerHTML = v.cantidadPuertas instanceof Auto ? v.cantidadPuertas : "N/A";
        fila.insertCell().innerHTML = v.asiestos instanceof Auto ? v.asiestos : "N/A";
        fila.insertCell().innerHTML = v.carga instanceof Camion ? v.carga : "N/A";
        fila.insertCell().innerHTML = v.autonomia instanceof Camion ? v.autonomia : "N/A";
        fila.insertCell().innerHTML = `<button onclick="mostrarModificacionDeDatos(${v.id})">Modificar</button>`;
        fila.insertCell().innerHTML = `<button onclick="mostrarEliminacionDeDatos(${v.id})">Eliminar</button>`;
    });
}

async function enviarSolicitudPost(vehiculo) {
    try {
        mostrarSpinner();
        let url = 'https://examenesutn.vercel.app/api/VehiculoAutoCamion';
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vehiculo),
        });

        if (response.status === 200) {
            let jsonResponse = await response.json();
            return jsonResponse;
        }
        else {
            alert("Error Status no esperado: " + response.status);
            return false;
        }
    }
    catch (e) {
        alert("Error al conertarse con la API: " + url);
        return false;
    }
}

function enviarSolicitudPut(vehiculo) {
    let url = 'https://examenesutn.vercel.app/api/VehiculoAutoCamion/';
    return fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehiculo),
    }).
    then(response => {
        if (response.status === 200) {
            return true;
        }
        else {
            alert("Error Status no esperado: " + response.status);
            modeFormulario();
            return false;
        }
    })
    .catch(error => {
        alert(error.message);
        modeFormulario();
        return false;
    });
}

async function enviarSolicitudDelete(vehiculoId) {
    try {
        mostrarSpinner();
        let url = 'https://examenesutn.vercel.app/api/VehiculoAutoCamion/';
        let response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vehiculoId),
        });

        if(response.status === 200) {
            if(confirm("¿Desea eliminar el vehiculo?")) {
                dataVehiculos = dataVehiculos.filter(v => v.id !== vehiculoId);
                modeFormulario();
                mostrarListado();
            }
            else {
                modeFormulario();
            }
        }
        else {
            modeFormulario();
            mostrarListado();
            alert("Error Status no esperado: " + response.status);
        }
    }
    catch(error) {
        alert("no se pudo conectar a la api: " + url + "\nError: " + error.message);
    }
}

async function alta() {
    mostrarSpinner();

    let modelo = document.getElementById("txtModelo").value;
    let anoFabricacion = document.getElementById("numAnoFabricacion").value;
    let velMax = document.getElementById("numVelMax").value;
    let cantidadPuertas;
    let asientos;
    let carga;
    let autonomia;

    if (!validar(modelo, anoFabricacion, velMax)) {
        ocultarSpinner();
        return;
    }

    let vehiculo;

    if (document.getElementById("selectTipo").value === "Auto") {
        cantidadPuertas = document.getElementById("numCantidadPuertas").value;
        asientos = document.getElementById("numAsientos").value;

        if (!validarAuto(cantidadPuertas, asientos)) {
            ocultarSpinner();
            return;
        }

        vehiculo = { modelo, anoFabricacion, velMax, cantidadPuertas, asientos };
    } else if (document.getElementById("selectTipo").value === "Camion") {
        carga = document.getElementById("numCarga").value;
        autonomia = document.getElementById("numAutonomia").value;

        if (!validarCamion(carga, autonomia)) {
            ocultarSpinner();
            return;
        }

        vehiculo = { modelo, anoFabricacion, velMax, carga, autonomia };
    }

    let respuesta = await enviarSolicitudPost(vehiculo);

    if (respuesta) {
        vehiculo.id = respuesta.id;

        if (document.getElementById("selectTipo").value === "Auto") {
            let auto = new Auto(vehiculo.id, vehiculo.modelo, vehiculo.anoFabricacion, vehiculo.velMax, vehiculo.cantidadPuertas, vehiculo.asientos);
            dataVehiculos.push(auto);
        }
        else {
            let camion = new Camion(vehiculo.id, vehiculo.modelo, vehiculo.anoFabricacion, vehiculo.velMax, vehiculo.carga, vehiculo.autonomia);
            dataVehiculos.push(camion);
        }

        mostrarListado();
    }
    else {
        ocultarSpinner();
        alert("No se pudo agregar el vehiculo");
    }
}

function modificar(vehiculo) {
    mostrarSpinner();
    enviarSolicitudPut(vehiculo)
    .then(response => {
        if (response) {
            let modelo = document.getElementById("txtModelo").value;
            let anoFabricacion = document.getElementById("numAnoFabricacion").value;
            let velMax = document.getElementById("numVelMax").value;

            if(!validar(modelo, anoFabricacion, velMax)) {
                ocultarSpinner();
                return;
            }

            let newVehiculo;

            if(document.getElementById("selectTipo").value === "Auto") {
                let cantidadPuertas = document.getElementById("numCantidadPuertas").value;
                let asientos = document.getElementById("numAsientos").value;

                if(!validarAuto(cantidadPuertas, asientos)) {
                    ocultarSpinner();
                    return;
                }
                newVehiculo = new Auto(vehiculo.id, modelo, anoFabricacion, velMax, cantidadPuertas, asientos);
            } else if(document.getElementById("selectTipo").value === "Camion") {
                let carga = document.getElementById("numCarga").value;
                let autonomia = document.getElementById("numAutonomia").value;

                if(!validarCamion(carga, autonomia)) {
                    ocultarSpinner();
                    return;
                }
                newVehiculo = new Camion(vehiculo.id, modelo, anoFabricacion, velMax, carga, autonomia);
            }

            let index = dataVehiculos.findIndex(v => v.id === vehiculo.id);
            
            if(index !== -1) {
                dataVehiculos[index] = newVehiculo;
            }
            modeFormulario();
            mostrarListado();
            document.getElementById('btnAceptar').onclick = null;
        } else {
            mostrarListado();
            document.getElementById('btnAceptar').onclick = null;
        }
    })
    .catch(error => {
        alert(error.message);
        ocultarSpinner();
        modeFormulario();
        mostrarListado();
    });
}

/**
 * Displays and populates the form fields for modifying a vehicle's data.
 * Enables input fields and fills them with the current data of the specified vehicle.
 * Sets the form to modification mode. If the vehicle is found, it also sets the 
 * "Aceptar" button to trigger the modification process.
 * 
 * @param {number} vehiculoId - The ID of the vehicle to be modified.
 */
function mostrarModificacionDeDatos(vehiculoId) {
    let vehiculo;
    dataVehiculos.forEach(v => {
        if(v.id === id) {
            vehiculo = v;
        }
    });

    if(vehiculo) {
        document.getElementById('txtId').value = vehiculo.id;
        document.getElementById('txtModelo').value = vehiculo.modelo;
        document.getElementById('numAnoFabricacion').value = vehiculo.anoFabricacion;
        document.getElementById('numVelMax').value = vehiculo.velMax;
        if(vehiculo instanceof Auto) {
            document.getElementById('numCantidadPuertas').value = vehiculo.cantidadPuertas;
            document.getElementById('numAsientos').value = vehiculo.asientos;
        }
        else if(vehiculo instanceof Camion) {
            document.getElementById('numCarga').value = vehiculo.carga;
            document.getElementById('numAutonomia').value = vehiculo.autonomia;
        }
        modeFormulario("modificar");
        document.getElementById('btnAceptar').onclick = () => modificar(vehiculo);
    }
    else {
        alert("No se pudo encontrar el vehiculo");
    }
}

function mostrarEliminacionDeDatos(vehiculoId) {
    let vehiculo;
    dataVehiculos.forEach(v => {
        if(v.id === id) {
            vehiculo = v;
        }
    });

    if(vehiculo) {
        document.getElementById('txtId').value = vehiculo.id;
        document.getElementById('txtModelo').value = vehiculo.modelo;
        document.getElementById('txtModelo').disabled = true;
        document.getElementById('numAnoFabricacion').value = vehiculo.anoFabricacion;
        document.getElementById('numAnoFabricacion').disabled = true;
        document.getElementById('numVelMax').value = vehiculo.velMax;
        document.getElementById('numVelMax').disabled = true;
        if(vehiculo instanceof Auto) {
            document.getElementById('selectTipo').value = "Auto";
            document.getElementById('selectTipo').disabled = true;
            document.getElementById('numCantidadPuertas').value = vehiculo.cantidadPuertas;
            document.getElementById('numCantidadPuertas').disabled = true;
            document.getElementById('numAsientos').value = vehiculo.asientos;
            document.getElementById('numAsientos').disabled = true;
        }
        else if(vehiculo instanceof Camion) {
            document.getElementById('selectTipo').value = "Camion";
            document.getElementById('selectTipo').disabled = true;
            document.getElementById('numCarga').value = vehiculo.carga;
            document.getElementById('numCarga').disabled = true;
            document.getElementById('numAutonomia').value = vehiculo.autonomia;
            document.getElementById('numAutonomia').disabled = true;
        }
        modeFormulario("eliminar");
        deshabiliarCampos();
        document.getElementById('btnAceptar').onclick = () => enviarSolicitudDelete(vehiculoId);
    }
    else {
        alert("El vehiculo no se encuentra en la base de datos");
    }
}

function habiliarCampos() {
    let tipo = document.getElementById("selectTipo").value;
    document.getElementById('txtModelo').disabled = false;
    document.getElementById('numAnoFabricacion').disabled = false;
    document.getElementById('numVelMax').disabled = false;
    document.getElementById('selectTipo').disabled = false;

    if (tipo === "Auto") {
        document.getElementById('numCantidadPuertas').disabled = false;
        document.getElementById('numAsientos').disabled = false;
        document.getElementById('numCarga').disabled = true;
        document.getElementById('numAutonomia').disabled = true;
        document.getElementById('numCarga').value = "";
        document.getElementById('numAutonomia').value = "";
    } else if (tipo === "Camion") {
        document.getElementById('numCantidadPuertas').disabled = true;
        document.getElementById('numAsientos').disabled = true;
        document.getElementById('numCarga').disabled = false;
        document.getElementById('numAutonomia').disabled = false;
        document.getElementById('numCantidadPuertas').value = "";
        document.getElementById('numAsientos').value = "";
    }
}

function deshabiliarCampos() {
    document.getElementById('txtModelo').disabled = true;
    document.getElementById('numAnoFabricacion').disabled = true;
    document.getElementById('numVelMax').disabled = true;
    document.getElementById('selectTipo').disabled = true;
    document.getElementById('numCantidadPuertas').disabled = true;
    document.getElementById('numAsientos').disabled = true;
    document.getElementById('numCarga').disabled = true;
    document.getElementById('numAutonomia').disabled = true;
}

function limpiarCampos() {
    document.getElementById('txtModelo').value = "";
    document.getElementById('numAnoFabricacion').value = "";
    document.getElementById('numVelMax').value = "";
    document.getElementById('numCantidadPuertas').value = "";
    document.getElementById('numAsientos').value = "";
    document.getElementById('numCarga').value = "";
    document.getElementById('numAutonomia').value = "";
}

function validar(modelo, anoFabricacion, velMax) {
    if (!modelo) {
        alert("Debe ingresar un modelo");
        return;
    }

    if (isNaN(anoFabricacion) || anoFabricacion <= 1985) {
        alert("Debe ingresar un año de fabricacion mayor a 1985");
        return;
    }

    if (isNaN(velMax) || velMax <= 0) {
        alert("Debe ingresar una velocidad maxima mayor a 0");
        return;
    }

    return true;
}

function validarAuto(cantidadPuertas, asientos) {
    if (isNaN(cantidadPuertas) || cantidadPuertas <= 2) {
        alert("Debe ingresar una cantidad de puertas mayor a 2");
        return;
    }

    if (isNaN(asientos) || asientos <= 2) {
        alert("Debe ingresar una cantidad de asientos mayor a 0");
        return;
    }

    return true;
}

function validarCamion(carga, autonomia) {
    if (isNaN(carga) || carga <= 0) {
        alert("Debe ingresar una carga mayor a 0");
        return;
    }

    if (isNaN(autonomia) || autonomia <= 0) {
        alert("Debe ingresar una autonomia mayor a 0");
        return;
    }

    return true;
}

window.onload = function () {
    document.getElementById("btnAgregar").addEventListener("click", () => modeFormulario("agregar"));
    document.getElementById("btnCancelar").addEventListener("click", () => modeFormulario("cancelar"));
    document.getElementById("selectTipo").addEventListener("change", () => habiliarCampos);
    document.getElementById("btnAceptar").addEventListener("click", () => {
        if (modeOperacion === "agregar") alta();
    });
    cargar();
}
