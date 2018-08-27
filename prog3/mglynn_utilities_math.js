/**
 * Created by mwglynn on 10/20/2016.
 */

//Rotate a Vector3 around the x-axis
function Rotation_Matrix_X(angle_in_degrees) {
    var r = deg2rad(angle_in_degrees);
    var s = Math.sin(r);
    var c = Math.cos(r);
    var multMatrix = new Matrix4();
    multMatrix.elements = [
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1];
    return multMatrix;
}

//Rotate a Vector3 around the y-axis
function Rotation_Matrix_Y(angle_in_degrees) {
    var r = deg2rad(angle_in_degrees);
    var s = Math.sin(r);
    var c = Math.cos(r);
    var multMatrix = new Matrix4();
    multMatrix.elements = [
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1];
    return multMatrix;
}

//Rotate a Vector3 around the z-axis
function Rotation_Matrix_Z(angle_in_degrees) {
    var r = deg2rad(angle_in_degrees);
    var s = Math.sin(r);
    var c = Math.cos(r);
    var multMatrix = new Matrix4();
    multMatrix.elements = [
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];
    return multMatrix;
}

//Rotate a Vector3 around the x-axis
function rotate_vector3_x(vector, angle_in_degrees) {
    var r = deg2rad(angle_in_degrees);
    var s = Math.sin(r);
    var c = Math.cos(r);
    var multMatrix = new Matrix4();
    multMatrix.elements = [
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1];
    return multMatrix.multiplyVector3(vector);
}

//Rotate a Vector3 around the y-axis
function rotate_vector3_y(vector, angle_in_degrees) {
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

//Rotate a Vector3 around the z-axis
function rotate_vector3_z(vector, angle_in_degrees) {
    var r = deg2rad(angle_in_degrees);
    var s = Math.sin(r);
    var c = Math.cos(r);
    var multMatrix = new Matrix4();
    multMatrix.elements = [
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
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
function averageVector3s(v3s) {
    var sumX, sumY, sumZ;
    sumX = sumY = sumZ = 0;
    for (var i = 0; i < v3s.length; i++) {
        sumX += v3s.get(i).elements[0];
        sumY += v3s.get(i).elements[1];
        sumZ += v3s.get(i).elements[2];
    }
    return scaleVector(new Vector3([sumX, sumY, sumZ]), 1 / v3s.length);
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

function Vector3Equal(vec1, vec2) {
    var v1 = vec1.elements;
    var v2 = vec2.elements;
    return v1[0] == v2[0] && v1[1] == v2[1] && v1[2] == v2[2];
}

function clamp(number, min, max) {
    return number < min ? min : number > max ? max : number;
}