import { vsSource } from "./shaders2(S).js";
import { fsSource } from "./shaders2(S).js";


const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

const zoroImage = document.getElementById('zoro');

if (!gl) {
    throw new Error("WebGL not supported");
}

// Vertices
const vertexData = [

    0.5, 0.5, 0,    // I
    -0.5, 0.5, 0,   // II
    -0.5, -0.5, 0,  // III
    0.5, -0.5, 0,   // IV
  // BOTTOM face (Green)

0.5, -0.5, 1,   // IV
-0.5, -0.5, 1,  // III
-0.5, -0.5, 0,  // III
0.5, -0.5, 0,   // IV

// LEFT face (Blue)
-0.5, -0.5, 1,  // III
-0.5, 0.5, 1,   // II
-0.5, 0.5, 0,   // II
-0.5, -0.5, 0,  // III

// TOP face (Yellow)
-0.5, 0.5, 1,   // II
0.5, 0.5, 1,    // I
0.5, 0.5, 0,    // I
-0.5, 0.5, 0,   // II

// BACK face
0.5, 0.5, 1,    // I
-0.5, 0.5, 1,   // II
-0.5, -0.5, 1,  // III
0.5, -0.5, 1,   // IV

// RIGHT face (Purple)
0.5, 0.5, 1,    // I
0.5, 0.5, 0,    // I
0.5, -0.5, 0,   // IV
0.5, -0.5, 1    // IV

];

const zoroTexCoordinate = [
    1, 1, // Bottom right
    0, 1, // Bottom left
    0, 0, // Top left
    1, 0,

    1, 1, // Bottom right
    0, 1, // Bottom left
    0, 0, // Top left
    1, 0,

    1, 1, // Bottom right
    0, 1, // Bottom left
    0, 0, // Top left
    1, 0,

    1, 1, // Bottom right
    0, 1, // Bottom left
    0, 0, // Top left
    1, 0,
    
    1, 1, // Bottom right
    0, 1, // Bottom left
    0, 0, // Top left
    1, 0,

    1, 1, // Bottom right
    0, 1, // Bottom left
    0, 0, // Top left
    1, 0,
    
   
];


// Buffer
const buffer = gl.createBuffer();
if (!buffer) {
    console.error("Failed to create ZoroBuffer");
} else {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData ), gl.STATIC_DRAW);
}

//zoro buffer

const zoroBuffer = gl.createBuffer();
if (!buffer) {
    console.error("Failed to create buffer");
} else {
    gl.bindBuffer(gl.ARRAY_BUFFER,  zoroBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(zoroTexCoordinate), gl.STATIC_DRAW);
}

const shipTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, shipTexture);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // This flips the image orientation to be upright.

if (isPowerOfTwo(zoroImage.width) && isPowerOfTwo(zoroImage.height)) {
    gl.generateMipmap(gl.TEXTURE_2D);
} else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
}
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, zoroImage);


// Vertex shader
const vertexShaderSourceCode = vsSource;
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vsSource);
gl.compileShader(vertexShader);

// Error checking for vertex shader
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(`Vertex shader compilation error:
     ${gl.getShaderInfoLog(vertexShader)}
     `);
}

// Fragment shader
const fragmentShaderSourceCode = fsSource;
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsSource);
gl.compileShader(fragmentShader);

// Error checking for fragment shader
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(`Fragment shader compilation error:
     ${gl.getShaderInfoLog(fragmentShader)}
     `);
}

// Program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// Linking error
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(`Shader program linking error:
     ${gl.getProgramInfoLog(program)}
     `);
}

const positionLocation = gl.getAttribLocation(program, "pos");
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

//Atttribute location of texture coordinates
const zoroTexCoordLocation = gl.getAttribLocation(program, "ztexCoord");
gl.enableVertexAttribArray(zoroTexCoordLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, zoroBuffer); 
gl.vertexAttribPointer(zoroTexCoordLocation, 2, gl.FLOAT, false, 0, 0);

const uMatrix = gl.getUniformLocation(program, 'u_Matrix')



function multiplyMatrices(matrixA, matrixB) {
    let result = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 4; k++) {
                result[i * 4 + j] += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
        }
    }
    return result;
}

let theta = Math.PI / 1;


draw();
function draw() {
    gl.clearColor(0, 0, 0, 0); // Set clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear both color and depth buffer
    gl.useProgram(program);

    theta = theta + Math.PI / 500;


    //Step5 make the matrix for each rotation this must be in the animation loop funciton
    const matrixX = [
        1, 0, 0, 0,
        0, Math.cos(theta), -Math.sin(theta), 0,
        0, Math.sin(theta), Math.cos(theta), 0,
        0, 0, 0, 1
    ]
    const matrixY = [
        Math.cos(theta), 0, Math.sin(theta), 0,
        0, 1, 0, 0,
        -Math.sin(theta), 0, Math.cos(theta), 0,
        0, 0, 0, 1
    ]
    const matrixZ = [
        Math.cos(theta), -Math.sin(theta), 0, 0,
        Math.sin(theta), Math.cos(theta), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]

    //Step6 use the multiplyMatrix function to multiply all your matrices together
    var matrixXY = multiplyMatrices(matrixX, matrixY);
    var matrixXYZ = multiplyMatrices(matrixXY, matrixZ);
    var matrixYZ = multiplyMatrices(matrixY, matrixZ);
    var matrixXZ = multiplyMatrices(matrixX, matrixZ);
     
    
    gl.uniformMatrix4fv(uMatrix, false, matrixXYZ); 
    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);

    

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
     gl.drawArrays(gl.TRIANGLE_FAN, 3, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);
     gl.drawArrays(gl.TRIANGLE_FAN, 12, 4);
    gl.drawArrays(gl.TRIANGLE_FAN, 16, 4);
     gl.drawArrays(gl.TRIANGLE_FAN, 20, 4);


    window.requestAnimationFrame(draw);
}

// checks if its to power of two
function isPowerOfTwo(value) {
    return (value & (value - 1)) === 0;
}
