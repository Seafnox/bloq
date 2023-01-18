import EntityManager from '@block/shared/EntityManager';
import { NetworkComponent } from './NetworkComponent';
import { NewPlayerComponent } from './NewPlayerComponent';
import { PickableComponent } from './PickableComponent';

export function registerServerComponents(manager: EntityManager) {
    manager.registerComponentType(new NetworkComponent());
    manager.registerComponentType(new NewPlayerComponent());
    manager.registerComponentType(new PickableComponent());
}
