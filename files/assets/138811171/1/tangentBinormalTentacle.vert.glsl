vec3 getTangent() {
    return normalize(dNormalMatrix * dTemp2.xyz);
}

vec3 getBinormal() {
    return cross(vNormalW, vTangentW);
}
