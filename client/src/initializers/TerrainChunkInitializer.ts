import { TerrainChunkComponent } from '@block/shared/components/terrainChunkComponent';
import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";
import { ComponentMap } from '@block/shared/interfaces';


export default class TerrainChunkInitializer extends Initializer {
    initialize(entity: string, componentMap: ComponentMap) {
        let component = componentMap[ComponentId.TerrainChunk];
        let chunkComponent = this.entityManager.addComponentFromObject(entity, ComponentId.TerrainChunk, component) as TerrainChunkComponent;
        chunkComponent.dirtyFields.add('data');
    }
}
