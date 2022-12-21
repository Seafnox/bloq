import { AbstractComponent, AbstractComponentData } from '@block/shared/components/abstractComponent';
import { ComponentId } from '@block/shared/constants';

export class NewPlayerComponent extends AbstractComponent<AbstractComponentData> {
    static ID = ComponentId.NewPlayer;
}
