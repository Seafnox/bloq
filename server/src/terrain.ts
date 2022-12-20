import FastSimplexNoise = require('fast-simplex-noise');
import {TerrainChunkComponent} from "@block/shared/components";
import {TERRAIN_CHUNK_SIZE, ComponentId} from "@block/shared/constants";
import EntityManager from "@block/shared/EntityManager";
import {globalToChunk, chunkKey, mod} from "@block/shared/helpers";


export function getValueGlobal(em: EntityManager, x: number, y: number, z: number) {
    let key = chunkKey(globalToChunk(x), globalToChunk(y), globalToChunk(z));
    let chunkComponent = em.getComponent<TerrainChunkComponent>(key, ComponentId.TerrainChunk);

    return chunkComponent.getValue(mod(x, TERRAIN_CHUNK_SIZE), mod(y, TERRAIN_CHUNK_SIZE), mod(z, TERRAIN_CHUNK_SIZE));
}
