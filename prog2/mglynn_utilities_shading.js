/**
 * Created by mwglynn on 10/21/2016.
 */

var ShadingMethod = {
    FLAT: 0,
    SMOOTH: 1
};

var a_Position;
var a_Normal;
var u_DiffuseColor;
var u_AmbientColor;
var u_SpecularColor;
var u_LightDirection;
var u_GlossinessFactor;
var u_LightColor;
var a_mvp;
var u_SpecularEnabled;

// Light info
var light_direction = new Vector3([1, 1, -1]);
var light_color = new Vector3([1, 1, 1]);

// Material Info
var ambient_color = new Vector3([0, 0, 0.2]);
var diffuse_color = new Vector3([1, 0, 0]);
var specular_color = new Vector3([0, 1, 0]);
var glossiness_factor = 1;
var specularEnabled = 0;

var objectRenderer = new Renderer();
var lineRenderer = new Renderer();

function Renderer() {
    this.LoadShaders = function (vs, fs) {
        this.shaderProgram = ShaderProgram(vs, fs);
    };

    this.enable = function () {
        gl.program = this.shaderProgram;
        gl.useProgram(this.shaderProgram);
        a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
        u_DiffuseColor = gl.getUniformLocation(gl.program, "u_DiffuseColor");
        u_AmbientColor = gl.getUniformLocation(gl.program, "u_AmbientColor");
        u_SpecularColor = gl.getUniformLocation(gl.program, "u_SpecularColor");
        u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
        u_GlossinessFactor = gl.getUniformLocation(gl.program, 'u_GlossinessFactor');
        u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
        u_SpecularEnabled = gl.getUniformLocation(gl.program, 'u_SpecularEnabled');
        a_mvp = gl.getUniformLocation(gl.program, 'mvp');
        gl.uniformMatrix4fv(a_mvp, false, mvp.elements);
        gl.uniform3fv(u_LightDirection, light_direction.elements);
        gl.uniform1f(u_GlossinessFactor, glossiness_factor);
        gl.uniform3fv(u_AmbientColor, ambient_color.elements);
        gl.uniform3fv(u_SpecularColor, specular_color.elements);
        gl.uniform3fv(u_LightColor, light_color.elements);
        gl.uniform1i(u_SpecularEnabled, specularEnabled);
    };
}


function GetShader(id, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, document.getElementById(id).innerHTML);
    gl.compileShader(shader);
    return shader;
}

function CreateProgramAndAttachShaders(shaders) {
    var program = gl.createProgram();
    for (var i = 0; i < shaders.length; i++) {
        gl.attachShader(program, shaders[i]);
    }

    gl.linkProgram(program);
    return program;
}

function ShaderProgram(vertex_shader, fragment_shader) {
    return CreateProgramAndAttachShaders([
        GetShader(vertex_shader, gl.VERTEX_SHADER),
        GetShader(fragment_shader, gl.FRAGMENT_SHADER)
    ]);
}