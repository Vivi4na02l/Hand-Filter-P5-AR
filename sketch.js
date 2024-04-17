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

                //if the "hand" image is visible in the screen
                if (readingPalmMode) {
                    if (newAverageX < width*0.75 && newAverageX > width*0.05) { //if user's hand is above the image "hand"

                        if (!readingPalm) {
                            readingPalm = true;
                            whileReadingTimer = ms;
                        }
                        
                        if (ms - whileReadingTimer > 2000) {
                            readingComplete = true;
                        }
                    } else {
                        if (!readingComplete) {
                            readingPalm = false;
                            whileReadingTimer = 0; //resets timer
                        }
                    }
                }
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
    ms = millis(); //counts milliseconds throughout the running of the code

    //* ML5 default code */
    push();
    translate(0, 0);
    tint(255, 255);
    // scale(-1, 1)
    image(video, 0, 0, width, height);
    pop();
    drawKeypoints();

    //* reading palm */
    if (readingPalm) {
        
    } else if (!readingPalm && !readingComplete) {

    }
}