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
onValue(ref(db, "remote/roll"), (snapshot) => {

    const val = snapshot.val();
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
// 地圖資料
// -------------------------------


const spaces = [

{ icon:"🎨", type:"gift",   x:80,   y:80 },
{ icon:"😂", type:"fun",    x:280,  y:80 },
{ icon:"💍", type:"love",   x:480,  y:80 },
{ icon:"📸", type:"memory", x:680,  y:80 },
{ icon:"🎁", type:"gift",   x:880,  y:80 },
{ icon:"💕", type:"love",   x:1080, y:80 },
{ icon:"⭐", type:"star",   x:1280, y:80 },

{ icon:"😂", type:"fun",    x:1280, y:260 },

{ icon:"💍", type:"love",   x:1080, y:260 },
{ icon:"📸", type:"memory", x:880,  y:260 },
{ icon:"🎁", type:"gift",   x:680,  y:260 },
{ icon:"💕", type:"love",   x:480,  y:260 },
{ icon:"⭐", type:"star",   x:280,  y:260 },
{ icon:"😂", type:"fun",    x:80,   y:260 },

{ icon:"💍", type:"love",   x:80,   y:440 },

{ icon:"📸", type:"memory", x:280,  y:440 },
{ icon:"🎁", type:"gift",   x:480,  y:440 },
{ icon:"💕", type:"love",   x:680,  y:440 },
{ icon:"⭐", type:"star",   x:880,  y:440 },
{ icon:"😂", type:"fun",    x:1080, y:440 },
{ icon:"💍", type:"love",   x:1280, y:440 },

{ icon:"📸", type:"memory", x:1280, y:620 },

{ icon:"🎁", type:"gift",   x:1080, y:620 },
{ icon:"💕", type:"love",   x:880,  y:620 },
{ icon:"⭐", type:"star",   x:680,  y:620 },
{ icon:"😂", type:"fun",    x:480,  y:620 },
{ icon:"💍", type:"love",   x:280,  y:620 },
{ icon:"📸", type:"memory", x:80,   y:620 },

{ icon:"🎁", type:"gift",   x:80,   y:800 },
{ icon:"💕", type:"love",   x:280,  y:800 },

{ icon:"👑", type:"star",   x:480,  y:800 }

];


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

div.dataset.index=index;

div.style.left=space.x+"px";

div.style.top=space.y+"px";

div.innerHTML=space.icon;

board.appendChild(div);

});

}

// -------------------------------
// 畫道路
// -------------------------------

function drawRoads(){

roads.forEach(r=>{

const a=spaces[r[0]];

const b=spaces[r[1]];

const line=document.createElementNS(
"http://www.w3.org/2000/svg",
"path"
);

line.setAttribute(
"d",
`M ${a.x+41} ${a.y+41}
L ${b.x+41} ${b.y+41}`
);

roadLayer.appendChild(line);

});

}

// -------------------------------
// 放置棋子
// -------------------------------

function placePieces(){

teams.forEach((team,index)=>{

const piece=document.getElementById("piece"+index);

const p=spaces[team.position];

piece.style.left=(p.x+26+(index%2)*10)+"px";

piece.style.top=(p.y+26+Math.floor(index/2)*10)+"px";

});

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

moveStep(team.position,target,()=>{

team.position=target;

placePieces();

showQuestion();

checkWinner();

moving=false;

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
function fitBoard(){

const container=document.getElementById("boardContainer");

const rightPanel=document.getElementById("rightPanel");

const topBar=95;

const padding=30;

const availableWidth=

window.innerWidth-rightPanel.offsetWidth-padding;

const availableHeight=

window.innerHeight-topBar-padding;

const scale=Math.min(

availableWidth/1450,

availableHeight/980,

1

);

container.style.transform=

`scale(${scale})`;

}

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
fitBoard();

window.addEventListener("resize",fitBoard);

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

