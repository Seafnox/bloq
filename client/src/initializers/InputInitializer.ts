import { ComponentId } from '@block/shared/constants/ComponentId';
import Initializer from '@block/shared/Initializer';

// TODO edit any
export default class InputInitializer extends Initializer<any> {
    initialize(entity: string, components: Object) {
        Object.keys(components).forEach((componentTypeStr) => {
            let componentType = parseInt(componentTypeStr) as ComponentId;
            let componentData = components[componentType];
            this.entityManager.addComponentFromData(entity, componentType, componentData);
        });
    }
}
