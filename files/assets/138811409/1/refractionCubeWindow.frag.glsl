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
uniform samplerCube texture_cubeMap;

void addReflection(vec3 reflDir, float gloss) {
    // Unfortunately, WebGL doesn't allow us using textureCubeLod. Therefore bunch of nasty workarounds is required.
    // We fix mip0 to 128x128, so code is rather static.
    // Mips smaller than 4x4 aren't great even for diffuse. Don't forget that we don't have bilinear filtering between different faces.

    float bias = saturate(1.0 - gloss) * 5.0; // multiply by max mip level
    int index1 = int(bias);
    int index2 = int(min(bias + 1.0, 7.0));

    vec3 fixedReflDir = fixSeams(-dViewDirW + vec3(dNormalMap.xy * material_bumpiness, 0.0), bias);

    vec4 cubes[6];
    cubes[0] = textureCube(texture_prefilteredCubeMap128, fixedReflDir);
    cubes[1] = textureCube(texture_prefilteredCubeMap64, fixedReflDir);
    cubes[2] = textureCube(texture_prefilteredCubeMap32, fixedReflDir);
    cubes[3] = textureCube(texture_prefilteredCubeMap16, fixedReflDir);
    cubes[4] = textureCube(texture_prefilteredCubeMap8, fixedReflDir);
    cubes[5] = textureCube(texture_prefilteredCubeMap4, fixedReflDir);

    vec4 cubeFinal = mix(cubes[0], cubes[1], min(bias, 1.0));
    cubeFinal = mix(cubeFinal, cubes[2], saturate(bias - 1.0));
    cubeFinal = mix(cubeFinal, cubes[3], saturate(bias - 2.0));
    cubeFinal = mix(cubeFinal, cubes[4], saturate(bias - 3.0));
    cubeFinal = mix(cubeFinal, cubes[5], saturate(bias - 4.0));

    vec3 refl = $DECODE(cubeFinal).rgb * 10.0;

    dReflection += vec4(refl, dTemp.b * material_reflectivity);
}
