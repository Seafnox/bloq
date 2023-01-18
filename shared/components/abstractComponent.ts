import { ComponentId } from '../constants/ComponentId';
import EntityManager from '../EntityManager';

export interface AbstractComponentData {
    ID: ComponentId;
}

export class AbstractComponent<T extends AbstractComponentData> implements AbstractComponentData {
    static ID: ComponentId = ComponentId.None;
    dirtyFields: Set<keyof T> = new Set<keyof T>();

    get ID(): ComponentId {
        return (this.constructor as typeof AbstractComponent).ID;
    }

    isDirty(field?: keyof T): boolean {
        if (field) return this.dirtyFields.has(field);
        else return this.dirtyFields.size > 0;
    }

    typeName(): ComponentId {
        return this.ID;
    }

    update(data: Partial<T>): void {
        Object.assign(this, data);
    }

    dispose(entityManager: EntityManager): void {
    }
}


