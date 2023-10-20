const url = "https://script.google.com/macros/s/AKfycbxVY3OYQ6bbLwv0ySeC4P7NztkdcnJR7UZ9VJyeDsdk5804U42AYGHn940ItyQJ4rsIvg/exec";
const RAD = Math.PI / 180;
const scrn = document.getElementById("canvas");
// const ratio = 276/414;
// scrn.height = document.body.clientHeight;
// scrn.width = ParseInt(scrn.height*ratio)
const scaledX = window.innerWidth / 276;
const scaledY = window.innerHeight / 414;
//1P-8GYixPJKy2cJHKLgVnAqtii13CSEF1jQBERb4cjMM
const scaleF = 1;

const sctx = scrn.getContext("2d");

const infoForm = document.getElementById("info-form");
const startGameButton = document.getElementById("start-game");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
// const genderSelect = document.getElementById("gender-radio");
var radioButtons = document.querySelectorAll('input[type="radio"]');

window.addEventListener("resize", resizeCanvas);
function resizeCanvas() {
  scrn.width = window.innerWidth * scaleF;
  scrn.height = window.innerHeight * scaleF;
  // 다른 요소들의 위치 및 크기도 이에 맞게 조절
}
resizeCanvas();  // 처음에 한 번 호출하여 초기 크기를 설정



scrn.tabIndex = 1;
scrn.addEventListener("click", () => {
  switch (state.curr) {
    case state.getReady:
      state.curr = state.Play;
      SFX.start.play();
      break;
    case state.Play:
      bird.flap();
      break;
    case state.gameOver:
      state.curr = state.getReady;
      bird.speed = 0;
      bird.y = 100;
      pipe.pipes = [];
      UI.score.curr = 0;
      SFX.played = false;
      break;
  }
});

scrn.onkeydown = function keyDown(e) {
  if (e.keyCode == 32 || e.keyCode == 87 || e.keyCode == 38) {
    // Space Key or W key or arrow up
    switch (state.curr) {
      case state.getReady:
        state.curr = state.Play;
        SFX.start.play();
        break;
      case state.Play:
        bird.flap();
        break;
      case state.gameOver:
        state.curr = state.getReady;
        bird.speed = 0;
        bird.y = 100;
        pipe.pipes = [];
        UI.score.curr = 0;
        SFX.played = false;
        break;
    }
  }
};

