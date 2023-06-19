#ifdef MAPTEXTURE
uniform sampler2D texture_aoMap;
uniform float aoLerp;
#endif

void getAO() {
    dAo = 1.0;

    #ifdef MAPTEXTURE
        vec2 ao = texture2D(texture_aoMap, $UV).rg;
        dAo *= mix(ao.g, ao.r, aoLerp);
    #endif

    #ifdef MAPVERTEX
        dAo *= saturate(vVertexColor.$VC);
    #endif

    vec3 aoColor = vec3(0.03155139140022645, 0.0055217448502396585, 0.0055217448502396585);
    dDiffuseLight *= mix(aoColor, vec3(1.0), dAo);
//        dShadowMask = ao.g;
}

