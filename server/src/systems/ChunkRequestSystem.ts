import { ChunkRequestComponent } from '@block/shared/components/chunkRequestComponent';
import { TerrainChunkComponent } from '@block/shared/components/terrainChunkComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import { terrainChunkSize } from '@block/shared/constants/interaction.constants';
import { chunkKey } from '@block/shared/helpers/chunkKey';
import {System} from "@block/shared/System";
import EntityManager from "@block/shared/EntityManager";
import path from 'path';
import { NetworkComponent } from '../components/networkComponent';
import Server from "../Server";
import { Worker } from 'node:worker_threads';

export default class ChunkRequestSystem extends System {
    worker = new Worker(path.resolve(__dirname, "../workers/TerrainWorker.js"));
    chunkQueue = new Map<string, Set<string>>();

    chunksRequested = new Set<string>();

    constructor(em: EntityManager) {
        super(em);

        this.worker.addListener("message", event => {
            console.log(__filename, 'onMessage', event.data)
            let entity = chunkKey(event.data.x, event.data.y, event.data.z);
            let chunkComponent = new TerrainChunkComponent(event.data.x, event.data.y, event.data.z);
            chunkComponent.data = Uint8Array.from(event.data.data); // Serialized as Array in JSON, but needs to be Uint8.
            this.entityManager.addComponent(entity, chunkComponent);
        });
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
                    Server.sendTerrainChunk(netComponent, chunkComponent.serialize().buffer);
                    reqComponent.chunks.splice(reqComponent.chunks.indexOf(key), 1);
                    return netComponent.bytesLeft() < Math.pow(terrainChunkSize, 3) + 32
                }

                if (!this.chunksRequested.has(key)) {
                    this.chunksRequested.add(key);
                    let [x, y, z] = key.split('x').map(i => parseInt(i));
                    this.worker.postMessage({x, y, z});
                }

                return false;
            });
        });
    }
}
