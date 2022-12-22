import { TerrainChunkComponent } from '@block/shared/components/terrainChunkComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import Initializer from "@block/shared/Initializer";
import { ComponentMap } from '@block/shared/entityMessage';
import { ClientComponentMap } from '../emtityManager/clientEntityMessage';


export default class TerrainChunkInitializer extends Initializer<ClientComponentMap> {
    initialize(entity: string, componentMap: ComponentMap) {
        let component = componentMap[ComponentId.TerrainChunk];
        let chunkComponent = this.entityManager.addComponentFromData(entity, ComponentId.TerrainChunk, component) as TerrainChunkComponent;
        chunkComponent.dirtyFields.add('data');
    }
}
