function Button(x, y) {
  this.x = x;
  this.y = y;
  this.float = 0;

  this.dragging = false;
  this.was_dragging = false;
  this.x_offset = 0;
  this.y_offset = 0;

  this.shadow_offset = 10;

  this.triangle_colour = '#f2cfc7';

  this.display = function() {
    noStroke();

    let d = dist(this.x, this.y, mouseX, mouseY);
    if(d <= 150) {
      cursor('pointer');
      this.shadow_offset = 5;
      this.triangle_colour = '#fce6e1';
    } else {
      cursor('default');
      this.shadow_offset = 10;
      this.triangle_colour = '#f2cfc7';
    }

    if(this.dragging) {
      this.x = mouseX + this.x_offset;
      this.y = mouseY + this.y_offset;
    }

    //fill('#361209');
    //circle(this.x + this.shadow_offset, this.y + this.shadow_offset, 300);

    fill('#ff592b');
    circle(this.x, this.y, 300);

    noStroke()
    fill(this.triangle_colour);
    triangle(this.x-45, this.y-90, this.x-45, this.y+90, this.x+85, this.y);

    this.float += 0.05;
    this.y = this.y + cos(this.float)/2
  }

  this.drag = function(mX, mY) {
    let d = dist(this.x, this.y, mX, mY);
    if(d <= 150) {
      this.dragging = true;
      this.was_dragging = true;
      this.x_offset = this.x - mX;
      this.y_offset = this.y - mY;
    }
  }

  this.click = function(mX, mY) {
    let d = dist(this.x, this.y, mX, mY);
    if(d <= 150) {
      return true;
    }
  }

  this.release = function() {
    this.dragging = false;
  }

  this.move = function(x, y) {
    this.x = x;
    this.y = y;
  }
}

function circleAnimation(x, y, sound) {
  this.x = x;
  this.y = y;
  this.size = 1;
  this.go = false;
  this.sound;

  this.display = function() {
    if(this.go) {
      noStroke();

      fill('#ffb624');
      circle(this.x, this.y, this.size + 100);

      fill('#ff8b6b');
      circle(this.x, this.y, this.size);

      if(this.size < windowWidth*2) {
        this.size += 50;
      } else {
        this.go = false;
        sound.stop();
      }
    }
  }

  this.activate = function() {
    this.size = 1;
    this.go = true;
    sound.play();
  }

  this.move = function(x, y) {
    this.x = x;
    this.y = y;
  }
}

function Dial(x, y, click_sound) {
  //angle calculations from https://editor.p5js.org/fergfluff/sketches/H1rwGFSsZ
  this.start = false;
  this.fade = 0;

  this.x = x;
  this.y = y;
  this.r = 150;

  this.dragging = false;
  this.playing = false;

  this.angle = -1.5708;
  this.angle_offset = 0;

  this.state = 1;

  this.click_sound = click_sound;

  this.start_up = function() {
    this.start = true;
  }

  this.display = function() {
    if(this.dragging) {
      this.drag();
    }

    push();
    noStroke();
    translate(this.x, this.y);
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
    }
    
    pop();
    pop();
  }

  this.start_drag = function() {
    if(this.start && this.checkHover(mouseX, mouseY) && !this.dragging) {
      this.dragging = true;
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
    return dist(x, y, this.x, this.y) <= this.r;
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
  // src: 'https://us4.internet-radio.com/proxy/douglassinclair?mp=/stream',
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
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  ping_sound = createAudio('../assets/ping.mp3');

  the_button = new Button(windowWidth/2, windowHeight/2);
  c_anim = new circleAnimation(windowWidth/2, windowHeight/2, ping_sound);
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
  
  c_anim.display();
  //the_button.display();
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

function mouseClicked() {
  /*
  if(!the_button.was_dragging) {
    if(the_button.click(mouseX, mouseY)) {
      //b_colour = '#ff592b'
      if(c_anim.go == false) {
        c_anim.move(the_button.x, the_button.y);
        c_anim.activate();
      }
    }
  } else {
    the_button.was_dragging = false;
  }
  */
}

function mouseDragged() {
  /*
  if(!the_button.dragging) {
    the_button.drag(mouseX, mouseY);
  }
  */
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
  //the_button.release();
  dial.release();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}