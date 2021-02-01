const MINESWEEPER_RECORD = "minesweeperRecord";

class Tile {
    constructor(x, y, isOpen, isMine) {
        this.x = x;
        this.y = y;
        this.isOpen = isOpen;
        this.isMine = isMine;
        this.priority = 0;
        this.isFlag = false;
    }
}
class Record {
    constructor(date, time) {
        this.date = date;
        this.time = time;
    }
}
let tileArr = [];
let dx = [0, 1, 0, -1];
let dy = [1, 0, -1, 0];
let numRow = 9;
let numCol = 9;
let numMine = 10;
let isStarted = false;
let isEnded = false;
let clickMode = "bomb";
let notOpen = numRow * numCol;
let colorMap = {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight"
};
let startTime = 0;
let intervalId = -1;
let leftMine = numMine;

function toStringLeadingZero(num, targetLength) {
    let isMinus = false;
    if (num < 0) {
        isMinus = true;
        num = -num;
        targetLength--;
    }
    let str = num + '';
    while (str.length < targetLength) {
        str = '0' + str;
    }
    if (isMinus) {
        str = '-' + str;
    }
    return str;
}
function toggleFlag(x, y, item) {
    if (tileArr[x][y].isOpen) {
        return;
    }
    let itemContent = item.querySelector(".item-content");
    if (tileArr[x][y].isFlag) {
        tileArr[x][y].isFlag = false;
        itemContent.innerHTML = "";
        item.classList.remove("flag");
        leftMine++;
    } else {
        tileArr[x][y].isFlag = true;
        let img = document.createElement("img");
        img.classList.add("bomb");
        img.src = "./flag.png";
        itemContent.append(img);
        item.classList.add("flag");
        leftMine--;
    }
    setContext('left-mine', toStringLeadingZero(leftMine, 3));
}
function clickTile(e) {
    let isRightMB = false;
    let item = this;
    if ("which" in e) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3;
        for (let i = 0; i < e.path.length; i++) {
            if (e.path[i].classList.contains("item")) {
                item = e.path[i];
                break;
            }
        }
    }

    //flag mode
    if (clickMode == "flag") {
        isRightMB = true;
    }
    let x = parseInt(item.dataset.x);
    let y = parseInt(item.dataset.y);
    if (isRightMB) {
        toggleFlag(x, y, item);
        return;
    }
    //To prevent start game
    if (tileArr[x][y].isFlag) {
        return;
    }
    if (!isStarted) {
        setMine(x, y);
        isStarted = true;
        isEnded = false;
        startTime = new Date();
        setContext('time', '000');

        intervalId = setInterval(() => {
            let curTime = new Date();
            let timeDiff = Math.floor((curTime - startTime) / 1000) + '';
            while (timeDiff.length < 3) {
                timeDiff = '0' + timeDiff;
            }
            setContext('time', timeDiff);
            if (isEnded) {
                clearInterval(intervalId);
            }
        }, 100);
    }
    open(x, y);
}
function isValid(x, y, n, m) {
    if (x >= 0 && x < n && y >= 0 && y < m) {
        return true;
    }
    return false;
}
function openAll() {
    for (let i = 0; i < numRow; i++) {
        for (let j = 0; j < numCol; j++) {
            open(i, j);
        }
    }
}
function getItem(i, j) {
    return document.querySelector(`.item[data-x='${i}'][data-y='${j}']`);
}
function flagAll() {
    for (let i = 0; i < numRow; i++) {
        for (let j = 0; j < numCol; j++) {
            if (!tileArr[i][j].isOpen && !tileArr[i][j].isFlag) {
                let item = getItem(i, j);
                toggleFlag(i, j, item);
            }
        }
    }
}

