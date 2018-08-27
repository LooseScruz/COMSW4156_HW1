var drawObjects = [];
var gl;

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

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl', {antialias: true});

    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
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
    initVertexBuffers();

    // // Get the storage location of a_Position
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    var lineObj = new DrawObject();
    lineObj.drawType = gl.LINE_STRIP;
    lineObj.SetVertices(new Float32ArrayList());
    drawObjects.push(lineObj);

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function (ev) {
        click(ev, canvas, a_Position, lineObj);
    };
    canvas.onmousemove = function (ev) {
        mouse_move(ev, canvas, a_Position, lineObj);
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

    //Initialize vertical line in the center
    var verticalLine = new DrawObject();
    verticalLine.drawType = gl.LINE_STRIP;
    verticalLine.SetVertices(new Float32ArrayList());
    add_point(verticalLine, 0, -1, 0);
    add_point(verticalLine, 0, 1, 0);
    drawObjects.push(verticalLine);
    draw_canvas();

    //Call update() 60 times per second
    window.setInterval(function () {
        update();
    }, 1000 / 60);

    //Set elements in HTML in case their state has been cached
    document.getElementById('shownormals').checked = false;
    document.getElementById('shouldupdate').checked = false;

    //Add event listeners to parts of the HTML
    document.getElementById('fileinput').addEventListener('change', input_load);
    document.getElementById('savesor').addEventListener('click', button_save);
    document.getElementById('shownormals').addEventListener('change', function () {
        if (!isDone) {
            document.getElementById('shownormals').checked = false;
            alert("Finish you SOR first");
        } else {
            toggle_normals();
            draw_canvas();
        }
    });
    document.getElementById('shouldupdate').addEventListener('change', function () {
        should_update = document.getElementById('shouldupdate').checked;
    });
    setupIOSOR('fileinput');
}

var isDone = false;
var hasStarted = false;
var should_update = false;

//Update function - standard among game engines
function update() {
    if (!isDone || !should_update) return;
    //For now, rotate everything around the y-axis
    for (var d = 0; d < drawObjects.length; d++) {
        for (var i = 0; i < drawObjects[d].vertices.length; i += 3) {
            var rotV = rotate_vector3(
                new Vector3([drawObjects[d].vertices._data[i],
                    drawObjects[d].vertices._data[i + 1],
                    drawObjects[d].vertices._data[i + 2]]), 0.1);
            drawObjects[d].vertices._data[i] = rotV.elements [0];
            drawObjects[d].vertices._data[i + 1] = rotV.elements [1];
            drawObjects[d].vertices._data[i + 2] = rotV.elements [2];
        }
    }
    draw_canvas();
}

function click(ev, canvas, a_Position, drawObj) {
    if (!hasStarted && ev.button == 0) { //Don't start drawing the line until a LEFT click
        hasStarted = true;
    }
    if (!hasStarted) return; //No LEFT click has been detected yet
    if (isDone) return; //We've received a RIGHT click and the program is 'done'
    var x = ((ev.clientX > canvas.width / 2 + 1) ? ev.clientX : canvas.width / 2 + 1); // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    console.log("Added point: (" + x + ", " + y + ")"); //The most recent point clicked

    if (drawObj.vertices.length == 0) { //On our first point, we must add a second to get 'rubber band' effect
        add_point(drawObj, x, y, 0);
    }

    //Add our new point to the vertex buffer

    draw_canvas(a_Position);

    if (ev.button == 2) {
        finish();
    } //Right click
    else {
        add_point(drawObj, x, y, 0);
    }

}

//Called when the mouse moves
function mouse_move(ev, canvas, a_Position, drawObj) {
    if (isDone) return; //Have we received a right click?
    var x = ((ev.clientX > canvas.width / 2 + 1) ? ev.clientX : canvas.width / 2 + 1); // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    //Update the latest point in our buffer. Since we start by adding two, this last point
    //is dedicated to the rubber band effect
    drawObj.vertices._data[drawObj.vertices.length - 3] = x;
    drawObj.vertices._data[drawObj.vertices.length - 2] = y;

    draw_canvas();

}

function draw_canvas() {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (var i = 0; i < drawObjects.length; i++) {
        if (drawObjects[i].enabled) {
            // Write date into the buffer object
            gl.bufferData(gl.ARRAY_BUFFER, drawObjects[i].vertices._data, gl.DYNAMIC_DRAW);
            gl.drawArrays(drawObjects[i].drawType, 0, drawObjects[i].vertices.length / 3);
        }
    }
}

