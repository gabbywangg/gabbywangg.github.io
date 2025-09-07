let points = [];
let SPACING = 20;
let DOT_SIZE = 4;
let INFLUENCE = 140;
let FORCE = 9000;
let MAX_OFFSET = 40;
let RETURN_SPEED = 0.12;
let JITTER = 8;
let palette = [];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("hero-sketch"); // attach canvas to hero section
  noStroke();

  palette = [
      color(204, 103, 94),    // tomato red
    color(116, 152, 161),   // steel blue
    color(158, 141, 72),   // medium sea green
    color(223, 147, 128),  // violet
    color(255, 255, 255) 
  ];

  initPoints();
}

function draw() {
  background(243, 236, 218); // cream background

  for (let p of points) {
    // spring back
    p.pos.x = lerp(p.pos.x, p.home.x, RETURN_SPEED);
    p.pos.y = lerp(p.pos.y, p.home.y, RETURN_SPEED);

    // mouse repulsion
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
      let dx = p.pos.x - mouseX;
      let dy = p.pos.y - mouseY;
      let d2 = dx * dx + dy * dy;

      if (d2 < INFLUENCE * INFLUENCE && d2 > 0.0001) {
        let d = sqrt(d2);
        let strength = (FORCE / d2) * (1 - d / INFLUENCE);
        p.pos.x += (dx / d) * strength;
        p.pos.y += (dy / d) * strength;

        // cap displacement
        let ox = p.pos.x - p.home.x;
        let oy = p.pos.y - p.home.y;
        let o2 = ox * ox + oy * oy;
        let max2 = MAX_OFFSET * MAX_OFFSET;
        if (o2 > max2) {
          let o = sqrt(o2);
          p.pos.x = p.home.x + (ox / o) * MAX_OFFSET;
          p.pos.y = p.home.y + (oy / o) * MAX_OFFSET;
        }
      }
    }

    fill(p.col);
    circle(p.pos.x, p.pos.y, DOT_SIZE);
  }
}

function initPoints() {
  points = [];
  let cols = floor(width / SPACING);
  let rows = floor(height / SPACING);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let hx = x * SPACING + random(-JITTER, JITTER);
      let hy = y * SPACING + random(-JITTER, JITTER);
      let home = createVector(hx, hy);
      let col = random(palette);
      points.push({ home: home, pos: home.copy(), col: col });
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initPoints();
}
