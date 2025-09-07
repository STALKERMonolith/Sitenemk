const FIELD_SIZE_X = 40;    // Розмір ігрового поля по X
const FIELD_SIZE_Y = 15;    // Розмір ігрового поля по Y
const REQUIRED_APPLES = 5;  // Кількість яблук, яку потрібно зібрати для перемоги

let snake = []; // сама змійка
let gameIsRunning = false;  // Гра на старті не запущена
let direction = "y+"; // За замовчуванням вниз (x+, x-, y-, y+)
let snakeSpeed = 300;   // Інтервал у мс руху змійки
let snakeTimer; // таймер змійки
let score = 0;  // Очки
let yellowApples = 0; // Кількість зібраних жовтих яблук
let redApples = 0;    // Кількість зібраних червоних яблук
let totalApples = 0;  // Загальна кількість яблук

/*
    Функція ініціалізації ігрового простору
*/
function init() {
    prepareGameField();
    // додаємо на кнопку старту слухача
    document.getElementById("snake-start").addEventListener("click", startGame);
    document.getElementById("snake-renew").addEventListener("click", refreshGame);

    // додаємо відслідковування натискання на клавіатуру
    addEventListener("keydown", changeDirection);
}

/*
    Функція запуску гри
*/
function startGame() {
    gameIsRunning = true;
    yellowApples = 0;
    redApples = 0;
    totalApples = 0;
    score = 0;
    getScoreInHtml(); // Оновлюємо рахунок в HTML
    respawn();
    snakeTimer = setInterval(move, snakeSpeed);
    createYellowFood();  // Жовте яблуко з'являється одразу після початку гри
    createRedFood();     // Червоне яблуко з'являється одразу після початку гри
}

/*
    Функція організації нової гри
*/
function refreshGame() {
    location.reload();
}

/*
    Функція підготовки ігрового поля
*/
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

/*
    Розташування змійки на ігровому полі
    Стартова довжина змійки: 2 елементи (голова і хвіст)
    Змійка — це масив елементів .game-table-cell
*/
function respawn() {
    // починаємо з центру
    let startCoordX = Math.floor(FIELD_SIZE_X / 2);
    let startCoordY = Math.floor(FIELD_SIZE_Y / 2);

    let snakeHead = document.getElementsByClassName("cell-" + startCoordX + "-" + startCoordY)[0];
    let prevSnakeHeadAttr = snakeHead.getAttribute("class");	// Зберігаємо попередні класи клітинки перед додаванням голови
    snakeHead.setAttribute("class", prevSnakeHeadAttr + " snake-unit");

    let snakeTail = document.getElementsByClassName("cell-" + startCoordX + "-" + (startCoordY - 1))[0];
    let prevSnakeTailAttr = snakeTail.getAttribute("class");	// Зберігаємо попередні класи клітинки перед додаванням хвоста
    snakeTail.setAttribute("class", prevSnakeTailAttr + " snake-unit");

    // Додаємо хвіст в масив змійки
    snake.push(snakeTail);
    // Додаємо голову в масив змійки
    snake.push(snakeHead);
}

/*
    Організація руху змійки
*/
function move() {
    let snakeHeadClasses = snake[snake.length - 1].getAttribute("class").split(" ");
    let newUnit;
    let snakeCoords = snakeHeadClasses[1].split("-");
    let coordX = parseInt(snakeCoords[1]);
    let coordY = parseInt(snakeCoords[2]);

    if (direction == "y+") {
        newUnit = document.getElementsByClassName("cell-" + coordX + "-" + (coordY + 1))[0];
    } else if (direction == "y-") {
        newUnit = document.getElementsByClassName("cell-" + coordX + "-" + (coordY - 1))[0];
    } else if (direction == "x+") {
        newUnit = document.getElementsByClassName("cell-" + (coordX + 1) + "-" + coordY)[0];
    } else if (direction == "x-") {
        newUnit = document.getElementsByClassName("cell-" + (coordX - 1) + "-" + coordY)[0];
    }

    if (!isSnakeUnit(newUnit) && newUnit !== undefined) {
        newUnit.setAttribute("class", newUnit.getAttribute("class") + " snake-unit");
        snake.push(newUnit);
        if (!checkFood(newUnit)) {
            let removed = snake.splice(0, 1)[0];
            let classes = removed.getAttribute("class").split(" ");
            removed.setAttribute("class", classes[0] + " " + classes[1]);
        }
        getScoreInHtml(); // Оновлюємо рахунок в HTML
        if (totalApples >= REQUIRED_APPLES) {
            finishTheGame(true);
        }
    } else {
        finishTheGame(false);
    }
}

/*
    Перевіряємо елемент на приналежність змійці
*/
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
        score++;
        return true;
    }

    if (unitClasses.includes("red-food-unit")) {
        // При контакті з червоним яблуком не зараховуються очки і не закінчується гра
        createRedFood(); // Створюємо нове червоне яблуко
        redApples++;
        totalApples++;
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
    Створення червоного яблука (якщо потрібно оновити позицію яблука)
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
    Управління рухом змійки
*/
function changeDirection(e) {
    switch (e.key) {
        case "Left": // IE/Edge specific value
        case "ArrowLeft":
            if (direction != "x+")
                direction = "x-";
            break;
        case "Up": // IE/Edge specific value
        case "ArrowUp":
            if (direction != "y+")
                direction = "y-";
            break;
        case "Right": // IE/Edge specific value
        case "ArrowRight":
            if (direction != "x-")
                direction = "x+";
            break;
        case "Down": // IE/Edge specific value
        case "ArrowDown":
            if (direction != "y-")
                direction = "y+";
            break;
    }
}

/*
    Оновлення рахунку в HTML
*/
function getScoreInHtml() {
    let scoreInHtml = document.getElementById('score');
    scoreInHtml.innerHTML = `Набрано ${score} очок з ${REQUIRED_APPLES}`;
}

/*
    Дії для завершення гри
*/
function finishTheGame(isVictory) {
    gameIsRunning = false;
    clearInterval(snakeTimer);

    if (isVictory) {
        alert(`Вітаємо! Ви набрали ${score} очок і зібрали ${totalApples} яблук.`);
    } else {
        alert(`Гра закінчена. Ви набрали ${score} очок і зібрали ${totalApples} яблук.`);
    }
}

window.onload = init;
