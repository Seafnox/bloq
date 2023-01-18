import EntityManager from "./EntityManager";
import { ComponentMap } from './EntityMessage';


export default class Initializer<TComponentMap extends ComponentMap> {
    entityManager: EntityManager;
    constructor(em: EntityManager) {
        this.entityManager = em;
    }

    initialize(entity: string, componentMap: TComponentMap): void {}
}
