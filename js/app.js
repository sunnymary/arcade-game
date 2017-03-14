//set basic unit for canvas. colW-column width, rowH - row height
var colW = 101;
var rowH = 83;
//get life count and score count from HTML
var lifeCount = document.getElementById("life-count");
var numLife = Number(lifeCount.textContent);
var scoreCount = document.getElementById("score-count");
var numScore = Number(scoreCount.textContent);
var scoreUp = new Audio("sounds/coin.wav");
var collision = new Audio("sounds/collision.wav")

// Enemies our player must avoid
var Enemy = function(x, y) {
    // Variables applied to each of our instances
    // The image/sprite for our enemies
    this.sprite = 'images/enemy-bug.png';

    //set the initial location(take params)
    this.x = x;
    this.y = y;

    // Set the initial speed
    // Randomly choose an integer between 50,100,150,200,250,300,350,400
    var randomSpeed = (Math.floor((Math.random() * 8) + 1)) * 50;
    this.speed = randomSpeed;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // Update location
    // Multiply any movement by the dt parameter
    // to ensure the game runs at the same speed for all computers.
    this.x += dt * this.speed;
    resetEnemies();
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    // The image/sprite for our player
    this.sprite = 'images/char-boy.png';
    //set the initial location
    this.x = colW*2;
    this.y = rowH*5-25;
};

Player.prototype.reset = function() {
    this.x = colW*2;
    this.y = rowH*5-25;
};

Player.prototype.update = function() {
    //reach the water, score up and back to start place
    if(this.y < rowH-25) {
        //coin collect sound
        scoreUp.play();
        //score up
        numScore += 100;
        scoreCount.textContent = numScore.toString();
        //player back to start place
        this.reset();
    }
    //handle collision
    this.checkCollision();
};

Player.prototype.checkCollision = function(){
    for (var i = 0; i < allEnemies.length; i++) {
        if(this.y === allEnemies[i].y && this.x >= allEnemies[i].x - 50 && this.x < allEnemies[i].x + 50) {
            //collision sound
            collision.play();
            //player go back to original start place
            this.reset();
            //lose one life
            numLife -= 1;
            lifeCount.textContent = numLife.toString();
            //check if loose all the life
            if(numLife <= 0) {
                stopGame();
            }
        }
    }
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

console.log("A");

Player.prototype.handleInput = function(key) {
    //move left - one colW per move
    if(key === "left") {
        this.x -= colW;
        console.log(this.x);
        //keep inside left boundary
        if(this.x < 0) {
            this.x += colW;
        }
    //move right - one colW per move
    } else if(key === "right") {
        this.x += colW;
        //keep inside right boundary
        if(this.x > 4*colW) {
            this.x -= colW;
        }
    //move up - one rowH per move
    } else if(key === "up") {
        this.y -= rowH;
        //keep inside upper boundary
        if(this.y < -25) {
            this.y += rowH;
        }
    //move down -  one rowH per move
    } else if(key === "down") {
        this.y += rowH;
        //keep inside lower boundary
        if(this.y > 5*rowH-25) {
            this.y -= rowH;
        }
    }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];

//function to make enemys with random X coordinate(-499 to 0)
function generateRandomX() {
    //set randow X position (-700 to -101)
    var randomX = Math.floor((Math.random() * 500))-600;
    return randomX;
}

//generate random Y coordinate(choose from 3 rows)
function generateRandomY() {
    //set Y position choice for enemys(on the rows)
    var YArray  =[rowH-25, 2*rowH-25, 3*rowH-25];
    //choose random number from 0,1,2
    var randomYIndex = Math.floor((Math.random() * 3));
    //randomly choose Y from YArray
    var randomY = YArray[randomYIndex];
    return randomY;
}

function makeEnemies(n){
    for (var i = 0; i < n; i++) {
        //generate random X and Y
        var randomX = generateRandomX();
        var randomY = generateRandomY();
        //create a new instance of Enemy(bug) by assign random X and Y to it
        var bug = new Enemy(randomX, randomY);
        allEnemies.push(bug);
    }
    return allEnemies;
};

function resetEnemies(){
    allEnemies.forEach(function(bug){
        //generate random X and Y
        var randomX = generateRandomX();
        var randomY = generateRandomY();
        //when the enemy runs out of right boundary, reset enemy loc
        if(bug.x > 5 * colW) {
            bug.x = randomX;
            bug.y = randomY;
        }
    });
}

function clearEnemies() {
    if(allEnemies) {
        allEnemies = [];
    }
}


// Place the player object in a variable called player
var player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
var keyListener = function(e) {
    var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        //e.keyCode: 37/38/39/40
        //possible INPUT - allowedKeys[e.keyCode]:"left"/"up"/"right"/"down"
        player.handleInput(allowedKeys[e.keyCode]);
}

function enableKeys(){
    document.addEventListener('keyup', keyListener);
}

function disableKeys(){
    document.removeEventListener('keyup', keyListener);
}

function startGame(){
    //set player into original place
    player.reset();
    //reset life to 5
    numLife = 5;
    lifeCount.textContent = numLife.toString();
    //reset score to 0
    numScore = 0;
    scoreCount.textContent = numScore.toString();

    //enable keys to move player
    enableKeys();
    //clear the enemies
    clearEnemies();
    //create 5 enemies
    makeEnemies(5);
    //change the start button context
    startButton.textContent = "restart";
    pauseButton.textContent = "pause";
}

function pauseOrContinueGame(){
    //"pause button" setting
    if(pauseButton.textContent === "pause") {
        //1. STORE speed
        //clear original store speedArray
        //and store all the speed for bugs in an array
        speedArray = [];
        allEnemies.forEach(function(bug){
            speedArray.push(bug.speed);
        });

        //2.stop the enemy: set the speed to 0
        allEnemies.forEach(function(bug){
            bug.speed = 0;
        });

        //3.disable the player's movement
        disableKeys();

        //4.change the button name to continue
        pauseButton.textContent = "continue";

    //"continue button" setting
    } else {
        //continue the enemy: assign the original speed
        for (var i = 0; i < allEnemies.length; i++) {
            allEnemies[i].speed = speedArray[i];
        }
        //enable the player's movement
        enableKeys();
        //change the button name to pause
        pauseButton.textContent = "pause";
    };
}

function stopGame() {
    //1.stop the enemy: set the speed to 0
    allEnemies.forEach(function(bug){
        bug.speed = 0;
    });

    //2.disable the player's movement
    disableKeys();

    //3.Game over notice
    alert("Game Over ... You final score is " + numScore + "! Click RESTART to play again");
}

//START/RESTART game
//1.set click event to start button
var startButton = document.getElementById("start");
startButton.addEventListener("click", startGame);

//2.add key event: press "enter" key to start
document.addEventListener("keyup",function(e){
    console.log(e.keyCode);
    if(e.keyCode === 13) {
        startGame();
    };
});


//PAUSE/CONTINUE game
//1.create a speed array to store speed info for bugs
var speedArray = [];

//2.set click event to pause button
var pauseButton = document.getElementById("pause");
pauseButton.addEventListener("click", pauseOrContinueGame);

//3.add key event: press "space" key to pause/continue
document.addEventListener("keyup",function(e){
    if(e.keyCode === 32) {
        pauseOrContinueGame();
    };
});