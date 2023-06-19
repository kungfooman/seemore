
#ifndef PMREM4
#define PMREM4
#extension GL_EXT_shader_texture_lod : enable
uniform samplerCube texture_prefilteredCubeMap128;
#endif
uniform float material_reflectivity;
uniform samplerCube texture_cubeMap;

void addReflection(vec3 reflDir, float gloss) {
    float bias = saturate(1.0 - gloss) * 5.0; // multiply by max mip level
    int index1 = int(bias);
    int index2 = int(min(bias + 1.0, 7.0));
    
    vec3 fixedReflDir = -dViewDirW + vec3(dNormalMap.xy * material_bumpiness, 0.0);

    vec4 cubeFinal = textureCube(texture_cubeMap, fixedReflDir, min(bias * 4.0, 5.0));
    vec3 refl = processEnvironment($DECODE(cubeFinal).rgb) * 4.0;

    dReflection += vec4(refl, gloss * material_reflectivity);
}
