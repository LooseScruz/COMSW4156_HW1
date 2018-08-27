/**
 * Created by mwglynn on 10/26/16.
 */
function CreateCube(lengthOfSide) {
    var offset = lengthOfSide / 2;
    var cube_vertices = new Float32ArrayList();
    var cube_indices = new Float32ArrayList();

    cube_vertices.Push(new Vector3([offset, offset, -offset]));
    cube_vertices.Push(new Vector3([offset, -offset, -offset]));
    cube_vertices.Push(new Vector3([offset, offset, offset]));
    cube_vertices.Push(new Vector3([offset, -offset, offset]));
    cube_vertices.Push(new Vector3([-offset, offset, offset]));
    cube_vertices.Push(new Vector3([-offset, -offset, offset]));
    cube_vertices.Push(new Vector3([-offset, offset, -offset]));
    cube_vertices.Push(new Vector3([-offset, -offset, -offset]));

    cube_indices.Push(new Vector3([0, 1, 2]));
    cube_indices.Push(new Vector3([2, 1, 3]));
    cube_indices.Push(new Vector3([2, 3, 4]));
    cube_indices.Push(new Vector3([4, 3, 5]));
    cube_indices.Push(new Vector3([4, 5, 6]));
    cube_indices.Push(new Vector3([6, 5, 7]));
    cube_indices.Push(new Vector3([6, 7, 0]));
    cube_indices.Push(new Vector3([0, 7, 1]));
    cube_indices.Push(new Vector3([0, 2, 6]));
    cube_indices.Push(new Vector3([6, 2, 4]));
    cube_indices.Push(new Vector3([1, 7, 3]));
    cube_indices.Push(new Vector3([3, 7, 5]));

    var nDO = new DrawObject();
    nDO.initializeData(cube_vertices, cube_indices);
    return nDO;
}