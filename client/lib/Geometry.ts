import { BufferGeometry } from 'three';
import { Bone, AnimationClip } from 'three/src/Three';

export class Geometry extends BufferGeometry {
    // These properties do not exist in a normal Geometry class, but if you use the instance that was passed by JSONLoader, it will be added.
    bones: Bone[];
    animation: AnimationClip;
    animations: AnimationClip[];
}
