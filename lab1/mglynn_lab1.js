var g_points = []; // The array for the position of a mouse press
var vBuffer = new Float32ArrayList();

// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '  gl_PointSize = 10.0;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'void main() {\n' +
    '  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n' +
    '}\n';

//main() is the entry point of our application
function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Write the positions of vertices to a vertex shader
    initVertexBuffers(gl);

    // // Get the storage location of a_Position
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function (ev) {
        click(ev, gl, canvas, a_Position);
    };
    canvas.onmousemove = function (ev) {
        mouse_move(ev, gl, canvas, a_Position);
    };

    // Disable the right click context menu
    canvas.addEventListener('contextmenu', function (e) {
        if (e.button == 2) {
            e.preventDefault();
            return false;
        }
    }, false);

    // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var isDone = false;
var hasStarted = false;

//Function called on click event.
function click(ev, gl, canvas, a_Position) {
    if (!hasStarted && ev.button == 0) { //Don't start drawing the line until a LEFT click
        hasStarted = true;
    }
    if (!hasStarted) return; //No LEFT click has been detected yet
    if (isDone) return; //We've received a RIGHT click and the program is 'done'
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    console.log("Added point: (" + x + ", " + y + ")"); //The most recent point clicked

    if (vBuffer.length == 0) { //On our first point, we must add a second to get 'rubber band' effect
        vBuffer.Push(x);
        vBuffer.Push(y);
    }

    //Add our new point to the vertex buffer
    vBuffer.Push(x);
    vBuffer.Push(y);

    draw_canvas(gl, a_Position);

    if (ev.button == 2) {
        finish();
    } //Right click

}

//Called when the mouse moves
function mouse_move(ev, gl, canvas, a_Position) {
    if (isDone) return; //Have we received a right click?
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    //Update the latest point in our buffer. Since we start by adding two, this last point
    //is dedicated to the rubber band effect
    vBuffer._data[vBuffer.length - 2] = x;
    vBuffer._data[vBuffer.length - 1] = y;

    draw_canvas(gl);

}

function draw_canvas(gl) {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vBuffer._data, gl.DYNAMIC_DRAW);

    //Draw everything
    gl.drawArrays(gl.POINTS, 0, vBuffer.length / 2);
    gl.drawArrays(gl.LINE_STRIP, 0, vBuffer.length / 2);
}

function initVertexBuffers(gl) {

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
}

function finish() {
    isDone = true; //Stop execution for the mouse event related functions
    console.log("=== Right Click ===");

    //Print a list of all the points
    for (var i = 0; i < vBuffer.length - 2; i += 2) {
        console.log("(" + vBuffer._data[i] + ", " + vBuffer._data[i + 1] + ")");
    }
}

//Helper Utilities

//Wrapped Float32Array so that I can dynamically change the length with Push(elemenet)
function Float32ArrayList() {
    this.length = 0;
    this.capacity = 40;
    this._data = new Float32Array(this.capacity); //Underlying data storage

    //Add an element to the data structure
    this.Push = function (elem) {
        if (this.length >= this._data.length) {
            this.resize();
        }
        this._data[this.length] = elem;
        this.length += 1;
    };

    //Double the length of the data structure
    this.resize = function () {
        this.capacity *= 2;
        var resizedArray = new Float32Array(this.capacity);
        for (var i = 0; i < this.length; i++) {
            resizedArray[i] = this._data[i];
        }
        this._data = resizedArray;
    };
}