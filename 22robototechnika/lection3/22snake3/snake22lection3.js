const FIELD_SIZE_X = 30;    // Розмір ігрового поля по X
const FIELD_SIZE_Y = 15;    // Розмір ігрового поля по Y
const REQUIRED_APPLES = 5;  // Кількість яблук, яку потрібно зібрати для перемоги

let snake = []; // сама змійка
let gameIsRunning = false;  // Гра на старті не запущена
let direction = "y+"; // За замовчуванням вниз (x+, x-, y-, y+)
let snakeSpeed = 300;   // Інтервал у мс руху змійки
let snakeTimer; // таймер змійки
let yellowApples = 0; // Кількість зібраних жовтих яблук
let redApples = 0;    // Кількість зібраних червоних яблук
let totalApples = 0;  // Загальна кількість яблук
let rectangleChangeCount = 0; // Лічильник змін тексту в першому прямокутнику
let secondRectangleChangeCount = 0; // Лічильник змін тексту в другому прямокутнику
let thirdRectangleChangeCount = 0; // Лічильник змін тексту в третьому прямокутнику

const texts1 = [
    "Роботи, які виконують промислові завдання",
    " Автоматизація виробничих процесів",
    "Розробка нових механізмів для промислових роботів",
    "Промислові маніпулятори",
    "Промислові роботи"
];

const texts2 = [
    "Роботи, які імітують людську форму і поведінку",
    "Забезпечення соціальної взаємодії та емоційної підтримки",
    "Забезпечення безпеки і конфіденційності даних ",
    "Роботи-компаньйони та соціальні роботи",
    "Роботи-компаньйони"
];

const texts3 = [
    "Що таке людиноподібні роботи?",
    "Яке призначення роботів-компаньйонів?",
    "Що є важливим в етиці робототехніки?",
    "Які роботи створюються для соціальної взаємодії?",
    "Які роботи призначені для догляду за людьми з особливими потребами?"
];


function init() {
    prepareGameField();
    document.getElementById("snake-start").addEventListener("click", startGame);
    document.getElementById("snake-renew").addEventListener("click", refreshGame);

    addEventListener("keydown", changeDirection);
}


function startGame() {
    gameIsRunning = true;
    yellowApples = 0;
    redApples = 0;
    totalApples = 0;
    rectangleChangeCount = 0; // Скидаємо лічильник змін тексту першого прямокутника
    secondRectangleChangeCount = 0; // Скидаємо лічильник змін тексту другого прямокутника
    thirdRectangleChangeCount = 0; // Скидаємо лічильник змін тексту третього прямокутника
    respawn();
    snakeTimer = setInterval(move, snakeSpeed);
    createYellowFood();  // Жовте яблуко з'являється одразу після початку гри
    createRedFood();     // Червоне яблуко з'являється одразу після початку гри
    changeRectangleText(); // Викликаємо зміну тексту одразу після старту гри
}

/*
    Функція організації нової гри
*/
function refreshGame() {
    location.reload();
}


function prepareGameField() {
    let gameTable = document.createElement("table");
    gameTable.setAttribute("class", "game-table");

    // у циклі генеруємо клітинки ігрової таблиці
    for (let i = 0; i < FIELD_SIZE_Y; i++) {
        let row = document.createElement("tr");
        row.setAttribute("class", "game-table-row row-" + i);

        for (let j = 0; j < FIELD_SIZE_X; j++) {
            let cell = document.createElement("td");
            cell.setAttribute("class", "game-table-cell cell-" + j + "-" + i);

            row.appendChild(cell);
        }

        gameTable.appendChild(row);
    }

    document.getElementById("snake-field").appendChild(gameTable);
}


function respawn() {
    let startCoordX = Math.floor(FIELD_SIZE_X / 2);
    let startCoordY = Math.floor(FIELD_SIZE_Y / 2);

    let snakeHead = document.getElementsByClassName("cell-" + startCoordX + "-" + startCoordY)[0];
    let prevSnakeHeadAttr = snakeHead.getAttribute("class");
    snakeHead.setAttribute("class", prevSnakeHeadAttr + " snake-unit");

    let snakeTail = document.getElementsByClassName("cell-" + startCoordX + "-" + (startCoordY - 1))[0];
    let prevSnakeTailAttr = snakeTail.getAttribute("class");	
    snakeTail.setAttribute("class", prevSnakeTailAttr + " snake-unit");

    snake.push(snakeTail);
    snake.push(snakeHead);
}


