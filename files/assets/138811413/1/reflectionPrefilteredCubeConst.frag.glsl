uniform samplerCube texture_prefilteredCubeMap128;
uniform samplerCube texture_prefilteredCubeMap64;
uniform samplerCube texture_prefilteredCubeMap32;
uniform samplerCube texture_prefilteredCubeMap16;
uniform samplerCube texture_prefilteredCubeMap8;
#ifndef PMREM4
#define PMREM4
uniform samplerCube texture_prefilteredCubeMap4;
#endif
uniform float material_reflectivity;

void addReflection(vec3 reflDir, float gloss) {
    vec3 fixedReflDir = fixSeams(cubeMapProject(reflDir), $MIP.0);

    vec4 cubeFinal = textureCube(texture_prefilteredCubeMap$MIPSIZE, fixedReflDir);
    vec3 refl = $DECODE(cubeFinal).rgb;

    dReflection += vec4(refl, material_reflectivity);
}
