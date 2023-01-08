import { Object3D, Mesh } from 'three';

export function isMesh(object3d: Object3D): object3d is Mesh {
    return 'isMesh' in object3d && !!object3d['isMesh'];
}
