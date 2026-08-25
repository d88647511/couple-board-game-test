import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
const firebaseConfig = {
  apiKey: "AIzaSyBg-YvvfUNvJNDYlzyd2bA0MuWXotvz5sg",
  authDomain: "couple-board-game.firebaseapp.com",
  databaseURL: "https://couple-board-game-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "couple-board-game",
  storageBucket: "couple-board-game.firebasestorage.app",
  messagingSenderId: "133501507868",
  appId: "1:133501507868:web:17396fe377a37fe83302d9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const applauseSound = new Audio("Applause.mp3");

function playConfetti() {

    const myConfetti = confetti.create(null, {
        resize: true,
        useWorker: true
    });

    myConfetti({
        particleCount: 180,
        spread: 120,
        origin: { y: 0.6 },
        zIndex: 99999
    });

}
console.log("✅ Firebase Ready");
// 監聽手機是否要求擲骰
let lastRollTimestamp = 0;
let isFirstRollLoad = true;
onValue(ref(db, "remote/roll"), (snapshot) => {

    const val = snapshot.val();
    if (isFirstRollLoad) {
        // 忽略首次載入的現有值，避免自動觸發擲骰
        if (typeof val === "number") {
            lastRollTimestamp = val;
        }
        isFirstLoad = false;
        return;
    }
    if (typeof val === "number" && val > lastRollTimestamp) {
        lastRollTimestamp = val;
        console.log("📱 手機要求擲骰:", val);
        document.getElementById("rollBtn").click();
    }

});
onValue(ref(db, "host/start"), (snapshot) => {

    if (snapshot.val() === true) {

        document.getElementById("startAnswerBtn").click();

    }

});
onValue(ref(db, "host/score1"), (snapshot) => {

    if (snapshot.val() === true) {

        document.getElementById("correctBtn").click();

    }

});
onValue(ref(db, "host/score2"), (snapshot) => {

    if (snapshot.val() === true) {

        document.getElementById("excellentBtn").click();

    }

});
onValue(ref(db, "host/close"), (snapshot) => {

    if (snapshot.val() === true) {

        document.getElementById("closeQuestionBtn").click();

    }

});
onValue(ref(db, "host/next"), (snapshot) => {

    if (snapshot.val() === true) {

        document.getElementById("nextBtn").click();

    }

});
onValue(ref(db, "host/undo"), (snapshot) => {

    if (snapshot.val() === true) {

        document.getElementById("undoBtn").click();

    }

});
onValue(ref(db, "host/winner"), (snapshot) => {

    if (snapshot.val() === true) {

        document.getElementById("winnerBtn").click();

    }

});
onValue(ref(db, "host/cheer"), (snapshot) => {

    if (snapshot.val() === true) {

        applauseSound.currentTime = 0;
        applauseSound.play();

        playConfetti();

    }

});
// ===============================
// 夫妻人生旅程 Wedding Edition
// script.js (Part 1)
// ===============================

// -------------------------------
// 地圖資料（大型 S 型蜿蜒地圖）
// -------------------------------

const BOARD_W = 2400;
const BOARD_H = 1650;

// 沿折線做等距取樣：產生 count 個均勻分布在路徑上的座標
function samplePath(anchors, count) {

    const pts = [anchors[0]];

    let total = 0;

    for (let i = 1; i < anchors.length; i++) {

        total += Math.hypot(
            anchors[i].x - anchors[i-1].x,
            anchors[i].y - anchors[i-1].y
        );

    }

    const step = total / (count - 1);

    let acc = 0;

    for (let i = 1; i < anchors.length; i++) {

        const a = anchors[i-1];

        const b = anchors[i];

        const len = Math.hypot(b.x-a.x, b.y-a.y);

        while (acc + len >= step * pts.length && pts.length < count) {

            const t = (step * pts.length - acc) / len;

            pts.push({
                x: a.x + (b.x-a.x)*t,
                y: a.y + (b.y-a.y)*t
            });

        }

        acc += len;

    }

    while (pts.length < count) pts.push({...anchors[anchors.length-1]});

    return pts;

}

// S 型蜿蜒路徑錨點（起點左上 → 終點右下）
const sAnchors = [

    { x: 220,  y: 260  },

    { x: 850,  y: 150  },

    { x: 1550, y: 200  },

    { x: 2120, y: 380  },

    { x: 2260, y: 700  },

    { x: 1980, y: 950  },

    { x: 1350, y: 1030 },

    { x: 700,  y: 980  },

    { x: 330,  y: 1180 },

    { x: 480,  y: 1440 },

    { x: 1150, y: 1540 },

    { x: 1850, y: 1470 },

    { x: 2220, y: 1300 }

];

const sPoints = samplePath(sAnchors, 31);

// 格子資料：icon/type/順序完全不變，座標改由 S 型路徑產生
const spaceDefs = [
    ["🎨","gift"],["😂","fun"],["💍","love"],["📸","memory"],
    ["🎁","gift"],["💕","love"],["⭐","star"],
    ["😂","fun"],
    ["💍","love"],["📸","memory"],["🎁","gift"],["💕","love"],
    ["⭐","star"],["😂","fun"],
    ["💍","love"],
    ["📸","memory"],["🎁","gift"],["💕","love"],["⭐","star"],
    ["😂","fun"],["💍","love"],
    ["📸","memory"],
    ["🎁","gift"],["💕","love"],["⭐","star"],["😂","fun"],
    ["💍","love"],["📸","memory"],
    ["🎁","gift"],["💕","love"],
    ["👑","star"]
];

const spaces = spaceDefs.map(([icon,type],i)=>({
    icon, type,
    x: Math.round(sPoints[i].x - 41),
    y: Math.round(sPoints[i].y - 41)
}));


// -------------------------------
// 道路
// -------------------------------

const roads = [

[0,1],
[1,2],
[2,3],
[3,4],
[4,5],
[5,6],
[6,7],
[7,8],
[8,9],
[9,10],
[10,11],
[11,12],
[12,13],
[13,14],
[14,15],
[15,16],
[16,17],
[17,18],
[18,19],
[19,20],
[20,21],
[21,22],
[22,23],
[23,24],
[24,25],
[25,26],
[26,27],
[27,28],
[28,29],
[29,30]

];

// -------------------------------
// 遊戲資料
// -------------------------------

const teams = [

{
name:"第一隊",
position:0,
score:0
},

{
name:"第二隊",
position:0,
score:0
},

{
name:"第三隊",
position:0,
score:0
},

{
name:"第四隊",
position:0,
score:0
},

{
name:"第五隊",
position:0,
score:0
}

];

let currentTeam = 0;

const board = document.getElementById("board");

const roadLayer = document.getElementById("roadLayer");

// -------------------------------
// 建立格子
// -------------------------------

function buildBoard(){

spaces.forEach((space,index)=>{

const div=document.createElement("div");

div.className="space "+space.type;

if(index===0) div.classList.add("start");

if(index===spaces.length-1) div.classList.add("goal");

div.dataset.index=index;

div.style.left=space.x+"px";

div.style.top=space.y+"px";

div.innerHTML=space.icon;

board.appendChild(div);

});

}

// -------------------------------
// 畫道路（平滑 S 型曲線）
// -------------------------------

function drawRoads(){

const pts = spaces.map(s=>({x:s.x+41, y:s.y+41}));

let d = `M ${pts[0].x} ${pts[0].y}`;

for(let i=0;i<pts.length-1;i++){

    const p0=pts[Math.max(i-1,0)];

    const p1=pts[i];

    const p2=pts[i+1];

    const p3=pts[Math.min(i+2,pts.length-1)];

    const c1x=p1.x+(p2.x-p0.x)/6, c1y=p1.y+(p2.y-p0.y)/6;

    const c2x=p2.x-(p3.x-p1.x)/6, c2y=p2.y-(p3.y-p1.y)/6;

    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;

}

const line=document.createElementNS(
"http://www.w3.org/2000/svg",
"path"
);

line.setAttribute("d", d);

roadLayer.appendChild(line);

}

// -------------------------------
// 放置棋子
// -------------------------------

function placePieces() {
    // 先按位置分組
    const posGroups = {};
    teams.forEach((team, index) => {
        const pos = team.position;
        if (!posGroups[pos]) posGroups[pos] = [];
        posGroups[pos].push(index);
    });

    // 為每個位置的棋子計算偏移並定位
    Object.values(posGroups).forEach(indices => {
        const count = indices.length;
        const baseIdx = indices[0];
        const p = spaces[teams[baseIdx].position];

        // 計算每個棋子的視覺偏移
        indices.forEach((idx, i) => {
            const piece = document.getElementById("piece" + idx);
            const { dx, dy } = getPieceOffset(count, i);
            piece.style.left = (p.x + 26 + dx) + "px";
            piece.style.top = (p.y + 26 + dy) + "px";
        });
    });
}

function getPieceOffset(count, i) {
    const spacing = 18; // 基礎間距
    const radius = 14;  // 排列半徑

    if (count === 1) {
        return { dx: 0, dy: 0 };
    }
    if (count === 2) {
        // 左右排列
        return { dx: (i === 0 ? -spacing/2 : spacing/2), dy: 0 };
    }
    if (count === 3) {
        // 三角形排列
        const angles = [-Math.PI/2, Math.PI/6, 5*Math.PI/6];
        return { dx: Math.cos(angles[i]) * radius, dy: Math.sin(angles[i]) * radius };
    }
    if (count === 4) {
        // 2x2 方陣
        const row = Math.floor(i / 2);
        const col = i % 2;
        return {
            dx: (col - 0.5) * spacing,
            dy: (row - 0.5) * spacing
        };
    }
    // 5人以上：圓形均勻分佈
    const angle = (i / count) * 2 * Math.PI - Math.PI/2;
    return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius };
}

