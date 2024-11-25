import { Vehiculo } from "./Vehiculo.js";

export class Camion extends Vehiculo {
    carga;
    autonomia;
    constructor(id, modelo, anoFabricacion, velMax, carga, autonomia) {
        super(id, modelo, anoFabricacion, velMax);
        this.carga = carga;
        this.autonomia = autonomia;
    }

    toString() {
        return super.toString() + ` - Carga: ${this.carga} - Autonomía: ${this.autonomia}`;
    }

    toJson() {
        return {
            id: this.id,
            marca: this.marca,
            modelo: this.modelo,
            velMax: this.velMax,
            carga: this.carga,
            autonomia: this.autonomia
        };
    }
}