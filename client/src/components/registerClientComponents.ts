import EntityManager from '@block/shared/EntityManager';
import { AnimatedMeshComponent } from './animatedMeshComponent';
import { MeshComponent } from './meshComponent';
import { PlayerChunkComponent } from './playerChunkComponent';
import { PlayerSelectionComponent } from './playerSelectionComponent';

export function registerClientComponents(manager: EntityManager) {
    manager.registerComponentType(new MeshComponent());
    manager.registerComponentType(new AnimatedMeshComponent());
    manager.registerComponentType(new PlayerSelectionComponent());
    manager.registerComponentType(new PlayerChunkComponent());
}
