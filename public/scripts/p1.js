let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;
    Body = Matter.Body;
    Events = Matter.Events;

let engine;
let world;

let archer;

let wallA;
let wallB;
let wallC;
let wallD;

let ball;
let ballID;
let hole;
let holeID;

let stageElements = [];

let start = false;
let prevFreq = 0;
let prevVol = 0;
let peakVol = 0;

let curAngle = 0;

let aiming = false;
let moving = false;

let sunk = false;
let shrink = 0;

let shots = 0;
let stage = 1;
let stage_text = "Welcome to Annoying Golf!  Let's start by making some noise.";

let a_dim;
let b_dim;
let c_dim;
let d_dim;

function audioStart() {
  start = true;
}

function preload() {
  archer = loadFont('../assets/archer.otf');
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
    h: 3*height/4 - 20
  }

  c_dim = {
    w: width-15,
    h: 5
  }

  d_dim = {
    w: 5,
    h: 3*height/4 - 20
  }

  wallA = Bodies.rectangle(width/2, 10-a_dim.h*50, a_dim.w*100, a_dim.h*100, { isStatic: true });
  wallB = Bodies.rectangle(10-b_dim.w*50, height/4 + height/8, b_dim.w*100, b_dim.h, { isStatic: true });
  wallC = Bodies.rectangle(width/2, 3*height/4-10+c_dim.h*50, c_dim.w*100, c_dim.h*100, { isStatic: true });
  wallD = Bodies.rectangle(width-10+b_dim.w*50, 3*height/8, d_dim.w*100, d_dim.h, { isStatic: true});

  ball = Bodies.circle(width/2, 3*height/5, 10, {restitution: 0.3});
  hole = Bodies.circle(width/2, height/6, 4, {isStatic: true, isSensor: true});

  ballID = ball.id;
  holeID = hole.id;

  World.add(world, ball);
  World.add(world, hole);

  Engine.run(engine);

  World.add(world, [wallA, wallB, wallC, wallD]);

  Events.on(engine, 'collisionStart', function(event) {
    var a = event.pairs[0].bodyA;
    var b = event.pairs[0].bodyB;
    
    if((a.id == ballID && b.id == holeID) || (a.id == holeID && b.id == ballID)) {
      sunk = true;
      shots = 0;

      Body.setPosition(ball, { x:width/2, y:3*height/5});
      Body.setVelocity(ball, {x: 0, y:0})
      shrink = 0;
    }
  });
}

function draw() {
  background(32, 133, 59);
  noStroke();

  push();
  fill(255, 50);
  textSize(width*1.84);
  text(shots, 0, 4*height/6);
  pop();

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
    pop();

    push();
    let p = map(shrink, 0, 20, 0, TWO_PI);
    let c = cos(p);
    fill(10, map(c, -1, 1, 255, 0));
    textSize(25);
    rectMode(CENTER);
    text("Nice shot!", hole.position.x-width/7, hole.position.y-height/30-shrink);
    pop();

    shrink += 1;

    if(shrink >= 20) {
      sunk = false;
      loadStage();
    }

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
  translate(wallA.position.x, wallA.position.y+a_dim.h*50);
  rotate(wallA.angle);
  rectMode(CENTER);
  rect(0, 0, a_dim.w, a_dim.h, 10, 10, 0, 0);
  pop();

  push();
  translate(wallB.position.x+b_dim.w*50, wallB.position.y);
  rotate(wallB.angle);
  rectMode(CENTER);
  rect(0, 0, b_dim.w, b_dim.h);
  pop();

  push();
  translate(wallC.position.x, wallC.position.y-c_dim.h*50);
  rotate(wallC.angle);
  rectMode(CENTER);
  rect(0, 0, c_dim.w, c_dim.h, 0, 0, 10, 10);
  pop();

  push();
  translate(wallD.position.x-b_dim.w*50, wallD.position.y);
  rotate(wallD.angle);
  rectMode(CENTER);
  rect(0, 0, d_dim.w, d_dim.h);
  pop();

  if(stage > 1) {
    for(i = 0; i < stageElements.length; i++) {
      push();
      translate(stageElements[i].b.position.x, stageElements[i].b.position.y);
      rotate(stageElements[i].angle);
      rectMode(CENTER);
      rect(0, 0, stageElements[i].w, stageElements[i].h, 5, 5, 5, 5);
      pop();
    }
  }

  pop();

  if(start && !sunk) {
    if(!moving) {
      /*
      if(!aiming) {
        checkAim();
      } else {
        checkHit();
      }
      */

      push();
      stroke(0);
      translate(ball.position.x, ball.position.y);

      let a = getAngle();
      rotate(a);
      //rectMode(CENTER);
      line(0, 0, 50, 0);
      pop();
    } else {
      if(ball.speed <= 0.02) {
        Body.setVelocity(ball, {x: 0, y:0})
        moving = false;
      }
    }
  }

  push();
  fill(255, 232, 217);
  rect(10, 3*height/4 + 10, width - 20, height/8, 10, 10, 10, 10);
  pop();

  push();
  fill(10);
  textSize(20);
  textFont(archer);
  text(stage_text, 20, 3*height/4 + 20, width - 40, height/8 - 10);
  pop();
}

