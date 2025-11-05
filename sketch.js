// 盤面
let board;
// 各穴とゴール
let p1Pits = [0, 1, 2, 3, 4, 5];
let p1Goal = 6;
let p2Pits = [7, 8, 9, 10, 11, 12];
let p2Goal = 13;

let pitSize;
let offsetX;
let offsetY;
let pitPositions = [];

function setup(){
    createCanvas(windowWidth, windowHeight);

    // 各穴に4つずつ種を配置して、ゴールは0個にする
    board = Array(14).fill(4);
    board[p1Goal] = 0;
    board[p2Goal] = 0;

    CalculateLayout();
    noLoop();
}

function draw(){
    background(200, 180, 150);
    translate(offsetX, offsetY);

    // ゴールの描画
    DrawPit(pitPositions[p2Goal], board[p2Goal], "P2 Goal");
    DrawPit(pitPositions[p1Goal], board[p1Goal], "P1 Goal");

    // 各穴の描画
    for(let i = 0; i < 6; i++){
        DrawPit(pitPositions[p2Pits[i]], board[p2Pits[i]], "P2");
        DrawPit(pitPositions[p1Pits[i]], board[p1Pits[i]], "P1");
    }
}

function mousePressed(){
    let clickX = mouseX - offsetX;
    let clickY = mouseY - offsetY;

    for(let i = 0; i < 14; i++){
        // ゴール内をクリックしていた時は何もしない
        if(i === p1Goal || i === p2Goal)
            continue;

        let pos = pitPositions[i];
        let d = dist(clickX, clickY, pos.x, pos.y);

        if(d < pos.size / 2){
            HandleMove(i);
            return;
        }
    }
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
    CalculateLayout();
    redraw();
}

function CalculateLayout(){
    let unitWidth = width / 8.5;
    let unitHeight = height / 3.0;

    pitSize = min(unitWidth, unitHeight);

    let boardWidth = pitSize * 8;
    let boardHeight = pitSize * 2.5;

    offsetX = (width - boardWidth) / 2;
    offsetY = (height - boardHeight) / 2;

    pitPositions = [];

    pitPositions[p1Goal] = { x: pitSize * 7.5, y: pitSize * 1.25, size: pitSize, isGoal: true};
    pitPositions[p2Goal] = { x: pitSize * 0.5, y: pitSize * 1.25, size: pitSize, isGoal: true};

    for(let i = 0; i < 6; i++){
        let p1_x = pitSize * (i + 1.5);
        pitPositions[p1Pits[i]] = { x: p1_x, y: pitSize * 2, size: pitSize, isGoal: false};

        let p2_x = pitSize * (6.5 - i);
        pitPositions[p2Pits[i]] = { x: p2_x, y: pitSize * 0.5, size: pitSize, isGoal: false};
    }
}

function DrawPit(pos, seedCount){
    let size = pos.size;

    let w = size;
    let h = pos.isGoal ? size * 2 : size;

    fill(160, 140, 120);
    stroke(100, 80, 70);
    strokeWeight(4);
    ellipse(pos.x, pos.y, w, h);

    DrawSeeds(pos.x, pos.y, w, h, seedCount);

    fill(255);
    stroke(0);
    textAlign(CENTER, CENTER);
    textSize(size * 0.3);
    text(seedCount, pos.x, pos.y);
}

function DrawSeeds(x, y, w, h, count){
    randomSeed(x + y);

    for(let i = 0; i < count; i++){
        let r = random(0.9);
        let angle = random(TWO_PI);

        let seedX = x + (cos(angle) * w * 0.35 * r);
        let seedY = y + (sin(angle) * h * 0.35 * r);

        let colors = [color(255, 100, 100), color(100, 255, 100), color(100, 100, 255), color(255, 255, 100)];
        fill(colors[i % colors.length]);
        noStroke();
        ellipse(seedX, seedY, w * 0.15, w * 0.15);
    }
}

// とりあえず次の穴に全ての種を動かす仮実装
function HandleMove(clickedIndex){
    let seedsToMove = board[clickedIndex];
    board[clickedIndex] = 0;

    let nextIndex = (clickedIndex + 1) % 14;
    board[nextIndex] += seedsToMove;

    redraw();
}