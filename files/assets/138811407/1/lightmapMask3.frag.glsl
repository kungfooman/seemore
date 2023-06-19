/* 
Override for chunk:
https://github.com/playcanvas/engine/blob/master/src/graphics/program-lib/chunks/lightmapSingle.frag

#ifdef MAPTEXTURE
uniform sampler2D texture_lightMap;
#endif

void addLightMap() {
    vec3 lm = vec3(1.0);

    #ifdef MAPTEXTURE
        lm *= $DECODE(texture2D(texture_lightMap, $UV)).$CH;
    #endif

    #ifdef MAPVERTEX
        lm *= saturate(vVertexColor.$VC);
    #endif
    
    dDiffuseLight += lm;
}
*/
uniform sampler2D texture_lightMap;
uniform sampler2D texture_light1Map;
uniform float shadowMaskLerp;
vec3 dIndirectLighting;
float dShadowMask;

void getLightMap() {

    vec3 lm0 = $DECODE(texture2D(texture_lightMap, $UV)).$CH;
    vec3 lm1 = texture2D(texture_light1Map, $UV).rgb;

    // dDiffuseLight = vec3(0.0);
    dIndirectLighting = lm0;
    
    dShadowMask = mix(lm1.r, lm1.g, min(shadowMaskLerp * 2.0, 1.0));
    dShadowMask = mix(dShadowMask, lm1.b, max(shadowMaskLerp * 2.0 - 1.0, 0.0));
}
