vec2 getUv0() {
    vec4 worldCenter = dModelMatrix[3];
    worldCenter.xyz += dModelMatrix[1].xyz * 10.0;
    vec4 screenCenter = matrix_viewProjection * worldCenter;
    vec2 vec = gl_Position.xy - screenCenter.xy;
    vUv1.x = min( (dot(vec, vec)) * 0.25, 1.0);
    
    vUv1.x *= max(-vNormalW.y, 0.0);
    return vertex_texCoord0;
}
