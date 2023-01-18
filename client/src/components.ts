import { AbstractComponent } from '@block/shared/components/abstractComponent';
import { ComponentId } from '@block/shared/constants/ComponentId';
import { Direction } from '@block/shared/constants/Direction';
import EntityManager from '@block/shared/EntityManager';
import { Mesh } from 'three';
import AnimatedMesh from "./three/AnimatedMesh";

// TODO edit any
export class MeshComponent extends AbstractComponent<any> {
    static ID = ComponentId.Mesh;

    mesh: Mesh = null;

    dispose(entityManager: EntityManager): void {
        if (this.mesh && this.mesh.parent) {
            this.mesh.geometry.dispose();
            this.mesh.parent.remove(this.mesh);
        }
    }
}

export class AnimatedMeshComponent extends MeshComponent {
    static ID = ComponentId.AnimatedMesh;

    mesh: AnimatedMesh = null;
}

export class PlayerSelectionComponent extends MeshComponent {
    static ID = ComponentId.PlayerSelection;

    target: [number, number, number] = [0, 0, 0];
    targetSide: Direction;
    targetValid: boolean = false;
}


// TODO edit any
export class PlayerChunkComponent extends AbstractComponent<any> {
    static ID = ComponentId.PlayerChunk;

    x: number = 0;
    y: number = 0;
    z: number = 0;
}

export function registerClientComponents(manager: EntityManager) {
    manager.registerComponentType(new MeshComponent());
    manager.registerComponentType(new AnimatedMeshComponent());
    manager.registerComponentType(new PlayerSelectionComponent());
    manager.registerComponentType(new PlayerChunkComponent());
}
