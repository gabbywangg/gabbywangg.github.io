function setup() {
  let canvas = createCanvas(400, 400);
  canvas.parent("sketch-holder"); // attaches canvas to div
  noStroke();
}

function draw() {
  background(20, 20, 40);
  fill(255, 165, 0, 150);
  ellipse(mouseX, mouseY, 80, 80);
}