// -------------------------------
// 更新隊名
// -------------------------------

function updateNames(){

for(let i=0;i<5;i++){

teams[i].name=document.getElementById("team"+i).value;

document.getElementById("scoreName"+i).textContent=teams[i].name;

}

document.getElementById("currentTeam").textContent=
teams[currentTeam].name;

}

// -------------------------------
// 更新目前隊伍
// -------------------------------

function updateTurn(){

document.getElementById("currentTeam").textContent=
teams[currentTeam].name;

}
// -------------------------------
// 題庫（之後會改成 questions.json）
// -------------------------------



// -------------------------------
// 骰子
// -------------------------------

const dice=document.getElementById("dice");

const rollBtn=document.getElementById("rollBtn");
const bgm=document.getElementById("bgm");
let resumeBgm = false;
const heartSound = new Audio("heart.mp3");
const endSound = new Audio("end.mp3");

endSound.volume = 1.0;

heartSound.loop = true;
heartSound.volume = 0.8;

const diceSound = new Audio("dice.mp3");

diceSound.volume = 0.8;

const winnerSound = new Audio("winner.mp3");

winnerSound.volume = 1.0;

const musicBtn=document.getElementById("musicBtn");

const questionBox=document.getElementById("questionBox");
const questionOverlay=document.getElementById("questionOverlay");

