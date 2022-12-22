import {BufferAttribute, BufferGeometry} from 'three';


export function geometryFromArrays(materials: Float32Array, vertices: Float32Array, shadows: Float32Array): BufferGeometry {
    var geometry = new BufferGeometry();
    geometry.setAttribute('material', new BufferAttribute(materials, 1));
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.setAttribute('shadow', new BufferAttribute(shadows, 1));
    geometry.computeBoundingBox();

    return geometry;
}
