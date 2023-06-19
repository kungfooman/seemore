    gl_FragColor.rgb = gammaCorrectOutput(dReflection.rgb * dReflection.a + dSpecularLight);
