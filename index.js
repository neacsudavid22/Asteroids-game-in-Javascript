const gameArea = document.getElementById("game-area");
let bullets = [];
let asteroids = [];
const keys = {
    w: { pressed: false }, s: { pressed: false }, a: { pressed: false }, d: { pressed: false },
    n: { pressed: false }, m: { pressed: false },
    x: { pressed: false }
};

gameArea.style.background = "black";
gameArea.setAttribute("width", window.innerWidth);
gameArea.setAttribute("height", window.innerHeight + 100);

let score = 0;
const scoreDisplay = document.createElementNS("http://www.w3.org/2000/svg", "text");
scoreDisplay.setAttribute("fill", "white");
scoreDisplay.setAttribute("font-size", 30);
scoreDisplay.setAttribute("font-family", "Arial");
scoreDisplay.setAttribute("x", window.innerWidth / 20);
scoreDisplay.setAttribute("y", window.innerHeight / 10);
gameArea.appendChild(scoreDisplay);

const scoreInterval = setInterval( () => scoreDisplay.textContent = `Score: ${score}`, 100 );

const lifes = [];
for(let i = 0; i < 3; i++){
    const heart = document.createElementNS("http://www.w3.org/2000/svg", "text");
    heart.setAttribute("x", 15 + 15 * i * 2);
    heart.setAttribute("y", window.innerHeight - 30);
    heart.setAttribute("font-size", 25);

    heart.textContent = "💛";
    lifes.push(heart);
    gameArea.appendChild(lifes[i]);
}

function gameOver(){
    clearInterval(scoreInterval);
    const finalText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    finalText.setAttribute("fill", "white");
    finalText.setAttribute("font-size", 100);
    finalText.setAttribute("font-family", "Arial");
    finalText.setAttribute("x", window.innerWidth / 2);
    finalText.setAttribute("y", window.innerHeight * 0.45);
    finalText.setAttribute("text-anchor", "middle");
    finalText.setAttribute("baseline-direction", "middle");

    finalText.textContent = `GAME OVER!`;
    const finalScore = document.createElementNS("http://www.w3.org/2000/svg", "text");
    finalScore.setAttribute("fill", "white");
    finalScore.setAttribute("font-size", 40);
    finalScore.setAttribute("font-family", "Arial");
    finalScore.setAttribute("x", window.innerWidth / 2);
    finalScore.setAttribute("y", window.innerHeight * 0.55);
    finalScore.setAttribute("text-anchor", "middle");
    finalScore.setAttribute("baseline-direction", "middle"); 
    finalScore.textContent = `Your Score Was ${scoreDisplay.textContent}`;

    gameArea.appendChild(finalText);
    gameArea.appendChild(finalScore);
}

class Bullet{
    constructor({spaceShipPosition, spaceShipAngle}) {
        this.bullet = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.bullet.setAttribute("stroke", "lime");
        this.bullet.setAttribute("stroke-width", 4);

        this.angle = spaceShipAngle;
            
        this.position = {
            x1: spaceShipPosition.x + 30,
            y1: spaceShipPosition.y,
            x2: spaceShipPosition.x + 30, 
            y2: spaceShipPosition.y + 21
        };

        this.bullet.setAttribute('x1', this.position.x1);
        this.bullet.setAttribute('y1', this.position.y1);
        this.bullet.setAttribute('x2', this.position.x2);
        this.bullet.setAttribute('y2', this.position.y2);

        this.bullet.setAttribute("transform", `rotate(${this.angle},${this.position.x2}, ${this.position.y2})`);

        bullets.push(this);
        gameArea.appendChild(this.bullet);
        
        const moveBullet = () => {

            this.position.y1 -= 4;
            this.position.y2 -= 4;
    
            this.bullet.setAttribute("x1", this.position.x1);
            this.bullet.setAttribute("y1", this.position.y1);
            this.bullet.setAttribute("x2", this.position.x2);
            this.bullet.setAttribute("y2", this.position.y2);

            if (this.position.y2 < 0 && this.bullet.parentNode === gameArea) {
                gameArea.removeChild(this.bullet);
                bullets.splice(bullets.indexOf(this), 1); 
            } else {
                requestAnimationFrame(moveBullet);
            }
        }

        requestAnimationFrame(moveBullet);
    }

