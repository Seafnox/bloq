import Initializer from "../../../shared/Initializer";
import {ComponentId} from "../../../shared/constants";


export default class InputInitializer extends Initializer {
    initialize(entity: string, components: any[]) {
        Object.keys(components).forEach((componentTypeStr) => {
            let componentType = parseInt(componentTypeStr) as ComponentId;
            let componentData = components[componentType];
            this.entityManager.addComponentFromObject(entity, componentType, componentData);
        });
    }
}
