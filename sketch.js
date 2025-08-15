// Kandinsky-inspired abstract animated painting (p5.js)
// Just the JavaScript — drop this into the p5 editor or an HTML page that loads p5.js.

let elements = [];
let palettes = [
  ['#1b3b6f','#f94144','#f3722c','#f9c74f','#90be6d','#577590'],
  ['#0b3d91','#ff6b6b','#ffd93d','#6bc1ff','#7d5fff','#ff9f1c'],
  ['#061a40','#ff8fab','#ffd6a5','#7be495','#4cc9f0','#7209b7'],
  ['#071a52','#ff5d8f','#ffd166','#06d6a0','#118ab2','#073b4c']
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  rectMode(CENTER);
  angleMode(DEGREES);
  noStroke();
  // choose a palette and slightly shuffle it
  let p = random(palettes);
  palette = shuffle(p.concat()); // global palette array
  // create background texture layer (static-ish)
  createStaticBackground();
  // populate dynamic elements: circles, arcs, rects, lines, blobs
  for (let i = 0; i < 30; i++) {
    elements.push(makeElement());
  }
  // add a slow-moving "conductor" line
  elements.push(makeConductor());
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // background is a painted textured canvas we drew in setup to the graphics buffer
  image(bgGraphics, 0, 0, width, height);

  // subtle global vignette
  drawVignette();

  // animate & draw elements in z-sorted order
  elements.sort((a,b) => a.depth - b.depth);
  for (let el of elements) {
    el.update();
    el.draw();
  }

  // occasional "splash" particles for spontaneous energy
  if (frameCount % 240 === 0) {
    spawnSplash();
  }
}

/* ----------------------
   Background & helpers
   ---------------------- */
let bgGraphics;
let palette = [];

function createStaticBackground() {
  bgGraphics = createGraphics(width, height);
  bgGraphics.colorMode(HSB,360,100,100,1);
  // base wash
  let base = color(random(10,50), 30, random(90,98));
  bgGraphics.background(base);
  // paint subtle noise strokes
  for (let i = 0; i < 4000; i++) {
    let x = random(width);
    let y = random(height);
    let s = random(0.5, 6);
    let a = random(0.02, 0.08);
    bgGraphics.noStroke();
    bgGraphics.fill(hue(base)+random(-20,20), 20, 100, a);
    bgGraphics.ellipse(x, y, s, s*random(0.5,1.5));
  }
  // light paper grain
  bgGraphics.noFill();
  bgGraphics.strokeWeight(1);
  for (let i = 0; i < 120; i++) {
    bgGraphics.stroke(0,0,100,0.02);
    bgGraphics.ellipse(random(width), random(height), random(30,300), random(10,80));
  }
}

function drawVignette() {
  push();
  blendMode(MULTIPLY);
  fill(0, 0, 0, 0.06);
  rect(width/2, height/2, width*0.9, height*0.9, 30);
  blendMode(BLEND);
  pop();
}

/* ----------------------
   Element factory & types
   ---------------------- */

