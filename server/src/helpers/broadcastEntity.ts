import { ComponentId } from '@block/shared/constants/ComponentId';
import EntityManager from '@block/shared/EntityManager';
import { NetworkComponent } from '../components/NetworkComponent';

export function broadcastEntity(em: EntityManager, chunk: [number, number, number], entity: string) {
    em.getEntities(ComponentId.Network).forEach((component, playerEntity) => {
        let netComponent = component as NetworkComponent;
        netComponent.pushEntity(em.serializeEntity(entity));
    });
}
