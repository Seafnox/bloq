import { AbstractComponent, AbstractComponentData } from './abstractComponent';

// Used when serializing component to avoid "dirty" flag being serialized. It is only needed locally at runtime.
const componentReplacer = (key: string, value: any) => {
    if (key === 'dirtyFields') return undefined;
    return value;
};

export interface SerializableComponentData extends AbstractComponentData {}

export class SerializableComponent<T extends SerializableComponentData> extends AbstractComponent<T> {
    serialize(): string {
        return JSON.stringify(this, componentReplacer);
    }
}
