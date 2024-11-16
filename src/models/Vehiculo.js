export class Vehiculo {

    id;
    modelo;
    anoFabricacion;
    velMax;
    constructor(id, modelo, anoFabricacion, velMax) {
        this.id = id;
        this.modelo = modelo;
        this.anoFabricacion = anoFabricacion;
        this.velMax = velMax;
    }

    toString() {
        return `ID: ${this.id} - Modelo: ${this.modelo} - Año Fabricación: ${this.anoFabricacion} - Velocidad Maxima: ${this.velMax}`;
    }

    toJson() {
        return {
            id: this.id,
            marca: this.marca,
            modelo: this.modelo,
            precio: this.precio
        };
    }
}