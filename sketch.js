/** Global variables */
//* ML5 handpose webcam variables */
let handpose;
let video;
let predictions = [];
let dims = {};
let averageX = 0;
let newAverageX;

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

            if (!readingComplete) {
                let currentTimer = ms - whileReadingTimer;

                let hue = colorRainbowHue();
                fill(hue, 100, 100);

                noStroke();
                circle(newX, newY, 10);
            }

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

    //* dialog box */
    dialogBox();

    //* reading palm */
    if (readingPalm && !readingComplete) {
        videoOpacity += 2;
    }

    if (!readingComplete) {
        drawChargingBar();   
    }
}

/**
 * calculates hue for rainbow effect
 * @returns rainbow hue
 */
function colorRainbowHue() {
    let currentTimer = ms - whileReadingTimer;

    colorMode(HSB, 360, 100, 100); //sets color mode to HSB
    let hue = map(currentTimer, 0, 5000, 0, 360); // Map the time to a full circle of hues (0-360 degrees)

    return hue;
}

/**
 * function that creates the dialog box
 */
function dialogBox() {
    //* color */
    /* for the color of the rectangle behind the dialog box */
    if (readingPalm && !readingComplete) {
        let hue = colorRainbowHue();
        fill(hue, 100, 100);   
    } else if (!readingPalm && !readingComplete) {
        colorMode(RGB, 255);
        fill('#000')
    }

    //* creations of forms for the dialog box */
    let iW = width*0.3; //initial X
    let fW = width*0.7; //final X
    let mW = (fW+iW)/2; //middle X for bezierVertex

    let iTopH = height*0.9; //initial Y of the top (lowest Y among the top Ys)
    let fTopH = height*0.88; //final Y of the top (highest Y)
    let mTopH = (fTopH+iTopH)/2; //middle Y of the top

    let iBottomH = height*0.95; //initial Y of the bottom (highest Y among the bottom Ys)
    let fBottomH = height*0.97; //final Y of the bottom (lowest Y)
    let mBottomH = (fBottomH+iBottomH)/2; //middle Y of the bottom


    beginShape();
    bezierVertex(iW, iTopH,
                 mW, mTopH,
                 fW, fTopH);
    vertex(fW, fTopH);
    vertex(fW, iBottomH);
    bezierVertex(fW, iBottomH,
                 mW, mBottomH,
                 iW, fBottomH);
    vertex(iW, fBottomH);
    vertex(iW, iTopH);
    endShape();

    colorMode(RGB, 255);
    fill('#fff')
    beginShape();
    vertex(iW+iW*0.005, mTopH);
    vertex(fW-fW*0.005, mTopH);
    vertex(fW-fW*0.005, mBottomH);
    vertex(iW+iW*0.005, mBottomH);
    vertex(iW+iW*0.005, mTopH);
    endShape();
}

/**
 * code responsable for making the border and filling of the rectangle progress bar representing the "reading of palm"
 */
function drawChargingBar() {
    //* logic for filling of the rectangle progress bar */
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

    let hue = colorRainbowHue();
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