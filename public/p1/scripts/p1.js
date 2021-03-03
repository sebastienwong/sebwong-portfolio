let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;
    Body = Matter.Body;
    Events = Matter.Events;

let engine;
let world;

let archer;

let sink_sound;
let swing_sound;
let wall_sound;
let pool_sound;

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
let lineFade = 0;

let sunk = false;
let sink_c = 255;
let shrink = 0;
let shot_fade = 41;
let sinkmoji;
let sink_emojis = ['🏌️', '👏', '⛳', '🔥', '😎'];

let scratch = false;

let invisible = false;

let sandy = false;
let sandballs = [];

let shots = 0;
let score = 0;
let stage = 0;
let stage_text;
let end = false;

let a_dim;
let b_dim;
let c_dim;
let d_dim;

function audioStart() {
  start = true;
}

function preload() {
  archer = loadFont('../assets/archer.otf');

  soundFormats('mp3', 'ogg');
  sink_sound = loadSound('../assets/golf_sink.mp3');
  sink_sound.setVolume(0.25);

  swing_sound = loadSound('../assets/golf_swing.mp3');
  swing_sound.setVolume(0.25);

  wall_sound = loadSound('../assets/wall_hit.mp3')
  wall_sound.setVolume(0.25);

  pool_sound = loadSound('../assets/pool_hit.mp3');
  pool_sound.setVolume(0.25);

  sand_sound = loadSound('../assets/sand_hit.mp3');
  sand_sound.setVolume(0.1);
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
    h: 7*height/8 - 40
  }

  c_dim = {
    w: width-15,
    h: 5
  }

  d_dim = {
    w: 5,
    h: 7*height/8 - 40
  }

  wallA = Bodies.rectangle(width/2, 10-a_dim.h*50, a_dim.w*100, a_dim.h*100, { isStatic: true });
  wallB = Bodies.rectangle(10-b_dim.w*50, 7*height/16 - 10, b_dim.w*100, b_dim.h, { isStatic: true });
  wallC = Bodies.rectangle(width/2, 7*height/8-30+c_dim.h*50, c_dim.w*100, c_dim.h*100, { isStatic: true });
  wallD = Bodies.rectangle(width-10+b_dim.w*50, 7*height/16 - 10, d_dim.w*100, d_dim.h, { isStatic: true});

  ball = Bodies.circle(width/2, 6*height/8, 10, {restitution: 0.4});
  hole = Bodies.circle(width/2, height/6, 8, {isStatic: true, isSensor: true});

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
      sink_c = 255;
      sunk = true;
      shot_fade = 0;

      invisible = false;
      
      sink_sound.play();
      if(stage == 6) {
        scratch = true;
      } else {
        sinkmoji = random(sink_emojis);
        score += shots;
        shots = 0;
      }
      
      Body.setPosition(ball, {x:width/2, y:6*height/8});
      Body.setVelocity(ball, {x: 0, y:0});
      Body.setAngularVelocity(ball, 0);

      shrink = 0;
    } else if(stage == 6) {
      if((a.id == stageElements[0].b.id && b.id == holeID) || (a.id == holeID && b.id == stageElements[0].b.id)) {
        sink_c = stageElements[0].c;
        sunk = true;
        shot_fade = 0;
        score += shots;
        shots = 0;
  
        sink_sound.play();
        sinkmoji = random(sink_emojis);

        scratch = false;

        world.gravity.y = 0;
        Body.setPosition(ball, {x:width/2, y:6*height/8});
        Body.setVelocity(ball, {x: 0, y:0});
        Body.setAngularVelocity(ball, 0);
        shrink = 0;
      } else if((a.id == stageElements[0].b.id && b.id == ballID) || (a.id == ballID && b.id == stageElements[0].b.id)) {
        pool_sound.play();
      } else {
        wall_sound.play();
      }
    } else if (stage == 4) {
      if((a.id == stageElements[0].b.id && b.id == ballID) || (a.id == ballID && b.id == stageElements[0].b.id) || 
        (a.id == stageElements[1].b.id && b.id == ballID) || (a.id == ballID && b.id == stageElements[1].b.id)) {
          ball.frictionAir = 0.1;
          sandy = true;
          sand_sound.play();
      }
    } else {
      wall_sound.play();
    }
  });

  loadStage();
}