let frames = 0;
let dx = 2;
const state = {
  curr: 0,
  getReady: 0,
  Play: 1,
  gameOver: 2,
  record:4,
  infoInput: 3, // 새로운 상태: 개인 정보 입력
};
const SFX = {
  start: new Audio(),
  flap: new Audio(),
  score: new Audio(),
  hit: new Audio(),
  die: new Audio(),
  played: false,
};
const gnd = {
  sprite: new Image(),
  x: 0,
  y: 0,

  draw: function () {
    let scaledwidth = this.sprite.width * scaledX;
    let scaledheight = this.sprite.height * scaledY;
    this.y = parseFloat(scrn.height - scaledheight);
    sctx.drawImage(this.sprite, this.x, this.y,scaledwidth,scaledheight);
  },
  update: function () {
    let scaledwidth = this.sprite.width * scaledX;
    if (state.curr != state.Play) return;
    this.x -= dx;
    this.x = this.x % (scaledwidth / 2);
  },
};
const bg = {
  sprite: new Image(),
  x: 0,
  y: 0,
  draw: function () {
    let scaledheight = this.sprite.height * scaledY;
    y = parseFloat(scrn.height - scaledheight - gnd.sprite.height*scaledY);
    sctx.drawImage(this.sprite, this.x, y,scrn.width, scrn.height);
  },
};
const pipe = {
  top: { sprite: new Image() },
  bot: { sprite: new Image() },
  gap: 85*scaledY,
  moved: true,
  pipes: [],
  draw: function () {
    for (let i = 0; i < this.pipes.length; i++) {
      let p = this.pipes[i];
      sctx.drawImage(this.top.sprite, p.x, p.y);
      sctx.drawImage(
        this.bot.sprite,
        p.x,
        p.y + parseFloat(this.top.sprite.height) + this.gap,
          this.bot.sprite.width,
          this.bot.sprite.height
      );
    }
  },
  update: function () {
    if (state.curr != state.Play) return;

    if (frames % (100-parseInt(dx*3)) == 0) {
      console.log(frames,dx)
      this.pipes.push({
        x: parseFloat(scrn.width),
        y: -210 * Math.min(Math.random() + 1, 1.8),
      });
    }
    this.pipes.forEach((pipe) => {
      pipe.x -= dx;
    });

    if (this.pipes.length && this.pipes[0].x < -this.top.sprite.width) {
      this.pipes.shift();
      this.moved = true;
    }
  },
};
const bird = {
  animations: [
    { sprite: new Image() },
    { sprite: new Image() },
    { sprite: new Image() },
    { sprite: new Image() },
  ],
  rotatation: 0,
  x: 50,
  y: 100,
  speed: 0,
  gravity: 0.125,
  thrust: 3.6,
  frame: 0,
  draw: function () {
    let h = this.animations[this.frame].sprite.height;
    let w = this.animations[this.frame].sprite.width;
    sctx.save();
    sctx.translate(this.x, this.y);
    sctx.rotate(this.rotatation * RAD);
    sctx.drawImage(this.animations[this.frame].sprite, -w / 2, -h / 2);
    sctx.restore();
  },
  update: function () {
    let r = parseFloat(this.animations[0].sprite.width) / 2;
    switch (state.curr) {
      case state.getReady:
        this.rotatation = 0;
        this.y += frames % 10 == 0 ? Math.sin(frames * RAD) : 0;
        this.frame += frames % 10 == 0 ? 1 : 0;
        break;
      case state.Play:
        this.frame += frames % 5 == 0 ? 1 : 0;
        this.y += this.speed;
        this.setRotation();
        this.speed += this.gravity;
        if (this.y + r >= gnd.y || this.collisioned()) {
          state.curr = state.record;
        }

        break;
      case state.record:
        let time = new Date();
        timestamp = time.toLocaleString();
        if(ranking[0].score < UI.score.curr){
          $.ajax({
            type: "get",
            url: url,
            dataType: "json",
            data:{
              "winner" : "winner"
            },
            success: function(response) {
              console.log("winner:", response);
              // 여기에서 랭킹 정보를 처리합니다.
            },
            error: function(request, status, error) {
              console.log(request)
              console.log("code:" + request.status + "\n" + "error:" + error);
              console.log("winner");
            }
          });
        }
        $.ajax({
          type: "get",
          url: url,
          dataType: "json",
          data:{
            "Timestamp": timestamp,
            "name":playerName,
            "phonenumber":playerPhone,
            "gender":checkedRadioButton.value,
            "score":UI.score.curr

          },
          success: function(response) {
            ranking = response;
            console.log("랭킹 정보:", response);
            // 여기에서 랭킹 정보를 처리합니다.
          },
          error: function(request, status, error) {
            console.log(request)
            console.log("code:" + request.status + "\n" + "error:" + error);
            console.log("rank");
          }
        });
        state.curr = state.gameOver;
      case state.gameOver:
        dx = 2;
        this.frame = 1;
        if (this.y + r < gnd.y) {
          this.y += this.speed;
          this.setRotation();
          this.speed += this.gravity * 2;
        } else {

          this.speed = 0;
          this.y = gnd.y - r;
          this.rotatation = 90;
          if (!SFX.played) {
            SFX.die.play();
            // SFX.die.play();
            SFX.played = true;
          }
        }



        break;
    }
    this.frame = this.frame % this.animations.length;
  },
  flap: function () {
    if (this.y > 0) {
      SFX.flap.play();
      this.speed = -this.thrust;
    }
  },
  setRotation: function () {
    if (this.speed <= 0) {
      this.rotatation = Math.max(-25, (-25 * this.speed) / (-1 * this.thrust));
    } else if (this.speed > 0) {
      this.rotatation = Math.min(90, (90 * this.speed) / (this.thrust * 2));
    }
  },
  collisioned: function () {
    if (!pipe.pipes.length) return;
    let bird = this.animations[0].sprite;
    let x = pipe.pipes[0].x;
    let y = pipe.pipes[0].y;
    let r = bird.height / 4 + bird.width / 4;
    let roof = y + parseFloat(pipe.top.sprite.height);
    let floor = roof + pipe.gap;
    let w = parseFloat(pipe.top.sprite.width);
    if (this.x + r >= x) {
      if (this.x + r < x + w) {
        if (this.y - r <= roof || this.y + r >= floor) {
          SFX.hit.play();
          return true;
        }
      } else if (pipe.moved) {
        UI.score.curr++;
        if(UI.score.curr % 5 == 0){
          // (frames % (100-parseInt(dx*3)
          frames = frames % (100-parseInt(dx*3));
          dx +=1;
          if( dx >= 12){
            dx = 12;
          }
          pipe.gap = (85-dx*2)*scaledY;
          // console.log(pipe.gap);

        }
        SFX.score.play();
        pipe.moved = false;
      }
    }
  },
};
const UI = {
  getReady: { sprite: new Image() },
  gameOver: { sprite: new Image() },
  tap: [{ sprite: new Image() }, { sprite: new Image() }],
  score: {
    curr: 0,
    best: 0,
  },
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  frame: 0,
  draw: function () {
    switch (state.curr) {
      case state.getReady:
        this.y = parseFloat(scrn.height - this.getReady.sprite.height) / 2;
        this.x = parseFloat(scrn.width - this.getReady.sprite.width) / 2;
        this.tx = parseFloat(scrn.width - this.tap[0].sprite.width) / 2;
        this.ty =
          this.y + this.getReady.sprite.height - this.tap[0].sprite.height;
        sctx.drawImage(this.getReady.sprite, this.x, this.y,);
        sctx.drawImage(this.tap[this.frame].sprite, this.tx, this.ty);
        break;
      case state.gameOver:
        this.y = parseFloat(scrn.height - this.gameOver.sprite.height) / 4;
        this.x = parseFloat(scrn.width - this.gameOver.sprite.width) / 2;
        this.tx = parseFloat(scrn.width - this.tap[0].sprite.width) / 2;
        this.ty =
          this.y + this.gameOver.sprite.height - this.tap[0].sprite.height;
        sctx.drawImage(this.gameOver.sprite, this.x, this.y);
        sctx.drawImage(this.tap[this.frame].sprite, this.tx, this.ty);

        sctx.fillStyle = "#FFFFFF";
        sctx.font = "20px Squada One";
        break;
    }
    this.drawScore();
  },
  drawScore: function () {
    sctx.fillStyle = "#FFFFFF";
    sctx.strokeStyle = "#000000";
    switch (state.curr) {
      case state.Play:
        sctx.lineWidth = "2";
        sctx.font = "35px Squada One";
        sctx.fillText(this.score.curr, scrn.width / 2 - 5, 50);
        sctx.strokeText(this.score.curr, scrn.width / 2 - 5, 50);
        sctx.font = "35px Squada One";
        sctx.fillStyle = "yellow";
        const str = "1st : " + ranking[0].score;
        sctx.fillText(str, scrn.width / 2 + 40, 50);
        sctx.strokeText(str, scrn.width / 2 + 40, 50);
        break;
      case state.gameOver:
        sctx.lineWidth = "2";
        sctx.font = "40px Squada One";
        let sc = `SCORE :     ${this.score.curr}`;
        try {
          this.score.best = Math.max(
            this.score.curr,
            localStorage.getItem("best")
          );
          localStorage.setItem("best", this.score.best);
          let bs = `BEST  :     ${this.score.best}`;
          sctx.fillText(sc, scrn.width / 2 - 80, scrn.height / 4 + this.gameOver.sprite.height/4);
          sctx.strokeText(sc, scrn.width / 2 - 80, scrn.height / 4 + this.gameOver.sprite.height/4);
          sctx.fillText(bs, scrn.width / 2 - 80, scrn.height / 4 + this.gameOver.sprite.height/4+ 30);
          sctx.strokeText(bs, scrn.width / 2 - 80, scrn.height / 4 + this.gameOver.sprite.height/4+ 30);
        } catch (e) {
          sctx.fillText(sc, scrn.width / 2 - 85, scrn.height / 4 + 15);
          sctx.strokeText(sc, scrn.width / 2 - 85, scrn.height / 4 + 15);
        }
        for( let i = 0; i < ranking.length; i++){
          var name = ranking[i].name;
          if (name.length > 2) {
            const firstChar = name.charAt(0);
            const lastChar = name.charAt(name.length - 1);
            const middlePart = '*'.repeat(name.length - 2);
            name = firstChar + middlePart + lastChar;
          } else if (name.length === 2) {
            name = name.charAt(0) + '*';
          }
          const rank = ranking[i].rank.toString().padStart(2,' ');
          name = name.padStart(10,' ');
          const score = ranking[i].score.toString().padStart(5,' ');

          sctx.fillText(rank, scrn.width / 2 - 100, scrn.height / 4 +this.tap[0].sprite.height+this.tap[1].sprite.height+ this.gameOver.sprite.height/4 + 30 + 35*(i+1));
          sctx.strokeText(rank, scrn.width / 2 - 100, scrn.height / 4 +this.tap[0].sprite.height+this.tap[1].sprite.height+ this.gameOver.sprite.height/4 + 30+ 35*(i+1));
          sctx.font = "100 35px 'Noto Sans KR'";
          sctx.fillText(name, scrn.width / 2 - 98, scrn.height / 4 +this.tap[0].sprite.height+this.tap[1].sprite.height+ this.gameOver.sprite.height/4 + 30 + 35*(i+1));
          sctx.font = "100 35px 'Noto Sans KR'";
          sctx.strokeText(name, scrn.width / 2 - 98, scrn.height / 4 +this.tap[0].sprite.height+this.tap[1].sprite.height+ this.gameOver.sprite.height/4 + 30+ 35*(i+1));
          sctx.font = "40px Squada One";
          sctx.fillText(score, scrn.width / 2 + 50, scrn.height / 4 +this.tap[0].sprite.height+this.tap[1].sprite.height+ this.gameOver.sprite.height/4 + 30 + 35*(i+1));
          sctx.strokeText(score, scrn.width / 2 + 50, scrn.height / 4 +this.tap[0].sprite.height+this.tap[1].sprite.height+ this.gameOver.sprite.height/4 + 30+ 35*(i+1));
        }

        break;
    }
  },
  update: function () {
    if (state.curr == state.Play) return;
    this.frame += frames % 10 == 0 ? 1 : 0;
    // console.log(this.frame,this.tap.length);
    this.frame = this.frame % this.tap.length;
  },
};

