import { TerrainChunkComponent } from '@block/shared/components/terrainChunkComponent';
import { ComponentId } from '@block/shared/constants/ComponentId';
import { terrainChunkSize } from '@block/shared/constants/interaction.constants';
import EntityManager from "@block/shared/EntityManager";
import { chunkKey } from '@block/shared/helpers/chunkKey';
import { globalToChunk } from '@block/shared/helpers/globalToChunk';
import { mod } from '@block/shared/helpers/mod';


export function getValueGlobal(em: EntityManager, x: number, y: number, z: number): number {
    let [cx, cy, cz] = [x, y, z].map(globalToChunk);

    let key = chunkKey(cx, cy, cz);

    let chunkComponent = em.getComponent<TerrainChunkComponent>(key, ComponentId.TerrainChunk);

    return chunkComponent.getValue(mod(x, terrainChunkSize), mod(y, terrainChunkSize), mod(z, terrainChunkSize));
}