const overlayQuestion=document.getElementById("overlayQuestion");

const startAnswerBtn=document.getElementById("startAnswerBtn");

const closeQuestionBtn=document.getElementById("closeQuestionBtn");

const correctBtn=document.getElementById("correctBtn");

const excellentBtn=document.getElementById("excellentBtn");

let moving=false;
let history = [];
const usedQuestions = {};

function getRandomQuestion(type){

    if(!usedQuestions[type]){
        usedQuestions[type] = [];
    }

    const allQuestions = questions[type];

    if(usedQuestions[type].length >= allQuestions.length){
        usedQuestions[type] = [];
    }

    const available = allQuestions.filter(
        q => !usedQuestions[type].includes(q)
    );

    const q = available[
        Math.floor(Math.random()*available.length)
    ];

    usedQuestions[type].push(q);

    return q;
}

// -------------------------------
// 擲骰
// -------------------------------

rollBtn.addEventListener("click",()=>{

if(moving) return;

updateNames();
history.push({

    currentTeam,

    dice: dice.textContent,

    teams: JSON.parse(JSON.stringify(teams))

});
moving=true;
diceSound.pause();
diceSound.currentTime = 0;
diceSound.play();
dice.classList.add("rolling");

let value=1;

const timer=setInterval(()=>{

value=Math.floor(Math.random()*6)+1;

dice.textContent=value;

},70);

setTimeout(()=>{

clearInterval(timer);

value=Math.floor(Math.random()*6)+1;

dice.textContent=value;

dice.classList.remove("rolling");

movePiece(value);

},700);

});

