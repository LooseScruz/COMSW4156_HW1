/**
 * Created by mwglynn on 10/21/2016.
 */
var mvp_P_ortho = new Matrix4().setOrtho(-500, 500, -500, 500, -2000, 2000);
var fov = 80;
var mvp_P_perspective = new Matrix4().setPerspective(fov, 1, 1, 1000);
var mvp_P = mvp_P_ortho;
var mvp_V_rotation = new Vector3([0, 0, 0]);
var mvp_V_position = new Vector3([0, 0, -1000]);
var mvp_V = new Matrix4().setTranslate(0, 0, -1000);//.setLookAt(0, 0, 1000, 0, 0, 0, 1, 1, 1);

var currentlySelectedDrawObject;
var lastX_translation, lastY_translation, lastZ_translation;
var lastX_rotation, lastY_rotation;
var lastX_camera_pan, lastY_camera_pan;
var is_xy_Translating = false;
var is_z_Translating = false;
var is_xz_Rotating = false;
var is_animating = false;

var is_moving_camera = false;
var is_panning_camera = false;

function update_mvp_V () {
    mvp_V.setTranslate(mvp_V_position.elements[0], mvp_V_position.elements[1], mvp_V_position.elements[2]);
    mvp_V.rotate(mvp_V_rotation.elements[0], 1, 0, 0);
    mvp_V.rotate(mvp_V_rotation.elements[1], 0, 1, 0);
    mvp_V.rotate(mvp_V_rotation.elements[2], 0, 0, 1);
}

function ColorAtPoint(x, y) {
    currently_click_checking = 1;
    draw();
    var pixelColor = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelColor);
    if (Vector3Equal(new Vector3(pixelColor), scaleVector(backgroundColor, 255))) {
        if (currentlySelectedDrawObject != null) {
            currentlySelectedDrawObject.deselected();
            currentlySelectedDrawObject = null;
        }
    }
    else {
        if (pixelColor[0] == 0) { // Is a draw object
            if (currentlySelectedDrawObject != null) {
                currentlySelectedDrawObject.deselected();
                if (currentlySelectedDrawObject == drawObjects[pixelColor[1]]) {
                    currentlySelectedDrawObject = null;
                }
                else {
                    drawObjects[pixelColor[1]].selected();
                    currentlySelectedDrawObject = drawObjects[pixelColor[1]];
                }
            }
            else {
                drawObjects[pixelColor[1]].selected();
                currentlySelectedDrawObject = drawObjects[pixelColor[1]];
            }

        } else if (pixelColor[0] == 255) {
            drawLineStrips[0].selected();
        }
    }

    currently_click_checking = 0;
    draw();
}

function begin_xy_translate(x, y) {
    if (currentlySelectedDrawObject == null || currentlySelectedDrawObject.static) return;
    is_xy_Translating = true;
    lastX_translation = x;
    lastY_translation = y;
}

function update_xy_translate(x, y) {
    if (currentlySelectedDrawObject == null || !is_xy_Translating || currentlySelectedDrawObject.static) return;
    var translate_amount = new Vector3([x - lastX_translation, y - lastY_translation, 0]);
    lastX_translation = x;
    lastY_translation = y;
    currentlySelectedDrawObject.transform.position = addVectors(currentlySelectedDrawObject.transform.position, translate_amount);
    draw();
}

function end_xy_translate() {
    is_xy_Translating = false;
}

function begin_z_translate(z) {
    if (currentlySelectedDrawObject == null || currentlySelectedDrawObject.static) return;
    lastZ_translation = z;
    is_z_Translating = true;
}

function update_z_translate(z) {
    if (currentlySelectedDrawObject == null || !is_z_Translating || currentlySelectedDrawObject.static) return;
    var translate_amount = new Vector3([0, 0, z - lastZ_translation]);
    lastZ_translation = z;
    currentlySelectedDrawObject.transform.position = addVectors(currentlySelectedDrawObject.transform.position, translate_amount);
    draw();
}

function end_z_translate() {
    is_z_Translating = false;
}

function begin_xz_rotation(x, y) {
    if (currentlySelectedDrawObject == null || currentlySelectedDrawObject.static) return;
    lastX_rotation = x;
    lastY_rotation = y;
    is_xz_Rotating = true;
}

function update_xz_rotation(x, y) {
    if (currentlySelectedDrawObject == null || !is_xz_Rotating || currentlySelectedDrawObject.static) return;
    var rotation_amount = new Vector3([-(y - lastY_rotation) * 0.5, 0, -(x - lastX_rotation) * 0.5]);
    lastX_rotation = x;
    lastY_rotation = y;
    currentlySelectedDrawObject.transform.rotation = addVectors(currentlySelectedDrawObject.transform.rotation, rotation_amount);
    draw();
}

function end_xz_rotation() {
    is_xz_Rotating = false;
}

function adjust_fov (adjustment) {
    if (mvp_P == mvp_P_perspective) {
        fov -= adjustment;
        mvp_P_perspective = new Matrix4().setPerspective(fov, 1, 1, 1000);
        mvp_P = mvp_P_perspective;
    }
    draw();
}

function try_camera_move () {
    if (currentlySelectedDrawObject == null) {
        is_moving_camera = true;
    }
}

function end_try_move_camera () {
    is_moving_camera = false;
}

function move_camera(dir) {
    mvp_V.translate(0, 0, dir*50);
    draw();
}

function start_camera_pan(x, y) {
    if (currentlySelectedDrawObject == null) {
        is_panning_camera = true;
        lastX_camera_pan = x;
        lastY_camera_pan = y;
    }
}

function update_camera_pan(x, y) {
    if (currentlySelectedDrawObject == null && is_panning_camera) {
        mvp_V_position.elements[0] += x - lastX_camera_pan;
        mvp_V_position.elements[1] += y - lastY_camera_pan;
        lastX_camera_pan = x;
        lastY_camera_pan = y;
        update_mvp_V();
        draw();
    }
}

function end_pan_camera () {
    is_panning_camera = false;
}

function try_examine() {
    if (currentlySelectedDrawObject != null) {
        currently_click_checking = 1;
        draw();
        var pixelColor = new Uint8Array(4);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelColor);
        if (Vector3Equal(new Vector3(pixelColor), scaleVector(backgroundColor, 255))) {

        }

        currently_click_checking = 0;
        draw();
    }
}