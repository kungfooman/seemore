uniform vec4 Tcontrol;

vec4 dTemp, dTemp2;

mat4 getModelMatrix() {
    return matrix_model;
}

vec4 getPosition() {
    dModelMatrix = getModelMatrix();
    
    vec3 localPos = vertex_position;

    localPos += vec3(0.0, 1.8, -0.5);

    float hAng = Tcontrol.w * localPos.y;
    float c1 = clamp(localPos.y, 0.0, Tcontrol.z);
    float c2 = max(localPos.y - Tcontrol.z,0.0);
    
    vec3 crossect = localPos.xyz;
    crossect.y = 0.0;
    vec3 topx = vec3(1.0, 0.0, 0.0);
    vec3 topy = vec3(0.0, 1.0, 0.0);
    vec3 topz = vec3(0.0, 0.0, 1.0);
    
    if (abs(Tcontrol.x) > 0.0 && c1 > 0.0){
        float icurl = 1.0 / Tcontrol.x;
        
        float cAngle = (c1 * 3.14159 / 2.0) / icurl;
        
        float gradient = sin(cAngle);
        float foreshorten = cos(cAngle);
        topy.y = foreshorten;
        topy.z = -gradient;
        
        topz.y = gradient;
        topz.z = foreshorten;
        
        localPos.y = sin(cAngle) / (3.14159 * 0.5) * icurl;
        localPos.z = (cos(cAngle) - 1.0) * icurl;
        
        localPos.x = 0.0;
    } else {
        localPos.y = c1;
        localPos.z = 0.0;
        localPos.x = 0.0;
    }
    
    if (abs(Tcontrol.y) > 0.0 && c2 > 0.0){
        float icurl = 1.0 / Tcontrol.y;
        
        float cAngle = (c2 * 3.14159 * 0.5) / icurl;
        
        float gradient = sin(cAngle);
        float foreshorten = cos(cAngle);
        vec3 tempy = foreshorten * topy - gradient * topz;
        vec3 tempz = gradient * topy + foreshorten * topz;
        
        localPos.xyz += sin(cAngle) / (3.14159 * 0.5) * icurl * topy + (cos(cAngle) - 1.0) * icurl * topz;
        topz = tempz;
        topy = tempy;
    } else {
        localPos.xyz += c2 * topy;
    }
    
    dTemp.xyz = vertex_normal.x * topx + vertex_normal.y * topy + vertex_normal.z * topz;
//    dTemp2.xyz = vertex_tangent.x * topx + vertex_tangent.y * topy + vertex_tangent.z * topz;
    dTemp2.xyz = 1.0 * topx + 0.0 * topy + 0.0 * topz;
    
    localPos.xyz += crossect.x * topx + crossect.z * topz;
    crossect = localPos.xyz;
    float ca = cos(hAng);
    float sa = sin(hAng);
    localPos.x = ca * crossect.x + sa * crossect.z;
    localPos.z = -sa * crossect.x + ca * crossect.z;
    
    crossect = dTemp2.xyz;
    dTemp2.x = ca * crossect.x + sa * crossect.z;
    dTemp2.z = -sa * crossect.x + ca * crossect.z;
    
    crossect = dTemp.xyz;
    dTemp2.x = ca * crossect.x + sa * crossect.z;
    dTemp2.z = -sa * crossect.x + ca * crossect.z;

    localPos.xz *= -1.0;
    dTemp.xz *= -1.0;
    dTemp2.xz *= -1.0;

    vec4 posW = dModelMatrix * vec4(localPos, 1.0);
    dPositionW = posW.xyz;
    return matrix_viewProjection * posW;
}

vec3 getWorldPosition() {
    return dPositionW;
}