// -------------------------------
// 棋子移動
// -------------------------------

function movePiece(step){

const team=teams[currentTeam];

let target=team.position+step;

if(target>=spaces.length){

target=spaces.length-1;

}

moveStep(team.position,target,()=>{

team.position=target;



showQuestion();

placePieces();

moving=false;

});

}

// -------------------------------
// 一格一格移動
// -------------------------------

function moveStep(now,target,finish){

if(now>=target){

finish();

return;

}

const piece=document.getElementById("piece"+currentTeam);

const next=spaces[now+1];

piece.style.left=(next.x+26+(currentTeam%2)*10)+"px";

piece.style.top=(next.y+26+Math.floor(currentTeam/2)*10)+"px";
highlightCell(now + 1);

spotlightTeam(currentTeam);

piece.classList.remove("jump");

void piece.offsetWidth;

piece.classList.add("jump");

setTimeout(()=>{

moveStep(now+1,target,finish);

},430);

}

// -------------------------------
// 題目
// -------------------------------

function showQuestion(){
closeQuestionBtn.onclick=()=>{

questionOverlay.classList.remove("show");

};
closeQuestionBtn.onclick=()=>{

questionOverlay.classList.remove("show");

};

startAnswerBtn.onclick=()=>{

startCountdown();

};
startAnswerBtn.onclick=()=>{

questionOverlay.classList.remove("show");

startCountdown();

};
correctBtn.onclick=()=>{

addScore(currentTeam,1);

questionOverlay.classList.remove("show");

};
excellentBtn.onclick=()=>{

addScore(currentTeam,2);

questionOverlay.classList.remove("show");

};
const allQuestions = Object.values(questions).flat();

const team = teams[currentTeam];

const currentSpace = spaces[team.position];

const q = getRandomQuestion(currentSpace.type);

questionBox.textContent=q;

overlayQuestion.textContent=q;

questionOverlay.classList.add("show");

}

// -------------------------------
// 下一隊
// -------------------------------

document

.getElementById("nextBtn")

.addEventListener("click",()=>{

currentTeam++;

if(currentTeam>=teams.length){

currentTeam=0;

}

updateTurn();

viewport.classList.add("follow-cam");

spotlightTeam(currentTeam);

setTimeout(()=>{
    viewport.classList.remove("follow-cam");
},900);

});

// -------------------------------
// 加分
// -------------------------------

function addScore(index,point=1){

    teams[index].score += point;

    // 原本計分板
    document.getElementById("score"+index).textContent =
        teams[index].score;

    // 隊伍設定右側分數
    document.getElementById("teamScore"+index).textContent =
        teams[index].score;

}
// -------------------------------
// 10 秒倒數
// -------------------------------

const overlay=document.getElementById("countdownOverlay");
const countdownNumber=document.getElementById("countdownNumber");

document
.getElementById("countdownBtn")
.addEventListener("click",startCountdown);

function startCountdown(){
    resumeBgm = !bgm.paused;

if (resumeBgm) {
    bgm.pause();
}
heartSound.pause();
heartSound.currentTime = 0;
heartSound.play().catch(() => {});
let time=10;

overlay.classList.add("show");

countdownNumber.textContent=time;

const timer=setInterval(()=>{

time--;

if(time>0){

countdownNumber.textContent=time;

}else{

clearInterval(timer);
heartSound.pause();
heartSound.currentTime = 0;
endSound.currentTime = 0;

endSound.onended = () => {
    if (resumeBgm) {
        bgm.play().catch(() => {});
    }
};

endSound.play().catch(() => {});
countdownNumber.textContent="時間到！";

setTimeout(()=>{

overlay.classList.remove("show");

questionOverlay.classList.add("show");

},1200);

}

},1000);

}



// -------------------------------
// 是否到終點
// -------------------------------

function checkWinner(){

const team=teams[currentTeam];

if(team.position===spaces.length-1){

setTimeout(()=>{

alert(
"🏆 "+team.name+" 抵達終點！\n\n恭喜獲勝！"
);

},300);

}

}

