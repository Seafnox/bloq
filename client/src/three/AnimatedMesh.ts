import { AnimationMixer } from 'three';
import { AnimationClip, Object3D } from 'three';

export interface AnimatedMesh<T = Object> extends Object3D {
    mixer: AnimationMixer;
    userData: {
        source: T;
        animationMap: Record<string, AnimationClip>;
        currentAnimationName: string;
        [key: string]: any;
    }
    playAnimation(name: string):void;
    getCurrentAnimation():string;
    getAvailableAnimations():string[];
}

export function getAnimatedMesh<T>(
    object: Object3D,
    animations: AnimationClip[] = [],
    source: T = undefined
): AnimatedMesh<T> {
    const animatedObject = object as AnimatedMesh<T>;
    if (object.animations !== animations) {
        console.warn(`Animation in 'object.animations' is different.`);
        console.warn(object.animations);
        console.warn(animations);
        object.animations = object.animations || animations;
    }

    const animationMap = (object.animations).reduce((map: Record<string, AnimationClip>, animation: AnimationClip) => {
            map[animation.name] = animation;

            return map;
        }, {});
    const currentAnimationName = Object.keys(animationMap)[0];

    animatedObject.userData = {
        ...object.userData,
        source,
        animationMap,
        currentAnimationName,
    };

    animatedObject.mixer = new AnimationMixer(animatedObject);
    animatedObject.playAnimation = (name: string) => {
        animatedObject.mixer.stopAllAction();
        let animation = animatedObject.userData.animationMap[name];
        if (animation) {
            let action = animatedObject.mixer.clipAction(animation, object);
            action.play();
            animatedObject.userData.currentAnimationName = name;
        } else {
            console.warn(`Animation ${name} does not exist.`);
        }
    }
    animatedObject.getAvailableAnimations = () => Object.keys(animatedObject.userData.animationMap);
    animatedObject.getCurrentAnimation = () => animatedObject.userData.currentAnimationName;

    return animatedObject;
}
