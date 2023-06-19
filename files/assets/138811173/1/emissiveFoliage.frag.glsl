uniform vec3 material_emissive;

void getEmission() {
    dEmission = dAlbedo * material_emissive * max(-dNormalW.y, 0.0);
}
