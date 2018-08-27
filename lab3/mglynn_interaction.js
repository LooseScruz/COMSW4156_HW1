/**
 * Created by mwglynn on 10/21/2016.
 */

var mvp_P = new Matrix4().setOrtho(-500, 500, -500, 500, -2000, 2000);
var mvp_V = new Matrix4().setTranslate(0, 0, -1000);//.setLookAt(0, 0, 1000, 0, 0, 0, 1, 1, 1);

function ColorAtPoint(x, y) {
    currently_click_checking = 1;
    draw();
    var pixelColor = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelColor);
    currently_click_checking = 0;
    draw();
    return pixelColor;
}