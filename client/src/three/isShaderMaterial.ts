import { Material, ShaderMaterial } from 'three';

export function isShaderMaterial(material: Material | Material[]): material is ShaderMaterial {
    return 'isShaderMaterial' in material && !!material['isShaderMaterial'];

}