// -------------------------------
// 覆寫 movePiece
// (加入終點判斷)
// -------------------------------

const originalMovePiece=movePiece;

movePiece=function(step){

const team=teams[currentTeam];

let target=team.position+step;

if(target>=spaces.length){

target=spaces.length-1;

}

viewport.classList.add("follow-cam");

moveStep(team.position,target,()=>{

team.position=target;

placePieces();

showQuestion();

checkWinner();

moving=false;

setTimeout(()=>{
    viewport.classList.remove("follow-cam");
},850);

});

};

// -------------------------------
// Enter 更新隊名
// -------------------------------

for(let i=0;i<5;i++){

document
.getElementById("team"+i)
.addEventListener("keyup",updateNames);

}
// -------------------------------
// 棋盤拖曳平移
// -------------------------------

const viewport=document.getElementById("boardViewport");
const boardContainerEl=document.getElementById("boardContainer");

let viewX=0, viewY=0;
let viewScale=1;

function clampView(){

const vw=viewport.clientWidth;
const vh=viewport.clientHeight;

const cw=BOARD_W*viewScale;
const ch=BOARD_H*viewScale;

if(cw<=vw){
    viewX=(vw-cw)/2;
}else{
    viewX=Math.max(vw-cw, Math.min(0, viewX));
}

if(ch<=vh){
    viewY=(vh-ch)/2;
}else{
    viewY=Math.max(vh-ch, Math.min(0, viewY));
}

}

function applyView(){
    boardContainerEl.style.transform=
        `translate(${viewX}px, ${viewY}px) scale(${viewScale})`;
}

// -------------------------------
// Spotlight：鏡頭平滑聚焦指定隊伍的娃娃
// -------------------------------

function spotlightTeam(index){

if(introPlaying){
    finishIntro();
}

const piece=document.getElementById("piece"+index);

if(!piece) return;

const px=parseFloat(piece.style.left)||0;
const py=parseFloat(piece.style.top)||0;

const cx=px+18;
const cy=py+24;

const vw=viewport.clientWidth;
const vh=viewport.clientHeight;

viewX=vw/2 - cx*viewScale;
viewY=vh/2 - cy*viewScale;

clampView();
applyView();

}

// -------------------------------
// 開場地圖鏡頭動畫
// -------------------------------

const INTRO_HOLD_MS=10000;
const INTRO_MOVE_MS=2600;

let introPlaying=false;
let introMoveTimer=null;

function cameraToFit(){

const vw=viewport.clientWidth;
const vh=viewport.clientHeight;

const s=Math.min(vw/BOARD_W, vh/BOARD_H)*0.95;

return {
    x:(vw-BOARD_W*s)/2,
    y:(vh-BOARD_H*s)/2,
    s:s
};

}

function cameraAtStart(){
    return {x:0, y:0, s:1};
}

function playIntro(){

introPlaying=true;

const fit=cameraToFit();

viewX=fit.x;
viewY=fit.y;
viewScale=fit.s;

viewport.classList.remove("intro-animating");

applyView();

void boardContainerEl.offsetWidth;

introMoveTimer=setTimeout(()=>{

    const t=cameraAtStart();

    viewport.classList.add("intro-animating");

    viewX=t.x;
    viewY=t.y;
    viewScale=t.s;

    applyView();

    introMoveTimer=setTimeout(finishIntro, INTRO_MOVE_MS+100);

}, INTRO_HOLD_MS);

}

function finishIntro(){

if(!introPlaying) return;

introPlaying=false;
clearTimeout(introMoveTimer);

viewport.classList.remove("intro-animating");

viewX=0;
viewY=0;
viewScale=1;

clampView();
applyView();

}

let panDragging=false;
let panPointerId=null;
let panStartX=0, panStartY=0;
let panBaseX=0, panBaseY=0;

viewport.addEventListener("pointerdown",e=>{

if(introPlaying){
    finishIntro();
}

viewport.classList.remove("follow-cam");

if(panDragging) return;

panDragging=true;
panPointerId=e.pointerId;
panStartX=e.clientX;
panStartY=e.clientY;
panBaseX=viewX;
panBaseY=viewY;

viewport.setPointerCapture(panPointerId);
viewport.classList.add("dragging");

e.preventDefault();

});

