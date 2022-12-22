import { TerrainChunkComponent } from '@block/shared/components/terrainChunkComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import { terrainChunkSize } from '@block/shared/constants/TerrainChunkSize';
import EntityManager from '@block/shared/EntityManager';
import { chunkKey } from '@block/shared/helpers/chunkKey';
import { globalToChunk } from '@block/shared/helpers/globalToChunk';
import { mod } from '@block/shared/helpers/mod';

export function findBlockMaterial(em: EntityManager, x: number, y: number, z: number): number {
    let [cx, cy, cz] = [x, y, z].map(globalToChunk);

    let key = chunkKey(cx, cy, cz);

    let chunkComponent = em.getComponent<TerrainChunkComponent>(key, ComponentId.TerrainChunk);
    if (!chunkComponent) return 0;

    let [lx, ly, lz] = [mod(x, terrainChunkSize), mod(y, terrainChunkSize), mod(z, terrainChunkSize)];
    return chunkComponent.getValue(lx, ly, lz);
}
