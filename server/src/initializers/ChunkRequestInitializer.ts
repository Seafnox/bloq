import { ChunkRequestComponent } from '@block/shared/components/chunkRequestComponent';
import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";
import { ComponentMap } from '@block/shared/interfaces';


export default class ChunkRequestInitializer extends Initializer {
    initialize(entity: string, componentMap: ComponentMap): void {
        let requestData = componentMap[ComponentId.ChunkRequest];
        let existingRequest = this.entityManager.getComponent<ChunkRequestComponent>(entity, ComponentId.ChunkRequest);

        // TODO: Might want to use Set.
        requestData.chunks.forEach(key => {
            if(existingRequest.chunks.indexOf(key) === -1) existingRequest.chunks.push(key);
        });
    }
}