    getRealCoord(){
        const ctm = this.bullet.getScreenCTM();
        const bulletPoint = this.bullet.ownerSVGElement.createSVGPoint();
        bulletPoint.x = this.position.x1;
        bulletPoint.y = this.position.y1;
        const bulletPointModified = bulletPoint.matrixTransform(ctm);

        return bulletPointModified;
    }
}

class SpaceShip {
    constructor({ position, movement, color }) {
        this.active = true;
        this.lifes = 3;
        this.position = { x: position.x, y: position.y };
        this.angle = 0; 
        this.movement = { x: movement.x, y: movement.y };
        this.color = { stroke: color.stroke, fill: color.fill}
        this.spaceShip = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.initialize();
    }

    initialize() {
        this.spaceShipBody = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        this.spaceShipBody.setAttribute("points", "30,-15 10,40 50,40");
        //tip(30,-15); left(10,40); right(50,40)
        this.spaceShipBody.setAttribute("fill", this.color.fill);
        this.spaceShipBody.setAttribute("stroke", this.color.stroke);
        this.spaceShipBody.setAttribute("stroke-width", "5");

        this.fire = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        this.fire.setAttribute("points", "22,44 38,44 31,58");
        this.fire.setAttribute("fill", "yellow");
        this.fire.setAttribute("stroke", "red");
        this.fire.setAttribute("stroke-width", "3");

        this.rocketWindow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.rocketWindow.setAttribute("r", "10");
        this.rocketWindow.setAttribute("fill", "cyan");
        this.rocketWindow.setAttribute("cx", "30");
        this.rocketWindow.setAttribute("cy", "26");

        this.gun = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.gun.setAttribute("r", "4");
        this.gun.setAttribute("fill", "grey");
        this.gun.setAttribute("cx", "30");
        this.gun.setAttribute("cy", "15");

        this.spaceShip.appendChild(this.spaceShipBody);
        this.spaceShip.appendChild(this.fire);
        this.spaceShip.appendChild(this.gun);
        this.spaceShip.appendChild(this.rocketWindow);

        gameArea.appendChild(this.spaceShip);
 
        this.move();
        this.engineAnimation();
    }

    damagedAnimation(){
        return new Promise((resolve) => {
            setTimeout( () => {
                this.spaceShipBody.setAttribute("fill", "orange")
                this.spaceShipBody.setAttribute("stroke", "white")
            }, 100);
            setTimeout( () => {
                this.spaceShipBody.setAttribute("fill", "white")
                this.spaceShipBody.setAttribute("stroke", "orange")
                }, 200);
                setTimeout( () => {
                    this.spaceShipBody.setAttribute("fill", "orange")
                    this.spaceShipBody.setAttribute("stroke", "white")
                }, 300);
            setTimeout( () => {
                this.spaceShipBody.setAttribute("fill", "white")
                this.spaceShipBody.setAttribute("stroke", "orange")
                resolve()
                }, 400);
            }
        );
    }

    engineAnimation(){
        let isYellow = true; 

        setInterval(() => {
            this.fire.setAttribute("fill", isYellow ? "yellow": "orange");
            isYellow = !isYellow;
            this.fire.setAttribute("stroke-width", `${3 + Math.floor(Math.random() * 2)}`);
        }, 300);
    }

    shootBullet(){
        if (bullets.length < 3 && this.active) {
            new Bullet({ spaceShipPosition: this.position, spaceShipAngle: this.angle});
        }
    }

