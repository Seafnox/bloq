import { OnGroundComponent } from '@block/shared/components/onGroundComponent';
import { PositionComponent } from '@block/shared/components/positionComponent';
import { RotationComponent } from '@block/shared/components/rotationComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import { terrainChunkSize } from '@block/shared/constants/interaction.constants';
import { mod } from '@block/shared/helpers/mod';
import {WebGLRenderer} from 'three';

import {System} from "@block/shared/System";
import EntityManager from "@block/shared/EntityManager";
import { PlayerSelectionComponent } from '../components/playerSelectionComponent';


// This is ugly, but it changes a lot, and is only for debugging.
export default class DebugTextSystem extends System {
    domEl: HTMLElement = null;
    renderer: WebGLRenderer;

    constructor(em: EntityManager, renderer: WebGLRenderer) {
        super(em);
        this.renderer = renderer;
    }

    update(dt: number): any {
        if (!this.domEl) {
            this.domEl = document.createElement('pre');
            this.domEl.style.position = 'absolute';
            this.domEl.style.backgroundColor = 'rgba(255,255,255,0.4)';
            this.domEl.style.bottom = '0';
            this.domEl.style.right = '0';
            this.domEl.style.margin = '0';
            this.domEl.style.padding = '10px';
            this.domEl.style.minWidth = '250px';
            this.domEl.style.fontWeight = 'bold';
            this.domEl.style.fontSize = '9px';
            document.body.appendChild(this.domEl);
        }

        let playerEntity = this.entityManager.getEntities(ComponentId.CurrentPlayer).keys().next().value;
        let positionComponent = this.entityManager.getComponent<PositionComponent>(playerEntity, ComponentId.Position);
        if (!positionComponent) return;

        let rotationComponent = this.entityManager.getComponent<RotationComponent>(playerEntity, ComponentId.Rotation);
        let selectionComponent = this.entityManager.getComponent<PlayerSelectionComponent>(playerEntity, ComponentId.PlayerSelection);

        let onGroundComponent = this.entityManager.getComponent<OnGroundComponent>(playerEntity, ComponentId.OnGround);


        let [cx, cy, cz] = positionComponent.toChunk();

        this.domEl.innerText = `Player:   ${playerEntity}
Chunk:    ${cx} x ${cy} x ${cz}

Global: x: ${positionComponent.x.toFixed(2)} | y: ${positionComponent.y.toFixed(2)} | z: ${positionComponent.z.toFixed(2)}
Local:  x: ${mod(positionComponent.x, terrainChunkSize).toFixed(2)} | y: ${mod(positionComponent.y, terrainChunkSize).toFixed(2)} | z: ${mod(positionComponent.z, terrainChunkSize).toFixed(2)}

On ground: ${!!onGroundComponent} | can jump: ${!!onGroundComponent && onGroundComponent.canJump}

Target: x: ${selectionComponent.target[0]} | y: ${selectionComponent.target[1]} | z: ${selectionComponent.target[2]} (${selectionComponent.targetValid ? 'valid' : 'invalid'})

Rotation: x: ${rotationComponent.x.toFixed(2)} | y: ${rotationComponent.y.toFixed(2)} | z: ${rotationComponent.z.toFixed(2)}

Renderer: ${JSON.stringify(this.renderer.info.memory, null, '  ')}
rendered 
${this.renderer.info.render.calls} calls / 
${this.renderer.info.render.frame} frame / 
${this.renderer.info.render.lines} lines / 
${this.renderer.info.render.points} points / 
${this.renderer.info.render.triangles} triangles 
`;
    }
}
