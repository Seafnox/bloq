import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";
import { ComponentMap } from '@block/shared/interfaces';

export default class InputInitializer extends Initializer {
    initialize(entity: string, componentMap: ComponentMap) {
        Object.keys(componentMap).forEach((componentIdStr) => {
            let componentId = parseInt(componentIdStr) as ComponentId;
            let componentData = componentMap[componentId];
            this.entityManager.addComponentFromObject(entity, componentId, componentData);
        });
    }
}
