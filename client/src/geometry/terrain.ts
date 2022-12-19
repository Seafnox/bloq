import {BufferAttribute, BufferGeometry} from 'three';


export function geometryFromArrays(arrays): BufferGeometry {
    var geometry = new BufferGeometry();
    geometry.setAttribute('material', new BufferAttribute(arrays.materials, 1));
    geometry.setAttribute('position', new BufferAttribute(arrays.vertices, 3));
    geometry.setAttribute('shadow', new BufferAttribute(arrays.shadows, 1));
    geometry.computeBoundingBox();

    return geometry;
}