function move() {
    let snakeHeadClasses = snake[snake.length - 1].getAttribute("class").split(" ");
    let newUnit;
    let snakeCoords = snakeHeadClasses[1].split("-");
    let coordX = parseInt(snakeCoords[1]);
    let coordY = parseInt(snakeCoords[2]);

    if (direction == "y+") {
        coordY += 1;
        if (coordY >= FIELD_SIZE_Y) {  
            coordY = 0;  
        }
    } else if (direction == "y-") {
        coordY -= 1;
        if (coordY < 0) {  
            coordY = FIELD_SIZE_Y - 1;  
        }
    } else if (direction == "x+") {
        coordX += 1;
        if (coordX >= FIELD_SIZE_X) {  
            coordX = 0;  
        }
    } else if (direction == "x-") {
        coordX -= 1;
        if (coordX < 0) {  
            coordX = FIELD_SIZE_X - 1;  
        }
    }


    newUnit = document.getElementsByClassName("cell-" + coordX + "-" + coordY)[0];

   
    if (!isSnakeUnit(newUnit) && newUnit !== undefined) {
        newUnit.setAttribute("class", newUnit.getAttribute("class") + " snake-unit");
        snake.push(newUnit);
        
    
        if (!checkFood(newUnit)) {
            let removed = snake.splice(0, 1)[0];
            let classes = removed.getAttribute("class").split(" ");
            removed.setAttribute("class", classes[0] + " " + classes[1]);
        }

    
        if (totalApples >= REQUIRED_APPLES) {
            finishTheGame(true);
        }
    } else {
        finishTheGame(false);
    }
}



function isSnakeUnit(unit) {
    return snake.includes(unit);
}

/*
    Функція перевірки їжі
*/
function checkFood(unit) {
    let unitClasses = unit.getAttribute("class").split(" ");

    if (unitClasses.includes("yellow-food-unit")) {
        unit.setAttribute("class", unitClasses[0] + " " + unitClasses[1]);
        createYellowFood(); // Створюємо нове жовте яблуко
        yellowApples++;
        totalApples++;
        changeRectangleText(); // Змінюємо текст у прямокутниках
        return true;
    }

    if (unitClasses.includes("red-food-unit")) {
        // При контакті з червоним яблуком не зараховуються очки і не закінчується гра
        createRedFood(); // Створюємо нове червоне яблуко
        redApples++;
        totalApples++;
        changeRectangleText(); // Змінюємо текст у прямокутниках
        return true;
    }

    return false;
}

/*
    Створення жовтого яблука (продовжує гру)
*/
function createYellowFood() {
    let foodCreated = false;

    while (!foodCreated) {
        let foodX = Math.floor(Math.random() * FIELD_SIZE_X);
        let foodY = Math.floor(Math.random() * FIELD_SIZE_Y);

        let foodCell = document.getElementsByClassName("cell-" + foodX + "-" + foodY)[0];
        let foodCellClasses = foodCell.getAttribute("class").split(" ");

        if (!foodCellClasses.includes("snake-unit") && !foodCellClasses.includes("yellow-food-unit") && !foodCellClasses.includes("red-food-unit")) {
            foodCell.setAttribute("class", foodCell.getAttribute("class") + " yellow-food-unit");
            foodCreated = true;
        }
    }
}

/*
    Створення червоного яблука (не продовжує гру)
*/
function createRedFood() {
    let foodCreated = false;

    while (!foodCreated) {
        let foodX = Math.floor(Math.random() * FIELD_SIZE_X);
        let foodY = Math.floor(Math.random() * FIELD_SIZE_Y);

        let foodCell = document.getElementsByClassName("cell-" + foodX + "-" + foodY)[0];
        let foodCellClasses = foodCell.getAttribute("class").split(" ");

        if (!foodCellClasses.includes("snake-unit") && !foodCellClasses.includes("yellow-food-unit") && !foodCellClasses.includes("red-food-unit")) {
            foodCell.setAttribute("class", foodCell.getAttribute("class") + " red-food-unit");
            foodCreated = true;
        }
    }
}

/*
    Зміна напряму змійки в залежності від натиснутої клавіші
*/
function changeDirection(event) {
    switch (event.key) {
        case "ArrowUp":
            if (direction !== "y+") direction = "y-";
            break;
        case "ArrowDown":
            if (direction !== "y-") direction = "y+";
            break;
        case "ArrowLeft":
            if (direction !== "x+") direction = "x-";
            break;
        case "ArrowRight":
            if (direction !== "x-") direction = "x+";
            break;
    }
}

/*
    Завершення гри
*/
function finishTheGame(victory) {
    gameIsRunning = false;
    clearInterval(snakeTimer);

    if (victory) {
        alert(`Ви перемогли! Набрано ${yellowApples} очок з ${REQUIRED_APPLES}`);
    } else {
        alert("Гру закінчено! Спробуйте знову.");
    }
}
/*
    Зміна тексту в прямокутниках
*/
function changeRectangleText() {
    if (rectangleChangeCount < texts1.length) {
        document.getElementById("t1").innerText = texts1[rectangleChangeCount];
        rectangleChangeCount++;
    }
    
    if (secondRectangleChangeCount < texts2.length) {
        document.getElementById("t2").innerText = texts2[secondRectangleChangeCount];
        secondRectangleChangeCount++;
    }

    if (thirdRectangleChangeCount < texts3.length) {
        document.getElementById("t3").innerText = texts3[thirdRectangleChangeCount];
        thirdRectangleChangeCount++;
    }
}

// Ініціалізація гри при завантаженні сторінки
window.onload = init;
