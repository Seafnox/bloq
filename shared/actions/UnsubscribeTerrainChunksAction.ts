import EntityManager from '../EntityManager';
import { AbstractAction } from './AbstractAction';

export class UnsubscribeTerrainChunksAction extends AbstractAction {
    chunkKeys: Array<string> = [];

    constructor(chunkKeys: Array<string>) {
        super();
        this.chunkKeys = chunkKeys;
    }

    execute(entityManager: EntityManager) {
        for (let chunkKey of this.chunkKeys) {
            entityManager.removeEntity(chunkKey);
        }
    }
}
