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
    this.color = diffuse_color;
    this.unlit = 0;
    this.active = 1; // Grey the object out?
    this.enabled = true;
    this.shadingMethod = ShadingMethod.FLAT;

    this.vertices_flat = new Float32ArrayList();
    this.indices_flat = new Float32ArrayList();
    this.normals_flat = new Float32ArrayList();

    this.indices_smooth = new Float32ArrayList();
    this.vertices_smooth = new Float32ArrayList();
    this.normals_smooth = new Float32ArrayList();

    this.mvp_M = new Matrix4();

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
}
