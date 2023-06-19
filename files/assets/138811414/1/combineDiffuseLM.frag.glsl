/* 
Override for chunk:
https://github.com/playcanvas/engine/blob/master/src/graphics/program-lib/chunks/combineDiffuse.frag

vec3 combineColor(vec3 albedo, vec3 sheenSpecularity, float clearcoatSpecularity) {
    return albedo * dDiffuseLight;
}
*/
vec3 combineColor(vec3 albedo, vec3 sheenSpecularity, float clearcoatSpecularity) {
    return albedo * (dIndirectLighting + dDiffuseLight * dShadowMask);
}

