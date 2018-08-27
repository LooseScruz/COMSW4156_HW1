/**
 * Created by mwglynn on 10/20/2016.
 */

function click(ev, canvas) {
    if (!hasStarted && ev.button == 0) { //Don't start drawing the line until a LEFT click
        hasStarted = true;
    }
    if (!hasStarted) return; //No LEFT click has been detected yet
    if (isDone) return; //We've received a RIGHT click and the program is 'done'
    var x = ((ev.clientX > canvas.width / 2 + 1)
        ? ev.clientX : canvas.width / 2 + 1); // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    console.log("Added point: (" + x + ", " + y + ")"); //The most recent point clicked

    if (user_draw_line.vertices.length == 0) { //On our first point, we must add a second to get 'rubber band' effect
        user_draw_line.vertices.Push(new Vector3([x, y, 0]));
    }

    //Add our new point to the vertex buffer

    draw(a_Position);

    if (ev.button == 2) {
        finish();
    } //Right click
    else {
        user_draw_line.vertices.Push(new Vector3([x, y, 0]));
    }
}

//Called when the mouse moves
function mouse_move(ev, canvas) {
    if (isDone || !hasStarted) return; //Have we received a right click?
    var x = ((ev.clientX > canvas.width / 2 + 1)
        ? ev.clientX : canvas.width / 2 + 1); // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    //Update the latest point in our buffer. Since we start by adding two, this last point
    //is dedicated to the rubber band effect
    user_draw_line.vertices.set(user_draw_line.vertices.length - 1, new Vector3([x, y, 0])); //[user_draw_line.vertices.length - 3] = x;
    //user_draw_line.vertices[user_draw_line.vertices.length - 2] = y;
    draw();

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

    setupIOSOR('fileinput');
}
