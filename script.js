const app = firebase.initializeApp(config.firebase); // for production (config.js 의 config 객체)
const db = firebase.firestore();

let score = 0;
let countdownValue = 3;
let countdownInterval;
let randomNumber = 0;
let handsToCreate = [];
let isReadyHand = {
  left: false,
  right: false,
  other: false,
};

function showRandomNumber() {
  const randomNumberElement = document.getElementById("random-number");
  randomNumber = Math.floor(Math.random() * 10) + 1;
  randomNumberElement.textContent = randomNumber;

  const interval = setInterval(() => {
    randomNumber = Math.floor(Math.random() * 10) + 1;
    randomNumberElement.textContent = randomNumber;
  }, 100);

  return interval;
}
let randomNumberInterval = showRandomNumber();

document.getElementById("start-btn").addEventListener("click", () => {
  clearInterval(randomNumberInterval);
  document.getElementById("ready-game").style.display = "none";
  document.getElementById("typography").style.display = "none";
  document.getElementById("countdown").style.display = "block";
  document.getElementById("rank-board").classList.add("hidden"); // (모바일) 게임 시작 시 랭킹 숨김
  startCountdown();
});

function startCountdown() {
  countdownValue--;
  countdownInterval = setInterval(() => {
    console.log(countdownValue);
    if (countdownValue > 0) {
      document
        .getElementById("countdown")
        .setAttribute("data-count", countdownValue);
      countdownValue--;
    } else {
      clearInterval(countdownInterval);
      document.getElementById("countdown").style.display = "none";
      document.getElementById("left-btn").disabled = false;
      document.getElementById("left-btn").style.display = "inline-block";
      document.getElementById("right-btn").disabled = false;
      document.getElementById("right-btn").style.display = "inline-block";

      generateRandomHands();
      startCreateHands();
    }
  }, 1000);
}

function generateRandomHands() {
  for (let i = 0; i < 4; i++) {
    handsToCreate.push("left", "right");
  }
  handsToCreate.sort(() => Math.random() - 0.5);
}

function startCreateHands() {
  let createHands = 0;
  const interval = setInterval(() => {
    if (createHands < handsToCreate.length) {
      createHand(handsToCreate[createHands]);
      createHands++;
    } else {
      clearInterval(interval);
      isReadyHand.other = true;
      checkFinishHands();
    }
  }, 200);
}

function createHand(direction, isMine = false) {
  const hand = document.createElement("img");
  hand.classList.add("hand");

  if (direction === "left") {
    if (isMine) hand.src = "img/leftMine.png";
    else hand.src = "img/left.png";
    hand.style.transform = "translateX(-200%)";
    hand.alt = "left";
  } else {
    if (isMine) hand.src = "img/rightMine.png";
    else hand.src = "img/right.png";
    hand.style.transform = "translateX(200%)";
    hand.alt = "right";
  }
  document.getElementById("hands").appendChild(hand);

  setTimeout(() => {
    if (direction == "left") hand.style.transform = "translateX(-40px)";
    else hand.style.transform = "translateX(40px)";
    hand.style.bottom = `${
      60 +
      document.querySelectorAll(".hand").length *
        (window.innerWidth > 560 ? 40 : 25)
    }px`;
  }, 10);
}

document.getElementById("left-btn").addEventListener("click", () => {
  document.getElementById("left-btn").disabled = true;
  createHand("left", true);
  isReadyHand.left = true;
  checkFinishHands();
});

document.getElementById("right-btn").addEventListener("click", () => {
  document.getElementById("right-btn").disabled = true;
  createHand("right", true);
  isReadyHand.right = true;
  checkFinishHands();
});

function checkFinishHands() {
  if (isReadyHand.left && isReadyHand.right && isReadyHand.other) {
    document.getElementById("left-btn").style.display = "none";
    document.getElementById("right-btn").style.display = "none";
    document.getElementById("game-btn").style.display = "inline-block";
  }
}

document.getElementById("game-btn").addEventListener("click", () => {
  document.getElementById("game-btn").style.display = "none";
  const floor = document.getElementById("result-floor");
  floor.innerText = randomNumber + "층";
  floor.style.display = "inline-block";

  for (let i = 0; i < randomNumber; i++) {
    setTimeout(() => {
      moveHandsUp(i);
    }, i * 500);
  }
});

function moveHandsUp(num) {
  const floor = document.getElementById("result-floor");
  if (num === randomNumber - 1) {
    calculateResult();
    if (document.querySelectorAll(".hand")[num].src.includes("Mine"))
      floor.innerText = "실패!";
    else floor.innerText = "통과!";
  } else floor.innerText = randomNumber - num + "층";

  const hands = document.querySelectorAll(".hand");
  if (hands.length > 0) {
    const handToMove = hands[num];

    if (handToMove.alt === "left") {
      handToMove.style.transform = "translate(-40px, -200px)";
    } else handToMove.style.transform = "translate(40px, -200px)";

    handToMove.style.transition = "transform 0.5s ease, bottom 0.5s ease";

    handToMove.style.bottom = `${
      (document.querySelectorAll(".hand").length + num) *
        (window.innerWidth > 560 ? 40 : 25) -
      110
    }px`;
  }
}

function calculateResult() {
  const hands = document.querySelectorAll(".hand");
  const lastHand = hands[randomNumber - 1];

  let isWin = true;
  if (lastHand.src.includes("Mine")) isWin = false;

  setTimeout(() => {
    if (isWin) {
      randomNumber = Math.floor(Math.random() * 10) + 1;

      const floor = document.getElementById("result-floor");
      floor.style.display = "none";
      score++;

      const newScore = document.getElementById("score");
      newScore.innerText = score;

      handsToCreate = [];
      isReadyHand = {
        let: false,
        right: false,
        other: false,
      };
      document.getElementById("hands").innerHTML = "";
      countdownValue = 3;
      document
        .getElementById("countdown")
        .setAttribute("data-count", countdownValue);
      document.getElementById("countdown").style.display = "block";
      startCountdown();
    } else {
      document.getElementById("game-over-score").innerText = score;
      if (
        ranks.length == 0 ||
        (ranks.length > 0 && ranks[ranks.length - 1].score < score)
      ) {
        document.querySelector(".record").style.display = "block";
      }
      document.getElementById("rank-board").classList.remove("hidden");
      document.getElementById("game-over").style.display = "flex";
    }
  }, 1000);
}

// 점수 관리
let ranks = [];
function getRank() {
  db.collection("scores")
    .orderBy("score", "desc")
    .limit(5)
    .get()
    .then((querySnapshot) => {
      const rankList = document.getElementById("rank-list");
      rankList.innerHTML = "";
      let index = 1;

      querySnapshot.forEach((doc) => {
        const rank = doc.data();
        ranks.push(rank);
        const rankElement = document.createElement("div");
        rankElement.classList.add("rank-item");
        rankElement.innerHTML = `<span class="rank">${index}위</span>
        <span>${rank.nickname}</span>
        <span>${rank.score}</span>
      `;
        rankList.appendChild(rankElement);
        index++;
      });
    });
}

document.getElementById("game-over-register").addEventListener("click", () => {
  const nickname = document.getElementById("game-over-nickname").value;
  db.collection("scores")
    .add({ nickname, score })
    .then(() => {
      location.reload();
    })
    .catch((error) => {
      console.error("점수 저장 오류: ", error);
    });
});

document.getElementById("replay").addEventListener("click", () => {
  location.reload();
});

getRank();