    move() {
        if(this.active){
            this.position.x += this.movement.x;
            this.position.y += this.movement.y;
            this.spaceShip.setAttribute("transform", 
                `translate(${this.position.x}, ${this.position.y}) rotate(${this.angle}, 30, 21)`);
        }
    }

    getSpaceShipPoints(){
        //"30,-15 10,40 50,40";
        if (!this.spaceShipBody.ownerSVGElement) 
            return [];

        const ctm = this.spaceShipBody.getScreenCTM();
        const tip = this.spaceShipBody.ownerSVGElement.createSVGPoint();
        tip.x = 30; 
        tip.y = -15;
        const tipFinal = tip.matrixTransform(ctm);

        const left = this.spaceShipBody.ownerSVGElement.createSVGPoint();
        left.x = 10;
        left.y = 40;
        const leftFinal = left.matrixTransform(ctm);

        const right = this.spaceShipBody.ownerSVGElement.createSVGPoint();
        right.x = 50;
        right.y = 40;
        const rightFinal = right.matrixTransform(ctm);

        return [tipFinal, leftFinal, rightFinal];
    }
}

const spaceShip = new SpaceShip({
    position: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    },
    movement: {
        x: 0,
        y: 0
    },
    color: {
        fill: "white",
        stroke: "orange"
    }
});

function updatePosition() {
    keys.w.pressed ? spaceShip.movement.y = -4 : keys.s.pressed ? spaceShip.movement.y = 4 : spaceShip.movement.y = 0;
    keys.a.pressed ? spaceShip.movement.x = -4 : keys.d.pressed ? spaceShip.movement.x = 4 : spaceShip.movement.x = 0;
    keys.n.pressed ? spaceShip.angle -= 3 : keys.m.pressed ? spaceShip.angle += 3 : spaceShip.angle += 0;
    spaceShip.move();
    requestAnimationFrame(updatePosition);
}

updatePosition();

class Asteroid {
    
    constructor({ position, level}) {
        const colors = ['green','orange','red','darkred'];
        this.position = {x: position.x, y: position.y};
        this.level = level;
        this.color = colors[level-1];
        this.speed = 5.5 - level + Math.random();
        this.radius = this.level * 20;
        this.drawAsteroidCircle();
    }

    drawAsteroidCircle() {

        this.asteroidCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        this.asteroidCircle.setAttribute("cx", 0);
        this.asteroidCircle.setAttribute("cy", 0);
        this.asteroidCircle.setAttribute("r", this.radius);
        this.asteroidCircle.setAttribute("stroke", "white");
        this.asteroidCircle.setAttribute("fill", `${this.color}`);
        this.asteroidCircle.setAttribute("stroke-width", "2");

        this.text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.text.setAttribute("fill", "white");
        this.text.setAttribute("font-size", `${this.level * 16}`);
        this.text.setAttribute("font-family", "Arial");
        this.text.setAttribute("text-anchor", "middle");
        this.text.setAttribute("alignment-baseline", "middle");
        this.text.textContent = `${this.level}`;

        this.asteroid = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.asteroid.appendChild(this.asteroidCircle);
        this.asteroid.appendChild(this.text);

        gameArea.appendChild(this.asteroid);
    }

