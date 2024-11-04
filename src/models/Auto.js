import { Vehiculo } from "./Vehiculo.js";

export class Auto extends Vehiculo {

    constructor(id, modelo, anoFabricacion, velMax, cantidadPuertas, asiestos) {
        super(id, modelo, anoFabricacion, velMax);
        this.cantidadPuertas = cantidadPuertas;
        this.asiestos = asiestos;
    }

    toString() {
        return super.toString() + ` - Cantidad de puertas: ${this.cantidadPuertas} - Asientos: ${this.asiestos}`;
    }

    toJson() {
        return {
            id: this.id,
            modelo: this.modelo,
            anoFabricacion: this.anoFabricacion,
            velMax: this.velMax,
            cantidadPuertas: this.cantidadPuertas,
            asiestos: this.asiestos
        };
    }
}