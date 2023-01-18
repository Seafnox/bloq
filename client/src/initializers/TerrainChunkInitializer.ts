import { ComponentId } from '@block/shared/constants/componentId';
import Initializer from '@block/shared/Initializer';

// TODO edit any
export default class TerrainChunkInitializer extends Initializer<any> {
    initialize(entity: string, components: Object) {
        let component = components[ComponentId.TerrainChunk];
        let chunkComponent = this.entityManager.addComponentFromData(entity, ComponentId.TerrainChunk, component);
        chunkComponent.dirtyFields.add('data');
    }
}
