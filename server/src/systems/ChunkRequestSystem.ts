import { ChunkRequestComponent } from '@block/shared/components/chunkRequestComponent';
import { TerrainChunkComponent } from '@block/shared/components/terrainChunkComponent';
import { ComponentId } from '@block/shared/constants/ComponentId';
import { terrainChunkSize } from '@block/shared/constants/interaction.constants';
import { chunkKey } from '@block/shared/helpers/chunkKey';
import {System} from "@block/shared/System";
import EntityManager from "@block/shared/EntityManager";
import path from 'path';
import { v4 } from 'uuid';
import { NetworkComponent } from '../components/NetworkComponent';
import { Worker } from 'node:worker_threads';

export default class ChunkRequestSystem extends System {
    worker = new Worker(path.resolve(__dirname, "../workers/TerrainWorker.js"));
    chunksRequested = new Set<string>();

    constructor(em: EntityManager) {
        super(em);

        this.worker.addListener("message", event => {
//            console.log('TerrainWorker', 'resolve', event.x, event.y, event.z, event.id);
            let entity = chunkKey(event.x, event.y, event.z);
            let chunkComponent = new TerrainChunkComponent(event.x, event.y, event.z);
            chunkComponent.data = Uint8Array.from(event.data); // Serialized as Array in JSON, but needs to be Uint8.
            this.entityManager.addComponent(entity, chunkComponent);
        });

        this.worker.addListener("error", event => console.log('TerrainWorker', 'onError', event));
        this.worker.addListener("messageerror", event => console.log('TerrainWorker', 'onMessageError', event));
        this.worker.addListener("online", () => console.log('TerrainWorker', 'onOnline'));
        this.worker.addListener("exit", () => console.log('TerrainWorker', 'onExit'));
    }

    update(dt: number) {
        let startTime = performance.now();
        this.entityManager.getEntities(ComponentId.ChunkRequest).forEach((component, entity) => {
            if(performance.now()-startTime > 8) return;
            let reqComponent = component as ChunkRequestComponent;
            let netComponent = this.entityManager.getComponent<NetworkComponent>(entity, ComponentId.Network);
            reqComponent.chunks.some(key => {
                if(performance.now()-startTime > 8) {
                    return true;
                }

                let chunkComponent = this.entityManager.getComponent<TerrainChunkComponent>(key, ComponentId.TerrainChunk);
                if (chunkComponent) {
                    netComponent.pushTerrainChunk(chunkComponent.serialize().buffer);
                    reqComponent.chunks.splice(reqComponent.chunks.indexOf(key), 1);
                    return netComponent.bytesLeft() < Math.pow(terrainChunkSize, 3) + 32
                }

                if (!this.chunksRequested.has(key)) {
                    this.chunksRequested.add(key);
                    let [x, y, z] = key.split('x').map(i => parseInt(i));
//                    console.log('TerrainWorker', 'onMessage', {x, y, z});
                    this.worker.postMessage({x, y, z , terrainChunkSize, id: v4()});
                }

                return false;
            });
        });
    }
}
