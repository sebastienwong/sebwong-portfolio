function Dial(x, y, click_sound) {
  //angle calculations from https://editor.p5js.org/fergfluff/sketches/H1rwGFSsZ
  this.start = false;
  this.fade = 0;

  this.help = false;
  this.tint = 0;

  this.x = x;
  this.y = y;
  this.r = 150;

  this.shadow_offset = 10;

  this.dragging = false;
  this.playing = false;

  this.angle = -1.5708;
  this.angle_offset = 0;

  this.state = 1;

  this.click_sound = click_sound;

  this.start_up = function() {
    this.start = true;
    this.help = true;
  }

  this.display = function() {
    if(this.dragging) {
      this.drag();
    }

    push();
    noStroke();
    translate(this.x, this.y);

    fill(54, 18, 9);
    circle(this.shadow_offset, this.shadow_offset, this.r*2);

    rotate(this.angle);

    push();

    fill(255, 89, 43);
    circle(0, 0, this.r*2);

    if(this.start) {
      if(this.fade < 255) {
        this.fade += 5;
      }
      fill(166, 55, 25, this.fade);
      triangle(this.r-20,-10,this.r-20,10,this.r-10,0);
      pop();
      
      push();
      rotate(1.5708);
      fill(242, 207, 199, this.fade);
      if(this.playing) {
        rect(-45, -60, 40, 120);
        rect(5, -60, 40, 120);
      } else {
        triangle(-30, -60, -30, 60, 60, 0);
      }

      if(this.help) {
        push();
        translate(-14, -120);
        scale(0.015);
        if(this.fade < 255) {
          tint(166, 55, 25, 0);
        } else {
          tint(166, 55, 25, map(cos(this.tint), 0, 1, 0, 128, true));
        }
          
        image(arrows_png, 0, 0)
        pop();

        this.tint += 0.1;
      }
    }
    
    pop();
    pop();
  }

  this.start_drag = function() {
    if(this.start && this.checkHover(mouseX, mouseY) && !this.dragging) {
      this.dragging = true;
      this.help = false;
      let dx = mouseX - this.x;
      let dy = mouseY - this.y;
      this.angle_offset = atan2(dy, dx) - this.angle;
    }
  }

  this.drag = function() {
    let dx = mouseX - this.x;
    let dy = mouseY - this.y;
    let mAngle = atan2(dy, dx);
    if(mAngle <= 0 && mAngle >= -PI) {
      this.angle = mAngle// - this.angle_offset;
      if(this.angle >= -0.0872665) {
        this.state = 3;
      } else if(this.angle >= -1.178097) {
        this.state = 2;
      } else if(this.angle <= -1.9634954) {
        this.state = 0;
      } else {
        this.state = 1;
      }
    }
  }

  this.click = function() {
    this.click_sound.play();
    this.playing = !this.playing;
  }

  this.checkHover = function(x, y) {
    if(dist(x, y, this.x, this.y) <= this.r) {
      this.shadow_offset = 5;
      return true;
    } else {
      this.shadow_offset = 10;
      return false;
    }
  }

  this.release = function() {
    this.dragging = false;
    if(this.angle >= -0.0872665) {
      this.angle = 0;
    } else if(this.angle >= -1.178097) {
      this.angle = -0.785398;
    } else if(this.angle <= -1.9634954) {
      this.angle = -2.35619;
    } else {
      this.angle = -1.5708;
    }
  }

  this.move = function(x, y) {
    this.x = x;
    this.y = y;
  }
}

function Radio(stations, x, y, pop_sound) {
  this.start = false;
  this.fade = 0;

  this.secret_fade = 0;

  this.stations = stations;
  this.state = 1;

  this.x = x;
  this.y = y;
  this.float = 0;

  this.pop_sound = pop_sound;

  this.start_up = function() {
    this.start = true;
  }

  this.display = function(n, angle) {

    if(n != this.state) {
      this.changeStations(n);
    }

    push();
    strokeWeight(4);
    noStroke();
    fill(242, 207, 199, this.fade);
    translate(this.x, this.y);

    if(this.start) {
      if(this.fade < 255) {
        this.fade += 5;
      }

      if(angle >= -0.785398) {
        this.secret_fade = map(angle, -0.785398, 0, 0, 255, true);
      } else {
        this.secret_fade = 0;
      }
      
      push();
      if(this.state == 0) { stroke(166, 55, 25, this.fade); }
      rotate(-0.785398);
      circle(0, -200, 50);
      pop();

      push();
      if(this.state == 1) { stroke(166, 55, 25, this.fade); }
      circle(0, -200, 50);
      pop();

      push();
      if(this.state == 2) { stroke(166, 55, 25, this.fade); }
      rotate(0.785398);
      circle(0, -200, 50);
      pop();

      push();
      if(this.state == 3) { stroke(166, 55, 25, this.fade); }
      rotate(1.5708);
      fill(242, 207, 199, this.secret_fade);
      circle(0, -200, 50);
      pop();

      push();
      textSize(64);
      fill(0);
      textAlign(CENTER);
      if(this.stations[this.state].sound.playing()) {
        this.float += 0.05;
        if(this.state == 3) {
          fill(random(255), random(255), random(255))
        }
      }
      text(this.stations[this.state].name, 0, 250+cos(this.float)*5);
      pop();
      pop();

    } else {
      push();
      textSize(64);
      fill(0);
      textAlign(CENTER);
      text("radio.", 0, 250);
      pop();
    }
  }

  this.changeStations = function(n) {
    if(this.stations[this.state].sound.playing()) {
      this.stations[this.state].sound.pause();
      this.stations[n].sound.play();
    } else {
      this.stations[this.state].sound.pause();
    }

    this.pop_sound.play();
    this.state = n;
  }

  this.toggle_play = function() {
    if(this.stations[this.state].sound.playing()) {
      this.stations[this.state].sound.pause();
    } else {
      this.stations[this.state].sound.play();
    }
  }

  this.move = function(x, y) {
    this.x = x;
    this.y = y;
  }
}

