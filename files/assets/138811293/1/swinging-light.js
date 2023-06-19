var SwingingLight = pc.createScript('swingingLight');

SwingingLight.attributes.add('light', { type: 'entity' });
SwingingLight.attributes.add('parentNode', { type: 'string' });
SwingingLight.attributes.add('offset', { type: 'vec3', default: [0, 0, 0] });
SwingingLight.attributes.add('swingAngle', { type: 'number', default: 60 });
SwingingLight.attributes.add('swingTime', { type: 'number', default: 2 });
SwingingLight.attributes.add('xAngle', { type: 'number', default: 0 });

SwingingLight.attributes.add('lightMapInterp', { type: 'asset', assetType: 'texture' });
SwingingLight.attributes.add('lightMapChunk', { type: 'asset', assetType: 'shader' });

// initialize code called once per entity
SwingingLight.prototype.initialize = function() {
    this.totalTime = 0;

    this.lightParent = this.entity.findByName(this.parentNode);
    this.light.reparent(this.lightParent);
    this.light.setLocalPosition(this.offset);

    this.glow = this.light.findByName('Glow');
    this.glowPos = new pc.Vec3();

    this.cameraPos = new pc.Vec3();
    this.app.on('cameramove', function (cameraPos) {
        this.cameraPos.copy(cameraPos);
    }, this);

    var assetRegistry = this.app.assets;
    var combineChunk = assetRegistry.find("combineDiffuseSpecularLM.frag", "shader").resource;
    
    this.entity.model.meshInstances.forEach(function (meshInstance) {
        // If we have a lightmapped material, let's augment it with interpolated lightmaps!
        if (meshInstance.material.lightMap !== null) {
            meshInstance.setParameter('texture_light1Map', this.lightMapInterp.resource);
            meshInstance.setParameter('shadowMaskLerp', 0.5); // Hardcode a value for now...

            // Override the two relevant chunks:
            meshInstance.material.chunks.APIVersion = pc.CHUNK_API_1_56;
            meshInstance.material.chunks.lightmapSinglePS = this.lightMapChunk.resource;
            meshInstance.material.chunks.combinePS = combineChunk;
        }
    }.bind(this));
};

// update code called every frame
SwingingLight.prototype.update = function(dt) {
    this.totalTime += dt;

    var a = Math.sin((this.totalTime * 2 * Math.PI) / this.swingTime);
    this.lightParent.setEulerAngles(this.xAngle, 0, a * this.swingAngle);
    this.light.setRotation(pc.Quat.IDENTITY);

    var lightPos = this.light.getPosition();
    this.glowPos.sub2(this.cameraPos, lightPos).scale(0.1).add(lightPos);
    this.glow.setPosition(this.glowPos);
    this.glow.lookAt(this.cameraPos);
    this.glow.rotateLocal(-90, 0, 0);

    this.entity.model.meshInstances.forEach(function (meshInstance) {
        // If we have a lightmapped material, let's augment it with interpolated lightmaps!
        if (meshInstance.material.lightMap !== null) {
            meshInstance.setParameter('shadowMaskLerp', -a * 0.5 + 0.5); // Hardcode a value for now...
        }
    });
};
