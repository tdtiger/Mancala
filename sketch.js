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

let gameState = "MENU";
let menuButtons = [];

// ルール名と使用する関数をまとめたもの
const rules_basic = {
    name: "ベーシック",
    HandleMove: HandleMove_Basic,
    CheckGameEnd: CheckGameEnd_Basic,
    HandleScoring: HandleScoring_Basic
}

const rules_karah = {
    name: "カラハ",
    HandleMove: HandleMove_Kalah,
    CheckGameEnd: CheckGameEnd_Basic,
    HandleScoring: HandleScoring_Karah
}

const PVP = "Player_vs_Player";
const PVC = "Player_vs_Computer";
let currentMode;
let currentPlayer;
let currentRule;

// 初期化用
function setup(){
    createCanvas(windowWidth, windowHeight);
    DrawMenu();
    noLoop();
}

// 状態に応じて画面を描画する
function draw(){
    if(gameState === "MENU"){
        background(200, 180, 150);
        textAlign(CENTER, CENTER);
        fill(255);
        stroke(0);
        textSize(40);
        text("マンカラ", width / 2, height / 2 - 150);
    }
    else if(gameState === "PLAYING"){
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

        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(18);
        let boardCenter = (pitSize * 8) / 2;
    
        if(currentPlayer === 1)
            text("プレイヤー1のターン", boardCenter, -pitSize / 2);
        else{
            if(currentMode === PVC)
                text("CPUのターン", boardCenter, -pitSize / 2);
            else if(currentMode === PVP)
                text("プレイヤー2のターン", boardCenter, -pitSize / 2);
        }
    }
}

// マウスクリック時の挙動
function mousePressed(){
    if(gameState !== "PLAYING" || currentRule.CheckGameEnd())
            return;

    // クリックされた位置を計算
    let clickX = mouseX - offsetX;
    let clickY = mouseY - offsetY;

    // プレイヤーの手番でなければ無視
    let canClick = false;
    if(currentPlayer === 1)
        canClick = true;
    else if(currentPlayer === 2 && currentMode === PVP)
        canClick = true;

    if(!canClick)
        return;

    for(let i = 0; i < 14; i++){
        // ゴール内をクリックしていた時は何もしない
        if(i === p1Goal || i === p2Goal)
            continue;

        let pos = pitPositions[i];
        let d = dist(clickX, clickY, pos.x, pos.y);

        let turnChange = true;
        if(d < pos.size / 2){
            // クリックされた穴が現在のプレイヤーの穴であるかを確認し、ルールに従って処理する
            if(currentPlayer === 1 && p1Pits.includes(i))
                turnChange = currentRule.HandleMove(i);
            else if(currentPlayer === 2 && p2Pits.includes(i))
                turnChange = currentRule.HandleMove(i);
            else
                return;

            // 画面を再描画
            redraw();
            if(turnChange){
                currentPlayer = (currentPlayer === 1) ? 2 : 1;
                if(currentPlayer === 2 && currentMode === PVC)  
                    CallAI();
            }

            if(currentRule.CheckGameEnd())
                currentRule.HandleScoring();

            return;
        }
    }
}

// ウィンドウのサイズが変更された時の処理
function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
    CalculateLayout();
    redraw();
}

// メニュー画面の描画
function DrawMenu(){
    // コンピュータ対戦モードのボタン
    let btn_pvc = createButton("ベーシック(vs CPU)");
    btn_pvc.position(width / 2 - 100, height / 2 - 40);
    btn_pvc.size(200, 40);
    btn_pvc.mousePressed(() => {
        setTimeout(() => StartGame(rules_basic, PVC), 0.1);
    });
    menuButtons.push(btn_pvc);

    // 2人対戦モードのボタン
    let btn_pvp = createButton("ベーシック(2人プレイ)");
    btn_pvp.position(width / 2 - 100, height / 2 + 20);
    btn_pvp.size(200, 40);
    btn_pvp.mousePressed(() => {
        setTimeout(() => StartGame(rules_basic, PVP), 0.1);
    });
    menuButtons.push(btn_pvp);

    // コンピュータ対戦モードのボタン（カラハ）
    let btn_karah_pvc = createButton("カラハ(vs CPU)");
    btn_karah_pvc.position(width / 2 - 100, height / 2 + 80);
    btn_karah_pvc.size(200, 40);
    btn_karah_pvc.mousePressed(() => {
        setTimeout(() => StartGame(rules_karah, PVC), 0.1);
    });
    menuButtons.push(btn_karah_pvc);

    // 2人対戦モードのボタン（カラハ）
    let btn_karah_pvp = createButton("カラハ(2人プレイ)");
    btn_karah_pvp.position(width / 2 - 100, height / 2 + 140);
    btn_karah_pvp.size(200, 40);
    btn_karah_pvp.mousePressed(() => {
        setTimeout(() => StartGame(rules_karah, PVP), 0.1);
    });
    menuButtons.push(btn_karah_pvp);
}

// ゲーム開始時の処理
function StartGame(rule, mode){
    // 画面上のボタンを消す
    for(let btn of menuButtons)
            btn.hide();

    currentRule = rule;
    currentMode = mode;

    // 盤面の初期化
    board = Array(14).fill(4);
    board[p1Goal] = 0;
    board[p2Goal] = 0;
    currentPlayer = 1;

    CalculateLayout();

    gameState = "PLAYING";

    redraw();
}

// 盤面のレイアウトを計算する
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

// 穴の描画
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

// 穴の中に種を散らすように描画
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