let the_button;
let c_anim;
let dial;
let radio;
let b_colour = '#ff8b6b'

let dont_click = false;

let sound1 = new Howl({
  src: 'https://freshgrass.streamguys1.com/folkalley-128mp3-tunein',
  html5: true,
  volume: 0.5,
  format: ['mp3', 'aac']
});

let sound2 = new Howl({
  src: 'http://rfcmedia.streamguys1.com/MusicPulse.mp3',
  html5: true,
  volume: 0.5,
  format: ['mp3', 'aac']
});

let sound3 = new Howl({
  src: 'https://live-aacplus-64.streamguys1.com/kexp64-tunein.aac',
  html5: true,
  volume: 0.5,
  format: ['mp3', 'aac']
});

let sound4 = new Howl({
  src: '../assets/cantina.mp3',
  volume: 0.5,
  loop: true,
  format: 'mp3'
})

let click_sound = new Howl({
  src: '../assets/click.mp3',
  volume: 0.5,
  format: 'mp3'
})

let pop_sound = new Howl({
  src: '../assets/pop.mp3',
  volume: 0.5,
  format: 'mp3'
})

let stations = [sound1, sound2, sound3];

function preload() {
  yoda_png = loadImage('../assets/yoda_png.png');
  arrows_png = loadImage('../assets/arrows.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  dial = new Dial(width/2, height/2, click_sound);
  radio = new Radio([
    {
      name: "folk.",
      sound: sound1
    },
    {
      name: "pop.",
      sound: sound2
    },
    {
      name: "indie.",
      sound: sound3
    },
    {
      name: "cantina.",
      sound: sound4
    }
  ], width/2, height/2, pop_sound);
}

sound1.on('end', function() {
  dial.playing = false;
  console.log("Finished station 1!");
});

sound2.on('end', function() {
  dial.playing = false;
  console.log("Finished station 2!");
});

sound3.on('end', function() {
  dial.playing = false;
  console.log("Finished station 3!");
});

let n = 0;
let m = 0;
let k = 0;

function draw() {
  background(b_colour);
  
  if(dial.checkHover(mouseX, mouseY)) {
    if(dist(dial.x, dial.y, mouseX, mouseY) > 100) {
      cursor('grab');
    } else {
      cursor('pointer');
    }
  } else {
    cursor('default');
  }
  dial.display();
  radio.display(dial.state, dial.angle);
  
  if(dial.state == 3 && dial.playing == true) {
    if(cos(n) == 1) { n = 0; }
    if(m-300 == width) { m = 0; k = random(height-300) }

    push()
    translate(width/2, height/2);

    push();
    rotate(map(cos(n), 0, 1, 0, 2*PI));
    translate(400, 0);
    rotate(map(cos(n), 0, 1, 0, 2*PI));
    image(yoda_png, -150, -150)
    pop();

    push();
    rotate(map(cos(n), 0, 1, 2*PI, 0));
    translate(400, 0);
    rotate(map(cos(n), 0, 1, 2*PI, 0));
    image(yoda_png, -150, -150)
    pop();

    push();
    rotate(map(cos(n), 0, 1, 0, 2*PI));
    translate(-400, 0);
    rotate(map(cos(n), 0, 1, 0, 2*PI));
    image(yoda_png, -150, -150)
    pop();

    push();
    rotate(map(cos(n), 0, 1, 2*PI, 0));
    translate(-400, 0);
    rotate(map(cos(n), 0, 1, 2*PI, 0));
    image(yoda_png, -150, -150)
    pop();

    pop();

    image(yoda_png, -300 + m, k+cos(n*10)*5);

    n += 0.005;
    m += 2;
  }
}


function mouseDragged() {
  dial.start_drag();
  dont_click = true;
}

function mouseClicked() {
  if(!dont_click) {
    if(dial.checkHover(mouseX, mouseY)) {
      if(dial.start) {
        radio.toggle_play();
        dial.click();
      } else {
        dial.start_up();
        radio.start_up();
      }
    }
  } else {
    dont_click = false;
  }
}

function mouseReleased() {
  dial.release();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  dial.move(width/2, height/2);
  radio.move(width/2, height/2);
}