function draw() {
  background(173, 105, 52);
  noStroke();
  textFont(archer);

  push();
  fill(32, 133, 59);
  rect(10, 10, width-20, 7*height/8-40);
  pop();

  push();
  fill(255, 50);
  textAlign(CENTER);
  textSize(7*height/8);
  textFont("Courier New");
  text(stage, width/2, height/2 + 150);
  pop();

  if(!invisible) {
    push();
    translate(hole.position.x, hole.position.y);
    rotate(hole.angle);
    rectMode(CENTER);
    fill(0, 43, 12);
    circle(0, 0, 30);
    pop();
  }

  for(i = 0; i < stageElements.length; i++) {
    if(stageElements[i].type == "block") {
      push();
      fill(64, 33, 8);
      translate(stageElements[i].b.position.x, stageElements[i].b.position.y);
      rotate(stageElements[i].angle);
      rectMode(CENTER);
      rect(0, 0, stageElements[i].w, stageElements[i].h, 5, 5, 5, 5);
      pop();
    } else if(stageElements[i].type == "ball") {
      if(stage != 6 || sunk != true || scratch != false) {
        push();
        translate(stageElements[i].b.position.x, stageElements[i].b.position.y);
        rectMode(CENTER);
        fill(stageElements[i].c);
        circle(0, 0, 30);
        pop();
      }
    } else if(stageElements[i].type == "sand") {
      push();
      fill(255, 206, 28);
      translate(stageElements[i].b.position.x, stageElements[i].b.position.y);
      rotate(stageElements[i].angle);
      rectMode(CENTER);
      rect(0, 0, stageElements[i].w, stageElements[i].h);
      pop();
    }
  }

  for(i = 0; i < sandballs.length; i++) {
    push();
    translate(sandballs[i].x, sandballs[i].y);
    rectMode(CENTER);
    fill(255);
    circle(0, 0, 20);
    pop();
  }
  
  if(sunk) {
    push();
    fill(sink_c, map(shrink, 0, 20, 255, 0));
    circle(hole.position.x + random(-1,1), hole.position.y, 18);
    pop();

    shrink ++;

    if(shrink >= 20) {
      sunk = false;

      if(!scratch) {
        loadStage();
      }
    }
  } else if(end) {
    push();
    fill(255, 232, 217);
    textAlign(CENTER);
    textSize(60);
    text("Fin.", width/2, 2*height/5);
    pop();

    push();
    textAlign(CENTER);
    textSize(40);
    text("Score: " + score, width/2, height/2);
    pop();
  } else {
    push();
    translate(ball.position.x, ball.position.y);
    rectMode(CENTER);
    fill(255);
    circle(0, 0, 20);
    pop();
  }

  if(shot_fade <= 40 && !scratch) {
    push();
    let p = map(shot_fade, 0, 40, 0, TWO_PI);
    let c = cos(p);
    fill(10, map(c, -1, 1, 255, 0));
    textSize(50);
    textAlign(CENTER);
    textFont('Helvetica')
    text(sinkmoji, hole.position.x, hole.position.y-shot_fade-30);
    
    pop();

    shot_fade++;
  }
  
  push();
  fill(102, 55, 18);

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

  pop();

  if(start && !sunk && !end) {
    if(!moving) {
      push();
      stroke(0, map(lineFade, 0, 10, 0, 255))
      strokeWeight(2);
      translate(ball.position.x, ball.position.y);

      let a = getAngle();
      rotate(a);
      line(0, 0, 50, 0);
      line(50, 0, 45, -5);
      line(50, 0, 45, 5);
      pop();

      push();
      fill(0, map(lineFade, 0, 10, 0, 255))
      textFont("Courier New");
      textSize(30);
      text(shots, ball.position.x+10, ball.position.y-10);
      pop();

      if(lineFade < 10) {
        lineFade++
      }
    } else {
      lineFade = 0;
      if(ball.speed <= 0.3) {
        Body.setVelocity(ball, {x: 0, y:0});
        Body.setAngularVelocity(ball, 0);
        moving = false;

        if(sandy) {
          sandballs.push({x: ball.position.x, y: ball.position.y});
          ball.frictionAir = 0.01;
          Body.setPosition(ball, {x:width/2, y:6*height/8});
          sandy = false;
        }
      }
    }
  }

  push();
  fill(255, 232, 217);
  rect(10, 7*height/8 - 10, width - 20, height/8, 10, 10, 10, 10);
  pop();

  push();
  fill(10);
  textSize(25);
  text(stage_text, 20, 7*height/8, width - 40, height/8 - 10);
  pop();
}

