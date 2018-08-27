/**
 * Created by mwglynn on 10/21/2016.
 */

var mvp_P = new Matrix4().setOrtho(-500, 500, -500, 500, -2000, 2000);
var mvp_V = new Matrix4().setTranslate(0, 0, -1000);//.setLookAt(0, 0, 1000, 0, 0, 0, 1, 1, 1);

var currentlySelectedDrawObject;
var lastX_translation, lastY_translation, lastZ_translation;
var lastX_rotation, lastY_rotation;
var is_xy_Translating = false;
var is_z_Translating = false;
var is_xz_Rotating = false;

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