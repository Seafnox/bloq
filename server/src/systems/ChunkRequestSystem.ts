import { ChunkRequestComponent } from '@block/shared/components/chunkRequestComponent';
import { TerrainChunkComponent } from '@block/shared/components/terrainChunkComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import { terrainChunkSize } from '@block/shared/constants/interaction.constants';
import { chunkKey } from '@block/shared/helpers/chunkKey';
var Worker = require("tiny-worker");
var now = require('performance-now');
import {System} from "@block/shared/System";
import EntityManager from "@block/shared/EntityManager";
import { NetworkComponent } from '../components/networkComponent';
import Server from "../Server";
import TerrainWorker from "../workers/TerrainWorker";


export default class ChunkRequestSystem extends System {
    worker: Worker = new Worker(TerrainWorker);
    chunkQueue: Map<string, Set<string>> = new Map<string, Set<string>>();

    chunksRequested: Set<string> = new Set<string>();

    constructor(em: EntityManager) {
        super(em);

        this.worker.onmessage = (evt) => {
            let entity = chunkKey(evt.data.x, evt.data.y, evt.data.z);
            let chunkComponent = new TerrainChunkComponent(evt.data.x, evt.data.y, evt.data.z);
            chunkComponent.data = Uint8Array.from(evt.data.data); // Serialized as Array in JSON, but needs to be Uint8.
            this.entityManager.addComponent(entity, chunkComponent);
        }
    }

    update(dt: number) {
        let startTime = now();
        this.entityManager.getEntities(ComponentId.ChunkRequest).forEach((component, entity) => {
            if(now()-startTime > 8) return;
            let reqComponent = component as ChunkRequestComponent;
            let netComponent = this.entityManager.getComponent<NetworkComponent>(entity, ComponentId.Network);
            reqComponent.chunks.some(key => {
                if(now()-startTime > 8) {
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
