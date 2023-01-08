import { ComponentId } from '@block/shared/constants/componentId';
import { AnimatedMesh } from '../three/AnimatedMesh';
import { MeshComponent, MeshComponentData } from './meshComponent';

export class AnimatedMeshComponent extends MeshComponent<MeshComponentData> {
    static ID = ComponentId.AnimatedMesh;

    mesh: AnimatedMesh = null;
}