function makeElement() {
  let types = ['circle','arc','rect','ring','triangle','blob','line'];
  let t = random(types);
  let el = {
    type: t,
    x: random(width),
    y: random(height),
    ox: 0, oy: 0, // orbit offsets for slow drift
    size: random(30, 220),
    sizeAmp: random(0.6,1.6),
    hue: random(0,360),
    sat: random(60,100),
    bri: random(60,100),
    alpha: random(0.35,0.95),
    rot: random(360),
    rotSpeed: random(-0.2,0.6),
    depth: random(-10, 10),
    strokeWeight: random(0,8),
    speed: random(0.001, 0.01),
    update: function(){},
    draw: function(){}
  };

  // attach behaviors based on type
  switch(t) {
    case 'circle':
      el.hue = pickPaletteHue();
      el.update = function(){
        let t = frameCount * this.speed;
        this.ox = sin((this.x+frameCount*0.2)*0.001 + this.depth)*50;
        this.oy = cos((this.y+frameCount*0.2)*0.001 + this.depth)*50;
        this.size = this.size * (0.995) + this.sizeAmp*60 * (0.005 + 0.002*sin(t*6));
        this.rot += this.rotSpeed;
      };
      el.draw = function(){
        push();
        translate(this.x + this.ox, this.y + this.oy);
        rotate(this.rot);
        fill(this.hue, this.sat, this.bri, this.alpha);
        noStroke();
        ellipse(0, 0, this.size);
        // inner smaller disc (like Kandinsky's concentric circles)
        fill((this.hue+30)%360, max(0,this.sat-10), min(100,this.bri+10), this.alpha*0.9);
        ellipse(0, 0, this.size*0.55);
        pop();
      };
      break;

    case 'arc':
      el.hue = pickPaletteHue();
      el.start = random(0,360);
      el.span = random(30,260);
      el.update = function(){
        this.rot += this.rotSpeed;
        this.ox = 30*sin(frameCount*this.speed*2 + this.depth);
        this.oy = 30*cos(frameCount*this.speed*1.5 + this.depth);
      };
      el.draw = function(){
        push();
        translate(this.x+this.ox, this.y+this.oy);
        rotate(this.rot);
        noFill();
        stroke(this.hue, this.sat, this.bri, this.alpha);
        strokeWeight(max(1,this.strokeWeight));
        arc(0,0,this.size,this.size,this.start,this.start+this.span);
        // small anchored dot
        noStroke();
        fill((this.hue+180)%360,this.sat,90,this.alpha);
        let a = radians(this.start + this.span);
        let px = cos(a) * this.size/2;
        let py = sin(a) * this.size/2;
        ellipse(px, py, this.size*0.05);
        pop();
      };
      break;

    case 'rect':
      el.hue = pickPaletteHue();
      el.update = function(){
        this.rot += this.rotSpeed;
        this.ox = 50*sin(frameCount*this.speed*0.6 + this.depth);
        this.oy = 50*cos(frameCount*this.speed*0.9 + this.depth);
      };
      el.draw = function(){
        push();
        translate(this.x+this.ox, this.y+this.oy);
        rotate(this.rot);
        fill(this.hue, this.sat, this.bri, this.alpha*0.9);
        rect(0,0,this.size,this.size*0.6, this.size*0.08);
        // diagonal stripe
        fill((this.hue+210)%360, this.sat, this.bri, this.alpha*0.6);
        rotate(20);
        rect(0,0,this.size*0.6,this.size*0.18, this.size*0.06);
        pop();
      };
      break;

    case 'ring':
      el.hue = pickPaletteHue();
      el.thick = random(6, 28);
      el.update = function(){
        this.rot += this.rotSpeed*0.6;
        this.ox = 60*sin(frameCount*this.speed*0.4 + this.depth*0.5);
        this.oy = 60*cos(frameCount*this.speed*0.8 + this.depth*0.3);
      };
      el.draw = function(){
        push();
        translate(this.x+this.ox, this.y+this.oy);
        rotate(this.rot);
        noFill();
        stroke(this.hue, this.sat, this.bri, this.alpha);
        strokeWeight(this.thick);
        ellipse(0,0,this.size, this.size);
        pop();
      };
      break;

    case 'triangle':
      el.hue = pickPaletteHue();
      el.update = function(){
        this.rot += this.rotSpeed;
        this.ox = 40*sin(frameCount*this.speed*1.2 + this.depth);
        this.oy = 40*cos(frameCount*this.speed*1.1 + this.depth);
      };
      el.draw = function(){
        push();
        translate(this.x+this.ox, this.y+this.oy);
        rotate(this.rot);
        fill(this.hue, this.sat, this.bri, this.alpha);
        beginShape();
        vertex(-this.size*0.5, this.size*0.5);
        vertex( this.size*0.6,  this.size*0.1);
        vertex(-this.size*0.1, -this.size*0.6);
        endShape(CLOSE);
        pop();
      };
      break;

    case 'blob':
      el.hue = pickPaletteHue();
      el.points = floor(random(5,12));
      el.noiseSeed = random(1000);
      el.update = function(){
        this.rot += this.rotSpeed*0.5;
        this.noiseSeed += 0.002;
        this.ox = 30*sin(frameCount*this.speed*2 + this.depth);
        this.oy = 30*cos(frameCount*this.speed*1.3 + this.depth);
      };
      el.draw = function(){
        push();
        translate(this.x+this.ox, this.y+this.oy);
        rotate(this.rot);
        fill(this.hue, this.sat, this.bri, this.alpha*0.9);
        beginShape();
        for (let i = 0; i < TWO_PI; i += TWO_PI/this.points) {
          let r = this.size * (0.4 + noise(cos(i)+this.noiseSeed, sin(i)+this.noiseSeed)*0.8);
          let px = cos(i) * r;
          let py = sin(i) * r;
          vertex(px, py);
        }
        endShape(CLOSE);
        pop();
      };
      break;

    case 'line':
      el.hue = pickPaletteHue();
      el.len = random(80, width*0.6);
      el.thin = random(1,8);
      el.update = function(){
        this.rot += this.rotSpeed*0.2;
        this.ox = 80*sin(frameCount*this.speed*0.3 + this.depth);
        this.oy = 80*cos(frameCount*this.speed*0.6 + this.depth);
      };
      el.draw = function(){
        push();
        translate(this.x+this.ox, this.y+this.oy);
        rotate(this.rot);
        stroke(this.hue, this.sat, this.bri, this.alpha);
        strokeWeight(this.thin);
        line(-this.len/2, 0, this.len/2, 0);
        noStroke();
        pop();
      };
      break;
  }

  return el;
}

