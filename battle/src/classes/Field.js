import Cell from "./Cell";


export let statuses = {
    STATIC: 0,
    SHIP: 1,
    DAMAGE: 2,
    MISS: 3,
    HAIGHLIGHT: 4,
    NOTVALID: 5
}

export class Field {
    constructor(name, player) {
        this._name = name;
        this._player = player;
        this._shipsReady = false;
        this._countOfShip = 10;
        this._cells = Array.from({ length: 100 }, (_, index) => {
            const x = index % 10; 
            const y = Math.floor(index / 10); 
            return new Cell(x, y);
        });
    }

}

export default Field;
