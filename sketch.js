/** Global variables */
//* ML5 handpose webcam variables */
let handpose;
let video;
let predictions = [];
let dims = {};
let averageX = 0;
let averageY = 0;
let newAverageX, newAverageY;

//* images */
let hand;

//* reading palm variables */
let videoOpacity = 50;
let readingPalmMode = true; //variable used when the image "hand" is visible
let readingPalm = false; //variable used to when the user's hand is above the image "hand"
let whileReadingTimer = 0;
let readingComplete = false;

//* aura array */
let isAuraChose = false;
let chosenAura = {
    color: '',
    RGB: '',
    text: '',
    song: 'playtime'
};
let auras = [
    {
        color: "Red",
        RGB: "#CF2E2E",
        text: "You are both emotionally and psychically grounded or balanced. Material wealth and spending is a fun game, and you hate to deny yourself the simple pleasures in life.",
        song: "playtime"
    },
    {
        color: "Orange",
        RGB: "#FF6900",
        text: "You are quick to make and keep friends. Your emotions are highly influenced by the relationships you have with others.",
        song: "playtime"

    },
    {
        color: "Yellow",
        RGB: "#FCB900",
        text: "You have a playful awakened spirit, a high self-esteem, high intellect and a huge hunger for greatness.",
        song: "playtime"
    },
    {
        color: "Green",
        RGB: "#00D084",
        text: "You are either in love with someone who balances you out, or you have a kind, loving heart. You have also a loving kindness towards animals, plants, friends, family and life in general.",
        song: "love"
    },
    {
        color: "Blue",
        RGB: "#0693E3",
        text: "You are usually in a calm state of mind. You can't be bothered easily. You are frequently a support system for your friends and family.",
        song: "calm"
    },
    {
        color: "Indigo",
        RGB: "#4B0082",
        text: "You search for the truths that the unknown holds and you can sense other people's energies. You can also see past the deceit that people try to pass as truth.",
        song: "dark"
    },
    {
        color: "Purple",
        RGB: "#800080",
        text: 'You are intuitive and the type of person to "view the larger picture". You love everyone and to guide others to their highest potential.',
        song: "love"
    },
    {
        color: "Pink",
        RGB: "#F78DA7",
        text: "You are happy and in harmony with yourself and those around you. You are very gentle to yourself and others.",
        song: "calm"
    },
    {
        color: "Black",
        RGB: "#000",
        text: "You have a large amount of built-up anger or grief inside of you. You haven't forgiven what has happened to you and you're still holding onto that pain.",
        song: "dark"
    },
    {
        color: "White",
        RGB: "#fff",
        text: "In this life, you are more concerned with your positive impact in others lives. You don't care so much for material possession or needs.",
        song: "calm"
    },
]

//* songs */
let playtime, love, dark, calm;

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
        averageY = 0;

        for (let j = 0; j < prediction.landmarks.length; j += 1) {
            const keypoint = prediction.landmarks[j]; /* coords for every each circle */

            let newX = map(keypoint[0], 0, dims.videoWidth, 0, dims.canvasWidth)
            let newY = map(keypoint[1], 0, dims.videoHeight, 0, dims.canvasHeight)

            if (!readingComplete) {
                let hue = colorRainbowHue();
                fill(hue, 100, 100);

                noStroke();
                circle(newX, newY, 10);
            }

            averageX += keypoint[0]
            averageY += keypoint[1]

            if (j == prediction.landmarks.length-1) {
                averageX = averageX / prediction.landmarks.length;
                newAverageX = map(averageX, 0, dims.videoWidth, 0, width);

                averageY = averageY / prediction.landmarks.length;
                newAverageY = map(averageY, 0, dims.videoHeight, 0, height);

                //* calculates size that the circle should have, considering the hand depth towards the camera */
                let circleSize = sizeOfAuraCircle(prediction.landmarks);

                if (readingComplete) {
                    colorMode(RGB, 255);

                    let translucentColor = color(chosenAura.RGB);
                    translucentColor.setAlpha(150);

                    fill(translucentColor);
                    noStroke();

                    circle(newAverageX, newAverageY, circleSize);
                }
            }
        }
    }
}

/**
 * function that determines the smallest and biggest X value in the entire keypoints array
 * after determining that, it calculates the distance between both, getting width of the hand
 * @param {*} keypoints receives all of the 21 keypoints detected from user's hand (thanks to ML5 library)
 * @returns the distance between both the keypoints that are furthest to the left and right
 */
function sizeOfAuraCircle(keypoints) {
    let smallestX = width;
    let biggestX = 0;

    for (const keypoint of keypoints) {
        if (keypoint[0] < smallestX) {
            smallestX = keypoint[0]
        };

        if (keypoint[0] > biggestX) {
            biggestX = keypoint[0]
        };
    }

    let handWidth = (biggestX - smallestX)*1.7;

    return handWidth;
}

