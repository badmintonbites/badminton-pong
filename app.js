function playSound(audioId, volume=1, loop=false, fromBeginning=true, chance=1) {
    const audio = document.getElementById(audioId);
    if (!audio.paused) {
        // Do nothing if the audio is already playing
        return;
    }
    if (fromBeginning) {
        audio.currentTime = 0;
    }
    if (1 - Math.random() > chance) {
        return -1;
    }
    audio.loop = loop;
    audio.volume = volume;
    audio.play();
}

window.addEventListener('load', () => {

    let controller = new AbortController();
    const btnFullscreen = document.getElementById('fullscreen');
    const btnTwoPlayer = document.getElementById('twoPlayer');
    const btnNormal = document.getElementById('normalMode');
    const btnHard = document.getElementById('hardMode');
    const btnLinDan = document.getElementById('linDan');

    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1600;
    canvas.height = 800;

    //VARIABLES
    let startGame = false;
    let gameOver = false;
    let scorePlayerLeft = 0;
    let scorePlayerRight = 0;

    window.addEventListener("keydown", startingGame);
    window.addEventListener("touchstart", startingGame);

    function startingGame(e) {
        if (e.key === 'Enter') {
            if (!startGame) {
                pauseAndResetAllSounds();
                if (currentMode == MODE.LIN_DAN) {
                    playSound("officialThemeRemix", 0.34, true);
                } else if (currentMode == MODE.TWO_PLAYER) {
                    playSound("playOfTheDayMusic", 0.5, true);
                } else {
                    playSound("officialTheme", .25, true);
                }
            }
            resetNumHits();
            startGame = true;
        };
        if (gameOver && (e.key === 'Enter')) {
            restartGame();
        };
    };

    //MIDDLE LINE
    function middleLine() {
        // ctx.beginPath();
        // ctx.setLineDash([30, 40]);
        // ctx.moveTo(canvas.width / 2, 0);
        // ctx.lineTo(canvas.width / 2, canvas.height);
        // ctx.strokeStyle = "#fff";
        // ctx.stroke();
        // ctx.closePath();
    };

    //DISPLAY SCORE
    function score() {
        ctx.beginPath();
        ctx.font = "80px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(scorePlayerLeft, canvas.width / 2 - 100, 100);
        ctx.fillText(scorePlayerRight, canvas.width / 2 + 100, 100);
    };

    function incrementNumHits() {
        const currentPoint = scorePlayerLeft + scorePlayerRight;
        numHits[currentPoint]++;
    }

    function resetNumHits() {
        for (let i = 0; i < numHits.length; i++) {
            numHits[i] = 0;
        }
    }

    function getCurrentNumHits() {
        const currentPoint = scorePlayerLeft + scorePlayerRight;
        return numHits[currentPoint];
    }

    const modeText = {
        TWO_PLAYER: '2 Player Mode',
        NORMAL: 'Normal Mode',
        HARD: 'Hard Mode',
        LIN_DAN: 'Lin Dan Mode'
    };
    
    const pointsToWin = 3;
    const numHits = [];
    for (let i = 0; i < 2 * pointsToWin - 1; i++) {
        numHits.push(0);
    }
    //INFO START GAME
    function gameInfo() {
        ctx.font = "20px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        const currentPoint = scorePlayerLeft + scorePlayerRight;
        numHits.forEach((hits, index) => {
            if (index < currentPoint || hits > 0 || index == currentPoint && !gameOver) {
                ctx.fillText(hits, (index + 1) * canvas.width / (numHits.length + 1), canvas.height - 20);
            }
        });
        
        const theMode = modeText[currentMode];
        if (currentMode == MODE.LIN_DAN) {
            const linDanImg = document.getElementById("linDanImg");
            ctx.drawImage(linDanImg, canvas.width / 2 - 50, canvas.height / 10 - 50, 100, 100);
        } else {
            ctx.fillText(theMode, canvas.width / 2, canvas.height / 10);
        }

        if (!startGame) {
            ctx.fillText("Press Enter to start.", canvas.width / 2, canvas.height * 2 / 10);
            ctx.fillText("Use 'k' and 'm' or up and down keys to move. First to 3 points wins.", canvas.width / 2, canvas.height * 3 / 10);
            ctx.fillText("If in 2 player mode, the left player uses 'a' and 'z' to move.", canvas.width / 2, canvas.height * 4 / 10);
            ctx.fillText("Turn the sound UP!!", canvas.width / 2, canvas.height * 6 / 10);
            ctx.fillText("And lastly, play in full screen mode :)", canvas.width / 2, canvas.height * 7 / 10);
        } else if (gameOver) {
            ctx.fillText("Press Enter to Play Again", canvas.width / 2, canvas.height / 1.6);
            ctx.font = "50px Arial";
            if (scorePlayerLeft === pointsToWin) {
                if (currentMode == MODE.TWO_PLAYER) {
                    ctx.fillText("The Left Player Wins!", canvas.width / 2, canvas.height * 3 / 10);
                } else {
                    ctx.fillText("You Lose!", canvas.width / 2, canvas.height * 3 / 10);
                }
            } else if (scorePlayerRight === pointsToWin) {
                if (currentMode == MODE.TWO_PLAYER) {
                    ctx.fillText("The Right Player Wins!", canvas.width / 2, canvas.height * 3 / 10);
                } else {
                    ctx.fillText("You Win!", canvas.width / 2, canvas.height * 3 / 10);
                }
                if (currentMode == MODE.LIN_DAN) {
                    playSound("beatLinDan");
                }
            };

            if (currentMode != MODE.LIN_DAN && (scorePlayerLeft === pointsToWin && scorePlayerRight === (pointsToWin - 1) || scorePlayerRight === pointsToWin && scorePlayerLeft == pointsToWin - 1)) {
                playSound("luckOfTheNetCaught");
            }
        };
    };

    //BACKGROUND
    class Background {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.width = canvas.width;
            this.height = canvas.height;
        };
        draw() {
            ctx.beginPath();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 5;
            ctx.setLineDash([]);
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.stroke();
            ctx.closePath();
        };
    };

    //PADDLE PARENT CLASS
    class Paddle {
        constructor(x) {
            this.width = 50;
            this.height = 200;
            this.x = x;
            this.y = canvas.height / 2 - this.height / 2;
            this.moveUp = false;
            this.moveDown = false;
            this.speed = 5;
            this.keys = [];
        }
        update() {
            // KEYBOARD MOVEMENT
            if (this.keys.includes("a")) {
                leftPaddle.y -= this.speed;
                if (currentMode != MODE.TWO_PLAYER) {
                    removeItemAll(this.keys, "a");
                }
            } else if (this.keys.includes("z")) {
                leftPaddle.y += this.speed;
                if (currentMode != MODE.TWO_PLAYER) {
                    removeItemAll(this.keys, "z");
                }
            } else if (this.keys.includes("ArrowUp") || this.keys.includes("k")) {
                rightPaddle.y -= this.speed;
            } else if (this.keys.includes("ArrowDown") || this.keys.includes("m")) {
                rightPaddle.y += this.speed;
            };

            //OUT OF BOUNDS
            if (this.y < 0) this.y = 0;       
            else if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
        };
        draw() {
            const image = document.getElementById("racket");
            ctx.drawImage(image, this.x, this.y, this.width, this.height);
        };
        getMidY() {
            return this.y + this.height / 2;
        }
    };

    //PADDLE CHILD CLASSES
    class LeftPaddle extends Paddle {
        constructor() {
            super(50);
            if (currentMode == MODE.LIN_DAN) {
                this.height = 400;
            } else if (currentMode == MODE.HARD) {
                this.height = 300;
            } else {
                this.height = 200;
            }

            if (currentMode == MODE.TWO_PLAYER) {
                document.addEventListener("keydown", e => {
                    if ((e.key === "a" ||
                        e.key === "z") && !this.keys.includes(e.key)) {
                        this.keys.push(e.key);
                    }
                }, { signal: controller.signal });
                document.addEventListener("keyup", e => {
                    if (e.key === "a" ||
                        e.key === "z") {
                        this.keys.splice(this.keys.indexOf(e.key), 1);
                    }
                }, { signal: controller.signal });
            }
        };
        moveUpwards() {
            this.keys.push('a');
        }
        moveDownwards() {
            this.keys.push('z');
        }
        reset() {
            this.y = canvas.height / 2 - this.height / 2;
        };
    };

    class RightPaddle extends Paddle {
        constructor() {
            super(canvas.width - 50 - 20);
            this.isTouching = false;
            this.touchY = '';
            document.addEventListener("keydown", e => {
                if ((e.key === "ArrowUp" ||
                    e.key === "ArrowDown" || e.key === "k" || e.key === "m") && !this.keys.includes(e.key)) {
                    this.keys.push(e.key);
                }
            }, { signal: controller.signal });
            document.addEventListener("keyup", e => {
                if (e.key === "ArrowUp" ||
                    e.key === "ArrowDown" || e.key === "k" || e.key === "m") {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            }, { signal: controller.signal });
        };
        reset() {
            this.y = canvas.height / 2 - this.height / 2;
        };
    };

    const startingVelocity = 12;
    const additionalVelocity = 0.3;
    class Ball {
        constructor() {
            this.radius = 15;
            this.x = canvas.width / 2 - this.radius / 2 + 5;
            this.y = canvas.height / 2 - this.radius / 2 + 4;
            this.dx = Math.floor(Math.random() * 2) === 0 ? 5 : -5;
            this.dy = Math.floor(Math.random() * 2) === 0 ? 5 : -5;
            this.velocity = startingVelocity;
        }
        update(deltaTime) {
            if (startGame) {
                const speedModifier = 12;
                this.x += this.dx * (deltaTime / speedModifier);
                this.y += this.dy * (deltaTime / speedModifier);
            };

            //COLLISION WALL
            if (this.y + this.radius > canvas.height) {
                this.dy *= -1;
                this.y = canvas.height - this.radius;
            } else if (this.y - this.radius < 0) {
                this.dy *= -1;
                this.y = this.radius;
            };

            //COLLISION RIGHT PADDLE
            if (this.x + this.radius > rightPaddle.x &&
                this.y + this.radius > rightPaddle.y &&
                this.y - this.radius < rightPaddle.y + rightPaddle.height &&
                this.x + this.radius < rightPaddle.x + rightPaddle.width) {

                this.velocity += additionalVelocity;

                //CALCUL ANGLE COLLISION PADDLE RIGHT
                let collidePoint = this.y - (rightPaddle.y + rightPaddle.height / 2);
                collidePoint = collidePoint / (rightPaddle.height / 2);
                let angle = (collidePoint * Math.PI) / 3;

                //CHANGE BALL DIRECTION 
                this.dx = -this.velocity * Math.cos(angle);
                this.dy = this.velocity * Math.sin(angle);

                //UPDATE BALL POSITION
                this.x = rightPaddle.x - this.radius;
                playSound("smash");
                playCommentatingSound();
                incrementNumHits();
            }

            //COLLISION LEFT PADDLE
            else if (this.x - this.radius < leftPaddle.x + leftPaddle.width &&
                this.y + this.radius > leftPaddle.y &&
                this.y - this.radius < leftPaddle.y + leftPaddle.height &&
                this.x - this.radius > leftPaddle.x) {

                this.velocity += additionalVelocity;

                //CALCUL ANGLE COLLISION PADDLE LEFT
                let collidePoint = this.y - (leftPaddle.y + leftPaddle.height / 2);
                collidePoint = collidePoint / (leftPaddle.height / 2);
                let angle = (collidePoint * Math.PI) / 3;

                //CHANGE BALL DIRECTION
                this.dx = this.velocity * Math.cos(angle);
                this.dy = this.velocity * Math.sin(angle);

                //UPDATE BALL POSITION
                this.x = leftPaddle.x + leftPaddle.width + this.radius;
                playSound("smash");
                playCommentatingSound();
                incrementNumHits();
            };

            //SCORE
            if (this.x < 0) {
                const numHits = getCurrentNumHits();
                scorePlayerRight++;
                if (scorePlayerRight == pointsToWin - 1 && numHits > 30) {
                    playSound("whatAWayToBringUpGamePointOpportunity");
                }
                this.reset();
            } else if (this.x + this.radius > canvas.width) {
                const numHits = getCurrentNumHits();
                scorePlayerLeft++;
                if (scorePlayerLeft == pointsToWin - 1 && numHits > 30) {
                    playSound("whatAWayToBringUpGamePointOpportunity");
                }
                this.reset();
            };

            //GAME OVER
            if (scorePlayerLeft === pointsToWin || scorePlayerRight === pointsToWin) gameOver = true;
        };
        draw() {
            const image = document.getElementById("birdie");
            const imgHeight = 30;
            const imgWidth = 30;

            let offset = 0; // in radians
            if (this.dx > 0 && this.dy > 0) {
                offset = 3.92699; // 225 degrees
            } else if (this.dx > 0 && this.dy < 0) {
                offset = 3.92699; // 225 degrees
            } else if (this.dx < 0 && this.dy < 0) {
                offset = 0.785398; // 45 degrees
            } else if (this.dx < 0 && this.dy > 0) {
                offset = 0.785398; // 45 degrees
            }

            let angle = -Math.atan(this.y / this.x) + Math.atan(this.dy / this.dx) + offset;

            rotateAndPaintImage ( ctx, image, angle, this.x, this.y, 0, 0, 30, 30);
            // ctx.fillStyle = "red";
            // const squareSize = this.radius;
            // ctx.fillRect(this.x - squareSize/2,this.y - squareSize/2,squareSize,squareSize); // fill in the pixel at (10,10)
        };
        reset() {
            this.x = canvas.width / 2 - this.radius / 2 + 5;
            this.y = canvas.height / 2 - this.radius / 2;
            this.dx = Math.floor(Math.random() * 2) === 0 ? 5 : -5;
            this.dy = Math.floor(Math.random() * 2) === 0 ? 5 : -5;
            this.velocity = startingVelocity;
        };
        getX() {
            return this.x;
        }
        getY() {
            return this.y;
        }
    };

    const MODE = {
        TWO_PLAYER: 'TWO_PLAYER',
        NORMAL: 'NORMAL',
        HARD: 'HARD',
        LIN_DAN: 'LIN_DAN'
    };
    let currentMode = MODE.NORMAL;
    let leftPaddle = new LeftPaddle();
    let rightPaddle = new RightPaddle();
    const ball = new Ball();
    const background = new Background();

    function changeMode(mode=MODE.NORMAL) {
        if (currentMode == mode) {
            return;
        }
        controller.abort(); // remove all necessary event listeners first
        controller = new AbortController();
        currentMode = mode;
        leftPaddle = new LeftPaddle();
        rightPaddle = new RightPaddle();
        gameOver = true;
        restartGame();
    }

    function removeItemAll(arr, value) {
        var i = 0;
        while (i < arr.length) {
          if (arr[i] === value) {
            arr.splice(i, 1);
          } else {
            ++i;
          }
        }
        return arr;
      }

    // From https://stackoverflow.com/questions/3793397/html5-canvas-drawimage-with-at-an-angle
    function rotateAndPaintImage ( context, image, angleInRad , positionX, positionY, axisX, axisY, imgWidth, imgHeight ) {
        context.translate( positionX, positionY );
        context.rotate( angleInRad );
        context.drawImage( image, -imgWidth/2, -imgHeight/2, imgWidth, imgHeight);
        context.rotate( -angleInRad );
        context.translate( -positionX, -positionY );
    }

    function restartGame() {
        playIntroSong();
        pauseAndResetAllSounds("BWFIntroSong");
        scorePlayerLeft = 0;
        scorePlayerRight = 0;
        gameOver = false;
        startGame = false;
        rightPaddle.reset();
        leftPaddle.reset();
        resetNumHits();
        ball.reset();
        gameLoop(undefined, currentMode);
    };

    function update(deltaTime) {
        rightPaddle.update();
        leftPaddle.update();
        if (currentMode == MODE.NORMAL || currentMode == MODE.HARD || currentMode == MODE.LIN_DAN) {
            updateLeftPaddle(deltaTime);
        }
        ball.update(deltaTime);
    };

    function draw() {
        gameInfo();
        background.draw();
        rightPaddle.draw();
        leftPaddle.draw();
        ball.draw();
        middleLine();
        score();
    }

    function updateLeftPaddle(deltaTime) {
        if (ball.getY() > leftPaddle.getMidY() - 10 && ball.getY() < leftPaddle.getMidY() + 10) {
            return;
        }
        if (ball.getY() < leftPaddle.getMidY()) {
            leftPaddle.moveUpwards();
        } else if (ball.getY() > leftPaddle.getMidY()) {
            leftPaddle.moveDownwards();
        }
    }

    //FULLSCREEN
    function fullscreen() {
        const body = document.querySelector("#body");
        requestFullScreen(body);
    };

    function requestFullScreen(element) {
        // Supports most browsers and their versions.
        var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
    
        if (requestMethod) { // Native full screen.
            requestMethod.call(element);
        } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
            }
        }
    }

    btnFullscreen.addEventListener('click', fullscreen);
    btnTwoPlayer.addEventListener('click', () => changeMode(MODE.TWO_PLAYER));
    btnNormal.addEventListener('click', () => changeMode());
    btnHard.addEventListener('click', () => changeMode(MODE.HARD));
    linDan.addEventListener('click', () => changeMode(MODE.LIN_DAN));

    let lastTime = 0;
    function gameLoop(timeStamp, mode) {
        let deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        update(deltaTime);
        draw();

        if (!gameOver && mode == currentMode) requestAnimationFrame((ts) => gameLoop(ts, mode));
    }

    const commentatingSounds = ["unbelievable", "thisIsExtraordinary", "whatARally", "ohMyGoodness", "fabulous", "howOnEarthDidTheySaveThat", "ohMyGoodnessAndShesGotItBack", "ohMyGoodnessHesFallenOver", "sensational", "super", "thatsGotToBeThePlayOfTheDay", "heartAndSouldGoingIntoThatSmash", "ohBetweenTheLegs", "ohHowQuickWasThat"];
    const commentatingTimeOut = 5000; // in milliseconds
    let lastCommentatedTime = null;
    function playCommentatingSound() {
        if (getCurrentNumHits() < 10) {
            return;
        }
        const currentTime = Date.now();
        if (lastCommentatedTime && currentTime - lastCommentatedTime < commentatingTimeOut) {
            return;
        }
        const randomIndex = getRandomInt(commentatingSounds.length);
        const audioId = commentatingSounds[randomIndex];
        const exitCode = playSound(audioId, 1, false, true, .2);
        if (exitCode != -1) {
            lastCommentatedTime = Date.now();
        }
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }



    const sounds = commentatingSounds.concat(["smash", "playOfTheDayMusic", "officialTheme", "officialThemeRemix", "beatLinDan", "BWFIntroSong", "whatAWayToBringUpGamePointOpportunity"]);
    function pauseAndResetAllSounds(exceptions=[]) {
        sounds.forEach((audioId) => {
            const audio = document.getElementById(audioId);
            if (audio && !exceptions.includes(audioId)) {
                audio.pause();
                audio.currentTime = 0;
            }
        })
    }

    gameLoop(0, currentMode);
    
});
function playIntroSong() {
    playSound("BWFIntroSong");
    window.removeEventListener('click', playIntroSong);
}
window.addEventListener('click', playIntroSong);