function changeFace(mode) {
    if (mode == "smile") {
        let imgFaceSurprising = document.querySelector(".face-surprising");
        imgFaceSurprising.classList.add("display-none");
        let imgFaceSmile = document.querySelector(".face-smile");
        imgFaceSmile.classList.remove("display-none");
    } else if (mode == "default") {
        let imgFaceSurprising = document.querySelector(".face-surprising");
        imgFaceSurprising.classList.remove("display-none");
        let imgFaceSmile = document.querySelector(".face-smile");
        imgFaceSmile.classList.add("display-none");
    }
}
function open(x, y) {
    //After end game, stop working of open
    if (tileArr[x][y].isOpen || tileArr[x][y].isFlag) {
        return;
    }
    tileArr[x][y].isOpen = true;

    let item = document.querySelector(`.item[data-x='${x}'][data-y='${y}'`);
    item.classList.add("open");
    let itemContent = item.querySelector(".item-content");
    if (tileArr[x][y].isMine) {
        let img = document.createElement("img");
        img.classList.add("bomb");
        img.src = "./bomb.png";
        itemContent.append(img);

        if (!isEnded) {
            isEnded = true;
            item.classList.add("red");
            openAll();
            let msg = document.createElement("div");
            msg.textContent = "Game Over";
            showModal(msg);
        }
    } else {
        itemContent.textContent = tileArr[x][y].content;
        if (tileArr[x][y].num != 0)
            itemContent.classList.add(colorMap[tileArr[x][y].num]);
    }

    //check victory

    if (!isEnded) {
        let leftOpen = 0;
        for (let i = 0; i < numRow; i++) {
            for (let j = 0; j < numCol; j++) {
                if (!tileArr[i][j].isOpen) {
                    leftOpen++;
                }
            }
        }
        if (leftOpen == numMine) {
            let msg = document.createElement("div");
            msg.textContent = "Victory";
            showModal(msg);

            //save the record
            let record = [];
            if (localStorage.getItem(MINESWEEPER_RECORD) != undefined) {
                record = JSON.parse(localStorage.getItem(MINESWEEPER_RECORD));
            }
            let curTime = new Date();
            let recordTime = Math.floor((curTime - startTime) / 10) / 100;
            record.push(new Record(new Date(), recordTime));
            localStorage.setItem(MINESWEEPER_RECORD, JSON.stringify(record));
            flagAll();
            isEnded = true;

            //change face
            changeFace("smile");

        }
    }
    if (tileArr[x][y].num == 0) {
        for (let nextX = x - 1; nextX <= x + 1; nextX++) {
            for (let nextY = y - 1; nextY <= y + 1; nextY++) {
                if (isValid(nextX, nextY, numRow, numCol) && !tileArr[nextX][nextY].isOpen) {
                    open(nextX, nextY);
                }
            }
        }
    }
}
function setMine(ignoreX, ignoreY) {

    let mineArr = [];
    for (let i = 0; i < numRow; i++) {
        for (let j = 0; j < numCol; j++) {
            if (i == ignoreX && j == ignoreY) {
                continue;
            }
            tileArr[i][j].priority = Math.random();
            mineArr.push(tileArr[i][j]);
        }
    }
    mineArr.sort((a, b) => {
        return (a.priority - b.priority);
    });

    for (let i = 0; i < numMine; i++) {
        mineArr[i].isMine = true;
    }
    //calculate number
    for (let i = 0; i < numRow; i++) {
        for (let j = 0; j < numCol; j++) {
            let num = 0;
            for (let x = i - 1; x <= i + 1; x++) {
                for (let y = j - 1; y <= j + 1; y++) {
                    if (isValid(x, y, numRow, numCol) && tileArr[x][y].isMine) {
                        num++;
                    }
                }
            }
            tileArr[i][j].num = num;
            if (num != 0) {
                tileArr[i][j].content = num;
            }
        }
    }
}
function setContext(id, context) {
    let node = document.getElementById(id);
    if (node !== undefined) {
        node.textContent = context
    }
}
function showModal(contentElement, title) {
    if (title == undefined)
        title = "";
    let modalBackground = document.getElementById("modal-background");
    let modalContent = document.getElementById("modal-content");
    let modalHeadContent = document.getElementById("modal-head-content");

    modalBackground.classList.add("show");
    modalContent.innerHTML = "";
    modalContent.append(contentElement);
    modalHeadContent.textContent = title;

}

