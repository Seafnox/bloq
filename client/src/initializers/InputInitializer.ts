import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";
import { ComponentMap } from '@block/shared/entityMessage';
import { ClientComponentMap } from '../emtityManager/clientEntityMessage';

export default class InputInitializer extends Initializer<ClientComponentMap> {
    initialize(entity: string, componentMap: ComponentMap) {
        Object.keys(componentMap).forEach((componentIdStr) => {
            let componentId = parseInt(componentIdStr) as ComponentId;
            let componentData = componentMap[componentId];
            this.entityManager.addComponentFromData(entity, componentId, componentData);
        });
    }
}
