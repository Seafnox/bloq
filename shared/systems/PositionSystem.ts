import { PhysicsComponent } from '../components/physicsComponent';
import { PositionComponent } from '../components/positionComponent';
import { ComponentId } from '../constants/componentId';
import {System} from "../System";


export default class PositionSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Physics).forEach((component, entity) => {
            // Get physics.
            let physComponent = component as PhysicsComponent;

            // Update positions.
            let posComponent = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
            posComponent.x += physComponent.velX * dt;
            posComponent.y += physComponent.velY * dt;
            posComponent.z += physComponent.velZ * dt;
        })
    }
}