    async move() {
        this.position.y += this.speed;
        this.asteroid.setAttribute("transform", `translate(${this.position.x}, ${this.position.y})`);
        
        const hit = () => {
            for (const bullet of bullets) {
                const coord = bullet.getRealCoord();
                const dx = coord.x - this.position.x;
                const dy = coord.y - this.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
        
                if (distance < this.radius) {
                    return bullet; // Collision detected
                }
            }
            return null; 
        };

        const bulletHit = hit();

        const hitSpaceShip = () => {
            const points = spaceShip.getSpaceShipPoints();

            for(let point of points){
                const dx = point.x - this.position.x;
                const dy = point.y - this.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if(distance < this.radius)
                    return true;
            }

            return false;
        }
        const spaceShipHit = hitSpaceShip();

        if(this.position.y >= 800 && this.asteroid.parentNode === gameArea){
            asteroids.splice(asteroids.indexOf(this), 1);
            gameArea.removeChild(this.asteroid);
        }
        else if(spaceShipHit && spaceShip.spaceShip.parentNode === gameArea && spaceShip.active){
            spaceShip.lifes--;
            gameArea.removeChild(lifes.pop());
            gameArea.removeChild(this.asteroid);

            if(!spaceShip.lifes){
                spaceShip.active = false;
                await spaceShip.damagedAnimation();
                await spaceShip.damagedAnimation();
                await spaceShip.damagedAnimation();
                gameArea.removeChild(spaceShip.spaceShip);
                stopSpawning();
                gameOver();
            }
            else{
                spaceShip.damagedAnimation();
            }
        }
        else if(bulletHit){
            gameArea.removeChild(this.asteroid);
            gameArea.removeChild(bulletHit.bullet);
            bullets.splice(bullets.indexOf(bulletHit), 1);
            if(this.level > 1){
                const asteroidTemp = new Asteroid({position: this.position, level: this.level - 1});
                asteroidTemp.move();
            }

            switch(this.level){
                case 1:
                    score += 10;
                    break;
                case 2:
                    score += 20;
                    break;
                case 3: 
                    score += 50;
                    break;

                case 4: 
                    score += 70;
                    break;
            }

            asteroids.splice(asteroids.indexOf(this), 1);
        }
        else requestAnimationFrame(() => this.move());
    }
}

let spawningIntervals = [];
function spawnAsteroids(){
    spawningIntervals.push(setInterval(() => {
        const asteroid = new Asteroid({
            position: { x: 100 + Math.random() * window.innerWidth, y: -100}, 
            level: 4
        });
        asteroids.push(asteroid);
        asteroid.move();
    }, 3000));
    
    spawningIntervals.push(setInterval(() => {
        const asteroid = new Asteroid({
            position: { x: 100 + Math.random() * window.innerWidth, y: -100}, 
            level: 3
        });        
        asteroids.push(asteroid);
        asteroid.move();
    }, 2000));
    
    spawningIntervals.push(setInterval(() => {
        const asteroid = new Asteroid({
            position: { x: 100 + Math.random() * window.innerWidth, y: -100}, 
            level: 2
        });    
        asteroids.push(asteroid);
        asteroid.move();
    }, 1500));
    
    setInterval((() => {
        const asteroid = new Asteroid({
            position: { x: 100 + Math.random() * window.innerWidth, y: -100}, 
            level: 1
        });
        asteroids.push(asteroid);
        asteroid.move();
    }, 1000));
}
function stopSpawning() {
    spawningIntervals.forEach(interval => clearInterval(interval));
    spawningIntervals = [];
}

spawnAsteroids();

document.addEventListener('keydown', (event)=>{
    switch(event.code){
        case "KeyW":
            keys.w.pressed = true;
            break;
        case "KeyS":
            keys.s.pressed = true;
            break;
        case "KeyA":
            keys.a.pressed = true;
            break;
        case "KeyD":
            keys.d.pressed = true;
            break;
        case "KeyN":
            keys.n.pressed = true;
            break;
        case "KeyM":
            keys.m.pressed = true;
            break;
        case "KeyX":
            spaceShip.shootBullet();
            break;
    }
});

document.addEventListener('keyup', (event)=>{
    switch(event.code){
        case "KeyW":
            keys.w.pressed = false;
            break;
        case "KeyS":
            keys.s.pressed = false;
            break;
        case "KeyA":
            keys.a.pressed = false;
            break;
        case "KeyD":
            keys.d.pressed = false;
            break;
        case "KeyN":
            keys.n.pressed = false;
            break;
        case "KeyM":
            keys.m.pressed = false;
            break;
    }
});