let board;
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

    board = Array(14).fill(4);
    board[p1Goal] = 0;
    board[p2Goal] = 0;
}

function draw(){
    background(200, 180, 150);
}