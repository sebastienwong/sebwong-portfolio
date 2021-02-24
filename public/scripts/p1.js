let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;
    Body = Matter.Body;
    Events = Matter.Events;

let engine;
let world;

let wallA;
let wallB;
let wallC;
let wallD;

let ball;
let ballID;
let hole;
let holeID;

let start = false;
let prevFreq = 0;
let prevVol = 0;
let peakVol = 0;

let curAngle = 0;

let aiming = false;
let moving = false;

let sunk = false;
let shrink = 0;

let a_dim;
let b_dim;
let c_dim;
let d_dim;

function audioStart() {
  start = true;
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  engine = Engine.create();
  world = engine.world;
  world.gravity.y = 0;

  a_dim = {
    w: width-15,
    h: 5
  }

  b_dim = {
    w: 5,
    h: height*0.75 - 20
  }

  c_dim = {
    w: width-15,
    h: 5
  }

  d_dim = {
    w: 5,
    h: height*0.75 - 20
  }

  wallA = Bodies.rectangle(width/2, 10, a_dim.w, a_dim.h, { isStatic: true });
  wallB = Bodies.rectangle(10, height/4 + height/8, b_dim.w, b_dim.h, { isStatic: true });
  wallC = Bodies.rectangle(width/2, height*0.75-10, c_dim.w, c_dim.h, { isStatic: true });
  wallD = Bodies.rectangle(width-10, height/4 + height/8, d_dim.w, d_dim.h, { isStatic: true});

  ball = Bodies.circle(width/2, height/2, 10, {restitution: 0.3});
  hole = Bodies.circle(width/2, height/6, 4, {isStatic: true, isSensor: true});

  ballID = ball.id;
  holeID = hole.id;

  World.add(world, ball);
  World.add(world, hole);

  World.add(world, [wallA, wallB, wallC, wallD]);

  Engine.run(engine);

  Events.on(engine, 'collisionStart', function(event) {
    var a = event.pairs[0].bodyA;
    var b = event.pairs[0].bodyB;
    
    if((a.id == ballID && b.id == holeID) || (a.id == holeID && b.id == ballID)) {
      sunk = true;
      Body.setPosition(ball, { x:width/2, y:height/2});
      Body.setVelocity(ball, {x: 0, y:0})
      shrink = 0;
    }
  });
}

function draw() {
  background(32, 133, 59);
  noStroke();

  push();
  translate(hole.position.x, hole.position.y);
  rotate(hole.angle);
  rectMode(CENTER);
  fill(10);
  circle(0, 0, 30);
  pop();

  if(sunk) {
    push();
    fill(map(shrink, 0, 20, 255, 0));
    circle(hole.position.x + random(-1,1), hole.position.y, 18);

    shrink += 1;

    if(shrink >= 20) {
      sunk = false;
    }
    pop();
  } else {
    push();
    translate(ball.position.x, ball.position.y);
    rectMode(CENTER);
    fill(255);
    circle(0, 0, 20);
    pop();
  }
  
  push();
  fill(64, 31, 8);

  push();
  translate(wallA.position.x, wallA.position.y);
  rotate(wallA.angle);
  rectMode(CENTER);
  rect(0, 0, a_dim.w, a_dim.h, 10, 10, 0, 0);
  pop();

  push();
  translate(wallB.position.x, wallB.position.y);
  rotate(wallB.angle);
  rectMode(CENTER);
  rect(0, 0, b_dim.w, b_dim.h);
  pop();

  push();
  translate(wallC.position.x, wallC.position.y);
  rotate(wallC.angle);
  rectMode(CENTER);
  rect(0, 0, c_dim.w, c_dim.h, 0, 0, 10, 10);
  pop();

  push();
  translate(wallD.position.x, wallD.position.y);
  rotate(wallD.angle);
  rectMode(CENTER);
  rect(0, 0, d_dim.w, d_dim.h);
  pop();

  pop();

  if(start && !sunk) {
    if(!moving) {
      if(!aiming) {
        checkAim();
      } else {
        checkHit();
      }

      push();
      stroke(0);
      translate(ball.position.x, ball.position.y);

      let a = getAngle();
      if(curAngle < a - 0.0872665) {
        curAngle += 0.25;
      } else if(curAngle > a + 0.0872665){
        curAngle -= 0.25;
      } else {
        curAngle = a;
      }
      rotate(a);
      //rectMode(CENTER);
      line(0, 0, 50, 0);
      pop();
    } else {
      if(ball.speed <= 0.01) {
        Body.setVelocity(ball, {x: 0, y:0})
        moving = false;
      }
    }
  }
}

function checkAim() {
  let f = getFreq();
  let v = getVolume();

  if(f >= 15) {
    aiming = true;
  }
}

function checkHit() {
  let f = getFreq();
  let v = getVolume();

  peakVol = max(v, peakVol);

  if(v < 15) {
    //hit(getAngle(), getPower()/6000);
  }
}

function hit(a, p) {
  aiming = false;
  moving = true;
  prevAngle = 0;
  prevPow = 0;
  console.log('hit angle: ' + a);
  console.log('hit power: ', p);
  Body.applyForce(ball, ball.position, {x: cos(a) * p, y: sin(a) * p});
}

function getAngle() {
  let v = getVolume();
  if(v > 20) {
    prevVol = v;
  } else {
    prevVol = 0;
  }
  return map(prevVol, 20, 60, -3*PI/2, PI/2, true);
}

function getPower() {
  let v = getVolume();
  if(v > 15) {
    prevVol = v;
  }
  return prevVol;
}

function keyPressed() {
  if(key == 'w') {
    Body.applyForce(ball, ball.position, {x: 0, y: -0.0005});
  } else if(key == 'a') {
    Body.applyForce(ball, ball.position, {x: -0.005, y: 0});
  } else if(key == 's') {
    Body.applyForce(ball, ball.position, {x: 0, y: 0.005});
  } else if(key == 'd') {
    Body.applyForce(ball, ball.position, {x: 0.005, y: 0});
  } else if(key == ' ') {
    a = getAngle();
    Body.applyForce(ball, ball.position, {x: cos(a) * 0.01, y: sin(a) * 0.01});
  }
}

