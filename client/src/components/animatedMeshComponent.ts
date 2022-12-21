import { ComponentId } from '@block/shared/constants';
import AnimatedMesh from '../../lib/AnimatedMesh';
import { MeshComponent } from './meshComponent';

export class AnimatedMeshComponent extends MeshComponent {
    static ID = ComponentId.AnimatedMesh;

    mesh: AnimatedMesh = null;
}