gnd.sprite.src = "./img/ground.png";
bg.sprite.src = "./img/BG.png";
pipe.top.sprite.src = "./img/toppipe.png";
pipe.bot.sprite.src = "./img/botpipe.png";
UI.gameOver.sprite.src = "./img/go.png";
UI.getReady.sprite.src = "./img/getready.png";
UI.tap[0].sprite.src = "./img/tap/t0.png";
UI.tap[1].sprite.src = "./img/tap/t1.png";
bird.animations[0].sprite.src = "./img/bird/female/b0.png";
bird.animations[1].sprite.src = "./img/bird/female/b1.png";
bird.animations[2].sprite.src = "./img/bird/female/b2.png";
bird.animations[3].sprite.src = "./img/bird/female/b0.png";
SFX.start.src = "./sfx/start.wav";
SFX.flap.src = "./sfx/flap.wav";
SFX.score.src = "./sfx/score.wav";
SFX.hit.src = "./sfx/hit.wav";
SFX.die.src = "./sfx/die.wav";

function gameLoop() {
  update();
  draw();
  frames++;
}

// 초기 상태 설정
state.curr = state.infoInput;

var playerName;
var playerPhone;
var checkedRadioButton;
var ranking;

// 게임 시작 버튼 클릭 시 상태 변경
startGameButton.addEventListener("click", () => {
  if (state.curr === state.infoInput) {
    // 개인 정보 입력 상태에서 게임 시작 버튼 클릭
    // 여기서 개인 정보를 가져와서 처리할 수 있습니다.
    playerName = nameInput.value;
    playerPhone = phoneInput.value;
    checkedRadioButton = Array.from(radioButtons).find(function(radioButton) {
      return radioButton.checked;
    });

    const phonePattern = /^\d{11}$/;
    const namePattern = /^[가-힣]{2,}$/; // 한글 이름을 기준으로 함. 다른 언어에 맞게 수정 가능


    if (!playerName || !playerPhone ) {
      // 개인 정보가 모두 입력되지 않은 경우에 경고 메시지 표시
      alert("모든 개인 정보를 입력해야 합니다.");
      return; // state 변경을 중단하고 함수를 종료
    }else if (!phonePattern.test(playerPhone)) {
      // 전화번호가 11자리가 아닌 경우에 경고 메시지 표시
      alert("전화번호는 11자리여야 합니다.");
    } else if (!namePattern.test(playerName)) {
      // 이름이 두 글자 이상이 아닌 경우에 경고 메시지 표시
      alert("이름은 두 글자 이상이어야 합니다.");
    } else {

      // 게임 상태를 게임 플레이 상태로 변경
      state.curr = state.getReady;

      // 블러 처리된 정보 입력 폼 숨기기
      infoForm.style.display = "none";

      $.ajax({
        type: "get",
        url: url,
        dataType: "json",
        success: function (response){
          ranking = response;
        },
        error: function(request, status, error) {
          console.log("code:" + request.status + "\n" + "error:" + error);
          console.log("load rank");
        }
      });



    }
  }
});

