/**
 * Created by mwglynn on 10/20/2016.
 */

//Assignment specific functions
var finishedSOR;
//vertices should be a Float32ArrayList and angle_deltas should be 10°
function createSOR(name, vertices, angle_deltas) {
    var sorVertices = [];
    for (var a = 0; a > -360; a -= angle_deltas) {
        for (var i = 0; i < vertices.length; i++) {
            //Rotate vector
            var rotv = rotate_vector3(vertices.get(i), a);
            sorVertices.push(rotv.elements[0]);
            sorVertices.push(rotv.elements[1]);
            sorVertices.push(rotv.elements[2]);
        }
    }

    var numPoints = vertices.length;
    vertices = sorVertices;
    var triangle_ordering = [];
    for (var o = 0; o < 360 / angle_deltas - 1; o++) { //All but the final strip which wraps around
        for (var i = 0; i < numPoints - 1; i++) {
            //First triangle of the quad
            triangle_ordering.push(o * numPoints + i);
            triangle_ordering.push(o * numPoints + i + 1);
            triangle_ordering.push((o + 1) * numPoints + i);

            //Second triangle of the quad
            triangle_ordering.push((o + 1) * numPoints + i);
            triangle_ordering.push(o * numPoints + i + 1);
            triangle_ordering.push((o + 1) * numPoints + i + 1);
        }
    }
    //Final wrap around the back
    for (var i = 0; i < numPoints - 1; i++) {
        //First triangle of the quad
        triangle_ordering.push((360 / angle_deltas - 1) * numPoints + i);
        triangle_ordering.push((360 / angle_deltas - 1) * numPoints + i + 1);
        triangle_ordering.push(i);

        //Second triangle of the quad
        triangle_ordering.push(i);
        triangle_ordering.push((360 / angle_deltas - 1) * numPoints + i + 1);
        triangle_ordering.push(i + 1);
    }

    return new SOR(name, vertices, triangle_ordering);
}

//Push each face into the draw queue
function renderSOR(sor) {
    var sorObject = new DrawObject();
    //sorObject.initializeData(sor.vertices, sor.indexes);
    var vtx = new Float32ArrayList();
    var idx = new Float32ArrayList();

    for (var i = 0; i < sor.vertices.length; i += 3) {
        vtx.Push(new Vector3([sor.vertices[i], sor.vertices[i + 1], sor.vertices[i + 2]]));
    }

    for (var i = 0; i < sor.indexes.length; i += 3) {
        idx.Push(new Vector3([sor.indexes[i], sor.indexes[i + 1], sor.indexes[i + 2]]));
    }
    sorObject.initializeData(vtx, idx);
    drawObjects.push(sorObject);
    draw();
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