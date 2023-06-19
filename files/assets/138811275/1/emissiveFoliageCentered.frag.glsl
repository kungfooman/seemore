uniform vec3 material_emissive;

void getEmission() {
    dEmission = dAlbedo * material_emissive * vUv1.x;
}
