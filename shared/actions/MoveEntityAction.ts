import { PositionComponent } from '../components/positionComponent';
import { ComponentId } from '../constants/componentId';
import EntityManager from '../EntityManager';
import { AbstractAction } from './AbstractAction';

export class MoveEntityAction extends AbstractAction {
    entity: string;
    position: [number, number, number];

    constructor(entity: string, position: [number, number, number]) {
        super();
        this.entity = entity;
        this.position = position;
    }

    execute(entityManager: EntityManager) {
        let posComponent = entityManager.getComponent<PositionComponent>(this.entity, ComponentId.Position);
        posComponent.x = this.position[0];
        posComponent.y = this.position[1];
        posComponent.z = this.position[2];
    }
}
