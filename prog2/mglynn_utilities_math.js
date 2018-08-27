/**
 * Created by mwglynn on 10/20/2016.
 */

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

function dot_product(v1, v2) {
    return v1.elements[0] * v2.elements[0]
        + v1.elements[1] * v2.elements[1]
        + v1.elements[2] * v2.elements[2];
}

function magnitude(v) {
    // Code taken from the normalize function in the lib folder
    var c = v.elements[0], d = v.elements[1], e = v.elements[2];
    return Math.sqrt(c * c + d * d + e * e);
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

//Returns v1-v2
function subtractVectors(v1, v2) {
    return new Vector3([v1.elements[0] - v2.elements[0],
        v1.elements[1] - v2.elements[1],
        v1.elements[2] - v2.elements[2]
    ]);
}

function clamp(number, min, max) {
    return number < min ? min : number > max ? max : number;
}