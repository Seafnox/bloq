import { TerrainChunkComponent } from '../components/terrainChunkComponent';
import { ComponentId } from '../constants/componentId';
import { terrainChunkSize } from '../constants/interaction.constants';
import EntityManager from '../EntityManager';
import { chunkKey } from '../helpers/chunkKey';
import { globalToChunk } from '../helpers/globalToChunk';
import { mod } from '../helpers/mod';
import { AbstractAction } from './abstractAction';

export class SetBlocksAction extends AbstractAction {
    blocks: Array<[number, number, number, number]>;

    constructor(blocks: Array<[number, number, number, number]>) {
        super();
        this.blocks = blocks;
    }

    execute(entityManager: EntityManager) {
        this.blocks.forEach(block => {
            let [x, y, z, value] = block;

            let [cx, cy, cz] = [x, y, z].map(globalToChunk);
            let [lx, ly, lz] = [mod(x, terrainChunkSize), mod(y, terrainChunkSize), mod(z, terrainChunkSize)];

            let entityKey = chunkKey(cx, cy, cz);
            let chunk = entityManager.getComponent<TerrainChunkComponent>(entityKey, ComponentId.TerrainChunk);
            if (!chunk) return;

            // Force refresh for neighboring chunks if player is digging at the edge of this chunk.
            [-1, 0, 1].forEach(oz => {
                [-1, 0, 1].forEach(oy => {
                    [-1, 0, 1].forEach(ox => {
                        if (Math.abs(ox) + Math.abs(oy) + Math.abs(oz) !== 1) return;
                        let [nx, ny, nz] = [x + ox, y + oy, z + oz].map(globalToChunk);
                        let neighborKey = chunkKey(nx, ny, nz);
                        if (neighborKey === entityKey) return;

                        let neighborChunk = entityManager.getComponent<TerrainChunkComponent>(neighborKey, ComponentId.TerrainChunk);
                        if (neighborChunk) neighborChunk.forceDirtyData(true);
                    });
                });
            });

            chunk.setValue(lx, ly, lz, value);
        });
    }
}
