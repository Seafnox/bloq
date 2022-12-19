import EntityManager from "./EntityManager";


export default class Initializer {
    entityManager: EntityManager;
    constructor(em: EntityManager) {
        this.entityManager = em;
    }

    initialize(entity: string, components: Object): void {}
}
