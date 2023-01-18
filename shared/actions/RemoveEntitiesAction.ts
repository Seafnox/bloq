import EntityManager from '../EntityManager';
import { AbstractAction } from './AbstractAction';

export class RemoveEntitiesAction extends AbstractAction {
    entities: Array<string>;

    constructor(entities: Array<string>) {
        super();
        this.entities = entities;
    }

    execute(entityManager: EntityManager) {
        for (let entity of this.entities) {
            entityManager.removeEntity(entity);
        }
    }
}
