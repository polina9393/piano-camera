var video;

//IMAGES
var prevImg;
var currImg;
var diffImg;

var threshold = 0.073;
var grid;
var d;

function setup() {
  createCanvas(windowWidth, windowHeight);

  //GRID
  grid = new Grid(640, 480);

  pixelDensity(1);
  video = createCapture(VIDEO);
  video.hide();

}

function draw() {
  background(125);
  image(video, 0, 0);
  video.loadPixels();


  //WIDTH_HEIGHT
  var w = video.width / 4;
  var h = video.height / 4;

  //CURRENT_IMAGE
  currImg = createImage(w, h);
  currImg.copy(video, 0, 0, video.width, video.height, 0, 0, w, h); // save current frame

  //FILTERS
  currImg.filter("gray");
  currImg.filter(BLUR, 3);

  //DIFFIMAGE_SIZE
  diffImg = createImage(w, h);

  if (typeof prevImg !== 'undefined') {

    //LOADING_PIXELS FOR IMAGES
    currImg.loadPixels();
    prevImg.loadPixels();
    diffImg.loadPixels();
    video.loadPixels();

//////MAGIC////////////////////////////////////////////////////////////////////////////////////////
    for (var x = 0; x < currImg.width; x += 1) {
      for (var y = 0; y < currImg.height; y += 1) {
        var index = (x + y * currImg.width) * 4;

        //RED CHANNEL
        var r = currImg.pixels[index + 0];
        var r1 = prevImg.pixels[index + 0];

        //ABSOLUTTE_DIFF
        var d = abs(r - r1);

        //DIFF_IMAG_CHANNELS
        diffImg.pixels[index + 0] = d;
        diffImg.pixels[index + 1] = d;
        diffImg.pixels[index + 2] = d;
        diffImg.pixels[index + 3] = 255;

      }
    }
    diffImg.updatePixels();

  }
  image(currImg, 640, 0);

  //THRESHOLD & threshold = 0.073;
  diffImg.filter(THRESHOLD, threshold);


  image(diffImg, 800, 0);
  prevImg = createImage(w, h);
  prevImg.copy(currImg, 0, 0, currImg.width, currImg.height, 0, 0, w, h);

  //GRID_UPDATE
  grid.update(diffImg);


}

function mousePressed() {

  //THRESHOLD_SETTINGS
  threshold = map(mouseX, 0, video.width, 0, 1);
  return threshold;

}

//////GRID////////////////////////////////////////////////////////////////////////////////////////

var Grid = function(_w, _h) {
  this.diffImg = 0;
  this.noteWidth = 40;
  this.worldWidth = _w;
  this.worldHeight = _h;
  this.numOfNotesX = int(this.worldWidth / this.noteWidth);
  this.numOfNotesY = int(this.worldHeight / this.noteWidth);
  this.arrayLength = this.numOfNotesX * this.numOfNotesY;
  this.noteStates = [];
  this.noteStates = new Array(this.arrayLength).fill(0);
  this.colorArray = [];
  console.log(this);
  console.log(_w, _h);

  // set the original colors of the notes
  for (var i = 0; i < this.arrayLength; i++) {
    this.r = 0;
    this.g = 255
    this.b = random(200, 255);
    this.a = random(255);
    this.colorArray.push(color(this.r, this.g, this.b, this.a));
  }

  this.update = function(_img) {
    this.diffImg = _img;
    this.diffImg.loadPixels();
    for (var x = 0; x < this.diffImg.width; x += 1) {
      for (var y = 0; y < this.diffImg.height; y += 1) {
        var index = (x + (y * this.diffImg.width)) * 4;
        var state = diffImg.pixels[index + 0];
        if (state == 255) {
          var screenX = map(x, 0, this.diffImg.width, 0, this.worldWidth);
          var screenY = map(y, 0, this.diffImg.height, 0, this.worldHeight);
          var noteIndexX = int(screenX / this.noteWidth);
          var noteIndexY = int(screenY / this.noteWidth);
          var noteIndex = noteIndexX + noteIndexY * this.numOfNotesX;
          this.noteStates[noteIndex] = 1;
        }
      }
    }


    for (var i = 0; i < this.arrayLength; i++) {
      this.noteStates[i] -= 0.05;
      this.noteStates[i] = constrain(this.noteStates[i], 0, 1);
    }

    this.draw();
  };


  this.draw = function() {
    push();
    noStroke();
    for (var x = 0; x < this.numOfNotesX; x++) {
      for (var y = 0; y < this.numOfNotesY; y++) {
        var posX = this.noteWidth / 2 + x * this.noteWidth;
        var posY = this.noteWidth / 2 + y * this.noteWidth;
        var noteIndex = x + (y * this.numOfNotesX);


        if (this.noteStates[noteIndex] > 0) {
          var changingSize = this.noteStates[noteIndex];

          fill(this.colorArray[noteIndex]);
          ellipse(posX, posY, this.noteWidth * changingSize, this.noteWidth * changingSize);
        }
      }
    }
    pop();
  }
};
