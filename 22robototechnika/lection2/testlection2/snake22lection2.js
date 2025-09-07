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
    " Bubble Sort ",
    "Система, яка здійснює обробку даних лише раз на добу",
    "Зберігання даних у великому обсязі",
    "Операційні системи для десктопів",
    " Розробка нових технологій для комп'ютерних ігор"
];

const texts2 = [
    "A* ",
    "Система, яка обробляє дані миттєво для забезпечення точності та швидкості виконання завдань  ",
    "Керування всіма процесами в реальному часі, включаючи сенсори і актуатори  ",
    "Системи реального часу",
    "Створення інструкцій для управління роботом, включаючи його сенсори та актуатори "
];

const texts3 = [
    "Який алгоритм зазвичай використовується для пошуку оптимального шляху в середовищі з перешкодами?",
    "Що таке система реального часу в контексті програмування роботів? ",
    "Яка роль контролера в робототехнічній системі?",
    "Який тип програмного забезпечення часто використовується для управління роботами у промислових застосуваннях?",
    "Яка основна мета програмування в контексті розробки роботів?"
];

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

    // Перевіряємо напрямок руху змійки
    if (direction == "y+") {
        coordY += 1;
        if (coordY >= FIELD_SIZE_Y) {  // Якщо змійка виходить за нижню межу
            coordY = 0;  // Переміщуємо її на верхнє поле
        }
    } else if (direction == "y-") {
        coordY -= 1;
        if (coordY < 0) {  // Якщо змійка виходить за верхню межу
            coordY = FIELD_SIZE_Y - 1;  // Переміщуємо її на нижнє поле
        }
    } else if (direction == "x+") {
        coordX += 1;
        if (coordX >= FIELD_SIZE_X) {  // Якщо змійка виходить за праву межу
            coordX = 0;  // Переміщуємо її на ліве поле
        }
    } else if (direction == "x-") {
        coordX -= 1;
        if (coordX < 0) {  // Якщо змійка виходить за ліву межу
            coordX = FIELD_SIZE_X - 1;  // Переміщуємо її на праве поле
        }
    }

    // Отримуємо нову клітинку змійки після зміни координат
    newUnit = document.getElementsByClassName("cell-" + coordX + "-" + coordY)[0];

    // Перевіряємо, чи не врізалась змійка в саму себе
    if (!isSnakeUnit(newUnit) && newUnit !== undefined) {
        newUnit.setAttribute("class", newUnit.getAttribute("class") + " snake-unit");
        snake.push(newUnit);
        
        // Якщо змійка не з'їла їжу, видаляємо хвіст
        if (!checkFood(newUnit)) {
            let removed = snake.splice(0, 1)[0];
            let classes = removed.getAttribute("class").split(" ");
            removed.setAttribute("class", classes[0] + " " + classes[1]);
        }

        // Перевіряємо, чи зібрано всі яблука
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
