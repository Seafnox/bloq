import {SkinnedMesh, MeshBasicMaterial, AnimationMixer} from 'three';
import { AnimationClip } from 'three/src/Three';
import { Geometry } from './Geometry';

export default class AnimatedMesh extends SkinnedMesh<Geometry, MeshBasicMaterial> {
    mixer: AnimationMixer;
    private animationMap: Record<string, AnimationClip> = {};
    private currentAnimName: string;

    constructor(geometry: Geometry, material: MeshBasicMaterial) {
        super(geometry, material);

        this.mixer = new AnimationMixer(this);

        (this.geometry as Geometry).animations.forEach(anim => {
            this.animationMap[anim.name] = anim;
        });

        this.playAnimation('walk');
    }

    playAnimation(name: string) {
        this.mixer.stopAllAction();
        let anim = this.animationMap[name];
        if (anim) {
            let action = this.mixer.clipAction(anim, this);
            action.play();
            this.currentAnimName = name;
        } else {
            console.warn(`Animation ${name} does not exist.`);
        }
    }

    getCurrentAnimation():string {
        return this.currentAnimName;
    }


}
