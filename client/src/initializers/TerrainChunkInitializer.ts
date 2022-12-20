import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";
import {TerrainChunkComponent} from "@block/shared/components";


export default class TerrainChunkInitializer extends Initializer {
    initialize(entity: string, components: any[]) {
        let component = components[ComponentId.TerrainChunk];
        let chunkComponent = this.entityManager.addComponentFromObject(entity, ComponentId.TerrainChunk, component) as TerrainChunkComponent;
        chunkComponent.dirtyFields.add('data');
    }
}
