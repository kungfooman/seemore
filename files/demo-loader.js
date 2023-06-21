var DemoLoader = pc.createScript('demoLoader');

// pc.app.scene.clusteredLightingEnabled = true;

// initialize code called once per entity
DemoLoader.prototype.initialize = function() {
    var app = this.app;

    app.scene.fogColor = new pc.Color(1.7098039388656616, 1.7882353067398071, 1.858823537826538);

    this.fixupMaterials();

    // ...but lock the gamesroom door until the next room has loaded
    app.root.findByName('Gamesroom').findByName('Door').script.door.lock();

    // ...and immediately start loading the next room
    this.loadRoom('Corridor1', function () {
        this.fixupMaterials();

        // Unlock gamesroom door
        app.root.findByName('Gamesroom').findByName('Door').script.door.unlock();

        // Lock inter-corridor door
        app.root.findByName('Corridor1').findByName('Door').script.door.lock();

        this.loadRoom('Corridor2', function () {
            this.fixupMaterials();

            // Unlock inter-corridor door
            app.root.findByName('Corridor1').findByName('Door').script.door.unlock();

            // Lock greenhouse doors
            app.root.findByName('Corridor2').findByName('Left Door').script.door.lock();
            app.root.findByName('Corridor2').findByName('Right Door').script.door.lock();

            this.loadRoom('Greenhouse', function () {
                this.fixupMaterials();

                // Unlock greenhouse doors
                app.root.findByName('Corridor2').findByName('Left Door').script.door.unlock();
                app.root.findByName('Corridor2').findByName('Right Door').script.door.unlock();
            }.bind(this));
        }.bind(this));
    }.bind(this));
};

/**
 * @param {string} room 
 * @param {Function} done 
 */
DemoLoader.prototype.loadRoom = function (room, done) {
    var app = this.app;
    var assetRegistry = app.assets;
    var assets = assetRegistry.findByTag(room.toLowerCase());
    var assetListLoader = new pc.AssetListLoader(assets, assetRegistry);
    assetListLoader.load(() => {
        app.root.findByName(room).enabled = true;
        done?.();
    })
};

DemoLoader.prototype.fixupMaterials = function () {
    var app = this.app;
    var assetRegistry = app.assets;
    var materialAssets = assetRegistry.findByTag('material');

    materialAssets.forEach(function (materialAsset) {
        if (materialAsset.loaded) {
            var tags = materialAsset.tags;
            var material = materialAsset.resource;

            material.chunks.APIVersion = pc.CHUNKAPI_1_56;

            // Normal maps in the Seemore demo only specify X and Y components. The 'normalXY'
            // shader chunk generates the Z component on the GPU.
            if (tags.has('normalmap')) {
                var normalXY = assetRegistry.find("normalXY.frag", "shader").resource;
                material.chunks.normalXYZPS = normalXY;
            }

            if (tags.has('specocc')) {
                var specOcc = assetRegistry.find("aoSpecOccConstSimpleSeemore.frag", "shader").resource;
                material.chunks.aoSpecOccConstSimplePS = specOcc;
            }

            if (tags.has([ 'greenhouse', 'foliage' ])) {
                var emissiveFoliage = assetRegistry.find("emissiveFoliage.frag", "shader").resource;
                material.chunks.emissivePS = emissiveFoliage;
            }

            if (tags.has([ 'greenhouse', 'aodual' ])) {
                var aoDual = assetRegistry.find("aoDual.frag", "shader").resource;
                material.chunks.aoPS = aoDual;
            }

            if (tags.has('window')) {
                var addReflection = assetRegistry.find('addReflection.frag', 'shader').resource;
                var origShader = pc.shaderChunks.reflectionEnvHQPS;
                material.chunks.reflectionEnvHQPS = origShader.substring(0, origShader.indexOf('void addReflection(vec3 reflDir, float gloss) {')) + addReflection;
            }

            if (tags.has('ambient2')) {
                material.ambient.set(2, 2, 2);
            }

            if (tags.has('ambient2.5')) {
                material.ambient.set(2.5, 2.5, 2.5);
            }
        }
    });
};