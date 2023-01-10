import { BlockComponent } from '@block/shared/components/blockComponent';
import { InventoryComponent } from '@block/shared/components/inventoryComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import {System} from "@block/shared/System";
import EntityManager from "@block/shared/EntityManager";
import HTMLParser from "../three/HTMLParser";
import '../assets/stylesheets/inventory.scss';
import block1 from '../assets/blocks/1.png';
import block2 from '../assets/blocks/2.png';
import block3 from '../assets/blocks/3.png';
import block4 from '../assets/blocks/4.png';
import block5 from '../assets/blocks/5.png';
import block6 from '../assets/blocks/6.png';
import block7 from '../assets/blocks/7.png';
import block8 from '../assets/blocks/8.png';
import block9 from '../assets/blocks/9.png';
import block10 from '../assets/blocks/10.png';

const textureImages = [
    null,
    block1,
    block2,
    block3,
    block4,
    block5,
    block6,
    block7,
    block8,
    block9,
    block10,
];

const html = `
    <div id="inventory">
        <ol class="inventory-row">
            <li class="active"><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
        </ol>
    </div>
`;

export default class InventoryUISystem extends System {
    private domNode: Element;
    private inventoryElements: NodeListOf<Element>;

    constructor(em: EntityManager, guiNode: Element) {
        super(em);

        // Parse and show in GUI.
        let parser = new HTMLParser();
        this.domNode = parser.parse(html);
        guiNode.appendChild(this.domNode);

        // Set up selectors.
        this.inventoryElements = this.domNode.querySelectorAll('.inventory-row:first-child li');
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.Inventory).forEach((component, entity) => {
            debugger;
            let inventory = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);
            if (inventory.isDirty('activeSlot')) {
                let currentSlot = this.domNode.querySelector('#inventory .active');
                let newSlot = this.inventoryElements[inventory.activeSlot];

                currentSlot.className = '';
                newSlot.className = 'active';
            }

            inventory.slots.forEach((entity, index) => {
                let domBlock = ((this.inventoryElements[index] as HTMLElement).children[0] as HTMLElement);
                if(!domBlock) return; // If inventory slot is not filled, skip.

                domBlock.style.display = entity ? 'block' : 'none';
                if (entity) {
                    let block = this.entityManager.getComponent<BlockComponent>(entity, ComponentId.Block);
                    if (!block) {
                        // Block was removed from game / inventory this tick, so update view right away.
                        inventory.slots[index] = null;
                        domBlock.style.display = 'none';
                        return;
                    }

                    // Workaround for Firefox. It attempts to refetch 404s every tick even though value didn't change.
                    let newBg = `url("${textureImages[block.kind]}")`;
                    if (domBlock.style.backgroundImage !== newBg) domBlock.style.backgroundImage = newBg;

                    domBlock.innerText = '' + block.count;
                }
            })
        });
    }
}
