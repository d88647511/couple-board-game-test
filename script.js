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
        isFirstRollLoad = false;
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
onValue(ref(db, "host/bgm"), (snapshot) => {

    if (snapshot.val() === true) {

        document.getElementById("musicBtn").click();

    }

});
onValue(ref(db, "host/roll"), (snapshot) => {

    if (snapshot.val() === true) {

        document.getElementById("rollBtn").click();

    }

});
onValue(ref(db, "host/rules"), (snapshot) => {

    if (snapshot.val() === true) {

        document.getElementById("rulesBtn").click();

    }

});
onValue(ref(db, "host/trialFail"), (snapshot) => {

    if (snapshot.val() === true) {

        showRepairVerse();

    }

});
onValue(ref(db, "host/repair"), (snapshot) => {

    if (snapshot.val() === true) {

        hideRepairVerse();

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

// ───────────────────────────────
// S 型婚姻旅程道路 Layout（圓形棋盤格）
// 5 列 × 6 站（0–29）蛇形蜿蜒向下，LOVE(30) 在最底部右端
// 所有站點與道路都必須完整落在「底層面板（#boardGround）」內，
// 四周保留合理空白。座標由面板幾何自適應算出。
// ───────────────────────────────
const PANEL_L = 60, PANEL_T = 60;          // 底層面板左上（#boardGround）
const PANEL_W = 2280, PANEL_H = 1530;      // 底層面板尺寸（固定世界邊界）
const PANEL_R = PANEL_L + PANEL_W;         // 2340
const PANEL_B = PANEL_T + PANEL_H;         // 1590

const CIRCLE_R = 105;                      // 普通圓形棋盤格半徑（直徑 210）
const BIG_R    = 120;                      // START / LOVE 半徑（直徑 240）
const S_MARGIN = 80;                       // 圓形格外緣距面板邊界的空白

const S_COLS = 6;                          // 每列站點數
const S_ROWS = 5;                          // 站點列數（5×6 = 30 站）
const HX = 330;                            // 水平中心間距（圓間保有道路空間）
const VY = 295;                            // 垂直中心間距

// 6 欄的 x：左緣留白 = S_MARGIN
const colX = (c) => PANEL_L + S_MARGIN + CIRCLE_R + c * HX;
// 5 列在面板內垂直置中
const rowsExtent = 5 * (CIRCLE_R*2) + 4 * (VY - CIRCLE_R*2);   // 圓直徑×5 + 4×圓間隙
const rowTopY = PANEL_T + (PANEL_H - rowsExtent) / 2 + CIRCLE_R;
const rowY = (r) => rowTopY + r * VY;

// 站點：0–29 蛇形，偶數列 左→右、奇數列 右→左；S 一路蜿蜒向下
const sPoints = Array.from({length:30},(_,i)=>{
    const r = Math.floor(i / S_COLS);
    const c0 = i % S_COLS;
    const c = (r % 2 === 0) ? c0 : (S_COLS - 1 - c0);
    return {
        x: Math.round(colX(c)),
        y: Math.round(rowY(r))
    };
});

// LOVE 終點：位於最後一站(29)右側，底部右端
const lastR = Math.floor(29 / S_COLS);                 // 4
const lastC = S_COLS - 1;                               // 5
sPoints.push({
    x: Math.round(colX(lastC) + BIG_R + CIRCLE_R + 10),
    y: Math.round(rowY(lastR))
});

// 格子資料：固定題目模式（index 0 = START, index 30 = GOAL）
const spaceDefs = [
    {index:0,  name:"START",     type:"start"},
    {index:1,  name:"甜蜜回憶",  type:"memory",  question:"第一次約會的地點是？"},
    {index:2,  name:"初次相遇",  type:"memory",  question:"你們第一次認識的時間或場合是什麼？"},
    {index:3,  name:"第一次約會", type:"memory",  question:"第一次約會做了什麼事情？"},
    {index:4,  name:"珍貴回憶",  type:"memory",  question:"交往後印象最深刻的一次旅行是哪一次？"},
    {index:5,  name:"遇見神",    type:"god",     blessing:true},
    {index:6,  name:"甜蜜約會",  type:"love",    question:"如果今晚可以約會，你最想去哪裡？"},
    {index:7,  name:"驚喜時刻",  type:"gift",    question:"老公最想收到的生日禮物是什麼（除了耶穌）？"},
    {index:8,  name:"彼此了解",  type:"love",    question:"老婆最喜歡的一件事情或興趣是什麼？"},
    {index:9,  name:"生活觀察",  type:"fun",     question:"老公的體重是多少？"},
    {index:10, name:"溝通練習",  type:"love",    question:"你覺得維持婚姻最重要的是什麼？"},
    {index:11, name:"婚姻試煉",  type:"trial",   trial:true},
    {index:12, name:"攜手同行",  type:"love",    question:"你最欣賞另一半的一個特質是什麼？"},
    {index:13, name:"金錢觀念",  type:"love",    question:"你們理想中的家庭財務規劃是什麼？"},
    {index:14, name:"家庭藍圖",  type:"love",    question:"未來想在哪個城市生活或退休？"},
    {index:15, name:"遇見神",    type:"god",     blessing:true},
    {index:16, name:"珍惜彼此",  type:"gift",    question:"老婆最想收到的生日禮物是什麼（除了耶穌）？"},
    {index:17, name:"旅行冒險",  type:"memory",  question:"最想一起去完成的一趟旅行是哪裡？"},
    {index:18, name:"共同目標",  type:"love",    question:"你們未來最想一起完成的一件事情是什麼？"},
    {index:19, name:"婚姻試煉",  type:"trial",   trial:true},
    {index:20, name:"未來計畫",  type:"love",    question:"要在台灣的哪個城市退休？"},
    {index:21, name:"家庭夢想",  type:"love",    question:"你認為給孩子最好的禮物是什麼（除了耶穌）？"},
    {index:22, name:"幸福累積",  type:"gift",    question:"兩人同時寫下對方最喜歡的一道料理（先寫自己的，再猜對方的），看答案是否一致。"},
    {index:23, name:"遇見神",    type:"god",     blessing:true},
    {index:24, name:"婚姻試煉",  type:"trial",   trial:true},
    {index:25, name:"永恆回憶",  type:"memory",  question:"一人用一句話形容另一半，另一半猜猜自己被形容的是什麼。"},
    {index:26, name:"婚姻試煉",  type:"trial",   trial:true},
    {index:27, name:"遇見神",    type:"god",     blessing:true},
    {index:28, name:"婚姻試煉",  type:"trial",   trial:true},
    {index:29, name:"遇見神",    type:"god",     blessing:true},
    {index:30, name:"LOVE 終點", type:"goal"}
];

const spaces = spaceDefs.map((def,i)=>({
    type: def.type,
    question: def.question,
    trial: def.trial,
    blessing: def.blessing,
    name: def.name,
    x: Math.round(sPoints[i].x - 41),
    y: Math.round(sPoints[i].y - 41)
}));


// -------------------------------
// 婚姻試煉共用題庫（踩到 trial 格時隨機抽一題）
// -------------------------------

const trialQuestions = [
    "請共同從兩邊一起吃巧克力棒，中途不能斷掉",
    "老公喝水說出提示詞，老婆必須猜出來",
    "兩人共同五連拍，姿勢不可重複",
    "老婆公主抱老公3秒",
    "兩人閉眼睛站在一起，一人出一隻手比一個大愛心，10秒內成功",
    "兩人背靠背手臂互勾，合作完成3次起立坐下，過程中不能放開手"
];

const godQuestions = [
    "分享一件你覺得神帶領你們相遇的事情",
    "分享另一半身上一個讓你感受到神愛的地方",
    "回想婚姻旅程中一件值得感恩的事情",
    "請為另一半祝福禱告一句話",
    "一起說出對未來家庭的祝福與盼望"
];

// -------------------------------
// 婚姻修復經文庫
// -------------------------------

const repairVerses = [
    {text:"「若是跌倒，這人可以扶起他的同伴。」",ref:"傳道書 4:10"},
    {text:"「你們各人的重擔要互相擔當，如此，就完全了基督的律法。」",ref:"加拉太書 6:2"},
    {text:"「總要彼此包容，彼此饒恕。」",ref:"歌羅西書 3:13"},
    {text:"「用愛心互相寬容……竭力保守聖靈所賜合而為一的心。」",ref:"以弗所書 4:2–3"},
    {text:"「愛弟兄，要彼此親熱；恭敬人，要彼此推讓。」",ref:"羅馬書 12:10"}
];
let usedRepairVerses=[];

function pickRepairVerse(){
    const available=repairVerses.filter(v=>!usedRepairVerses.includes(v));
    if(available.length===0){ usedRepairVerses=[]; return pickRepairVerse(); }
    const v=available[Math.floor(Math.random()*available.length)];
    usedRepairVerses.push(v);
    return v;
}

function showRepairVerse(){
    // 關閉答題介面
    questionOverlay.classList.remove("show");

    // === 第一階段：烏雲動畫 ===
    const tfEl=document.getElementById("trialFailOverlay");
    const rvEl=document.getElementById("repairVerseOverlay");
    tfEl.classList.add("show");

    // 暫停 BGM，播放 trial-event 音效
    if(musicPlaying){ bgm.pause(); }
    playEventSound("trial");

    // 8 秒後進入第二階段
    setTimeout(()=>{
        // 第一階段結束
        stopEventSound("trial");
        tfEl.classList.remove("show");

        // === 第二階段：黃光經文 ===
        const v=pickRepairVerse();
        document.getElementById("rvVerse").textContent=v.text;
        document.getElementById("rvRef").textContent=v.ref;
        rvEl.classList.add("show");

        // 播放 god-event 音效
        playEventSound("god");
    },8000);
}

function hideRepairVerse(){
    // 關閉經文畫面
    const rvEl=document.getElementById("repairVerseOverlay");
    rvEl.classList.remove("show");

    // 關閉烏雲（以防第一階段還沒結束就被按）
    const tfEl=document.getElementById("trialFailOverlay");
    tfEl.classList.remove("show");

    // 停止所有特殊音效
    stopEventSound("god");
    stopEventSound("trial");

    // 關閉答題視窗（確保不會殘留）
    questionOverlay.classList.remove("show");

    // 恢復 BGM
    if(musicPlaying){ bgm.play().catch(()=>{}); }
}

// -------------------------------
// 特殊事件格已觸發追蹤（全域）
// -------------------------------

const usedEventSpaces=new Set();

// -------------------------------
// 祝福前導動畫（終點前強制遇見神用）
// -------------------------------

function showBlessingLead(){
    return new Promise(resolve=>{
        const el=document.getElementById("blessingLeadOverlay");
        el.classList.add("show");
        if(musicPlaying){ bgm.pause(); }
        setTimeout(()=>{ el.classList.remove("show"); resolve(); },4500);
    });
}

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
score:0,
journey:{hasMetGod:false,hasTrial:false,usedGodQuestions:[],usedTrialQuestions:[]}
},

{
name:"第二隊",
position:0,
score:0,
journey:{hasMetGod:false,hasTrial:false,usedGodQuestions:[],usedTrialQuestions:[]}
},

{
name:"第三隊",
position:0,
score:0,
journey:{hasMetGod:false,hasTrial:false,usedGodQuestions:[],usedTrialQuestions:[]}
},

{
name:"第四隊",
position:0,
score:0,
journey:{hasMetGod:false,hasTrial:false,usedGodQuestions:[],usedTrialQuestions:[]}
},

{
name:"第五隊",
position:0,
score:0,
journey:{hasMetGod:false,hasTrial:false,usedGodQuestions:[],usedTrialQuestions:[]}
}

];

let currentTeam = 0;

let activeTeamCount = 5;

const board = document.getElementById("board");

const roadLayer = document.getElementById("roadLayer");

// -------------------------------
// 建立格子
// -------------------------------

// 格子名稱（顯示在等角磚上，index 0 = START, index 30 = LOVE終點）
const SPACE_NAMES=[
"","甜蜜回憶","初次相遇","第一次約會","珍貴回憶","遇見神","甜蜜約會",
"驚喜時刻","彼此了解","生活觀察","溝通練習","婚姻試煉","攜手同行",
"金錢觀念","家庭藍圖","遇見神","珍惜彼此","旅行冒險","共同目標",
"婚姻試煉","未來計畫","家庭夢想","幸福累積","遇見神","婚姻試煉",
"永恆回憶","婚姻試煉","遇見神","婚姻試煉","遇見神",
""
];

// -------------------------------
// 2.5D Wedding Icon System（純 SVG，無 Emoji）
// 共用漸層定義一次，全部 icon 以 url(#id) 引用
// -------------------------------

const ICON_HEART="M24 40 C12.5 30.5 8.5 23.5 8.5 17.5 C8.5 11.7 13 7.5 18.4 7.5 C21.2 7.5 23 8.9 24 11 C25 8.9 26.8 7.5 29.6 7.5 C35 7.5 39.5 11.7 39.5 17.5 C39.5 23.5 35.5 30.5 24 40 Z";

const ICON_DEFS=`<svg id="iconDefs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="wgRose" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdcec"/><stop offset="1" stop-color="#ff70a6"/></linearGradient>
<linearGradient id="wgCoral" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3d4"/><stop offset="1" stop-color="#ff9878"/></linearGradient>
<linearGradient id="wgBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9f2ff"/><stop offset="1" stop-color="#66b8ec"/></linearGradient>
<linearGradient id="wgGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4c9"/><stop offset="1" stop-color="#ffc44d"/></linearGradient>
<linearGradient id="wgPeach" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffeede"/><stop offset="1" stop-color="#ffb066"/></linearGradient>
<linearGradient id="wgLav" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eee2ff"/><stop offset="1" stop-color="#b78af5"/></linearGradient>
<linearGradient id="wgCloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f5fa"/><stop offset="1" stop-color="#b3c0d4"/></linearGradient>
<linearGradient id="wgGod" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8e8"/><stop offset="1" stop-color="#f5d78e"/></linearGradient>
<linearGradient id="wgStorm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b7280"/><stop offset="1" stop-color="#2d3748"/></linearGradient>
</defs></svg>`;

const SPACE_ICONS={

1:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="13" ry="3" fill="rgba(120,60,90,.12)"/>
<g transform="translate(4.5 12) scale(.55) rotate(-10)"><path d="${ICON_HEART}" fill="#ffb99d"/></g>
<path d="${ICON_HEART}" fill="url(#wgRose)" stroke="rgba(216,78,134,.35)" stroke-width="1.5"/>
<path d="M15 14 C17.5 11.5 21 10.8 23.5 12.2" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".8"/></svg>`,

2:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="12" ry="3" fill="rgba(120,60,90,.12)"/>
<circle cx="24" cy="25" r="15" fill="#ffd0e4" stroke="rgba(216,78,134,.4)" stroke-width="2"/>
<circle cx="24" cy="25" r="9.5" fill="#ff9cc2"/>
<circle cx="24" cy="25" r="4.5" fill="#f2568f"/>
<ellipse cx="18.5" cy="17.5" rx="4.2" ry="2.6" fill="#fff" opacity=".75" transform="rotate(-32 18.5 17.5)"/></svg>`,

3:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="12" ry="3" fill="rgba(60,90,130,.12)"/>
<path d="${ICON_HEART}" fill="url(#wgBlue)" stroke="rgba(63,146,201,.45)" stroke-width="1.5"/>
<polyline points="24,10 20.5,17 26,22 21.5,29 25,36.5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".92"/></svg>`,

4:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="14" ry="3" fill="rgba(90,60,120,.12)"/>
<rect x="19" y="8.5" width="10" height="9" rx="3.5" fill="none" stroke="#a678e0" stroke-width="3"/>
<rect x="8" y="15" width="32" height="24" rx="5" fill="url(#wgLav)" stroke="rgba(143,92,214,.35)" stroke-width="1.5"/>
<rect x="15" y="15" width="4" height="24" fill="rgba(143,92,214,.28)"/>
<rect x="29" y="15" width="4" height="24" fill="rgba(143,92,214,.28)"/>
<rect x="21.5" y="23.5" width="5" height="6" rx="1.5" fill="#ffd76e" stroke="rgba(224,163,46,.6)"/>
<ellipse cx="16" cy="19.5" rx="5.5" ry="2.2" fill="#fff" opacity=".5"/></svg>`,

5:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="12" ry="3" fill="rgba(180,140,60,.15)"/>
<ellipse cx="24" cy="14" rx="6" ry="2.8" fill="#fff8e0" opacity=".6"/>
<circle cx="24" cy="23" r="11" fill="url(#wgGod)" stroke="rgba(210,170,80,.45)" stroke-width="1.8"/>
<circle cx="24" cy="23" r="7.5" fill="#fff8e8"/>
<circle cx="21.2" cy="21.5" r="1.2" fill="#7a5a2a"/><circle cx="26.8" cy="21.5" r="1.2" fill="#7a5a2a"/>
<path d="M21.5 25.5 Q24 28 26.5 25.5" stroke="#c9963a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M15 17 C17 14 21 12.5 24 12 C27 12.5 31 14 33 17" stroke="#e8c86a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M17 34 L24 33 L31 34 L33 42 Q24 44.5 15 42 Z" fill="url(#wgGod)" stroke="rgba(210,170,80,.4)"/>
<rect x="22.5" y="31" width="3" height="5" rx="1" fill="#fff" opacity=".85"/>
<line x1="24" y1="28" x2="24" y2="31" stroke="#e8c86a" stroke-width="1.4" stroke-linecap="round"/>
<path d="M22 9.5 L24 7.5 L26 9.5 M23 9.5 L23 12 M25 9.5 L25 12" stroke="#e8c86a" stroke-width="1" stroke-linecap="round" fill="none"/>
<ellipse cx="18.5" cy="18" rx="3" ry="1.6" fill="#fff" opacity=".5" transform="rotate(-25 18.5 18)"/></svg>`,

6:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="11" ry="2.8" fill="rgba(120,80,50,.14)"/>
<line x1="24" y1="5" x2="24" y2="25" stroke="#c98a3a" stroke-width="4" stroke-linecap="round"/>
<rect x="19.5" y="24" width="9" height="4" rx="2" fill="#b97b2f"/>
<path d="M15 28 L33 28 L29.5 42 Q24 44 18.5 42 Z" fill="url(#wgGold)" stroke="rgba(224,163,46,.5)"/>
<line x1="19.5" y1="30" x2="20.3" y2="40" stroke="rgba(224,163,46,.55)" stroke-width="1.6"/>
<line x1="24" y1="30" x2="24" y2="41" stroke="rgba(224,163,46,.55)" stroke-width="1.6"/>
<line x1="28.5" y1="30" x2="27.7" y2="40" stroke="rgba(224,163,46,.55)" stroke-width="1.6"/>
<ellipse cx="20" cy="30" rx="3" ry="1.4" fill="#fff" opacity=".55"/></svg>`,

7:`<svg viewBox="0 0 48 48"><circle cx="16.5" cy="23" r="7.5" fill="url(#wgCloud)"/><circle cx="25" cy="18.5" r="9.5" fill="url(#wgCloud)"/><circle cx="33.5" cy="23.5" r="7" fill="url(#wgCloud)"/><rect x="10" y="21" width="28" height="9.5" rx="7" fill="url(#wgCloud)"/>
<ellipse cx="21" cy="17" rx="5" ry="2.4" fill="#fff" opacity=".7"/>
<polygon points="26,27 19.5,37 24,37 21.5,44.5 31,33 26.5,33 30,27" fill="url(#wgGold)" stroke="rgba(224,163,46,.5)" stroke-width="1"/></svg>`,

8:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="13" ry="3" fill="rgba(120,60,90,.12)"/>
<rect x="5" y="13.5" width="8.5" height="21" rx="4" fill="url(#wgRose)" stroke="rgba(216,78,134,.35)"/>
<rect x="34.5" y="13.5" width="8.5" height="21" rx="4" fill="url(#wgRose)" stroke="rgba(216,78,134,.35)"/>
<rect x="13" y="21.8" width="22" height="4.4" rx="2.2" fill="#ffb1cd"/>
<line x1="19" y1="22.5" x2="19" y2="25.5" stroke="#e77ba7" stroke-width="1.6"/>
<line x1="24" y1="22.5" x2="24" y2="25.5" stroke="#e77ba7" stroke-width="1.6"/>
<line x1="29" y1="22.5" x2="29" y2="25.5" stroke="#e77ba7" stroke-width="1.6"/>
<rect x="6.8" y="16" width="2.6" height="8" rx="1.3" fill="#fff" opacity=".65"/>
<rect x="36.3" y="16" width="2.6" height="8" rx="1.3" fill="#fff" opacity=".65"/></svg>`,

9:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="13" ry="3" fill="rgba(60,90,130,.13)"/>
<path d="M11 33 h26 v5 a13 4.5 0 0 1 -26 0 Z" fill="#4d9fd6"/><ellipse cx="24" cy="33" rx="13" ry="4.5" fill="#6db5e7"/>
<path d="M11 26 h26 v5 a13 4.5 0 0 1 -26 0 Z" fill="#57a8de"/><ellipse cx="24" cy="26" rx="13" ry="4.5" fill="#82c6ee"/>
<ellipse cx="24" cy="19" rx="13" ry="4.5" fill="url(#wgBlue)" stroke="rgba(63,146,201,.45)"/>
<path d="M15 17.5 a11 3.4 0 0 1 9-1.4" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7" stroke-linecap="round"/></svg>`,

10:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="14" ry="3" fill="rgba(90,60,120,.12)"/>
<path d="M8.5 41 C8.5 30 27 30 27 41 Z" fill="#cdb2f5"/>
<circle cx="17.5" cy="24" r="6.2" fill="url(#wgLav)" stroke="rgba(143,92,214,.35)"/>
<path d="M24.5 41 C24.5 32.5 38 32.5 38 41 Z" fill="#dcc8fa"/>
<circle cx="31.2" cy="28.5" r="4.7" fill="url(#wgLav)" stroke="rgba(143,92,214,.35)"/>
<circle cx="15.5" cy="23.5" r=".95" fill="#6b4a9e"/><circle cx="19.8" cy="23.5" r=".95" fill="#6b4a9e"/>
<path d="M16 26.3 Q17.6 27.6 19.2 26.3" stroke="#6b4a9e" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<circle cx="29.8" cy="28.2" r=".85" fill="#6b4a9e"/><circle cx="33" cy="28.2" r=".85" fill="#6b4a9e"/>
<path d="M30.2 30.5 Q31.4 31.5 32.6 30.5" stroke="#6b4a9e" stroke-width="1.1" fill="none" stroke-linecap="round"/></svg>`,

11:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.5" rx="13" ry="3" fill="rgba(50,55,65,.18)"/>
<circle cx="17" cy="24" r="7.5" fill="#6b7280" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<circle cx="27" cy="19.5" r="9.5" fill="url(#wgStorm)" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<circle cx="34" cy="25" r="6.5" fill="#6b7280" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<ellipse cx="25" cy="25" rx="16" ry="6" fill="#4b5563" stroke="rgba(75,85,99,.45)" stroke-width="1.2"/>
<ellipse cx="20" cy="20" rx="4" ry="2" fill="#9ca3af" opacity=".45"/>
<path d="M19 28 L21 33 L18 33 L20 38" stroke="#a0aec0" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".7"/>
<path d="M28 27 L30 32 L27 32 L29 37" stroke="#a0aec0" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".7"/>
<path d="M22 31 L25 28 L23 34 L27 31" stroke="#fbbf24" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".85"/>
<path d="M12 18 Q14 15 16 18" stroke="#9ca3af" stroke-width="1" fill="none" opacity=".4"/>
<path d="M30 14 Q32 11 34 14" stroke="#9ca3af" stroke-width="1" fill="none" opacity=".4"/></svg>`,

12:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.5" rx="13" ry="3" fill="rgba(120,80,40,.14)"/>
<rect x="20" y="8.5" width="8" height="6" rx="2" fill="#edb54a"/>
<rect x="19" y="12.5" width="10" height="3" rx="1.5" fill="#c98a2e"/>
<path d="M24 13 C16 17 11 24.5 11 31.5 C11 39 17 43 24 43 C31 43 37 39 37 31.5 C37 24.5 32 17 24 13 Z" fill="url(#wgGold)" stroke="rgba(224,163,46,.5)"/>
<path d="M16.5 25.5 C20 23 28 23 31.5 25.5" stroke="rgba(224,163,46,.55)" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
<circle cx="36.5" cy="38.5" r="4" fill="#ffd76e" stroke="rgba(224,163,46,.6)"/>
<circle cx="36.5" cy="38.5" r="2" fill="none" stroke="rgba(224,163,46,.6)"/>
<ellipse cx="19" cy="20.5" rx="4" ry="2.2" fill="#fff" opacity=".6" transform="rotate(-28 19 20.5)"/></svg>`,

13:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="11" ry="2.8" fill="rgba(120,80,50,.13)"/>
<path d="M17 30.5 L26 30.5 L15.5 40 Z" fill="url(#wgPeach)"/>
<rect x="8" y="10.5" width="32" height="21.5" rx="9" fill="url(#wgPeach)" stroke="rgba(224,138,58,.35)"/>
<g transform="translate(15.4 12.4) scale(.36)"><path d="${ICON_HEART}" fill="#fff" opacity=".95"/></g></svg>`,

14:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="11" ry="2.8" fill="rgba(60,90,130,.13)"/>
<circle cx="24" cy="26.5" r="13.5" fill="url(#wgBlue)" stroke="rgba(63,146,201,.5)" stroke-width="2"/>
<circle cx="24" cy="26.5" r="9.5" fill="none" stroke="#fff" stroke-width="1.6" opacity=".75"/>
<text x="24" y="31" text-anchor="middle" font-family="'Comic Sans MS','PingFang TC',sans-serif" font-size="13" font-weight="800" fill="#fff" opacity=".95">$</text>
<path d="M15.5 20 a10.5 10.5 0 0 1 6-4.5" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".8"/></svg>`,

15:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="12" ry="3" fill="rgba(180,140,60,.15)"/>
<ellipse cx="24" cy="14" rx="6" ry="2.8" fill="#fff8e0" opacity=".6"/>
<circle cx="24" cy="23" r="11" fill="url(#wgGod)" stroke="rgba(210,170,80,.45)" stroke-width="1.8"/>
<circle cx="24" cy="23" r="7.5" fill="#fff8e8"/>
<circle cx="21.2" cy="21.5" r="1.2" fill="#7a5a2a"/><circle cx="26.8" cy="21.5" r="1.2" fill="#7a5a2a"/>
<path d="M21.5 25.5 Q24 28 26.5 25.5" stroke="#c9963a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M15 17 C17 14 21 12.5 24 12 C27 12.5 31 14 33 17" stroke="#e8c86a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M17 34 L24 33 L31 34 L33 42 Q24 44.5 15 42 Z" fill="url(#wgGod)" stroke="rgba(210,170,80,.4)"/>
<rect x="22.5" y="31" width="3" height="5" rx="1" fill="#fff" opacity=".85"/>
<line x1="24" y1="28" x2="24" y2="31" stroke="#e8c86a" stroke-width="1.4" stroke-linecap="round"/>
<path d="M22 9.5 L24 7.5 L26 9.5 M23 9.5 L23 12 M25 9.5 L25 12" stroke="#e8c86a" stroke-width="1" stroke-linecap="round" fill="none"/>
<ellipse cx="18.5" cy="18" rx="3" ry="1.6" fill="#fff" opacity=".5" transform="rotate(-25 18.5 18)"/></svg>`,

16:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="42.5" rx="12" ry="3" fill="rgba(120,60,90,.12)"/>
<ellipse cx="18.5" cy="10.5" rx="4.4" ry="3" fill="#ffa8c9" stroke="rgba(216,78,134,.35)" transform="rotate(-18 18.5 10.5)"/>
<ellipse cx="29.5" cy="10.5" rx="4.4" ry="3" fill="#ffa8c9" stroke="rgba(216,78,134,.35)" transform="rotate(18 29.5 10.5)"/>
<circle cx="24" cy="11.5" r="2.4" fill="#ffd0e4"/>
<rect x="12" y="19" width="24" height="19" rx="4" fill="#ff9cc0" stroke="rgba(216,78,134,.3)"/>
<rect x="10" y="13.5" width="28" height="7" rx="3" fill="#ff77aa"/>
<rect x="21.75" y="13.5" width="4.5" height="24.5" fill="#fff" opacity=".92"/></svg>`,

17:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="44" rx="13" ry="3" fill="rgba(120,80,40,.13)"/>
<g transform="rotate(-5 24 24)">
<rect x="20" y="6.5" width="9" height="4.5" rx="1.5" fill="#ffe9ad" opacity=".95" transform="rotate(4 24.5 8.5)"/>
<rect x="9.5" y="8.5" width="29" height="31" rx="2.5" fill="#fff" stroke="rgba(224,163,46,.45)" stroke-width="1.5"/>
<rect x="12.5" y="11.5" width="23" height="18" fill="url(#wgGold)"/>
<circle cx="30.5" cy="16.5" r="2.7" fill="#fff" opacity=".9"/>
<path d="M12.5 29.5 L19 22.5 L24 27 L29 21.5 L35.5 29.5 Z" fill="rgba(224,163,46,.55)"/>
<rect x="14" y="33.5" width="13" height="2" rx="1" fill="#eadbb8"/>
</g></svg>`,

18:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.5" rx="10" ry="2.6" fill="rgba(120,80,50,.13)"/>
<path d="M20.5 13.5 C20.5 8.5 27.5 8.5 27.5 13.5 Z" fill="#f0a066"/>
<rect x="18.5" y="12.5" width="11" height="4.5" rx="2" fill="#e08a3a"/>
<rect x="15.5" y="17" width="17" height="24" rx="6.5" fill="#fff" stroke="rgba(224,138,58,.45)" stroke-width="1.8"/>
<rect x="17.3" y="26.5" width="13.4" height="12.7" rx="5" fill="url(#wgPeach)"/>
<line x1="20.5" y1="29.5" x2="20.5" y2="31.5" stroke="#f3c49a" stroke-width="1.2"/>
<line x1="24" y1="29.5" x2="24" y2="31.5" stroke="#f3c49a" stroke-width="1.2"/>
<line x1="27.5" y1="29.5" x2="27.5" y2="31.5" stroke="#f3c49a" stroke-width="1.2"/>
<line x1="18.5" y1="21" x2="18.5" y2="36" stroke="#fff" stroke-width="1.6" opacity=".7" stroke-linecap="round"/></svg>`,

19:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.5" rx="13" ry="3" fill="rgba(50,55,65,.18)"/>
<circle cx="17" cy="24" r="7.5" fill="#6b7280" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<circle cx="27" cy="19.5" r="9.5" fill="url(#wgStorm)" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<circle cx="34" cy="25" r="6.5" fill="#6b7280" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<ellipse cx="25" cy="25" rx="16" ry="6" fill="#4b5563" stroke="rgba(75,85,99,.45)" stroke-width="1.2"/>
<ellipse cx="20" cy="20" rx="4" ry="2" fill="#9ca3af" opacity=".45"/>
<path d="M19 28 L21 33 L18 33 L20 38" stroke="#a0aec0" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".7"/>
<path d="M28 27 L30 32 L27 32 L29 37" stroke="#a0aec0" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".7"/>
<path d="M22 31 L25 28 L23 34 L27 31" stroke="#fbbf24" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".85"/>
<path d="M12 18 Q14 15 16 18" stroke="#9ca3af" stroke-width="1" fill="none" opacity=".4"/>
<path d="M30 14 Q32 11 34 14" stroke="#9ca3af" stroke-width="1" fill="none" opacity=".4"/></svg>`,

20:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="13" ry="3" fill="rgba(60,90,130,.12)"/>
<rect x="14.5" y="7.5" width="3" height="7" rx="1.5" fill="#3f92c9"/>
<rect x="30.5" y="7.5" width="3" height="7" rx="1.5" fill="#3f92c9"/>
<path d="M9 14 a4 4 0 0 1 4-4 h22 a4 4 0 0 1 4 4 v5 H9 Z" fill="url(#wgBlue)"/>
<rect x="9" y="19" width="30" height="19" rx="4" fill="#fff" stroke="rgba(63,146,201,.4)" stroke-width="1.6"/>
<circle cx="15" cy="25.5" r="1.3" fill="#bcdcf2"/><circle cx="21" cy="25.5" r="1.3" fill="#bcdcf2"/><circle cx="27" cy="25.5" r="1.3" fill="#bcdcf2"/><circle cx="33" cy="25.5" r="1.3" fill="#bcdcf2"/>
<circle cx="15" cy="31.5" r="1.3" fill="#bcdcf2"/><circle cx="21" cy="31.5" r="1.3" fill="#bcdcf2"/>
<g transform="translate(24.3 24.1) scale(.3)"><path d="${ICON_HEART}" fill="#f2568f"/></g></svg>`,

21:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.5" rx="13" ry="3" fill="rgba(90,60,120,.13)"/>
<circle cx="24" cy="25" r="15" fill="url(#wgLav)" stroke="rgba(143,92,214,.45)" stroke-width="2"/>
<circle cx="24" cy="25" r="10.5" fill="#fdfbff"/>
<polygon points="24,16.5 27.5,25 20.5,25" fill="#f2568f"/>
<polygon points="24,33.5 27.5,25 20.5,25" fill="#8f5cd6"/>
<circle cx="24" cy="25" r="1.8" fill="#fff" stroke="rgba(143,92,214,.5)"/>
<line x1="24" y1="11.5" x2="24" y2="14" stroke="#fff" stroke-width="1.6" opacity=".85"/>
<line x1="24" y1="36" x2="24" y2="38.5" stroke="#fff" stroke-width="1.6" opacity=".85"/>
<line x1="10.5" y1="25" x2="13" y2="25" stroke="#fff" stroke-width="1.6" opacity=".85"/>
<line x1="35" y1="25" x2="37.5" y2="25" stroke="#fff" stroke-width="1.6" opacity=".85"/></svg>`,

22:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="44" rx="11" ry="2.8" fill="rgba(120,80,40,.14)"/>
<path d="M24 11.6 C24.5 9.5 26 8.8 27.2 8.6" stroke="#b9835a" stroke-width="1.4" fill="none" stroke-linecap="round"/>
<circle cx="24" cy="15" r="3.4" fill="#f26d8a" stroke="rgba(200,60,100,.4)"/>
<path d="M12.5 29 C10.5 21.5 17 17 24 19.5 C31 17 37.5 21.5 35.5 29 Z" fill="#fff4e2" stroke="#ecc79b" stroke-width="1.5"/>
<rect x="17" y="21.5" width="2.6" height="1.3" rx=".6" fill="#f9a8c0" transform="rotate(-20 18 22)"/>
<rect x="23" y="19.8" width="2.6" height="1.3" rx=".6" fill="#9fd0f0" transform="rotate(15 24 20.4)"/>
<rect x="29" y="22" width="2.6" height="1.3" rx=".6" fill="#ffd76e" transform="rotate(-12 30 22.6)"/>
<path d="M15 28.5 L33 28.5 L30.8 42 Q24 44 17.2 42 Z" fill="url(#wgGold)" stroke="rgba(224,163,46,.5)"/>
<line x1="19.5" y1="29.5" x2="20.3" y2="41" stroke="rgba(224,163,46,.5)" stroke-width="1.4"/>
<line x1="24" y1="29.5" x2="24" y2="42" stroke="rgba(224,163,46,.5)" stroke-width="1.4"/>
<line x1="28.5" y1="29.5" x2="27.7" y2="41" stroke="rgba(224,163,46,.5)" stroke-width="1.4"/></svg>`,

23:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="12" ry="3" fill="rgba(180,140,60,.15)"/>
<ellipse cx="24" cy="14" rx="6" ry="2.8" fill="#fff8e0" opacity=".6"/>
<circle cx="24" cy="23" r="11" fill="url(#wgGod)" stroke="rgba(210,170,80,.45)" stroke-width="1.8"/>
<circle cx="24" cy="23" r="7.5" fill="#fff8e8"/>
<circle cx="21.2" cy="21.5" r="1.2" fill="#7a5a2a"/><circle cx="26.8" cy="21.5" r="1.2" fill="#7a5a2a"/>
<path d="M21.5 25.5 Q24 28 26.5 25.5" stroke="#c9963a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M15 17 C17 14 21 12.5 24 12 C27 12.5 31 14 33 17" stroke="#e8c86a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M17 34 L24 33 L31 34 L33 42 Q24 44.5 15 42 Z" fill="url(#wgGod)" stroke="rgba(210,170,80,.4)"/>
<rect x="22.5" y="31" width="3" height="5" rx="1" fill="#fff" opacity=".85"/>
<line x1="24" y1="28" x2="24" y2="31" stroke="#e8c86a" stroke-width="1.4" stroke-linecap="round"/>
<path d="M22 9.5 L24 7.5 L26 9.5 M23 9.5 L23 12 M25 9.5 L25 12" stroke="#e8c86a" stroke-width="1" stroke-linecap="round" fill="none"/>
<ellipse cx="18.5" cy="18" rx="3" ry="1.6" fill="#fff" opacity=".5" transform="rotate(-25 18.5 18)"/></svg>`,

24:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.5" rx="13" ry="3" fill="rgba(50,55,65,.18)"/>
<circle cx="17" cy="24" r="7.5" fill="#6b7280" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<circle cx="27" cy="19.5" r="9.5" fill="url(#wgStorm)" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<circle cx="34" cy="25" r="6.5" fill="#6b7280" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<ellipse cx="25" cy="25" rx="16" ry="6" fill="#4b5563" stroke="rgba(75,85,99,.45)" stroke-width="1.2"/>
<ellipse cx="20" cy="20" rx="4" ry="2" fill="#9ca3af" opacity=".45"/>
<path d="M19 28 L21 33 L18 33 L20 38" stroke="#a0aec0" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".7"/>
<path d="M28 27 L30 32 L27 32 L29 37" stroke="#a0aec0" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".7"/>
<path d="M22 31 L25 28 L23 34 L27 31" stroke="#fbbf24" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".85"/>
<path d="M12 18 Q14 15 16 18" stroke="#9ca3af" stroke-width="1" fill="none" opacity=".4"/>
<path d="M30 14 Q32 11 34 14" stroke="#9ca3af" stroke-width="1" fill="none" opacity=".4"/></svg>`,

25:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="10" ry="2.6" fill="rgba(60,90,130,.12)"/>
<path d="M24 7 C25.8 17 30 21.5 40 24 C30 26.5 25.8 31 24 41 C22.2 31 18 26.5 8 24 C18 21.5 22.2 17 24 7 Z" fill="url(#wgBlue)" stroke="rgba(63,146,201,.4)" stroke-width="1.5"/>
<path d="M37 5.5 l1.1 2.6 2.6 1.1 -2.6 1.1 -1.1 2.6 -1.1 -2.6 -2.6 -1.1 2.6 -1.1 Z" fill="#9fd4f4"/>
<circle cx="11.5" cy="12" r="1.5" fill="#bfe4f8"/>
<ellipse cx="19.5" cy="17.5" rx="2.4" ry="1.4" fill="#fff" opacity=".7" transform="rotate(-38 19.5 17.5)"/></svg>`,

26:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.5" rx="13" ry="3" fill="rgba(50,55,65,.18)"/>
<circle cx="17" cy="24" r="7.5" fill="#6b7280" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<circle cx="27" cy="19.5" r="9.5" fill="url(#wgStorm)" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<circle cx="34" cy="25" r="6.5" fill="#6b7280" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<ellipse cx="25" cy="25" rx="16" ry="6" fill="#4b5563" stroke="rgba(75,85,99,.45)" stroke-width="1.2"/>
<ellipse cx="20" cy="20" rx="4" ry="2" fill="#9ca3af" opacity=".45"/>
<path d="M19 28 L21 33 L18 33 L20 38" stroke="#a0aec0" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".7"/>
<path d="M28 27 L30 32 L27 32 L29 37" stroke="#a0aec0" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".7"/>
<path d="M22 31 L25 28 L23 34 L27 31" stroke="#fbbf24" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".85"/>
<path d="M12 18 Q14 15 16 18" stroke="#9ca3af" stroke-width="1" fill="none" opacity=".4"/>
<path d="M30 14 Q32 11 34 14" stroke="#9ca3af" stroke-width="1" fill="none" opacity=".4"/></svg>`,

27:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="12" ry="3" fill="rgba(180,140,60,.15)"/>
<ellipse cx="24" cy="14" rx="6" ry="2.8" fill="#fff8e0" opacity=".6"/>
<circle cx="24" cy="23" r="11" fill="url(#wgGod)" stroke="rgba(210,170,80,.45)" stroke-width="1.8"/>
<circle cx="24" cy="23" r="7.5" fill="#fff8e8"/>
<circle cx="21.2" cy="21.5" r="1.2" fill="#7a5a2a"/><circle cx="26.8" cy="21.5" r="1.2" fill="#7a5a2a"/>
<path d="M21.5 25.5 Q24 28 26.5 25.5" stroke="#c9963a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M15 17 C17 14 21 12.5 24 12 C27 12.5 31 14 33 17" stroke="#e8c86a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M17 34 L24 33 L31 34 L33 42 Q24 44.5 15 42 Z" fill="url(#wgGod)" stroke="rgba(210,170,80,.4)"/>
<rect x="22.5" y="31" width="3" height="5" rx="1" fill="#fff" opacity=".85"/>
<line x1="24" y1="28" x2="24" y2="31" stroke="#e8c86a" stroke-width="1.4" stroke-linecap="round"/>
<path d="M22 9.5 L24 7.5 L26 9.5 M23 9.5 L23 12 M25 9.5 L25 12" stroke="#e8c86a" stroke-width="1" stroke-linecap="round" fill="none"/>
<ellipse cx="18.5" cy="18" rx="3" ry="1.6" fill="#fff" opacity=".5" transform="rotate(-25 18.5 18)"/></svg>`,

28:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.5" rx="13" ry="3" fill="rgba(50,55,65,.18)"/>
<circle cx="17" cy="24" r="7.5" fill="#6b7280" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<circle cx="27" cy="19.5" r="9.5" fill="url(#wgStorm)" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<circle cx="34" cy="25" r="6.5" fill="#6b7280" stroke="rgba(75,85,99,.5)" stroke-width="1.5"/>
<ellipse cx="25" cy="25" rx="16" ry="6" fill="#4b5563" stroke="rgba(75,85,99,.45)" stroke-width="1.2"/>
<ellipse cx="20" cy="20" rx="4" ry="2" fill="#9ca3af" opacity=".45"/>
<path d="M19 28 L21 33 L18 33 L20 38" stroke="#a0aec0" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".7"/>
<path d="M28 27 L30 32 L27 32 L29 37" stroke="#a0aec0" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".7"/>
<path d="M22 31 L25 28 L23 34 L27 31" stroke="#fbbf24" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".85"/>
<path d="M12 18 Q14 15 16 18" stroke="#9ca3af" stroke-width="1" fill="none" opacity=".4"/>
<path d="M30 14 Q32 11 34 14" stroke="#9ca3af" stroke-width="1" fill="none" opacity=".4"/></svg>`,

29:`<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43" rx="12" ry="3" fill="rgba(180,140,60,.15)"/>
<ellipse cx="24" cy="14" rx="6" ry="2.8" fill="#fff8e0" opacity=".6"/>
<circle cx="24" cy="23" r="11" fill="url(#wgGod)" stroke="rgba(210,170,80,.45)" stroke-width="1.8"/>
<circle cx="24" cy="23" r="7.5" fill="#fff8e8"/>
<circle cx="21.2" cy="21.5" r="1.2" fill="#7a5a2a"/><circle cx="26.8" cy="21.5" r="1.2" fill="#7a5a2a"/>
<path d="M21.5 25.5 Q24 28 26.5 25.5" stroke="#c9963a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M15 17 C17 14 21 12.5 24 12 C27 12.5 31 14 33 17" stroke="#e8c86a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M17 34 L24 33 L31 34 L33 42 Q24 44.5 15 42 Z" fill="url(#wgGod)" stroke="rgba(210,170,80,.4)"/>
<rect x="22.5" y="31" width="3" height="5" rx="1" fill="#fff" opacity=".85"/>
<line x1="24" y1="28" x2="24" y2="31" stroke="#e8c86a" stroke-width="1.4" stroke-linecap="round"/>
<path d="M22 9.5 L24 7.5 L26 9.5 M23 9.5 L23 12 M25 9.5 L25 12" stroke="#e8c86a" stroke-width="1" stroke-linecap="round" fill="none"/>
<ellipse cx="18.5" cy="18" rx="3" ry="1.6" fill="#fff" opacity=".5" transform="rotate(-25 18.5 18)"/></svg>`

};

const ICON_START=`<svg viewBox="0 0 48 48">
<ellipse cx="24" cy="44" rx="14" ry="3.2" fill="rgba(120,30,70,.25)"/>
<path d="${ICON_HEART}" fill="url(#wgRose)" stroke="rgba(190,40,105,.5)" stroke-width="2"/>
<path d="M15 14 C17.5 11.5 21 10.8 23.5 12.2" stroke="#fff" stroke-width="3.2" stroke-linecap="round" fill="none" opacity=".85"/>
<circle cx="34.5" cy="12.5" r="1.6" fill="#fff" opacity=".9"/>
<circle cx="38" cy="17" r="1.1" fill="#fff" opacity=".7"/>
</svg>`;

const ICON_GOAL=`<svg viewBox="0 0 48 48">
<ellipse cx="24" cy="44" rx="14" ry="3.2" fill="rgba(120,30,70,.25)"/>
<g transform="translate(20.5 -1.5) scale(.46)"><path d="${ICON_HEART}" fill="#ffc3dc" stroke="rgba(216,78,134,.4)" stroke-width="2"/></g>
<path d="${ICON_HEART}" fill="url(#wgRose)" stroke="rgba(190,40,105,.5)" stroke-width="2"/>
<path d="M15 14 C17.5 11.5 21 10.8 23.5 12.2" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".85"/>
<path d="M8 6 l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2 Z" fill="#fff" opacity=".95"/>
</svg>`;

function buildBoard(){

if(!document.getElementById("iconDefs")) board.insertAdjacentHTML("beforeend",ICON_DEFS);

spaces.forEach((space,index)=>{

const div=document.createElement("div");

div.className="space "+space.type;

if(index===0) div.classList.add("start");

if(index===spaces.length-1) div.classList.add("goal");

div.dataset.index=index;

const isStart=index===0;
const isGoal=index===spaces.length-1;

// 以站點中心為基準絕對定位（道路上依序排列的圓形事件站）
// 中心 = space.x+41；起點/終點為較大的圓形
const hw = isStart||isGoal ? BIG_R : CIRCLE_R;
div.style.left = (space.x + 41 - hw) + "px";
div.style.top  = (space.y + 41 - hw) + "px";
div.style.width  = (hw*2) + "px";
div.style.height = (hw*2) + "px";

if(isStart){

div.innerHTML='<div class="space-inner"><span class="space-big">'+ICON_START+'</span><span class="space-name">START</span></div>';

}else if(isGoal){

div.innerHTML='<div class="space-inner"><span class="space-big">'+ICON_GOAL+'</span><span class="space-name">LOVE 終點</span></div>';

}else{

const iconName=SPACE_NAMES[index]?`<span class="space-name">${SPACE_NAMES[index]}</span>`:"";
div.innerHTML=`<div class="space-inner"><span class="space-num">${index}</span><span class="space-icon">${SPACE_ICONS[index]||""}</span>${iconName}</div>`;

}

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

const wall=document.createElementNS("http://www.w3.org/2000/svg","path");

wall.setAttribute("d", d);

wall.classList.add("road-wall");

roadLayer.appendChild(wall);

const surface=document.createElementNS("http://www.w3.org/2000/svg","path");

surface.setAttribute("d", d);

surface.classList.add("road-surface");

roadLayer.appendChild(surface);

const dash=document.createElementNS("http://www.w3.org/2000/svg","path");

dash.setAttribute("d", d);

dash.classList.add("road-dash");

roadLayer.appendChild(dash);

}

// -------------------------------
// 隊伍數量控制
// -------------------------------

function setActiveTeamCount(n) {

    const newCount = Math.max(2, Math.min(5, n));

    if (newCount === activeTeamCount) return;

    activeTeamCount = newCount;

    // currentTeam 超過範圍時拉回最後有效隊伍
    if (currentTeam >= activeTeamCount) {

        currentTeam = activeTeamCount - 1;

        updateTurn();

    }

    updateTeamVisibility();
    updateJourneyDisplay();

    placePieces();

}

function updateTeamVisibility() {

    // 右側隊伍設定列
    for (let i = 0; i < 5; i++) {

        const row = document.getElementById("teamRow" + i);

        if (row) row.classList.toggle("hidden", i >= activeTeamCount);

    }

    // 計分板列
    for (let i = 0; i < 5; i++) {

        const row = document.getElementById("scoreRow" + i);

        if (row) row.classList.toggle("hidden", i >= activeTeamCount);

    }

    // 棋子顯示
    for (let i = 0; i < 5; i++) {

        const piece = document.getElementById("piece" + i);

        if (piece) piece.style.display = i < activeTeamCount ? "" : "none";

    }

    // 按鈕 disabled 狀態
    document.getElementById("teamCountMinus").disabled = activeTeamCount <= 2;

    document.getElementById("teamCountPlus").disabled = activeTeamCount >= 5;

    document.getElementById("teamCountNum").textContent = activeTeamCount;

}

function updateJourneyDisplay(){
    for(let i=0;i<5;i++){
        const el=document.getElementById("journey"+i);
        if(!el) continue;
        const t=teams[i];
        const god=t.journey.hasMetGod?"✝️✅":"✝️❌";
        const trial=t.journey.hasTrial?"🌑✅":"🌑❌";
        el.textContent=god+" "+trial;
    }
}

// -------------------------------
// 放置棋子
// -------------------------------

function placePieces() {
    // 未入場(等待區)與已入場分開處理（只處理啟用中的隊伍）
    const waiting = [];
    const posGroups = {};
    teams.forEach((team, index) => {
        if (index >= activeTeamCount) return;
        if (!team.entered) {
            waiting.push(index);
            return;
        }
        const pos = team.position;
        if (!posGroups[pos]) posGroups[pos] = [];
        posGroups[pos].push(index);
    });

    // 等待區：五位小朋友以扇形排列在 START 的左下側（不遮住 START）
    // START 位於棋盤左上角落，開闊方向為左側與下方
    const startC = spaces[0];
    const n = waiting.length;
    const cx = startC.x + 41;
    const cy = startC.y + 41;
    const WAIT_R = 150;
    waiting.forEach((idx, i) => {
        const piece = document.getElementById("piece" + idx);
        const t = (n === 1) ? 0.5 : (i / (n - 1));
        const angle = (70 + t * 165) * Math.PI / 180;   // 70°~235°，扇形佈於 START 開放側
        const wx = cx + Math.cos(angle) * WAIT_R;
        const wy = cy + Math.sin(angle) * WAIT_R;
        piece.style.left = (wx - 22) + "px";
        piece.style.top = (wy - 28) + "px";
    });

    // 已入場：為每個位置的棋子計算偏移並定位
    Object.values(posGroups).forEach(indices => {
        const count = indices.length;
        const baseIdx = indices[0];
        const p = spaces[teams[baseIdx].position];

        // 計算每個棋子的視覺偏移
        indices.forEach((idx, i) => {
            const piece = document.getElementById("piece" + idx);
            const { dx, dy } = getPieceOffset(count, i);
            piece.style.left = (p.x + 19 + dx) + "px";
            piece.style.top = (p.y + 13 + dy) + "px";
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

const godEventSound = new Audio("assets/audio/god-event.mp3");
godEventSound.volume = 0.6;

const trialEventSound = new Audio("assets/audio/trial-event.mp3");
trialEventSound.volume = 0.6;

function playEventSound(type){
    if(type==="god"){
        godEventSound.currentTime=0;
        godEventSound.play().catch(()=>{});
    }else if(type==="trial"){
        trialEventSound.currentTime=0;
        trialEventSound.play().catch(()=>{});
    }
}

function stopEventSound(type){
    if(type==="god"){ godEventSound.pause(); godEventSound.currentTime=0; }
    else if(type==="trial"){ trialEventSound.pause(); trialEventSound.currentTime=0; }
}

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
// 終點前補完：強制完成缺失旅程
// -------------------------------

function pickRandomFrom(arr, used){
    const available=arr.filter(q=>!used.includes(q));
    return available.length>0
        ? available[Math.floor(Math.random()*available.length)]
        : arr[Math.floor(Math.random()*arr.length)];
}

function forceTrial(team){
    return new Promise(async resolve=>{
        await showTrialAnimation();
        const tq=pickRandomFrom(trialQuestions, team.journey.usedTrialQuestions);
        team.journey.usedTrialQuestions.push(tq);
        team.journey.hasTrial=true;
        updateJourneyDisplay();
        questionBox.textContent="🌑 婚姻試煉\n"+tq;
        overlayQuestion.textContent="🌑 婚姻試煉\n"+tq;
        questionOverlay.classList.add("show");
        const handler=()=>{ resolve(); };
        closeQuestionBtn.onclick=()=>{ questionOverlay.classList.remove("show"); handler(); };
        correctBtn.onclick=()=>{ addScore(currentTeam,1); questionOverlay.classList.remove("show"); handler(); };
        excellentBtn.onclick=()=>{ addScore(currentTeam,2); questionOverlay.classList.remove("show"); handler(); };
    });
}

function forceGod(team){
    return new Promise(async resolve=>{
        await showGodAnimation();
        const gq=pickRandomFrom(godQuestions, team.journey.usedGodQuestions);
        team.journey.usedGodQuestions.push(gq);
        team.journey.hasMetGod=true;
        updateJourneyDisplay();
        questionBox.textContent="✝️ 遇見神\n"+gq;
        overlayQuestion.textContent="✝️ 遇見神\n"+gq;
        questionOverlay.classList.add("show");
        const handler=()=>{ resolve(); };
        closeQuestionBtn.onclick=()=>{ questionOverlay.classList.remove("show"); handler(); };
        correctBtn.onclick=()=>{ addScore(currentTeam,1); questionOverlay.classList.remove("show"); handler(); };
        excellentBtn.onclick=()=>{ addScore(currentTeam,2); questionOverlay.classList.remove("show"); handler(); };
    });
}

// -------------------------------
// 擲骰（含軟性路徑分散）
// -------------------------------

function pickDiceValue(team){
    const pos=team.position;
    const maxStep=spaces.length-1-pos;
    const candidates=[];
    for(let s=1;s<=6;s++){
        if(s>maxStep) break;
        candidates.push(s);
    }
    if(candidates.length<=1) return candidates[0]||1;

    const otherPositions=[];
    for(let i=0;i<activeTeamCount;i++){
        if(i===currentTeam) continue;
        otherPositions.push(teams[i].position);
    }

    const scored=candidates.map(s=>{
        const land=pos+s;
        let penalty=0;
        for(const op of otherPositions){
            const dist=Math.abs(land-op);
            if(dist===0) penalty+=3;
            else if(dist<=2) penalty+=1;
        }
        if(land>=spaces.length-1) penalty+=0.5;
        return {s,penalty};
    });

    const minPenalty=Math.min(...scored.map(x=>x.penalty));
    const best=scored.filter(x=>x.penalty===minPenalty);
    return best[Math.floor(Math.random()*best.length)].s;
}

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

const finalValue=pickDiceValue(teams[currentTeam]);

let value=1;

const timer=setInterval(()=>{

value=Math.floor(Math.random()*6)+1;

dice.textContent=value;

},70);

setTimeout(()=>{

clearInterval(timer);

dice.textContent=finalValue;

dice.classList.remove("rolling");

movePiece(finalValue);

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

moveStep(team.position,target,async ()=>{

const startPos=team.position;
team.position=target;

// LOVE 終點前：只強制遇見神，不再強制試煉
if(target>=spaces.length-1){
    if(!team.journey.hasMetGod){
        team.position=startPos;
        await showBlessingLead();
        await forceGod(team);
        placePieces();
        moving=false;
        return;
    }
}

await showQuestion();

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

piece.style.left=(next.x+19+(currentTeam%2)*10)+"px";

piece.style.top=(next.y+13+Math.floor(currentTeam/2)*10)+"px";
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
// 特殊事件動畫（5 秒 3 階段）
// 0~1s 進場 → 1~4s 展示 → 4~5s 離場
// -------------------------------

function showGodAnimation(){
    return new Promise(resolve=>{
        const el=document.getElementById("godOverlay");
        const p1=el.querySelector(".god-phase1");
        const p2=el.querySelector(".god-phase2");
        p1.style.opacity="0"; p2.style.opacity="0";
        el.classList.add("show");
        playEventSound("god");
        // Phase 1: 進場 (0~1s)
        setTimeout(()=>{ p1.style.opacity="1"; },300);
        // Phase 2: 展示 (1~4s)
        setTimeout(()=>{ p1.style.opacity="0"; p2.style.opacity="1"; },1200);
        // Phase 3: 離場 (4~5s)
        setTimeout(()=>{ p1.style.opacity="0"; p2.style.opacity="0"; },4000);
        setTimeout(()=>{ el.classList.remove("show"); stopEventSound("god"); resolve(); },5000);
    });
}

function showTrialAnimation(){
    return new Promise(resolve=>{
        const el=document.getElementById("trialOverlay");
        const p1=el.querySelector(".trial-phase1");
        const p2=el.querySelector(".trial-phase2");
        p1.style.opacity="0"; p2.style.opacity="0";
        el.classList.add("show");
        playEventSound("trial");
        // Phase 1: 進場 (0~1s)
        setTimeout(()=>{ p1.style.opacity="1"; },300);
        // Phase 2: 展示 (1~4s)
        setTimeout(()=>{ p1.style.opacity="0"; p2.style.opacity="1"; },1200);
        // Phase 3: 離場 (4~5s)
        setTimeout(()=>{ p1.style.opacity="0"; p2.style.opacity="0"; },4000);
        setTimeout(()=>{ el.classList.remove("show"); stopEventSound("trial"); resolve(); },5000);
    });
}

// -------------------------------
// 題目
// -------------------------------

async function showQuestion(){
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

const team = teams[currentTeam];

const currentSpace = spaces[team.position];
const spaceIdx = team.position;

if(currentSpace.blessing){
    if(!team.journey.hasMetGod && !usedEventSpaces.has(spaceIdx)){
        usedEventSpaces.add(spaceIdx);
        await showGodAnimation();
        const available=godQuestions.filter(q=>!team.journey.usedGodQuestions.includes(q));
        const gq=available.length>0
            ? available[Math.floor(Math.random()*available.length)]
            : godQuestions[Math.floor(Math.random()*godQuestions.length)];
        team.journey.usedGodQuestions.push(gq);
        team.journey.hasMetGod=true;
        updateJourneyDisplay();
        questionBox.textContent="✝️ 遇見神\n"+gq;
        overlayQuestion.textContent="✝️ 遇見神\n"+gq;
        questionOverlay.classList.add("show");
        return;
    }
}

if(currentSpace.trial){
    if(!team.journey.hasTrial && !usedEventSpaces.has(spaceIdx)){
        usedEventSpaces.add(spaceIdx);
        await showTrialAnimation();
        const available=trialQuestions.filter(q=>!team.journey.usedTrialQuestions.includes(q));
        const tq=available.length>0
            ? available[Math.floor(Math.random()*available.length)]
            : trialQuestions[Math.floor(Math.random()*trialQuestions.length)];
        team.journey.usedTrialQuestions.push(tq);
        team.journey.hasTrial=true;
        updateJourneyDisplay();
        questionBox.textContent="🌑 婚姻試煉\n"+tq;
        overlayQuestion.textContent="🌑 婚姻試煉\n"+tq;
        questionOverlay.classList.add("show");
        return;
    }
}

if(currentSpace.question){
    questionBox.textContent=currentSpace.question;
    overlayQuestion.textContent=currentSpace.question;
    questionOverlay.classList.add("show");
}

}

// -------------------------------
// 下一隊
// -------------------------------

document

.getElementById("nextBtn")

.addEventListener("click",()=>{

currentTeam++;

if(currentTeam>=activeTeamCount){

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

const beginMove=()=>{

moveStep(team.position,target,async ()=>{

const startPos=team.position;
team.position=target;

// LOVE 終點前：只強制遇見神
if(target>=spaces.length-1){
    if(!team.journey.hasMetGod){
        team.position=startPos;
        placePieces();
        await showBlessingLead();
        await forceGod(team);
        placePieces();
        moving=false;
        setTimeout(()=>{ viewport.classList.remove("follow-cam"); },850);
        return;
    }
}

placePieces();

showQuestion();

checkWinner();

moving=false;

setTimeout(()=>{
    viewport.classList.remove("follow-cam");
},850);

});

};

if(!team.entered){

    // 第一次擲骰：先從起點外圍等待區滑入起點格
    team.entered=true;

    const sp=spaces[0];

    const el=document.getElementById("piece"+currentTeam);

    el.style.left=(sp.x+19+(currentTeam%2)*10)+"px";

    el.style.top=(sp.y+13+Math.floor(currentTeam/2)*10)+"px";

    highlightCell(0);

    spotlightTeam(currentTeam);

    setTimeout(beginMove,480);

}else{

    beginMove();

}

};

// -------------------------------
// Enter 更新隊名
// -------------------------------

for(let i=0;i<5;i++){

document
.getElementById("team"+i)
.addEventListener("keyup",updateNames);

}

// 隊伍數量 −/＋ 按鈕
document.getElementById("teamCountMinus").addEventListener("click",()=>{
    setActiveTeamCount(activeTeamCount - 1);
});
document.getElementById("teamCountPlus").addEventListener("click",()=>{
    setActiveTeamCount(activeTeamCount + 1);
});
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

// -------------------------------
// 攝影機動畫（JS 平滑縮放＋平移，統一套用於開場與追焦）
// 注意 #boardContainer 使用 transform: translate() scale()
// 這裡操作的都是「地圖內部座標」+ viewport 尺寸，不與 getBoundingClientRect 混用
// -------------------------------

let camAnimId=null;

function cancelCamAnim(){
    if(camAnimId){
        cancelAnimationFrame(camAnimId);
        camAnimId=null;
    }
}

function easeInOutCubic(t){
    return t<0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
}

function animateCameraTo(tx,ty,ts,dur,onDone){
    cancelCamAnim();
    const sx=viewX, sy=viewY, ss=viewScale;
    const t0=performance.now();
    const step=(now)=>{
        let t=Math.min(1,(now-t0)/dur);
        const e=easeInOutCubic(t);
        viewX=sx+(tx-sx)*e;
        viewY=sy+(ty-sy)*e;
        viewScale=ss+(ts-ss)*e;
        clampView();
        applyView();
        if(t<1){
            camAnimId=requestAnimationFrame(step);
        }else{
            camAnimId=null;
            if(onDone) onDone();
        }
    };
    camAnimId=requestAnimationFrame(step);
}

function spotlightTeam(index){

if(introPlaying){
    finishIntro();
}

const piece=document.getElementById("piece"+index);

if(!piece) return;

// 棋子用 style.left/top = 地圖內部座標（非 viewport 座標）
const px=parseFloat(piece.style.left)||0;
const py=parseFloat(piece.style.top)||0;

const cx=px+22;
const cy=py+28;

const vw=viewport.clientWidth;
const vh=viewport.clientHeight;

// 追焦：保持目前縮放，平滑把目前移動中的隊伍置中
const s=viewScale;
const targetX=vw/2 - cx*s;
const targetY=vh/2 - cy*s;

animateCameraTo(targetX,targetY,s,620);

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

// 以「目前實際 START 站點座標」為準（新版圓形格，非舊方格固定座標）
const sx=sPoints[0].x;
const sy=sPoints[0].y;

const vw=viewport.clientWidth;
const vh=viewport.clientHeight;

// 縮放：讓 START 與其周圍的五位角色大約進入畫面
const spread=340;   // 地圖座標半徑（涵蓋 START 圓格 + 扇形角色）
const s=Math.max(zoomMinScale(), Math.min(ZOOM_MAX, Math.min(vw/(spread*2), vh/(spread*2))));

// 中心略偏右上，好讓位於 START 左/下方的角色也入鏡
const fx=sx-60, fy=sy-40;

return { x: vw/2 - fx*s, y: vh/2 - fy*s, s:s };

}

function playIntro(){

introPlaying=true;

cancelCamAnim();

const fit=cameraToFit();

viewX=fit.x;
viewY=fit.y;
viewScale=fit.s;

viewport.classList.remove("intro-animating");

clampView();
applyView();

void boardContainerEl.offsetWidth;

introMoveTimer=setTimeout(()=>{

    // Phase 2：從全局平滑 Zoom In 到位於 START 的起點視角
    const t=cameraAtStart();

    viewport.classList.add("intro-animating");

    animateCameraTo(t.x,t.y,t.s,INTRO_MOVE_MS,()=>{
        viewport.classList.remove("intro-animating");
        viewX=t.x;
        viewY=t.y;
        viewScale=t.s;
        clampView();
        applyView();
        introPlaying=false;
    });

}, INTRO_HOLD_MS);

}

function finishIntro(){

if(!introPlaying) return;

introPlaying=false;
clearTimeout(introMoveTimer);

viewport.classList.remove("intro-animating");

// 停止自動攝影機，停留在「START 起點」視角（不再跳回全局）
const t=cameraAtStart();

cancelCamAnim();

viewX=t.x;
viewY=t.y;
viewScale=t.s;

clampView();
applyView();

}

let panDragging=false;
let panPointerId=null;
let panStartX=0, panStartY=0;
let panBaseX=0, panBaseY=0;

viewport.addEventListener("pointerdown",e=>{

cancelCamAnim();

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

if(pinching) return;

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
// 手動縮放（觸控板 pinch + 雙指 pinch）
// 與拖曳/Spotlight 共用 viewScale 相機系統
// -------------------------------

const ZOOM_MAX=2.0;

// 最小縮放：動態依目前地圖尺寸與 viewport 計算，
// 永遠允許縮小到「完整看到整張遊戲地圖」（並留些空白邊），
// 而非被固定數字卡住。
function zoomMinScale(){
    const fit=cameraToFit();
    return fit.s * 0.9;
}

const activePtrs=new Map();
let pinching=false;
let pinchStartDist=1;
let pinchStartScale=1;

function setZoom(newScale,ax,ay){

cancelCamAnim();

newScale=Math.max(zoomMinScale(),Math.min(ZOOM_MAX,newScale));

// 縮放前後，錨點下的棋盤座標保持不動
const bx=(ax-viewX)/viewScale;
const by=(ay-viewY)/viewScale;

viewScale=newScale;
viewX=ax-bx*viewScale;
viewY=ay-by*viewScale;

clampView();
applyView();

}

function localPoint(clientX,clientY){
    const r=viewport.getBoundingClientRect();
    return {x:clientX-r.left,y:clientY-r.top};
}

function tryStartPinch(){

if(introPlaying) return;

if(viewport.classList.contains("follow-cam")) return;

const pts=[...activePtrs.values()];

pinchStartDist=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y)||1;

pinchStartScale=viewScale;

pinching=true;

}

function updatePinch(){

if(!pinching || activePtrs.size<2) return;

const pts=[...activePtrs.values()];

const dist=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y)||1;

const mid={
    x:(pts[0].x+pts[1].x)/2,
    y:(pts[0].y+pts[1].y)/2
};

const lp=localPoint(mid.x,mid.y);

setZoom(pinchStartScale*dist/pinchStartDist,lp.x,lp.y);

}

viewport.addEventListener("pointerdown",e=>{
    activePtrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(activePtrs.size===2){
        if(panDragging){
            panDragging=false;
            panPointerId=null;
            viewport.classList.remove("dragging");
        }
        tryStartPinch();
    }
    e.preventDefault();
});

viewport.addEventListener("pointermove",e=>{
    if(!activePtrs.has(e.pointerId)) return;
    activePtrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    updatePinch();
});

function zoomPtrEnd(e){
    activePtrs.delete(e.pointerId);
    if(activePtrs.size<2) pinching=false;
}

viewport.addEventListener("pointerup",zoomPtrEnd);
viewport.addEventListener("pointercancel",zoomPtrEnd);

// Mac 觸控板雙指捏合 → 瀏覽器送出 ctrlKey + wheel
viewport.addEventListener("wheel",e=>{

if(!e.ctrlKey && !e.metaKey) return;

e.preventDefault();

if(introPlaying){
    finishIntro();
}

const lp=localPoint(e.clientX,e.clientY);

setZoom(viewScale*Math.exp(-e.deltaY*0.002),lp.x,lp.y);

},{passive:false});

// -------------------------------
// 初始化
// -------------------------------

buildBoard();

drawRoads();

placePieces();

updateTeamVisibility();
updateJourneyDisplay();

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
// 底部工具列
// -------------------------------

document.getElementById("sfxBtn").addEventListener("click",()=>{
    musicBtn.click();
});

document.getElementById("qBtn").addEventListener("click",()=>{
    if(!questionOverlay.classList.contains("show")){
        overlayQuestion.textContent=questionBox.textContent;
        questionOverlay.classList.add("show");
    }
});

document.getElementById("scoreBtn").addEventListener("click",()=>{
    const card=document.getElementById("scoreBoard").closest(".card");
    card.scrollIntoView({behavior:"smooth",block:"nearest"});
    card.style.transition="box-shadow .3s";
    card.style.boxShadow="0 0 0 3px #ffb6d5";
    setTimeout(()=>{card.style.boxShadow="";},900);
});

document.getElementById("rulesBtn").addEventListener("click",()=>{
    alert(
"📋 遊戲規則\n\n"+
"1️⃣ 各隊輪流擲骰前進\n"+
"2️⃣ 停在格子上回答該格題目\n"+
"3️⃣ 答對 +1 分、優秀回答 +2 分\n"+
"4️⃣ 抵達終點後，總分最高者獲勝！"
    );
});

document.getElementById("homeBtn").addEventListener("click",()=>{
    if(confirm("確定要返回大廳重新開始？目前的進度會消失。")){
        location.reload();
    }
});

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

// 本機主持人/遙控器測試用（BroadcastChannel）
try{
const _hc=new BroadcastChannel("wedding-host");
_hc.onmessage=e=>{
const map={start:"startBtn",score1:"correctBtn",score2:"excellentBtn",
close:"closeQuestionBtn",next:"nextBtn",undo:"undoBtn",winner:"winnerBtn",
roll:"rollBtn",bgm:"musicBtn",rules:"rulesBtn",cheer:"cheerBtn"};
const fnMap={trialFail:showRepairVerse,repair:hideRepairVerse};
if(fnMap[e.data]){ fnMap[e.data](); }
else{ const id=map[e.data]; if(id) document.getElementById(id)?.click(); }
};
}catch(_e){}
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

    teams.forEach((team,index)=>{

        if(index>=activeTeamCount) return;

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
        teams[index].entered = team.entered;
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

