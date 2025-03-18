import React, { useState, useEffect } from "react";
import Field from "./Field";
import { statuses } from "./Field";
import CompField from "./CompField";
import dialog from "../imgs/dialog.svg"
import { phrasesPersonGoal, phrasesPersonMiss, phrasesCompMiss, phrasesCompGoal } from './phrases.js';

function cellStyle(cell) {
    let style = {
        background: null,
    };
    if (cell.status === statuses.SHIP) {
        style.background = "#f1e49da7";
    }
    else if (cell.status === statuses.DAMAGE) {
        style.background = "#ae500eb3";
    }
    else if (cell.status === statuses.HAIGHLIGHT) {
        style.background = "#878787cc";
    }
    else if (cell.status === statuses.NOTVALID) {
        style.background = "#a34a60b3";
    }
    return style;
}

function cellCompStyle(cell) {
    let style = {
        background: null,
    };
    if (cell.status === statuses.DAMAGE) {
        style.background = "#ae500eb3";
    }
    return style;
}


function CreateField({ player, personField, fieldComp}) {
    let field = new Field(player, personField);
    const initCells = field._cells;
    let countOfShip = field._countOfShip;

    let compField = new CompField(player, fieldComp);
    const initCompCells = compField._cells;

    const [compCells, setCompCells] = useState(initCompCells);
    const [compAttack, setCompAttack] = useState(false);
    const [id, setId] = useState("");

    const [message, setMessage] = useState("");
    const [showMessage, setShowMessage] = useState(false);
    const [isValid, setValid] = useState(true);

    const [cells, setCells] = useState(initCells);
    const [count, setCount] = useState(countOfShip);
    const [isDrawing, setDrawing] = useState(false);
    const [prevX, setPrevX] = useState(0);
    const [prevY, setPrevY] = useState(0);
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);
    const [length, setLength] = useState(0);
    const [ready, setReady] = useState(false);
    const [finish, setFinish] = useState(false);
    const [start, setStart] = useState(true);
    const [rools, setRools] = useState(false);
    const [showBack, setBack] = useState(false);
    // const [zIndex, setZIndex] = useState(0);



    const [personAttack, setPerAttack] = useState(true);//?

    let direction = null;

    const handleMouseDown = (cell) => {
        setDrawing(() => (count > 0));
        if (count > 0 && personField) {
            if(validZone(cell)) {
                cell.status = statuses.HAIGHLIGHT;
                setValid(true);
            }
            else {
                setMessage("Нашы корабли в опасной близости!");
                setId("human-phrase");
                setShowMessage(true);
                setValid(false);
                setTimeout(() => {
                    setShowMessage(false);
                }, 3000); 
            }
            
            setPrevX(cell.x);
            setPrevY(cell.y);
        }
    };

    function lengthAndDirection() {
        let len = 0;
        if (lastX - prevX !== 0) {
            if (lastX > prevX) {
                direction = 't->b';
                len += lastX - prevX;
            } else {
                direction = 'b->t';
                len += prevX - lastX;
            }
        } else if (lastY - prevY !== 0) {
            if (lastY > prevY) {
                direction = 'l->r';
                len += lastY - prevY;
            } else {
                direction = 'r->l';
                len += prevY - lastY;
            }
        }
        setLength(len);
        return len;
    }

    const handleMouseUp = () => {
        setDrawing(false);

        const updatedCells = cells.map((cell) => {
            if (validZone(cell) && cell.status === statuses.HAIGHLIGHT) cell.status = statuses.SHIP;
            else if(cell.status === statuses.NOTVALID) cell.status = statuses.STATIC;
            return cell;
        });
        
        if(length > 0 && isValid) setCount((val) => val - 1);
        console.log(isValid);
        
        setCells(updatedCells);
    };

    const handleMouseMove = (cell) => {
        let len = lengthAndDirection();
        if (isDrawing) {
            if (lastX != null && lastY != null) {
                if (direction === 't->b' && (cell.y !== prevY || cell.x < prevX)) {
                    return;
                } else if (direction === 'b->t' && (cell.y !== prevY || cell.x > prevX)) {
                    return;
                } else if (direction === 'l->r' && (cell.x !== prevX || cell.y < prevY)) {
                    return;
                } else if (direction === 'r->l' && (cell.x !== prevX || cell.y > prevY)) {
                    return;
                }
                if (len < 4) {
                    if (cell.status !== statuses.SHIP) resetStaticStatus();
                }
            }
            setLastX(cell.x);
            setLastY(cell.y);
        }
    };

    const validZone = (cell) => {
        let mustFreeCells = isFreeCells(cells);
        let notFreeCells = isNoAvailableCells(cells); 
        let x = cell.x;
        let y = cell.y;

        if (mustFreeCells.some((cell) => cell.x === x && cell.y === y)) {
            cell.status = statuses.NOTVALID;
            return false;
        }
        else if(notFreeCells.some((cell) => cell.x === x && cell.y === y)){
            return false;
        }
        else return true;
    }

    const resetStaticStatus = () => {
        const startX = prevX;
        const endX = lastX;
        const startY = prevY;
        const endY = lastY;


        cells.forEach((cell) => {
            const isInsideX = cell.x >= startX && cell.x <= endX;
            const isInsideY = cell.y >= startY && cell.y <= endY;

            const x = cell.x <= startX && cell.x >= endX;
            const y = cell.y <= startY && cell.y >= endY;

            if (isInsideX && isInsideY && (direction === 'l->r' || direction === 't->b')) {
                if(validZone(cell) && cell.status === statuses.STATIC && isValid) cell.status = statuses.HAIGHLIGHT;
               
            } else if (x && y && (direction === 'r->l' || direction === 'b->t')) {
                if(validZone(cell) && cell.status === statuses.STATIC && isValid) cell.status = statuses.HAIGHLIGHT;
      
            } else if (cell.status !== statuses.SHIP ) { //?
                cell.status = statuses.STATIC;
            }
        });
    };

    const clearShips = () => {
        const updatedCells = cells.map((cell) => {
            return cell.status !== statuses.STATIC  ? { ...cell, status: statuses.STATIC } : cell;
        });
        
        const updatedCompCells = compCells.map((cell) => {
            return cell.status !== statuses.STATIC ? { ...cell, status: statuses.STATIC } : cell;
        });
        setCompCells(updatedCompCells);
        setReady(false);
        
        setCells(updatedCells);
        setCount(10);
        
    };

    function createCompShip(len, startPosition, vertical) {
        let x = startPosition.x;
        let y = startPosition.y;
    
        const updatedCells = compCells.map((cell) => {
            if (vertical) {
                for (let i = 0; i < len; i++) {
                    if (cell.x === x && cell.y === y + i) {
                        cell.status = statuses.SHIP;
                    }
                }
            } else {
                for (let i = 0; i < len; i++) {
                    if (cell.x === x + i && cell.y === y) {
                        cell.status = statuses.SHIP;
                    }
                }
            }
            return cell;
        });
    
        setCompCells(updatedCells);
    }
    
    function isNoAvailableCells(cells) {
        return cells.filter((cell) => cell.status === statuses.SHIP)
                         .map(cell => ({ x: cell.x, y: cell.y }));
    }
    
    function isFreeCells(cells) {
        let adjacentCells = new Set();
        let occupiedCells = isNoAvailableCells(cells);
    
        for (let cell of occupiedCells) {
            let { x, y } = cell;
    
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
    
                    let newX = x + dx;
                    let newY = y + dy;
    
                    if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
                        if (cells.some(c => c.x === newX && c.y === newY && c.status === statuses.STATIC)) {
                            adjacentCells.add(`${newX},${newY}`);
                        }
                    }
                }
            }
        }
        return Array.from(adjacentCells).map(cell => {
            const [x, y] = cell.split(',').map(Number);
            return { x, y };
        });
    }
    
    function valid(len, startPosition, vertical) {
        let x = startPosition.x;
        let y = startPosition.y;
        let mustFreeCells = isFreeCells(compCells);
        let notFreeCells = isNoAvailableCells(compCells);
    
        if (vertical) {
            if (x + len > 10) return false;
                  
        } else {
            if (y + len > 10) return false;
        }
        if (mustFreeCells.some((cell) => cell.x === x && cell.y === y) || notFreeCells.some((cell) => cell.x === x && cell.y === y)) {
            return false;
        }
    
        return true;
    }
    function shipsDied(cells){
        return cells.some((cell) => cell.status === statuses.SHIP) ? false : true;
    }
    
    const placeCompShips = () => {
            const updatedCells = [...compCells]; 
    
            for (let i = 0; i < 10; i++) { 
                while (true) {
                    let startPosition = {
                        x: Math.floor(Math.random() * 10),
                        y: Math.floor(Math.random() * 10)
                    };
    
                    let len = Math.floor(Math.random() * 5) + 1; 
                    let vertical = Math.random() < 0.5; 
    
                    if (valid(len, startPosition, vertical)) {
                        createCompShip(len, startPosition, vertical);
                        break; 
                    }
                }
            }
            setCompCells(updatedCells); 
    
    };
    
    function CreatePhrase({visible, text}){
        return(
            visible && <div id={id} className="phrase">
                <img className="dialog" src={dialog} alt="dialog"/>
                <p>{text}</p>
            </div>
        )

    }
    function TheRoolsText({text, span, button}){
        return(
            (rools) && <div className="end" id="rools">
                <p>{text} <br/><span>{span}</span></p>
                <button onClick={() => {
                    setRools(false);
                    clearShips();
                }}>{button}</button>
            </div>
        )
    }
    function TheTextOfGame({text, span, button}){
        return(
            (finish || start) && <div className="end">
                <p>{text} <br/><span>{span}</span></p>
                <button onClick={() => {
                    setFinish(false);
                    setStart(false);
                    setRools(true);
                    clearShips();
                }}>{button}</button>
            </div>
        )
    }
    function Background() {
        let style = {
            zIndex: 19,
            animation: 'none'
        };
        // if(finish || start || rools) index = 19;
        return(
            <div className="back-dialog" style={(finish || start || rools) ? style : null}></div>
        )
    }

    const attack = (x, y) => {
        if(ready){
            let randomIndex = Math.floor(Math.random() * 3);
            const updatedCellsState = compCells.map((cell) => {
                setId("human-phrase");
                if (cell.x === x && cell.y === y) {
                    if (cell.status === statuses.STATIC) {
                        cell.status = statuses.MISS;
                        setPerAttack(false);
                        setCompAttack(true);
                        setMessage(phrasesPersonMiss[randomIndex]);

                    } else if (cell.status === statuses.SHIP) {
                        cell.status = statuses.DAMAGE;
                        setPerAttack(true);
                        setCompAttack(false);//?
                        setMessage(phrasesPersonGoal[randomIndex]);
                    }
                }
                return cell;
            });
            // setZIndex(9);
            setBack(true);

            setShowMessage(true); 
            setCompCells(updatedCellsState);
            if(shipsDied(compCells)) {
                setMessage("Вот видишь, я опять победила!");
                setFinish(true);
            }
            setTimeout(() => {
                setBack(false);
                setShowMessage(false)}, 4000);
        }
    };
    
    useEffect(() => {
        if (compAttack) {
            let randomIndex = Math.floor(Math.random() * 3);
            const attackComputer = () => {
                let randX, randY;
                let set = new Set();
                do {
                    randX = Math.floor(Math.random() * 10);
                    randY = Math.floor(Math.random() * 10);
                } while (set.has(`${randX},${randY}`));
                set.add(`${randX},${randY}`);

                const updatedCells = cells.map((cell) => {
                    setId("comp-phrase");
                    if(cell.x === randX && cell.y === randY){
                        if(cell.status === statuses.SHIP){
                            cell.status = statuses.DAMAGE;
                            setMessage(phrasesCompGoal[randomIndex]);
                            setPerAttack(false);
                            setCompAttack(true);

                        }
                        else if(cell.status === statuses.STATIC){
                            cell.status = statuses.MISS;
                            setPerAttack(true);
                            setCompAttack(false);
                            setMessage(phrasesCompMiss[randomIndex]);
                        }
                    }
                    return cell;
                })
                setCells(updatedCells);
                if(shipsDied(cells)){
                    setMessage("Вот и пришла твоя смерть, Хюрем!");
                    setFinish(true);
                }
                setBack(true);
                setShowMessage(true); 
                setTimeout(() => {
                    setBack(false);
                    setShowMessage(false);
                }, 4000); 

            };

            const timer = setTimeout(attackComputer, 6000);
            return () => clearTimeout(timer);
        }
    }, [compAttack, cells]);
    

    return (
        <div className="block-field">
            <CreatePhrase visible={showMessage} text={message} id={id}/>
            {finish ? <TheTextOfGame text={"ВОЙНА ОКОНЧЕНА! "} span={"Если Вы хотите сыграсть снова, нажмите кнопку"} button={"ВТОРОЙ ШАНС"}/> : null}
            {start ? <TheTextOfGame text={"ДОБРО ПОЖАЛОВАТЬ! "} span={"Если Вы хотите сыграсть, нажмите кнопку"} button={"ДАЛЕЕ"}/> : null}
            {rools ? <TheRoolsText text={"ПРАВИЛА"} span={"Чтобы разместить корабль, кликните по ячейке поля и протините до нужной Вам длины."} button={"ИГРАТЬ"} /> : null}
            {showBack || finish || start || rools ? <Background/>: null}
            <div className="block" id="human">
                <p>{player}</p>
                <div className="field">
                    {cells.map((cell, index) => (
                        <div
                            className="cell"
                            key={index}
                            id={index}
                            onMouseDown={() => handleMouseDown(cell)}
                            onMouseMove={() => handleMouseMove(cell)}
                            onMouseUp={handleMouseUp}
                            style={cellStyle(cell)}
                        >
                            {cell.status === statuses.MISS && cell.status !== statuses.SHIP ? "•" : null}
                        </div>
                    ))}
                </div>
                <div className="buttons">
                    {!ready && personField ? <button id="clear" onClick={clearShips}>CLEAR</button> : null}
                    {count <= 0 && !ready && personField ? <button id="start" onClick={() => {
                        setReady(true);
                        setFinish(false);
                        placeCompShips();
                        setMessage("Да начнется ВЕЛИКИЙ БОЙ!");
                        setId("human-phrase");
                        setShowMessage(true);
                        setTimeout(() => {
                            setShowMessage(false);
                        }, 3000); 

                    }}>START</button> : null}
                    {ready && personField ? <button id="end" onClick={() => {
                        setFinish(true);

                    }}>END</button> : null}
                </div>

            </div>
            
            <div className="block">
                <p>ИБРАГИМ</p>
                <div className="field">
                    {compCells.map((cell, index) => (
                        <div
                            className="cell"
                            key={index}
                            id={index}
                            onClick={() => !finish ? attack(cell.x, cell.y) : null}
                            style={cellCompStyle(cell)}
                        >
                            {cell.status === statuses.MISS && cell.status !== statuses.SHIP ? "•" : null}
                            
                        </div>
                    ))}
                </div>

            </div>
            
        </div>
    );
}

export default CreateField;

