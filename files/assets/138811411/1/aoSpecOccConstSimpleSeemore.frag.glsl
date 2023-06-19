void occludeSpecular(float gloss, float ao, vec3 worldNormal, vec3 viewDir) {
    float specOcc = saturate(ao * 5.0);
    dSpecularLight *= specOcc;
    dReflection *= specOcc;
}
