import EntityManager from '@block/shared/EntityManager';
import { NetworkComponent } from './networkComponent';
import { NewPlayerComponent } from './newPlayerComponent';
import { PickableComponent } from './pickableComponent';

export function registerServerComponents(manager: EntityManager) {
    manager.registerComponentType(new NetworkComponent());
    manager.registerComponentType(new NewPlayerComponent());
    manager.registerComponentType(new PickableComponent());
}
