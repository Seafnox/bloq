import { AbstractComponent, AbstractComponentData } from '@block/shared/components/abstractComponent';
import { ComponentId } from '@block/shared/constants/componentId';

export class NewPlayerComponent extends AbstractComponent<AbstractComponentData> {
    static ID = ComponentId.NewPlayer;
}
