//Wrapped Float32Array so that I can dynamically change the size with Push(elemenet)
function Float32ArrayList() {
    this.length = 0;
    this.capacity = 40;
    this._data = new Float32Array(this.capacity); //Underlying data storage

    //Add an element to the data structure
    this.Push = function (vector3) {
        var index = this.length * 3;
        if (index + 3 >= this._data.length) {
            this.resize();
        }
        this._data[index] = vector3.elements[0];
        this._data[index + 1] = vector3.elements[1];
        this._data[index + 2] = vector3.elements[2];
        this.length += 1;
    };

    this.get = function (index) {
        var loc = index * 3;
        return new Vector3([this._data[loc],
            this._data[loc + 1],
            this._data[loc + 2]]);
    };

    this.set = function (index, vector3) {
        var loc = index * 3;
        this._data[loc] = vector3.elements[0];
        this._data[loc + 1] = vector3.elements[1];
        this._data[loc + 2] = vector3.elements[2];
    };

    //Double the length of the data structure
    this.resize = function () {
        this.capacity *= 2;
        var resizedArray = new Float32Array(this.capacity);
        for (var i = 0; i < this.length * 3; i++) {
            resizedArray[i] = this._data[i];
        }
        this._data = resizedArray;
    };
}

//An object which can be rendered
function DrawObject() {
    this.name = "";
    this.color = diffuse_color;
    this.unlit = 0;
    this.active = 1; // Grey the object out?
    this.enabled = true;
    this.shadingMethod = ShadingMethod.FLAT;
    this.static = false;
    this.material = new Material(); // Not yet implemented
    this.isSelected = false;

    this.vertices_flat = new Float32ArrayList();
    this.indices_flat = new Float32ArrayList();
    this.normals_flat = new Float32ArrayList();

    this.indices_smooth = new Float32ArrayList();
    this.vertices_smooth = new Float32ArrayList();
    this.normals_smooth = new Float32ArrayList();

    this.centerPoint = new Vector3(); // Should default init to (0, 0, 0)

    this.mvp_M = new Matrix4();
    this.transform = new Transform(); // Not yet implemented

    this.selected = function () {
        this.isSelected = true;
    };

    this.deselected = function () {
        this.isSelected = false;
    };

    this.GetVertices = function () {
        return this.shadingMethod == ShadingMethod.FLAT ? this.vertices_flat : this.vertices_smooth;
    };

    this.GetIndices = function () {
        return this.shadingMethod == ShadingMethod.FLAT ? this.indices_flat : this.indices_smooth;
    };

    this.GetNormals = function () {
        return this.shadingMethod == ShadingMethod.FLAT ? this.normals_flat : this.normals_smooth;
    };

    this.initializeData = function (vertices, indices) {
        this.centerPoint = averageVector3s(vertices);
        for (var i = 0; i < vertices.length; i++) {
            vertices.set(i, subtractVectors(vertices.get(i), this.centerPoint));
        }
        this.transform.position = this.centerPoint;
        this.initializeFlatShading(vertices, indices);
        this.initializeSmoothShading(vertices, indices);
    };

    this.initializeFlatShading = function (vertices, indices) {
        this.vertices_flat = new Float32ArrayList();
        this.indices_flat = new Float32ArrayList();
        this.normals_flat = new Float32ArrayList();

        for (var i = 0; i < indices.length; i++) {
            var ind = indices.get(i);

            var v0 = vertices.get(ind.elements[0]);
            var v1 = vertices.get(ind.elements[1]);
            var v2 = vertices.get(ind.elements[2]);

            this.vertices_flat.Push(v0);
            this.vertices_flat.Push(v1);
            this.vertices_flat.Push(v2);

            this.indices_flat.Push(new Vector3([i * 3, i * 3 + 1, i * 3 + 2]));

            var norm = cross_product(subtractVectors(v1, v0), subtractVectors(v2, v0)).normalize();

            this.normals_flat.Push(norm);
            this.normals_flat.Push(norm);
            this.normals_flat.Push(norm);
        }
    };

    this.initializeSmoothShading = function (vertices, indices) {
        this.vertices_smooth = new Float32ArrayList();
        this.indices_smooth = new Float32ArrayList();
        this.normals_smooth = new Float32ArrayList();

        for (var i = 0; i < vertices.length; i++) {
            this.vertices_smooth.Push(vertices.get(i));
            this.normals_smooth.Push(vertices.get(i));
        }

        for (var i = 0; i < indices.length; i++) {
            var ind = indices.get(i);
            this.indices_smooth.Push(ind);

            var i0 = ind.elements[0];
            var i1 = ind.elements[1];
            var i2 = ind.elements[2];

            var v0 = vertices.get(i0);
            var v1 = vertices.get(i1);
            var v2 = vertices.get(i2);

            var norm = cross_product(subtractVectors(v1, v0), subtractVectors(v2, v0));

            this.normals_smooth.set(i0, addVectors(this.normals_smooth.get(i0), norm));
            this.normals_smooth.set(i1, addVectors(this.normals_smooth.get(i1), norm));
            this.normals_smooth.set(i2, addVectors(this.normals_smooth.get(i2), norm));
        }

        for (var i = 0; i < this.normals_smooth.length; i++) {
            this.normals_smooth.set(i, this.normals_smooth.get(i).normalize());
        }
    };
}

function DrawLine() {
    this.color = new Vector3([0, 0, 0]);
    this.enabled = true;
    this.unlit = 0;
    this.active = 1;
    this.vertices = new Float32ArrayList();


    this.selected = function () {
        this.active = !this.active;
    };

    this.deselected = function () {
        this.active = !this.active;
    };
}

function Transform() {
    this.position = new Vector3([0, 0, 0]);
    this.rotation = new Vector3([0, 0, 0]); //Working in Euler Angles
    this.scale = new Vector3([1, 1, 1]);

    this.setUniformScale = function (scale) {
        scale = Math.abs(scale);
        this.scale = new Vector3([scale, scale, scale]);
    };

    this.generate_Model_Matrix = function () {
        /*return this.generate_Rotation_Matrix()
         .translate(this.position.elements[0], this.position.elements[1], this.position.elements[2])
         .scale(this.scale.elements[0], this.scale.elements[1], this.scale.elements[2]);*/
        return new Matrix4().translate(this.position.elements[0], this.position.elements[1], this.position.elements[2])
            .multiply(this.generate_Rotation_Matrix())
            .scale(this.scale.elements[0], this.scale.elements[1], this.scale.elements[2]);
    };

    this.generate_Rotation_Matrix = function () {
        return new Matrix4().rotate(this.rotation.elements[0], 1, 0, 0)
            .rotate(this.rotation.elements[1], 0, 1, 0)
            .rotate(this.rotation.elements[2], 0, 0, 1);
    }
}

function Material() {
    this.Ka = new Vector3();
    this.Kd = new Vector3();
    this.Ks = new Vector3();
}