function preload() {
    //* sound */  
    playtime = loadSound("songs/playtime-bedtime-193378.mp3");
    love = loadSound("songs/fall-in-love-with-a-stranger-piano-bar-lounge-music-5853.mp3");
    dark = loadSound("songs/8-bit-halloween-story-166454.mp3");
    calm = loadSound("songs/please-calm-my-mind-125566.mp3");
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


    //* text */
    textSize(20);
    textFont('Arial');
    textAlign(CENTER, CENTER);
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
    let [centerX, centerY, maxWidth] = dialogBox();
    dialogBoxText(centerX, centerY, maxWidth);


    //* reading palm */
    if (readingPalm && !readingComplete) {
        videoOpacity += 2;
    }

    if (!readingComplete) {
        drawChargingBar();   
    }

    if (readingComplete && !isAuraChose) {
        isAuraChose = true;
        getRandomAura();
        playAuraSong();
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
    } else {
        colorMode(RGB, 255);
        fill(chosenAura.RGB)
    }

    //* definition of dialog box size */
    let iW = width*0.3; //initial X
    let fW = width*0.7; //final X
    let mW = (fW+iW)/2; //middle X for bezierVertex

    let iPercentageY, fPercentageY;
    if (readingComplete) {
        iPercentageY = 0.8;
        fPercentageY = 0.78
    } else {
        iPercentageY = 0.9;
        fPercentageY = 0.88
    }
    let iTopH = height*iPercentageY; //initial Y of the top (lowest Y among the top Ys)
    let fTopH = height*fPercentageY; //final Y of the top (highest Y)
    let mTopH = (fTopH+iTopH)/2; //middle Y of the top

    let iBottomH = height*0.95; //initial Y of the bottom (highest Y among the bottom Ys)
    let fBottomH = height*0.97; //final Y of the bottom (lowest Y)
    let mBottomH = (fBottomH+iBottomH)/2; //middle Y of the bottom

    //* creations of forms for the dialog box */
    noStroke();
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
    fill('#f7f7f7')
    beginShape();
    vertex(iW+iW*0.005, mTopH);
    vertex(fW-fW*0.005, mTopH);
    vertex(fW-fW*0.005, mBottomH);
    vertex(iW+iW*0.005, mBottomH);
    vertex(iW+iW*0.005, mTopH);
    endShape();

    //* horizontal and vertical middle of the dialog box */
    let centerX = mW;
    let centerY = (fTopH+fBottomH)/2;
    let maxWidth = (fW - iW)*0.98;

    return [centerX, centerY, maxWidth];
}

/**
 * text of the dialog box
 * @param {*} centerX used to position the text horizontally in the middle of the dialog box
 * @param {*} centerY used to position the text vertically in the middle of the dialog box
 */
function dialogBoxText(centerX, centerY, maxWidth) {
    noStroke();
    fill('#000');
    textSize(20);
    textStyle(NORMAL);
    
    if (!readingComplete) {
        textAlign(CENTER, CENTER);
        text("Show one of your hands to the camera for the aura reading.", centerX-maxWidth/2, centerY, maxWidth);
    } else {
        //* text about the aura color obtained */
        fill('#000');
        text(chosenAura.text, centerX-maxWidth/2, centerY, maxWidth);
        
        //* color of the aura as a "title" */
        textSize(45);
        textStyle(BOLD);
        stroke('#fff');
        strokeWeight(2);
        fill(chosenAura.RGB);

        text(chosenAura.color, centerX, height*0.1)
    }
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

function getRandomAura() {
    let randomNbr = Math.floor(Math.random() * auras.length);
    chosenAura = auras[randomNbr];
    console.log(chosenAura);
}

function playAuraSong() {
    if (chosenAura.song == 'playtime') {
        playtime.play();
        playtime.loop();
        playtime.setVolume(0.3);
        userStartAudio();   
    } else if (chosenAura.song == 'love') {
        love.play();
        love.loop();
        love.setVolume(0.3);
        userStartAudio(); 
    } else if (chosenAura.song == 'dark') {
        dark.play();
        dark.loop();
        dark.setVolume(0.3);
        userStartAudio(); 
    } else if (chosenAura.song == 'calm') {
        calm.play();
        calm.loop();
        calm.setVolume(0.5);
        userStartAudio(); 
    }
}

/**
 * resets the entire aura reading thing
 */
window.addEventListener('click', e => {
    videoOpacity = 50;
    readingPalmMode = true; //variable used when the image "hand" is visible
    readingPalm = false; //variable used to when the user's hand is above the image "hand"
    whileReadingTimer = 0;
    readingComplete = false;
    isAuraChose = false;

    if (chosenAura.song == 'playtime') {
        playtime.stop();
    } else if (chosenAura.song == 'love') {
        love.stop();
    } else if (chosenAura.song == 'dark') {
        dark.stop();
    } else if (chosenAura.song == 'calm') {
        calm.stop();
    }
})