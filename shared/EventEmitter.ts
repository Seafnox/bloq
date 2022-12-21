import { ComponentId } from "./constants";
import { ComponentMap } from './interfaces';

export type ComponentHandler = (entity: string, componentMap: ComponentMap) => void;

export class ComponentEventEmitter {
    private componentHandlers: Map<ComponentId, ComponentHandler[]> = new Map<ComponentId, ComponentHandler[]>();

    addEventListener(componentId: ComponentId, listener: ComponentHandler) {
        let handlers = this.componentHandlers.get(componentId);
        if (!handlers) {
            handlers = [];
            this.componentHandlers.set(componentId, handlers);
        }
        handlers.push(listener);
    }

    emit(componentId: ComponentId, entity: string, componentMap: ComponentMap) {
        let handlers = this.componentHandlers.get(componentId);
        if (!handlers) return;

        handlers.forEach((callback) => {
            callback(entity, componentMap);
        })
    }
}
