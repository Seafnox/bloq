import { MoveEntityAction } from '@block/shared/actions/moveEntityAction';
import { PositionComponent } from '@block/shared/components/positionComponent';
import { ActionId } from '@block/shared/constants/actionId';
import { ComponentId } from '@block/shared/constants/componentId';
import { globalToChunk } from '@block/shared/helpers/globalToChunk';
import Initializer from "@block/shared/Initializer";
import { ServerComponentMap } from '../entityManager/serverEntityMessage';
import { broadcastAction } from '../helpers/broadcastAction';
import EntityManager from "@block/shared/EntityManager";
import {ServerActionManager} from "../actions/ServerActionManager";


export default class PositionInitializer extends Initializer<ServerComponentMap> {
    private actionManager: ServerActionManager;

    constructor(em: EntityManager, am: ServerActionManager) {
        super(em);
        this.actionManager = am;
    }

    initialize(entity: string, componentMap: ServerComponentMap): void {
        let position = componentMap[ComponentId.Position];
        let existingPosition = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
        let prevPos: [number, number, number] = [existingPosition.x, existingPosition.y, existingPosition.z];
        let dist = Math.sqrt(Math.pow(position.x - existingPosition.x, 2) + Math.pow(position.y - existingPosition.y, 2) + Math.pow(position.z - existingPosition.z, 2));

        if (dist < 2) {
            existingPosition.update(position);
        } else {
            console.log('Too big difference between client and server!', dist);
            console.log(entity, prevPos);
            let action = new MoveEntityAction(entity, prevPos);
            this.actionManager.queueAction(action); // Queue on server as well.

            // Broad cast so it's queued on clients.
            let [cx, cy, cz] = prevPos.map(globalToChunk);
            broadcastAction(this.entityManager, [cx, cy, cz], ActionId.MoveEntity, action);
        }

    }
}
