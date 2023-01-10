import { ComponentId } from './constants/componentId';
import { ComponentMap } from './entityMessage';

export type ComponentHandler<TComponentMap extends ComponentMap> = (entity: string, componentMap: Partial<TComponentMap>) => void;

export class ComponentEventEmitter<TComponentMap extends ComponentMap> {
    private componentHandlers: Map<ComponentId, ComponentHandler<TComponentMap>[]> = new Map<ComponentId, ComponentHandler<TComponentMap>[]>();

    addEventListener(componentId: ComponentId, listener: ComponentHandler<TComponentMap>) {
        let handlers = this.componentHandlers.get(componentId);
        if (!handlers) {
            handlers = [];
            this.componentHandlers.set(componentId, handlers);
        }
        handlers.push(listener);
    }

    emit(componentId: ComponentId, entity: string, componentMap: Partial<TComponentMap>) {
        let handlers = this.componentHandlers.get(componentId) || [];

        handlers.forEach((callback: ComponentHandler<TComponentMap>) => callback(entity, componentMap));
    }
}