// 通常モードの手番処理
function HandleMove_Basic(clickedIndex){
    if(board[clickedIndex] === 0){
        redraw();
        return;
    }

    // 選択されたマスの種の数を取得し、0にする
    let seedsToMove = board[clickedIndex];
    board[clickedIndex] = 0;

    let currentIndex = clickedIndex;
    let lastIndex = -1;

    // 種を1つずつ次のマスに入れていく
    while(seedsToMove > 0){
        currentIndex = (currentIndex + 1) % 14;

        board[currentIndex] += 1;
        seedsToMove -= 1;

        if(seedsToMove === 0)
            lastIndex = currentIndex;
    }

    let turnChange = true;
    if(lastIndex === p1Goal || lastIndex === p2Goal)
        turnChange = false;

    return turnChange;
}

// カラハモードの手番処理
function HandleMove_Kalah(clickedIndex){
    if(board[clickedIndex] === 0){
        redraw();
        return;
    }

    // 選択されたマスの種の数を取得し、0にする
    let seedsToMove = board[clickedIndex];
    board[clickedIndex] = 0;

    let currentIndex = clickedIndex;
    let lastIndex = -1;

    // 種を1つずつ次のマスに入れていく
    while(seedsToMove > 0){
        currentIndex = (currentIndex + 1) % 14;

        board[currentIndex] += 1;
        seedsToMove -= 1;

        if(seedsToMove === 0)
            lastIndex = currentIndex;
    }

    let turnChange = true;
    if(lastIndex === p1Goal || lastIndex === p2Goal)
        turnChange = false;

    // 最後の種が自分の空の穴に入った場合、相手の反対側の穴の種を自分のゴールに移動する
    if(turnChange){
        let isCapture = false;
        if(currentPlayer === 1 && p1Pits.includes(lastIndex) && board[lastIndex] === 1)
            isCapture = true;
        else if(currentPlayer === 2 && p2Pits.includes(lastIndex) && board[lastIndex] === 1)
            isCapture = true;

        if(isCapture){
            let oppositeIndex = 12 - currentIndex;
            if(board[oppositeIndex] > 0){
                capturedSeeds = board[oppositeIndex] + board[lastIndex];

                if(currentPlayer === 1)
                    board[p1Goal] += capturedSeeds;
                else
                    board[p2Goal] += capturedSeeds;

                board[oppositeIndex] = 0;
                board[lastIndex] = 0;
            }
        }
    }
    return turnChange;
}

function CallAI(){
    setTimeout(() =>{
        let possible = [];
        for(let i = 0; i < p2Pits.length; i++){
            if(board[p2Pits[i]] > 0)
                possible.push(p2Pits[i]);
        }

        // とりあえず適当に一個選ぶだけ
        let aiMove = random(possible);
        let turnChange = currentRule.HandleMove(aiMove);

        if(turnChange)
            currentPlayer = 1;
        else
            CallAI();
        
        if(currentRule.CheckGameEnd())
            currentRule.HandleScoring();
        else
            redraw();
    }, 500);
}

// ゲーム終了の判定（通常モードとカラハモードで共通）
function CheckGameEnd_Basic(){
    let p1PitsEmpty = true;
    for(let i = 0; i < p1Pits.length; i++){
        if(board[p1Pits[i]] > 0){
            p1PitsEmpty = false;
            break;
        }
    }
    let p2PitsEmpty = true;
    for(let i = 0; i < p2Pits.length; i++){
        if(board[p2Pits[i]] > 0){
            p2PitsEmpty = false;
            break;
        }
    }

    return p1PitsEmpty || p2PitsEmpty;
}

// ゲーム終了時のスコア処理（通常モード）
function HandleScoring_Basic(){
    redraw();

    if(currentMode === PVC && currentPlayer === 1)
        window.alert("ゲーム終了！\nあなたの勝ち!");
    else if(currentMode === PVC && currentPlayer === 2)
        window.alert("ゲーム終了！\nCPUの勝ち!");
    else if(currentMode === PVP){
        if(currentPlayer === 1)
            window.alert("ゲーム終了！\nプレイヤー1の勝ち!");
        else
            window.alert("ゲーム終了！\nプレイヤー2の勝ち!");
    }
}

// ゲーム終了時のスコア処理（カラハモード）
function HandleScoring_Karah(){
    // 残っている種を各プレイヤーのゴールに移動する
    let p1Score = 0, p2Score = 0;
    for(let i = 0; i < p1Pits.length; i++){
        p1Score += board[p1Pits[i]];
        board[p1Pits[i]] = 0;
        p2Score += board[p2Pits[i]];
        board[p2Pits[i]] = 0;
    }
    p1Score += board[p1Goal];
    p2Score += board[p2Goal];

    // 再描画
    redraw();

    if(currentMode === PVC){
        if(p1Score > p2Score)
            window.alert(`あなたの勝ち!\n\nあなた: ${p1Score} - CPU: ${p2Score}`);
        else if(p2Score > p1Score)
            window.alert(`CPUの勝ち!\n\nあなた: ${p1Score} - CPU: ${p2Score}`);
        else
            window.alert(`引き分け!\n\nあなた: ${p1Score} - CPU: ${p2Score}`);
    }
    else if(currentMode === PVP){
        if(p1Score > p2Score)
            window.alert(`プレイヤー1の勝ち!\n\nプレイヤー1: ${p1Score} - プレイヤー2: ${p2Score}`);
        else if(p2Score > p1Score)
            window.alert(`プレイヤー2の勝ち!\n\nプレイヤー1: ${p1Score} - プレイヤー2: ${p2Score}`);
        else
            window.alert(`引き分け!\n\nプレイヤー1: ${p1Score} - プレイヤー2: ${p2Score}`);
    }
}