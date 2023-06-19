/* 
Override for chunk:
https://github.com/playcanvas/engine/blob/master/src/graphics/program-lib/chunks/combineDiffuseSpecular.frag

vec3 combineColor(vec3 albedo, vec3 sheenSpecularity, float clearcoatSpecularity) {
    return mix(albedo * dDiffuseLight, dSpecularLight + dReflection.rgb * dReflection.a, dSpecularity);
}
*/

vec3 combineColor(vec3 albedo, vec3 sheenSpecularity, float clearcoatSpecularity) {
    // post half-angle fresnel, energy conservation has changed
    return albedo * (dIndirectLighting + dDiffuseLight * dShadowMask) + dSpecularLight * dShadowMask + dReflection.rgb * dReflection.a;
//    return dAlbedo * (dIndirectLighting + dDiffuseLight * dShadowMask) + dSpecularLight * dShadowMask + dReflection.rgb * dReflection.a;
}