function checkAim() {
  aiming = true;
}

function checkHit() {
  let f = getFreq();
  let v = getVolume();

  peakVol = max(v, peakVol);

  if(v < 15) {
    //hit(getAngle(), getPower()/6000);
  }
}

function hit(a) {
  aiming = false;
  moving = true;
  shots++;
  //prevAngle = 0;
  //prevPow = 0;
  console.log('hit angle: ' + a);
  //console.log('hit power: ', p);
  let p = 0.01;
  if(stage == 3) {
    world.gravity.y = 0;
    Body.setStatic(hole, false);
    //hole.isSensor = false;
    Body.applyForce(hole, hole.position, {x: cos(a) * p, y: sin(a) * p});
  } else {
    Body.applyForce(ball, ball.position, {x: cos(a) * p, y: sin(a) * p});
  }
}

function getAngle() {
  let v = getVolume();
  if(v > 20) {
    prevVol = v;
  } else {
    prevVol = 0;
  }
  return map(prevVol, 20, 70, -3*PI/2, PI/2, true);
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
    Body.applyForce(ball, ball.position, {x: 0, y: -0.005});
  } else if(key == 'a') {
    Body.applyForce(ball, ball.position, {x: -0.005, y: 0});
  } else if(key == 's') {
    Body.applyForce(ball, ball.position, {x: 0, y: 0.005});
  } else if(key == 'd') {
    Body.applyForce(ball, ball.position, {x: 0.005, y: 0});
  } else if(key == ' ') {
    if(start) {
      a = getAngle();
      Body.applyForce(ball, ball.position, {x: cos(a) * 0.01, y: sin(a) * 0.01});
    }
  }
}

function mousePressed() {
  if(start && !moving) {
    //a = getAngle();
    //Body.applyForce(ball, ball.position, {x: cos(a) * 0.01, y: sin(a) * 0.005});
    hit(getAngle());
  }
}

function loadStage() {
  stage++

  if(stage == 2) {
    stage_text = "Phew! That was annoying. Let's add a few blocks."

    e1 = {
      b: Bodies.rectangle(3*width/8 - 15, height/2, 5*width/8, 50, {isStatic: true}),
      w: 5*width/8,
      h: 50,
    }
    stageElements.push(e1);

    e2 = {
      b: Bodies.rectangle(5*width/8 + 15, 2*height/8, 5*width/8, 50, {isStatic: true}),
      w: 5*width/8,
      h: 50,
    }
    stageElements.push(e2);

    World.add(world, e1.b);
    World.add(world, e2.b);

  } else if(stage == 3) {
    stage = 2;
    //Body.setStatic(ball, true);
  }
}

