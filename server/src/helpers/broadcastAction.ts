import { AbstractAction } from '@block/shared/actions/AbstractAction';
import { RemoveEntitiesAction } from '@block/shared/actions/RemoveEntitiesAction';
import { ActionId } from '@block/shared/constants/actionId';
import { ComponentId } from '@block/shared/constants/componentId';
import EntityManager from '@block/shared/EntityManager';
import { NetworkComponent } from '../components/networkComponent';
import Server from '../Server';

export function broadcastAction(em: EntityManager, chunk: [number, number, number], actionId: ActionId, action: AbstractAction) {
    em.getEntities(ComponentId.Network).forEach((component, playerEntity) => {
        // If we are going to remove an entity, and this entity a networked entity (Player),
        // it means this player has disconnected, so no need to try sending on a closed socket.
        if (actionId === ActionId.RemoveEntities && (action as RemoveEntitiesAction).entities.indexOf(playerEntity) !== -1) return;

        let netComponent = component as NetworkComponent;
        Server.sendAction(netComponent, actionId, action);
    });
}
