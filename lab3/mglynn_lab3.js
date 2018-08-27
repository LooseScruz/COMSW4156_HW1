var drawObjects = [];
var drawLineStrips = [];
var gl;

var vertex_buffer;
var index_buffer;
var normal_buffer;

var user_draw_line;

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl', {antialias: true});

    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    lineRenderer.LoadShaders("shader-vs-line", "shader-fs-line");
    objectRenderer.LoadShaders("shader-vs-face", "shader-fs-face");

    initVertexBuffers();

    user_draw_line = new DrawLine();
    canvas.onmousedown = function (ev) {
        click(ev, canvas, a_Position);
    };
    canvas.onmousemove = function (ev) {
        mouse_move(ev, canvas);
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
    gl.lineWidth(7);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    //Initialize vertical line in the center
    var verticalLine = new DrawLine();
    var vts = new Float32ArrayList();
    vts.Push(new Vector3([0, -500, 0]));
    vts.Push(new Vector3([0, 500, 0]));
    verticalLine.vertices = vts;

    var light_Line = new DrawLine();
    var d_l_vts = new Float32ArrayList();
    d_l_vts.Push(new Vector3([0, 0, 0]));
    d_l_vts.Push(new Vector3([500, 500, 500]));
    light_Line.vertices = d_l_vts;
    light_Line.color = new Vector3([1, 0, 0]);

    var light_cube = CreateCube(50);
    light_cube.mvp_M.setTranslate(0, 500, 0); //1 = 500/500
    light_cube.color = point_light_color;
    light_cube.unlit = 1;

    drawLineStrips.push(light_Line);
    drawLineStrips.push(user_draw_line);
    drawLineStrips.push(verticalLine);
    drawObjects.push(light_cube);

    initializeDocumentListeners();

    draw();
}

var isDone = false;
var hasStarted = false;
var should_update = false;

var currentAngle = 0;
//Update function - standard among game engines - Pulled out in this version due to new matrix math
var sinInput = 0;
function update() {
    if (!should_update) return;
    point_light_location = new Vector3([0, 500, 250 + 250*Math.sin(sinInput += 0.02)]);
    draw();
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    draw_objects();
    draw_line_strips();
    draw_normals();
}

function draw_objects() {
    objectRenderer.enable();

    for (var i = 0; i < drawObjects.length; i++) {
        if (drawObjects[i].enabled) {
            if (drawObjects[i].GetVertices().length == 0) continue;
            var current_drawObject = drawObjects[i];
            gl.uniform3fv(u_DiffuseColor, current_drawObject.color.elements);
            gl.uniformMatrix4fv(u_mvp_M, false, current_drawObject.mvp_M.elements);
            gl.uniform1i(u_unlit, current_drawObject.unlit);
            gl.uniform1i(u_active, current_drawObject.active);

            gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);

            gl.bufferData(gl.ARRAY_BUFFER, current_drawObject.GetVertices()._data, gl.STATIC_DRAW);


            gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
            gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Normal);
            gl.bufferData(gl.ARRAY_BUFFER, current_drawObject.GetNormals()._data, gl.STATIC_DRAW);


            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(current_drawObject.GetIndices()._data), gl.STATIC_DRAW);

            gl.drawElements(gl.TRIANGLES, current_drawObject.GetIndices().length * 3, gl.UNSIGNED_SHORT, 0);
        }
    }
}

function draw_line_strips() {
    lineRenderer.enable();

    for (var i = 0; i < drawLineStrips.length; i++) {
        if (drawLineStrips[i].enabled) {
            if (drawLineStrips[i].vertices.length == 0) continue;
            gl.uniform3fv(u_DiffuseColor, drawLineStrips[i].color.elements);
            gl.uniform1i(u_active, drawLineStrips[i].active);
            var current_drawLineStrip = drawLineStrips[i];
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, current_drawLineStrip.vertices._data, gl.STATIC_DRAW);
            gl.drawArrays(gl.LINE_STRIP, 0, current_drawLineStrip.vertices.length);
        }
    }
}

function draw_normals() {
    if (!is_showing_normals || currently_click_checking) return;
    gl.lineWidth(1);
    lineRenderer.enable();
    gl.uniform3fv(u_DiffuseColor, [1, 0, 0]);
    gl.uniform1i(u_active, 1);
    var normal_data = new Float32ArrayList();
    for (var i = 0; i < drawObjects.length; i++) {
        var verts = drawObjects[i].GetVertices();
        for (var j = 1; j < verts.length * 3; j++) {
            normal_data.Push(verts.get(j));
            normal_data.Push(addVectors(verts.get(j), scaleVector(drawObjects[i].GetNormals().get(j), 25)));
        }
    }

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, normal_data._data, gl.STATIC_DRAW);
    gl.drawArrays(gl.LINES, 0, normal_data.length / 3);
    gl.lineWidth(7);
}

function initVertexBuffers() {
    vertex_buffer = gl.createBuffer();
    index_buffer = gl.createBuffer();
    normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
}

function finish() {
    //Remove User's draw line and center line
    drawLineStrips.pop();
    drawLineStrips.pop();

    isDone = true; //Stop execution for the mouse event related functions

    //Create SOR with timestamp as a name
    var date = new Date();
    var solidOfRevolution = createSOR("SOR_" + date.getFullYear()
        + "_" + (date.getMonth() + 1) + "_" + date.getDate()
        + "_" + date.toLocaleTimeString().replace(' ', ''), user_draw_line.vertices, 10);

    renderSOR(solidOfRevolution);
    finishedSOR = solidOfRevolution;
}

var is_showing_normals = false;
function toggle_normals() {
    is_showing_normals = document.getElementById('shownormals').checked;
}