function initVertexBuffers() {

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
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
}

function finish() {
    drawObjects.pop(); //Remove user's line drawing
    isDone = true; //Stop execution for the mouse event related functions
    console.log("=== Right Click ===");

    //Print a list of all the points
    for (var i = 0; i < drawObjects.length; i++) {
        for (var j = 0; j < drawObjects[i].vertices.length; j += 3) {
            console.log("(" + drawObjects[i].GetVertex(j) + ", " + drawObjects[i].GetVertex(j + 1) + ")");
        }
    }
    //Create SOR with timestamp as a name
    var date = new Date();
    var solidOfRevolution = createSOR("SOR_" + date.getFullYear() + "_" + (date.getMonth() + 1) + "_" + date.getDate() + "_" + date.toLocaleTimeString().replace(' ', ''), drawObjects[0].vertices, 10);
    drawObjects[0].vertices = new Float32ArrayList();
    for (var i = 0; i < solidOfRevolution.vertices.length; i++) {
        drawObjects[0].vertices.Push(solidOfRevolution.vertices[i]);
    }
    drawObjects.pop(); //Remove vertical line
    renderSOR(solidOfRevolution);
    finishedSOR = solidOfRevolution;
}

function add_point(drawObj, x, y, z) {
    drawObj.vertices.Push(x);
    drawObj.vertices.Push(y);
    drawObj.vertices.Push(z);
}

//Assignment specific functions
var finishedSOR;
//vertices should be a Float32ArrayList and angle_deltas should be 10°
function createSOR(name, vertices, angle_deltas) {
    var sorVertices = new Float32ArrayList();
    for (var a = 0; a > -360; a -= angle_deltas) {
        for (var i = 0; i < vertices.length; i += 3) {
            //Rotate vector
            var rotv = rotate_vector3(
                new Vector3([vertices.get(i), vertices.get(i + 1), vertices.get(i + 2)]), a);
            sorVertices.Push(rotv.elements[0]);
            sorVertices.Push(rotv.elements[1]);
            sorVertices.Push(rotv.elements[2]);
        }
    }

    var numPoints = vertices.length / 3;
    vertices = sorVertices;
    var triangle_ordering = new Float32ArrayList();
    for (var o = 0; o < 360 / angle_deltas - 1; o++) { //All but the final strip which wraps around
        for (var i = 0; i < numPoints - 1; i++) {
            //First triangle of the quad
            triangle_ordering.Push(o * numPoints + i);
            triangle_ordering.Push(o * numPoints + i + 1);
            triangle_ordering.Push((o + 1) * numPoints + i);

            //Second triangle of the quad
            triangle_ordering.Push((o + 1) * numPoints + i);
            triangle_ordering.Push(o * numPoints + i + 1);
            triangle_ordering.Push((o + 1) * numPoints + i + 1);
        }
    }
    //Final wrap around the back
    for (var i = 0; i < numPoints - 1; i++) {
        //First triangle of the quad
        triangle_ordering.Push((360 / angle_deltas - 1) * numPoints + i);
        triangle_ordering.Push((360 / angle_deltas - 1) * numPoints + i + 1);
        triangle_ordering.Push(i);

        //Second triangle of the quad
        triangle_ordering.Push(i);
        triangle_ordering.Push((360 / angle_deltas - 1) * numPoints + i + 1);
        triangle_ordering.Push(i + 1);
    }
    //vBuffer = triangle_ordering;
    var vertexOut = [];
    var indexOut = [];

    //Convert to a standard array
    for (var i = 0; i < vertices.length; i++) {
        vertexOut.push(vertices.get(i));
    }

    //Convert to a standard array
    for (var i = 0; i < triangle_ordering.length; i++) {
        indexOut.push(triangle_ordering.get(i));
    }

    return new SOR(name, vertexOut, indexOut);
}

