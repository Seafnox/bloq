import { ChunkRequestComponent } from '@block/shared/components/chunkRequestComponent';
import { ComponentId } from '@block/shared/constants/ComponentId';
import Initializer from "@block/shared/Initializer";
import { ServerComponentMap } from '../entityManager/serverEntityMessage';


export default class ChunkRequestInitializer extends Initializer<ServerComponentMap> {
    initialize(entity: string, componentMap: ServerComponentMap): void {
        let requestData = componentMap[ComponentId.ChunkRequest];
        let existingRequest = this.entityManager.getComponent<ChunkRequestComponent>(entity, ComponentId.ChunkRequest);

        // TODO: Might want to use Set.
        requestData.chunks.forEach(key => {
            if(existingRequest.chunks.indexOf(key) === -1) existingRequest.chunks.push(key);
        });
    }
}
