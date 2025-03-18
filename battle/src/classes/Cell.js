import {statuses} from "./Field.js"

export class Cell{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.status = statuses.STATIC;
    }
    getCell(){
        return [this.x, this.y]
    }
}

export default Cell;