viewport.addEventListener("pointermove",e=>{

if(!panDragging || e.pointerId!==panPointerId) return;

viewX=panBaseX+(e.clientX-panStartX);
viewY=panBaseY+(e.clientY-panStartY);

clampView();
applyView();

e.preventDefault();

});

function panEnd(e){

if(!panDragging || (e.pointerId!==undefined && e.pointerId!==panPointerId)) return;

panDragging=false;
panPointerId=null;

viewport.classList.remove("dragging");

}

viewport.addEventListener("pointerup",panEnd);
viewport.addEventListener("pointercancel",panEnd);

viewport.addEventListener("dragstart",e=>e.preventDefault());

// -------------------------------
// 初始化
// -------------------------------

buildBoard();

drawRoads();

placePieces();

updateNames();

updateTurn();
teams.forEach((team,index)=>{

    document.getElementById("teamScore"+index).textContent =
        team.score;

});
playIntro();

window.addEventListener("resize",()=>{

if(introPlaying){
    clearTimeout(introMoveTimer);
    playIntro();
}else{
    clampView();
    applyView();
}

});

questionBox.textContent=
"🎲 點擊『擲骰』開始遊戲";

// -------------------------------
// Console
// -------------------------------

console.log(
"%c夫妻人生旅程 Wedding Edition",
"color:#ff4d88;font-size:20px;font-weight:bold;"
);

console.log(
"Board Ready."
);
// -------------------------------
// 背景音樂
// -------------------------------

bgm.volume=0.35;

let musicPlaying=false;

musicBtn.addEventListener("click",async()=>{

try{

if(!musicPlaying){

await bgm.play();

musicPlaying=true;

musicBtn.textContent="⏸ 暫停音樂";

}else{

bgm.pause();

musicPlaying=false;

musicBtn.textContent="🎵 播放音樂";

}

}catch(e){

console.log(e);

}

});

function highlightCell(index){

    document.querySelectorAll(".space").forEach(cell=>{
        cell.classList.remove("active");
    });

    document
        .querySelector(`.space[data-index="${index}"]`)
        ?.classList.add("active");
}
const winnerBtn=document.getElementById("winnerBtn");

const winnerOverlay=document.getElementById("winnerOverlay");

const winnerName=document.getElementById("winnerName");

const winnerScore=document.getElementById("winnerScore");

const closeWinner=document.getElementById("closeWinner");

function showWinner(){

    let winner=teams[0];

    teams.forEach(team=>{

        if(team.score>winner.score){

            winner=team;

        }

    });

    winnerName.textContent="🥇 "+winner.name;

    winnerScore.textContent=
    "總分："+winner.score+" 分";
    bgm.pause();
winnerSound.pause();
winnerSound.currentTime = 0;
winnerSound.play().catch(()=>{});
    winnerOverlay.classList.add("show");

}
const undoBtn = document.getElementById("undoBtn");

undoBtn.onclick = () => {

if (history.length === 0) {

    alert("已經沒有上一動了！");

    return;

}

const state = history.pop();

// 恢復目前隊伍
currentTeam = state.currentTeam;

// 恢復骰子
dice.textContent = state.dice;

    // 恢復隊伍資料
   state.teams.forEach((team,index)=>{
        teams[index].position = team.position;
        teams[index].score = team.score;
        teams[index].name = team.name;
    });

    // 更新棋子位置
    placePieces();

    // 更新目前隊伍
    updateTurn();

    // 更新計分板
    teams.forEach((team, index) => {

        document.getElementById("score" + index).textContent =
            team.score;

        const teamScore = document.getElementById("teamScore" + index);

        if (teamScore) {
            teamScore.textContent = team.score;
        }

    });

    // 關閉所有視窗
    questionOverlay.classList.remove("show");
    overlay.classList.remove("show");
    winnerOverlay.classList.remove("show");

    // 清除格子發光
    document.querySelectorAll(".space").forEach(cell => {
        cell.classList.remove("active");
    });

};
winnerBtn.onclick=showWinner;

closeWinner.onclick=()=>{

    winnerOverlay.classList.remove("show");

    if(musicPlaying){
        bgm.play().catch(()=>{});
    }

};

