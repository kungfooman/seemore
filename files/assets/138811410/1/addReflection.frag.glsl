void addReflection(vec3 reflDir, float gloss) {
    vec3 fixedReflDir = normalize(-dViewDirW + vec3((dNormalW * dTBN).xy * material_bumpiness, 0.0)) * vec3(-1.0, 1.0, 1.0);
    dReflection += vec4(calcReflection(fixedReflDir, gloss) * 4.0, gloss * material_reflectivity);
}