function pickPaletteHue() {
  // convert hex palette to a rough hue by creating a color object
  let hcol = color(random(palette));
  return (hue(hcol) + random(-12,12) + 360) % 360;
}

function makeConductor() {
  // A long sweeping curved line that "conducts" the composition
  let c = {
    type: 'conductor',
    points: [],
    t: random(1000),
    depth: 20,
    update: function(){
      this.t += 0.002;
      // slowly change control points
      for (let i = 0; i < this.points.length; i++) {
        let p = this.points[i];
        p.x += sin(this.t + i*0.5) * 0.3;
        p.y += cos(this.t*1.2 + i*0.7) * 0.3;
      }
    },
    draw: function(){
      push();
      strokeWeight(2.5);
      for (let i = 0; i < 3; i++) {
        let hueShift = (i*30 + frameCount*0.02) % 360;
        stroke((pickPaletteHue()+hueShift)%360, 70, 95, 0.08 + i*0.06);
        noFill();
        beginShape();
        for (let p of this.points) curveVertex(p.x + 20*sin(frameCount*0.01 + p.x*0.0005), p.y + 20*cos(frameCount*0.008 + p.y*0.0006));
        endShape();
      }
      pop();
    }
  };
  // initialize points across the canvas to form a sweeping curve
  let n = 8;
  for (let i = 0; i < n; i++) {
    let px = map(i, 0, n-1, width*0.05, width*0.95) + random(-80,80);
    let py = height*0.15 + sin(i*1.1)*height*0.25 + random(-120,120);
    c.points.push({x:px, y:py});
  }
  return c;
}

/* ----------------------
   Spawns & interactions
   ---------------------- */

function spawnSplash() {
  // create quick burst of small shapes around a random focus
  let cx = random(width*0.15, width*0.85);
  let cy = random(height*0.1, height*0.9);
  for (let i = 0; i < 18; i++) {
    let el = makeElement();
    el.x = cx + random(-60,60);
    el.y = cy + random(-60,60);
    el.size = random(8,50);
    el.alpha = random(0.5,1);
    el.depth = 25 + random(0,10);
    el.rotSpeed = random(-4,4);
    elements.push(el);
  }
  // prune oldest occasionally
  if (elements.length > 120) {
    elements.splice(0, elements.length - 100);
  }
}

/* ----------------------
   Optional: mouse interaction
   ---------------------- */

function mousePressed() {
  // plant a bold shape where the user clicks
  let el = makeElement();
  el.x = mouseX;
  el.y = mouseY;
  el.size = random(60, 260);
  el.depth = 40;
  el.alpha = 0.95;
  el.rotSpeed = random(-2,2);
  elements.push(el);
  // keep composition balanced
  if (elements.length > 160) elements.shift();
}
