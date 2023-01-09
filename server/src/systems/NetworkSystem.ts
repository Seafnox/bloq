import { ComponentId } from '@block/shared/constants/componentId';
import {System} from "@block/shared/System";
import { NetworkComponent } from '../components/networkComponent';
import Server from "../Server";
import EntityManager from "@block/shared/EntityManager";


export default class NetworkSystem extends System {
    server: Server;

    constructor(em: EntityManager, server: Server) {
        super(em);
        this.server = server;
    }

    update(dt: number): void {
        this.entityManager.getEntities(ComponentId.Network).forEach((component, entity) => {
            const netComponent = component as NetworkComponent;
            console.log('Update Socket', entity, netComponent.bufferPos, netComponent.websocket.readyState);

            // Player has disconnected. Remove entity and do not attempt to send on socket.
            if(netComponent.isClosed()) {
                console.log('Socket closed', entity);
                this.entityManager.removeEntity(entity);
                return;
            }

            netComponent.flush();
        });
    }
}
