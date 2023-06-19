vec3 unpackNormal(vec4 nmap) {
    vec3 normal;
    normal.xy = nmap.xy * 2.0 - 1.0;

    // Derive Z component from X and Y
    normal.z = sqrt(1.0 - saturate(dot(normal.xy, normal.xy)));

    return normalize(normal);
}
