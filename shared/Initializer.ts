import EntityManager from "./EntityManager";
import { ComponentMap } from './interfaces';


export default class Initializer {
    entityManager: EntityManager;
    constructor(em: EntityManager) {
        this.entityManager = em;
    }

    initialize(entity: string, componentMap: ComponentMap): void {}
}