var hasCreatedNormals = false;
var is_showing_normals = false;
function toggle_normals() {
    var newState = document.getElementById('shownormals').checked;
    if (newState == is_showing_normals) return; //We were already doing this
    if (!hasCreatedNormals) {
        var count = drawObjects.length;
        for (var i = 0; i < count; i++) {
            //Collect the vertices of the triangle
            var p1 = new Vector3([drawObjects[i].GetVertex(0),
                drawObjects[i].GetVertex(1),
                drawObjects[i].GetVertex(2)]);
            var p2 = new Vector3([drawObjects[i].GetVertex(3),
                drawObjects[i].GetVertex(4),
                drawObjects[i].GetVertex(5)]);
            var p3 = new Vector3([drawObjects[i].GetVertex(6),
                drawObjects[i].GetVertex(7),
                drawObjects[i].GetVertex(8)]);
            //Calculate the center of the triangle
            var average_vector = centerOfTriangle(p1, p2, p3);
            var normal_draw_obj = new DrawObject();
            normal_draw_obj.drawType = gl.LINE_STRIP;
            normal_draw_obj.SetVertices(new Float32ArrayList());
            //Calculate the other end of the normal vector
            var norm_endpoint = addVectors(average_vector, scaleVector(cross_product(
                addVectors(p2, scaleVector(p1, -1)),
                addVectors(p3, scaleVector(p1, -1))
            ).normalize(), 0.25));
            //Add points to render object
            add_point(normal_draw_obj, average_vector.elements[0],
                average_vector.elements[1],
                average_vector.elements[2]);
            add_point(normal_draw_obj, norm_endpoint.elements[0],
                norm_endpoint.elements[1],
                norm_endpoint.elements[2]);
            //Add to render queue
            drawObjects.push(normal_draw_obj);
        }
        hasCreatedNormals = true;
    }
    for (var i = drawObjects.length / 2; i < drawObjects.length; i++) {
        drawObjects[i].enabled = newState;
    }
    is_showing_normals = newState;
}

//Push each face into the draw queue
function renderSOR(sor) {
    for (var i = 0; i < sor.indexes.length; i += 3) {
        var face = new DrawObject();
        face.SetVertices(new Float32ArrayList());
        //For this un-optimized version, each face is it's own draw pass
        for (var j = 0; j < 3; j++) {
            add_point(face, sor.vertices[sor.indexes[i + j] * 3],
                sor.vertices[sor.indexes[i + j] * 3 + 1],
                sor.vertices[sor.indexes[i + j] * 3 + 2]);
        }
        drawObjects.push(face);
    }
    draw_canvas();
}

var checkLoad;
function input_load() { //Wait for the async to be done
    checkLoad = window.setInterval(load_SOR, 100);
}

//Called by the save SOR button
function button_save() {
    if (!isDone) {
        alert("Error: Please complete the SOR");
    }
    else {
        saveFile(finishedSOR);
    }
}

//Attempt to load the SOR from ioSOR.js
function load_SOR() {
    var fileOut = readFile();
    if (typeof fileOut != 'undefined') {
        window.clearInterval(checkLoad);
        drawObjects = [];
        renderSOR(fileOut);
        isDone = true;
    }
}

//Helper Utilities

//An object which can be rendered
function DrawObject() {
    this.drawType = gl.LINE_LOOP;
    this.enabled = true;
    this.SetVertices = function (vertices) {
        this.vertices = vertices;
    };

    this.GetVertex = function (index) {
        return this.vertices.get(index);
    };
}

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

    this.get = function (index) {
        return this._data[index];
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

//Rotate a Vector3 around the y-axis
function rotate_vector3(vector, angle_in_degrees) {
    var r = deg2rad(angle_in_degrees);
    var s = Math.sin(r);
    var c = Math.cos(r);
    var multMatrix = new Matrix4();
    multMatrix.elements = [
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1];
    return multMatrix.multiplyVector3(vector);
}

//Convert Degrees to Radians
function deg2rad(degrees) {
    return degrees * (Math.PI / 180);
}

//Cross Vector3s
function cross_product(v1, v2) {
    return new Vector3([v1.elements[1] * v2.elements[2] - v1.elements[2] * v2.elements[1],
        v1.elements[2] * v2.elements[0] - v1.elements[0] * v2.elements[2],
        v1.elements[0] * v2.elements[1] - v1.elements[1] * v2.elements[0]]);
}

//Average Vector3s
function centerOfTriangle(p1, p2, p3) {
    return new Vector3([(p1.elements[0] + p2.elements[0] + p3.elements[0]) / 3,
        (p1.elements[1] + p2.elements[1] + p3.elements[1]) / 3,
        (p1.elements[2] + p2.elements[2] + p3.elements[2]) / 3]);
}

//Scale Vector3
function scaleVector(vec, sca) {
    return new Vector3([vec.elements[0] * sca, vec.elements[1] * sca, vec.elements[2] * sca]);
}

//Add Vector3s
function addVectors(v1, v2) {
    return new Vector3([v1.elements[0] + v2.elements[0],
        v1.elements[1] + v2.elements[1],
        v1.elements[2] + v2.elements[2]
    ]);
}