import { AbstractComponent, AbstractComponentData } from '@block/shared/components/abstractComponent';
import { ComponentId } from '@block/shared/constants';
import EntityManager from '@block/shared/EntityManager';
import { Mesh } from 'three';

export interface MeshComponentData extends AbstractComponentData {
    mesh: Mesh;
}

export class MeshComponent<T extends MeshComponentData = MeshComponentData> extends AbstractComponent<T> {
    static ID = ComponentId.Mesh;

    mesh: Mesh = null;

    dispose(entityManager: EntityManager): void {
        if (this.mesh && this.mesh.parent) {
            this.mesh.geometry.dispose();
            this.mesh.parent.remove(this.mesh);
        }
    }
}
