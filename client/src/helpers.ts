import { TerrainChunkComponent } from '@block/shared/components/terrainChunkComponent';
import EntityManager from '@block/shared/EntityManager';
import {globalToChunk, chunkKey, mod} from "@block/shared/helpers";
import {TERRAIN_CHUNK_SIZE, ComponentId} from "@block/shared/constants";


export function findBlockMaterial(em: EntityManager, x: number, y: number, z: number): number {
    let [cx, cy, cz] = [x, y, z].map(globalToChunk);

    let key = chunkKey(cx, cy, cz);

    let chunkComponent = em.getComponent<TerrainChunkComponent>(key, ComponentId.TerrainChunk);
    if(!chunkComponent) return 0;

    let [lx, ly, lz] = [mod(x, TERRAIN_CHUNK_SIZE), mod(y, TERRAIN_CHUNK_SIZE), mod(z, TERRAIN_CHUNK_SIZE)];
    return chunkComponent.getValue(lx, ly, lz);
}

export function bufferToObject<T extends Object>(data: ArrayBuffer): T {
    // Bytes -> JSON string -> Object.
    let decoder = new TextDecoder();
    let jsonStr = decoder.decode(data);
    return JSON.parse(jsonStr);
}
