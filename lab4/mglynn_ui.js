/**
 * Created by mwglynn on 10/20/2016.
 */
var currentSORname = "";
var creatingSOR = false;

function click(ev, canvas) {
    if (is_animating) return;
    var rect = ev.target.getBoundingClientRect();
    if (!creatingSOR) {
        var x_in_canvas = ev.clientX - rect.left, y_in_canvas = rect.bottom - ev.clientY;
        if (ev.button == 0) {
            ColorAtPoint(x_in_canvas, y_in_canvas);
            begin_xy_translate(ev.clientX - rect.left, rect.bottom - ev.clientY);
            start_camera_pan(ev.clientX - rect.left, rect.bottom - ev.clientY);
        }
        else if (ev.button == 1) {
            begin_z_translate(rect.bottom - ev.clientY);
            try_camera_move();
        }
        else if (ev.button == 2) {
            begin_xz_rotation(ev.clientX - rect.left, rect.bottom - ev.clientY);
            //try_examine();
        }
    } //We've received a RIGHT click and the program is 'done'
    else {

        var x = ((ev.clientX > canvas.width / 2 + 1)
            ? ev.clientX : canvas.width / 2 + 1); // x coordinate of a mouse pointer
        var y = ev.clientY; // y coordinate of a mouse pointer
        x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2) * 500;
        y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2) * 500;

        console.log("Added point: (" + x + ", " + y + ")"); //The most recent point selected

        if (user_draw_line.vertices.length == 0) { //On our first point, we must add a second to get 'rubber band' effect
            user_draw_line.vertices.Push(new Vector3([x, y, 0]));
        }

        //Add our new point to the vertex buffer

        //draw(a_Position);

        if (ev.button == 2) {
            finish();
            creatingSOR = false;
        } //Right click
        else {
            user_draw_line.vertices.Push(new Vector3([x, y, 0]));
        }
    }
}

function dbl_click(ev) {
    if (is_animating) return;
    if (!creatingSOR) {
        var rect = ev.target.getBoundingClientRect();
        var x_in_canvas = ev.clientX - rect.left, y_in_canvas = rect.bottom - ev.clientY;
        currently_click_checking = 1;
        draw();
        var pixelColor = new Uint8Array(4);
        gl.readPixels(x_in_canvas, y_in_canvas, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelColor);
        if (!Vector3Equal(new Vector3(pixelColor), scaleVector(backgroundColor, 255))) {
            if (pixelColor[0] == 0) { // Is a draw object
                var pos = drawObjects[pixelColor[1]].transform.position;
                mvp_V.setTranslate(pos.elements[0], pos.elements[1], pos.elements[2]);
                turn_around_360(drawObjects[pixelColor[1]]);
            }
        }
        currently_click_checking = 0;
        draw();
    }
}

//Called when the mouse moves
function mouse_move(ev, canvas) {
    var x = ((ev.clientX > canvas.width / 2 + 1)
        ? ev.clientX : canvas.width / 2 + 1); // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2) * 500;
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2) * 500;

    if (!creatingSOR) {
        update_xy_translate(ev.clientX - rect.left, rect.bottom - ev.clientY);
        update_z_translate(rect.bottom - ev.clientY);
        update_xz_rotation(ev.clientX - rect.left, rect.bottom - ev.clientY);
        update_camera_pan(ev.clientX - rect.left, rect.bottom - ev.clientY);
    }
    else {
        //Update the latest point in our buffer. Since we start by adding two, this last point
        //is dedicated to the rubber band effect
        user_draw_line.vertices.set(user_draw_line.vertices.length - 1, new Vector3([x, y, 0])); //[user_draw_line.vertices.length - 3] = x;
        //user_draw_line.vertices[user_draw_line.vertices.length - 2] = y;
        draw();
    }
}

function initializeDocumentListeners() {

    //Call update() 60 times per second

    window.setInterval(function () {
        update();
    }, 1000 / 60);


    //Set elements in HTML in case their state has been cached
    document.getElementById('shownormals').checked = false;
    document.getElementById('shouldupdate').checked = false;
    document.getElementById('specularswitch').checked = false;
    document.getElementById('glossiness').value = 1;

    //Add event listeners to parts of the HTML
    document.getElementById('fileinput').addEventListener('change', input_load);

    document.getElementById('createsor').addEventListener('click', function () {
        if (creatingSOR) {
            alert("Please finish the current SOR before creating a new one.");
            return;
        }
        currentSORname = window.prompt("SOR Name: ");
        initializeSORCreator();
    });

    document.getElementById('savesor').addEventListener('click', button_save);

    document.getElementById('shownormals').addEventListener('change', function () {
        if (!isDone) {
            document.getElementById('shownormals').checked = false;
            alert("Finish you SOR first");
        } else {
            toggle_normals();
            draw();
        }
    });


    document.getElementById('shouldupdate').addEventListener('change', function () {
        should_update = document.getElementById('shouldupdate').checked;
    });

    document.getElementById('specularswitch').addEventListener('change', function () {
        if (document.getElementById('specularswitch').checked) {
            specularEnabled = 1;
        } else {
            specularEnabled = 0;
        }
        draw();
    });

    document.getElementById('glossiness').addEventListener('input', function () {
        var glossiness_value = document.getElementById("glossiness").value;
        document.getElementById("glossinessvalue").innerHTML = glossiness_value;
        glossiness_factor = glossiness_value;
        draw();
    });

    document.getElementById('shadingtypebutton').addEventListener('click', function () {
        var current_text = document.getElementById("shadingbuttontype").innerHTML;
        var type;
        if (current_text == "smooth") {
            document.getElementById("shadingbuttontype").innerHTML = "flat";
            type = ShadingMethod.SMOOTH;
        }
        else {
            document.getElementById("shadingbuttontype").innerHTML = "smooth";
            type = ShadingMethod.FLAT;
        }
        for (var i = 0; i < drawObjects.length; i++) {
            drawObjects[i].shadingMethod = type;
        }
        draw();
    });

    document.getElementById('projectiontypebutton').addEventListener('click', function () {
        var current_text = document.getElementById("projectionbuttontype").innerHTML;
        var type;
        if (current_text == "Perspective") {
            document.getElementById("projectionbuttontype").innerHTML = "Orthographic";
            mvp_P = mvp_P_perspective;
        }
        else {
            document.getElementById("projectionbuttontype").innerHTML = "Perspective";
            mvp_P = mvp_P_ortho;
        }
        draw();
    });

    document.getElementById("webgl").ondblclick = dbl_click;

    setupIOSOR('fileinput');
}

function process_scroll(event) {
    event.preventDefault();
    var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
    if (currentlySelectedDrawObject != null) {
        currentlySelectedDrawObject.transform.setUniformScale(currentlySelectedDrawObject.transform.scale.elements[0] + 0.1 * delta);
        draw();
    } else {
        if (is_moving_camera) {
            move_camera(delta);
        }
        else {
            adjust_fov(delta);
        }
    }
}