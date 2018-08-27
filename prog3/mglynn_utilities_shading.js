/**
 * Created by mwglynn on 10/21/2016.
 */

var ShadingMethod = {
    FLAT: 0,
    SMOOTH: 1
};

//Shader Locations
var a_Position;
var a_Normal;
var u_DiffuseColor;
var u_AmbientColor;
var u_SpecularColor;
var u_LightDirection;
var u_PointLightLocation;
var u_PointLightColor;
var u_GlossinessFactor;
var u_LightColor;
var u_mvp_P;
var u_mvp_V;
var u_mvp_M;
var u_SpecularEnabled;
var u_ClickEvent;
var u_LightEnabled;
var u_PointLightEnabled;
var u_unlit;
var u_active;
var u_rotationMatrix;

// Light info
var light_direction = new Vector3([1, 1, 1]);
var light_color = new Vector3([1, 1, 1]);

var point_light_location = new Vector3([0, 500, 500]);
var point_light_color = new Vector3([1, 1, 0]);

// Material Info
var ambient_color = new Vector3([0, 0, 0.2]);
var diffuse_color = new Vector3([1, 0, 0]);
var specular_color = new Vector3([0, 1, 0]);
var glossiness_factor = 1;
var specularEnabled = 0;

var objectRenderer = new Renderer();
var lineRenderer = new Renderer();

var currently_click_checking = 0;

var lightEnabled = 1;
var pointLightEnabled = 1;

var backgroundColor = new Vector3([1.0, 1.0, 1.0]);

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
        u_PointLightLocation = gl.getUniformLocation(gl.program, 'u_PointLightLocation');
        u_GlossinessFactor = gl.getUniformLocation(gl.program, 'u_GlossinessFactor');
        u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
        u_PointLightColor = gl.getUniformLocation(gl.program, 'u_PointLightColor');
        u_SpecularEnabled = gl.getUniformLocation(gl.program, 'u_SpecularEnabled');
        u_mvp_M = gl.getUniformLocation(gl.program, 'u_mvp_M');
        u_mvp_V = gl.getUniformLocation(gl.program, 'u_mvp_V');
        u_mvp_P = gl.getUniformLocation(gl.program, 'u_mvp_P');
        u_ClickEvent = gl.getUniformLocation(gl.program, 'u_ClickEvent');
        u_LightEnabled = gl.getUniformLocation(gl.program, 'u_LightEnabled');
        u_PointLightEnabled = gl.getUniformLocation(gl.program, 'u_PointLightEnabled');
        u_unlit = gl.getUniformLocation(gl.program, "u_unlit");
        u_active = gl.getUniformLocation(gl.program, "u_active");
        u_rotationMatrix = gl.getUniformLocation(gl.program, "u_rotationMatrix");

        gl.uniformMatrix4fv(u_mvp_M, false, new Matrix4().elements);
        gl.uniformMatrix4fv(u_mvp_V, false, mvp_V.elements);
        gl.uniformMatrix4fv(u_mvp_P, false, mvp_P.elements);
        gl.uniform3fv(u_LightDirection, light_direction.elements);
        gl.uniform3fv(u_PointLightLocation, point_light_location.elements);
        gl.uniform3fv(u_PointLightColor, point_light_color.elements);
        gl.uniform1f(u_GlossinessFactor, glossiness_factor);
        gl.uniform3fv(u_AmbientColor, ambient_color.elements);
        gl.uniform3fv(u_SpecularColor, specular_color.elements);
        gl.uniform3fv(u_LightColor, light_color.elements);
        gl.uniform1i(u_SpecularEnabled, specularEnabled);
        gl.uniform1i(u_ClickEvent, currently_click_checking);
        gl.uniform1i(u_LightEnabled, lightEnabled);
        gl.uniform1i(u_PointLightEnabled, pointLightEnabled);
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