/** Global variables */
//* ML5 handpose webcam variables */
let handpose;
let video;
let predictions = [];
let dims = {};
let averageX = 0;
let newAverageX;
let handSkeletonColor = "#FFFF00";

//* images */
let hand;

//* reading palm variables */
let videoOpacity = 50;
let readingPalmMode = true; //variable used when the image "hand" is visible
let readingPalm = false; //variable used to when the user's hand is above the image "hand"
let whileReadingTimer = 0;
let readingComplete = false;


/**
 * ML5 function for when camera is ready and defining its dimensions
 */
function webcamIsReady() {
    dims.canvasWidth = window.innerWidth, dims.canvasHeight = window.innerHeight
    dims.videoWidth = video.width, dims.videoHeight = video.height
}

/**
 * ML5 function to inform that model is ready
 */
function modelReady() {
    console.log("Model ready!");
    console.log('ml5 version:', ml5.version);
}

/**
 * function that draws ellipses and skeletons over the detected keypoints
 */
function drawKeypoints() {
    //if there is no hand being detected
    if (predictions.length == 0) {
        if (!readingComplete) {
            readingPalm = false;
            whileReadingTimer = 0; //resets timer
            videoOpacity = 50;
        }
    } else {
        //if palm just appeared in screen
        if (!readingPalm) {
            readingPalm = true;
            whileReadingTimer = ms;
        }

        //if palm is still consistent in the screen and the timer reaches 5 seconds
        if (ms - whileReadingTimer > 5000 && readingPalm) {
            readingComplete = true;
        }
    }
    
    for (let i = 0; i < predictions.length; i += 1) {
        const prediction = predictions[i]; /* coords for every circle on every finger */
        averageX = 0;

        for (let j = 0; j < prediction.landmarks.length; j += 1) {
            const keypoint = prediction.landmarks[j]; /* coords for every each circle */

            let newX = map(keypoint[0], 0, dims.videoWidth, 0, dims.canvasWidth)
            let newY = map(keypoint[1], 0, dims.videoHeight, 0, dims.canvasHeight)

            fill(handSkeletonColor);
            noStroke();
            circle(newX, newY, 10);

            averageX += keypoint[0]

            if (j == prediction.landmarks.length-1) {
                averageX = averageX / prediction.landmarks.length;
                newAverageX = map(averageX, 0, dims.videoWidth, 0, width);
            }
        }
    }
}

function preload() {
    hand = loadImage('images/hand.png');
}

function setup() {
    //* canvas setting */
    document.querySelector('#divBackground').style.height = window.innerHeight + 'px'
    let canvasW = window.innerWidth;
    let canvasH = window.innerHeight;
    let canvas = createCanvas(canvasW, canvasH);
    canvas.parent("divBackground");

    //* ML5 */
    video = createCapture(VIDEO, webcamIsReady);
    handpose = ml5.handpose(video, modelReady);
    handpose.on("predict", results => {
        predictions = results;
    });
    video.hide();
}

function draw() {
    clear();
    colorMode(RGB, 255);
    ms = millis(); //counts milliseconds throughout the running of the code

    //* ML5 default code */
    push();
    translate(0, 0);
    tint(255, 255, 255, videoOpacity);
    // scale(-1, 1)
    image(video, 0, 0, width, height);
    pop();
    drawKeypoints();

    //* reading palm */
    if (readingPalm && !readingComplete) {
        videoOpacity += 2;
    }

    if (!readingComplete) {
        drawChargingBar();   
    }
}

function drawChargingBar() {
    //* code responsable for making the filling of the rectangle progress with the "reading of palm" */
    let iW = width*0.3;
    let iH = height*0.05;
    let fW = width*0.7;
    let fH = height*0.1;

    let currentTimer = ms - whileReadingTimer;
    let progressW = 0;

    if (readingPalm && !readingComplete) { //if palm is being read and reading isn't complete
        progressW = ((fW-iW)*currentTimer)/5000; //math rule of three to discover the filling of the rectangle's width corresponding to timer
    } else if (!readingPalm && !readingComplete) { //resets progress bar if the reading is stops before being complete
        progressW = 0;
    }

    //* drawing of rectangle's border and its filling */
    noFill();
    stroke("#000");
    strokeWeight(2);

    //border
    beginShape();
    vertex(iW, iH);
    vertex(fW, iH);
    vertex(fW, fH);
    vertex(iW, fH);
    vertex(iW, iH);
    endShape();

    
    /* Calculate hue for rainbow effect */
    colorMode(HSB, 360, 100, 100); //sets color mode to HSB
    let hue = map(currentTimer, 0, 5000, 0, 360); // Map the time to a full circle of hues (0-360 degrees)

    fill(hue, 100, 100);
    noStroke();

    //filling of border
    beginShape();
    vertex(iW, iH);
    vertex(iW+progressW, iH);
    vertex(iW+progressW, fH);
    vertex(iW, fH);
    vertex(iW, iH);
    endShape();
}