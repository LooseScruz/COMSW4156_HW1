var drawObjects = [];
var drawLineStrips = [];
var gl;

var vertex_buffer;
var index_buffer;
var normal_buffer;

var texture_buffer;

var user_draw_line;

var showTexture = 0;

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    lineRenderer.LoadShaders("shader-vs-line", "shader-fs-line");
    objectRenderer.LoadShaders("shader-vs-face", "shader-fs-face");

    initVertexBuffers();

    canvas.onmousedown = function (ev) {
        click(ev, canvas, a_Position);
    };

    canvas.onmouseup = function (ev) {
        if (ev.button == 0) {
            end_xy_translate();
            end_pan_camera();
        }
        else if (ev.button == 1) {
            end_z_translate();
            end_try_move_camera();
        }
        else if (ev.button == 2) end_xz_rotation();
    };

    canvas.onmousemove = function (ev) {
        mouse_move(ev, canvas);
    };

    canvas.addEventListener('mousewheel', process_scroll, false); //Not firefox
    canvas.addEventListener('DOMMouseScroll', process_scroll, false); //Firefox

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
    light_Line.selected = function () {
        this.active = !this.active;
        lightEnabled = !lightEnabled;
    };

    var light_cube = CreateCube(50);
    light_cube.transform.position = new Vector3([0, 500, 0]); //1 = 500/500
    light_cube.color = point_light_color;
    light_cube.unlit = 1;
    light_cube.name = "Light_Cube";
    light_cube.selected = function () {
        pointLightEnabled = !pointLightEnabled;
        this.active = !this.active;
    };
    light_cube.static = true;

    light_cube.deselected = function () {
    };

    drawLineStrips.push(light_Line);
    drawLineStrips.push(verticalLine);
    drawObjects.push(light_cube);

    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255]));
    var image = new Image();
    image.src = "image.png";
    image.addEventListener('load', function()
    {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });

    initializeDocumentListeners();

    draw();
}

function initializeSORCreator() {
    creatingSOR = true;
    user_draw_line = new DrawLine();
    drawLineStrips.push(user_draw_line);
}

var isDone = false;
var hasStarted = false;
var should_update = false;

var currentAngle = 0;
//Update function - standard among game engines - Pulled out in this version due to new matrix math
var sinInput = 0;
function update() {
    if (!should_update) return;
    point_light_location = new Vector3([0, 500, 250 + 250 * Math.sin(sinInput += 0.02)]);
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
            if (!currently_click_checking) gl.uniform3fv(u_DiffuseColor, current_drawObject.color.elements);
            else gl.uniform3fv(u_DiffuseColor, new Vector3([0, i / 255, 0]).elements);
            //gl.uniformMatrix4fv(u_mvp_M, false, current_drawObject.mvp_M.elements);
            gl.uniformMatrix4fv(u_mvp_M, false, current_drawObject.transform.generate_Model_Matrix().elements);
            gl.uniformMatrix4fv(u_rotationMatrix, false, current_drawObject.transform.generate_Rotation_Matrix().elements);

            // Enable texture
            gl.uniform1i(u_hasTexture, showTexture);
            gl.uniform1i(u_unlit, current_drawObject.unlit);
            gl.uniform1i(u_active, current_drawObject.active);
            if (current_drawObject.isSelected) gl.uniform3fv(u_AmbientColor, new Vector3([0.5, 0.5, 0.5]).elements);
            else gl.uniform3fv(u_AmbientColor, ambient_color.elements);
            gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);

            gl.bufferData(gl.ARRAY_BUFFER, current_drawObject.GetVertices()._data, gl.STATIC_DRAW);


            gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
            gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Normal);
            gl.bufferData(gl.ARRAY_BUFFER, current_drawObject.GetNormals()._data, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, texture_buffer);
            gl.vertexAttribPointer(a_textureCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_textureCoord);
            gl.bufferData(gl.ARRAY_BUFFER, current_drawObject.GetTexture()._data, gl.STATIC_DRAW);
            gl.uniform1i(u_texture, 0);

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
            if (!currently_click_checking) gl.uniform3fv(u_DiffuseColor, drawLineStrips[i].color.elements);
            else gl.uniform3fv(u_DiffuseColor, new Vector3([1, i / 255, 0]).elements);
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
    texture_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, texture_buffer);
}

function finish() {
    //Remove User's draw line and center line
    drawLineStrips.pop();
    //drawLineStrips.pop();

    isDone = true; //Stop execution for the mouse event related functions

    //Create SOR with timestamp as a name
    var date = new Date();
    var solidOfRevolution = createSOR("SOR_" + date.getFullYear()
        + "_" + (date.getMonth() + 1) + "_" + date.getDate()
        + "_" + date.toLocaleTimeString().replace(' ', ''), user_draw_line.vertices, 10);

    drawObjects.push(SORtoDrawObject(solidOfRevolution));
    draw();
    finishedSOR = solidOfRevolution;
}

var is_showing_normals = false;
function toggle_normals() {
    is_showing_normals = document.getElementById('shownormals').checked;
}
