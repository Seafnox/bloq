import { AbstractComponent, AbstractComponentData } from '@block/shared/components/abstractComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import EntityManager from '@block/shared/EntityManager';
import { Object3D, Mesh } from 'three';

export interface MeshComponentData extends AbstractComponentData {
    mesh: Mesh;
}

export class MeshComponent<T extends MeshComponentData = MeshComponentData> extends AbstractComponent<T> {
    static ID = ComponentId.Mesh;

    mesh: Object3D = null;

    dispose(entityManager: EntityManager): void {
        if (this.mesh && this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }
    }
}