// 개인 정보 입력 상태에서 화면 업데이트
function updateInfoInput() {
  if (state.curr === state.infoInput) {
    infoForm.style.display = "flex";
  } else {
    infoForm.style.display = "none";
  }
}

function update() {
  bird.update();
  gnd.update();
  pipe.update();
  UI.update();
  updateInfoInput(); // 개인 정보 입력 상태 업데이트
}

function draw() {
  sctx.fillStyle = "#30c0df";
  sctx.fillRect(0, 0, scrn.width, scrn.height);
  bg.draw();
  pipe.draw();

  bird.draw();
  gnd.draw();
  UI.draw();
}

document.getElementById("male").addEventListener("change", function() {
  document.getElementById("gender-img").src = "./img/bird/male/b0.png"; // 남성 이미지 경로
  bird.animations[0].sprite.src = "img/bird/male/b0.png";
  bird.animations[1].sprite.src = "img/bird/male/b1.png";
  bird.animations[2].sprite.src = "img/bird/male/b2.png";
  bird.animations[3].sprite.src = "img/bird/male/b0.png";
});

document.getElementById("female").addEventListener("change", function() {
  document.getElementById("gender-img").src = "./img/bird/female/b0.png"; // 여성 이미지 경로
  bird.animations[0].sprite.src = "img/bird/female/b0.png";
  bird.animations[1].sprite.src = "img/bird/female/b1.png";
  bird.animations[2].sprite.src = "img/bird/female/b2.png";
  bird.animations[3].sprite.src = "img/bird/female/b0.png";
});


setInterval(gameLoop, 20);