function closeModal() {
    let modalBackground = document.getElementById("modal-background");
    modalBackground.classList.remove("show");
}
function resetGame() {
    initGame();
    clearInterval(intervalId);
}
function initGame() {
    let board = document.getElementById("board");
    board.innerHTML = "";
    tileArr = [];
    isStarted = false;
    isEnded = false;
    //clickMode = "bomb";

    setContext('left-mine', toStringLeadingZero(numMine, 3));
    setContext('time', '000');
    changeFace("default");
    leftMine = numMine;
    //disalbe showing menu when click right mouse button
    board.oncontextmenu = function (e) {
        console.log(e);
        clickTile(e);
        return false;
    }
    let rowContainer = document.createElement("div");
    rowContainer.classList.add("row-container");

    for (let i = 0; i < numRow; i++) {
        let row = document.createElement("div");
        row.classList.add("row");
        let tileRow = [];
        for (let j = 0; j < numCol; j++) {
            let item = document.createElement("div");
            item.classList.add("item");
            item.dataset.x = i;
            item.dataset.y = j;
            item.addEventListener("click", clickTile);
            let itemContent = document.createElement("div");
            itemContent.classList.add("item-content");
            item.append(itemContent);
            row.append(item);
            tileRow.push(new Tile(i, j, false, false));
        }
        tileArr.push(tileRow);
        rowContainer.append(row);
    }
    board.append(rowContainer);

    //modal setting
    let modalClose = document.getElementById("modal-close");
    modalClose.addEventListener("click", function () {
        console.log("close");
        closeModal();
    });
}
document.addEventListener("DOMContentLoaded", function () {
    initGame();

    let resetBtn = document.getElementById("reset-btn");
    resetBtn.addEventListener("click", () => {
        resetGame();
    });

    let $clickModeBtn = document.getElementById("click-mode");
    $clickModeBtn.addEventListener("click", function () {
        let $bombImg = $clickModeBtn.querySelector(".click-bomb");
        let $flagImg = $clickModeBtn.querySelector(".click-flag");
        if (clickMode == "bomb") {
            $bombImg.classList.add("display-none");
            $flagImg.classList.remove("display-none");
            clickMode = "flag";
        } else if (clickMode == "flag") {
            $bombImg.classList.remove("display-none");
            $flagImg.classList.add("display-none");
            clickMode = "bomb";
        }
    });

    //show records
    let $recordBtn = document.getElementById("record-btn");
    $recordBtn.addEventListener("click", () => {
        let record = localStorage.getItem(MINESWEEPER_RECORD);
        if (record != undefined) {
            record = JSON.parse(record);
        } else {
            record = [];
        }
        record.sort((a, b) => {
            return a.time - b.time;
        });
        let table = document.getElementById("record-table").cloneNode(true);
        table.classList.remove("display-none");
        let tbody = table.querySelector("tbody");
        tbody.innerHTML = "";
        //show max 10 records
        for (let i = 0; i < 10 && i < record.length; i++) {
            let r = record[i];
            let tr = document.createElement("tr");
            let tdIdx = document.createElement("td");
            let tdDate = document.createElement("td");
            let tdTime = document.createElement("td");

            //to change locale date
            let recordDate = new Date(r.date);

            let year = recordDate.getFullYear();
            let month = toStringLeadingZero(recordDate.getMonth() + 1, 2);
            let date = toStringLeadingZero(recordDate.getDate(), 2);
            let hour = toStringLeadingZero(recordDate.getHours(), 2);
            let minute = toStringLeadingZero(recordDate.getMinutes(), 2);
            let second = toStringLeadingZero(recordDate.getSeconds(), 2);
            tdIdx.textContent = i + 1;
            tdDate.textContent = `${year}.${month}.${date} ${hour}:${minute}:${second}`;
            //r.date.substr(0, r.date.length - 5);
            tdTime.textContent = r.time;

            tr.append(tdIdx);
            tr.append(tdDate);
            tr.append(tdTime);

            tbody.append(tr);
        }
        showModal(table, "Record");
    });
}); 