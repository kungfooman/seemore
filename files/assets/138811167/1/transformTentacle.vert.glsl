uniform vec4 uTentacleControl;

vec4 dTemp, dTemp2;

mat4 getModelMatrix() {
    return matrix_model;
}

vec4 getPosition() {
    dModelMatrix = getModelMatrix();
    vec3 localPos = vertex_position;

    dTemp.xyz = vertex_normal;
    dTemp2 = vec4(1.0, 0.0, 0.0, 0.0);

    // Throb
    localPos.xz *= 1.0 + cos(localPos.y + uTentacleControl.w * 6.283) * 0.125;
    dTemp.y += sin(localPos.y + uTentacleControl.w * 6.283) * 0.25;
    dTemp.xyz = normalize(dTemp.xyz);
    dTemp2.y += sin(localPos.y + uTentacleControl.w * 6.283) * 0.25;
    dTemp2.xyz = normalize(dTemp2.xyz);

    // Twirl
    float curl = length(uTentacleControl.xy);
    vec2 tent = vec2(cos(localPos.y * 0.25 - uTentacleControl.z * 6.283) * localPos.y * 0.0625,
                     sin(localPos.y * 0.25 - uTentacleControl.z * 6.283) * localPos.y * 0.0625);
    dTemp.y -= dot(tent, normalize(localPos.zx)) * 0.5 / (1.0 + curl * 2.0);
    dTemp2.y -= dot(tent, normalize(localPos.zx)) * 0.5 / (1.0 + curl * 2.0);
    localPos.xz += tent;
    dTemp.xyz = normalize(dTemp.xyz);
    dTemp2.xyz = normalize(dTemp2.xyz);
    
    // Bend
    tent = normalize(uTentacleControl.xy);

    if (curl > 0.0001) {
        float TLENGTH = 20.0;
        float icurl = TLENGTH / curl;

        // rotate vetex layer
        float extra = 0.0;
        float cAngle = (localPos.y * 3.14159 / 2.0)/icurl;
        if (icurl < localPos.y){
            extra = localPos.y - icurl;
            cAngle = 3.14159 / 2.0;
        }
        float gradient = sin(cAngle);
        float foreshorten = cos(cAngle);
        float adj = dot(localPos.xz, tent);
        
        float nadj = dot(dTemp.xz, tent);
        dTemp.y += gradient * nadj;
        dTemp.xz += (foreshorten * nadj - nadj) * tent;

        float tadj = dot(dTemp2.xz, tent);
        dTemp2.y += gradient * tadj;
        dTemp2.xz += (foreshorten * tadj - tadj) * tent;
        
        // recenter vertex layer
        localPos.y = (sin(cAngle) * icurl) / (3.14159/2.0) + gradient * adj;
        localPos.xz += ((cos(cAngle) * icurl - icurl) / (3.14159/2.0) + (foreshorten * adj - adj) - extra) * tent;
    }

    vec4 posW = dModelMatrix * vec4(localPos, 1.0);
    dPositionW = posW.xyz;
    return matrix_viewProjection * posW;
}

vec3 getWorldPosition() {
    return dPositionW;
}