function hit(a) {
  aiming = false;
  moving = true;
  shots++;

  let p;
  if(stage == 3) {
    p = 0.0125;
  } else {
    p = 0.01;
  }
  Body.applyForce(ball, ball.position, {x: cos(a) * p, y: sin(a) * p});
  swing_sound.play();
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

function keyPressed() {
  if(key == 'w') {
    Body.applyForce(ball, ball.position, {x: 0, y: -0.005});
  } else if(key == 'a') {
    Body.applyForce(ball, ball.position, {x: -0.005, y: 0});
  } else if(key == 's') {
    Body.applyForce(ball, ball.position, {x: 0, y: 0.005});
  } else if(key == 'd') {
    Body.applyForce(ball, ball.position, {x: 0.005, y: 0});
  }
}

function touchStarted() {
  if(start && !moving && !end) {
    //a = getAngle();
    //Body.applyForce(ball, ball.position, {x: cos(a) * 0.01, y: sin(a) * 0.005});
    if(stage == 3) {
      world.gravity.y = 0.25;
    } else {
      world.gravity.y = 0;
    }
    hit(getAngle());
  }
}

function loadStage() {
  stage++
  if(stage == 1) { 
    stage_text = "Welcome to Annoying Golf!  Be louder or quieter to aim the ball and tap the screen to hit.";
  } else if(stage == 2) {
    stage_text = "Phew! That was annoying. Let's add a few blocks."

    addBlocks();

  } else if(stage == 3) {
    stage_text = "Did you know they played golf on the moon?"

    removeBlocks();
    addBlocks();
  } else if(stage == 6) {
    stage_text = "Sometimes I dabble in pool as well.  Red in the middle pocket."

    removeBlocks();

    e1 = {
      b: Bodies.circle(width/4, height/2, 15, {restitution: 0.8, density: 0.0005}),
      d: 20,
      type: "ball",
      c: color(196, 44, 39)
    }

    stageElements.push(e1);
    World.add(world, e1.b);

  } else if(stage == 5) {
    removeBlocks();

    stage_text = "This time I made the hole invisible and put it somewhere secret.  Shh!";

    invisible = true;
  } else if(stage == 4) {
    world.gravity.y = 0;
    removeBlocks();
    stage_text = "I added sand traps.  Try not to touch em.";

    e1 = {
      b: Bodies.rectangle(1*width/5+5, 2*height/5+20, 3*width/8 - 27, 7*height/8 - 66, {isStatic: true, isSensor: true}),
      w: 3*width/8 - 7,
      h: 7*height/8 - 46,
      type: "sand"
    }
    stageElements.push(e1);
  
    e2 = {
      b: Bodies.rectangle(4*width/5-5, 2*height/5+20, 3*width/8 - 27, 7*height/8 - 66, {isStatic: true, isSensor: true}),
      w: 3*width/8 - 7,
      h: 7*height/8 - 46,
      type: "sand"
    }
    stageElements.push(e2);
  
    World.add(world, e1.b);
    World.add(world, e2.b);

  } else {
    console.log(stageElements);
    removeBlocks();
    end = true;
    document.getElementById("restart_button").style.display = 'block';

    if(score > (stage-1)*4) {
      stage_text = "Thanks for playing!  Crummy score though.";
    } else if(score > (stage-1)*3) {
      stage_text = "Thanks for playing!  Score could use improvement.";
    } else if(score > (stage-1)*2) {
      stage_text = "Thanks for playing!  Not a bad score, but could you do better?";
    } else {
      stage_text = "Thanks for playing!  Amazing score!  Are you cheating?";
    }
    
    stage = " ";
  }
}

function addBlocks() {
  e1 = {
    b: Bodies.rectangle(3*width/8 - 15, 10*height/16-25, 5*width/8, 50, {isStatic: true}),
    w: 5*width/8,
    h: 50,
    type: "block"
  }
  stageElements.push(e1);

  e2 = {
    b: Bodies.rectangle(5*width/8 + 15, 6*height/16-50, 5*width/8, 50, {isStatic: true}),
    w: 5*width/8,
    h: 50,
    type: "block"
  }
  stageElements.push(e2);

  World.add(world, e1.b);
  World.add(world, e2.b);
}

function removeBlocks() {
  for(i = 0; i < stageElements.length; i++) {
    World.remove(world, stageElements[i].b);
  }
  sandballs = [];
  stageElements = [];
}

function restart() {
  swing_sound.play();
  end = false;
  stage = 0;

  Body.setPosition(ball, {x:width/2, y:6*height/8});
  Body.setVelocity(ball, {x: 0, y:0});
  Body.setAngularVelocity(ball, 0);

  score = 0;
  shots = 0;

  document.getElementById("restart_button").style.display = 'none';

  loadStage();
}

