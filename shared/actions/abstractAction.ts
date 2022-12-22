import EntityManager from '../EntityManager';

export class AbstractAction {
    serialize(): string {
        return JSON.stringify(this);
    }

    execute(entityManager: EntityManager) {}
}
