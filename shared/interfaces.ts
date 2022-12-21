import { ComponentId } from './constants';

export interface EntityMessage {
    entity: string,
    componentMap: ComponentMap
}

export interface ComponentMap extends Record<ComponentId, Object> {}
