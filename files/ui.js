var Ui = pc.createScript('ui');

Ui.attributes.add('html', { type: 'asset', assetType: 'html' });
Ui.attributes.add('css', { type: 'asset', assetType: 'css' });

// initialize code called once per entity
Ui.prototype.initialize = function() {
    this.fixedHtml = "";
    this.fixedCss = "";

    this.fixUp();
    this.createCss();
    this.createHtml();
    this.initUi();

    this.lastFrameStartTime = 0;
    this.FPS = 0;
    this.fpsTimeToCount = 0;
    this.fpsAccum = 0;
    this.fpsTicks = 0;
};

Ui.prototype.fixUp = function () {
    this.fixedHtml = this.html.resource;
    this.fixedCss = this.css.resource;

    // Substitute asset names for full URLs for UI images
    var assetRegistry = this.app.assets;
    assetRegistry.findByTag('ui').forEach(function (asset) {
        var regExp = new RegExp(asset.name, "gi");
        var url = asset.getFileUrl();
        this.fixedHtml = this.fixedHtml.replace(regExp, url);
        this.fixedCss = this.fixedCss.replace(regExp, url);
    }.bind(this));

    // Remove whitespace from HTML asset text
    this.fixedHtml = this.fixedHtml.replace(/>\s+</g, "><");
};

Ui.prototype.createCss = function () {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = this.fixedCss;
    
    // Update the CSS every time it's saved in the code editor
    this.css.on('load', function() {
        console.log("LOAD EVENT ON ASSET")
        this.fixUp();
        style.innerHTML = this.fixedCss;
    }, this);

    document.getElementsByTagName('head')[0].appendChild(style);
};

Ui.prototype.createHtml = function () {
    var div = document.createElement('div');
    div.innerHTML = this.fixedHtml;

    // Update the HTML every time it's saved in the code editor
    this.html.on('load', function() {
        console.log("LOAD EVENT ON ASSET CREATEHTML")
        this.fixUp();
        div.innerHTML = this.fixedHtml;
        this.initUi();
    }, this);

    document.body.appendChild(div);
};

Ui.prototype.showPopup = function (url) {
    var width = 640;
    var height = 380;
    var left = (screen.width / 2) - (width / 2);
    var top = (screen.height / 2) - (height / 2);

    var popup = window.open(url, 'name', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + width + ', height=' + height +', top=' + top + ', left=' + left);
    if (window.focus && popup) {
        popup.focus();
    }
};

Ui.prototype.initUi = function () {
    var app = this.app;

    var el;
    var optionRenderMode = document.getElementById('render-mode');
    var optionGammaCorrection = document.getElementById('gamma-correction');
    var optionToneMapping = document.getElementById('tone-mapping');
    var optionSpecularAa = document.getElementById('specular-aa');

    // Don't propagate mouse down or touch events through the UI to the canvas
    [
        'info', 'info-button', 'options', 'options-button', 'stats', 'stats-button', 'share', 'share-button', 'camera-button', 'fullscreen-button'
    ].forEach(function (id) {
        el = document.getElementById(id);
        el.addEventListener('mousedown', function (e) {
            e.stopPropagation();
        });
        el.addEventListener('touchstart', function (e) {
            e.stopPropagation();
        });
    });
    
    // TOP LEFT BUTTONS
    [
        'info', 'options', 'stats', 'share'
    ].forEach(function (id) {
        el = document.getElementById(id + '-button');
        el.addEventListener('click', function (e) {
            document.getElementById(id + '-button').classList.toggle('checked');
            document.getElementById(id).classList.toggle('hidden');
        });
    });

    // OPTIONS
    optionRenderMode.addEventListener('click', function (e) {
        el  = document.getElementById('dropdown');
        el.classList.toggle('hidden');
    });
    ['final-image', 'albedo', 'diffuse', 'reflection', 'specularity'].forEach(function (id, idx) {
        el = document.getElementById(id);
        el.addEventListener('click', function (e) {
            optionRenderMode.childNodes[0].nodeValue = 'Render Mode: ' + e.target.innerText;

            var assetRegistry = app.assets;
            var chunk;
            if (idx > 0) {
                var chunkName = 'end' + id.charAt(0).toUpperCase() + id.slice(1) + '.frag';
                chunk = assetRegistry.find(chunkName, "shader").resource;
            }
            assetRegistry.findByTag('material').forEach(function (asset) {
                var material = asset.resource;
                material.chunks.endPS = chunk;
                material.update();
            });
        });
    });
    optionGammaCorrection.addEventListener('click', function (e) {
        optionGammaCorrection.classList.toggle('checked');
        app.scene.gammaCorrection = optionGammaCorrection.classList.contains('checked') ? pc.GAMMA_SRGB : pc.GAMMA_NONE;
    });
    optionToneMapping.addEventListener('click', function (e) {
        optionToneMapping.classList.toggle('checked');
        app.scene.toneMapping = optionToneMapping.classList.contains('checked') ? pc.TONEMAP_FILMIC : pc.TONEMAP_LINEAR;
    });
    optionSpecularAa.addEventListener('click', function (e) {
        optionSpecularAa.classList.toggle('checked');
        var enabled = optionSpecularAa.classList.contains('checked');
        var assetRegistry = app.assets;
        assetRegistry.findByTag('specularaa').forEach(function (asset) {
            var material = asset.resource;
            material.specularAntialias = enabled;
            material.update();
        });
    });

    // SHARE BUTTONS
    el = document.getElementById('twitter-button');
    el.addEventListener('click', function (e) {
        var text = 'Check out #Seemore, a @playcanvas powered demo optimized for @ARMMobile devices. #HTML5 #WebGL';
        var url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(window.location);
        this.showPopup(url);
    }.bind(this));

    el = document.getElementById('facebook-button');
    el.addEventListener('click', function (e) {
        var url = 'https://facebook.com/sharer.php?u=' + encodeURIComponent(window.location);
        this.showPopup(url);
    }.bind(this));

    // TOP RIGHT BUTTONS
    el = document.getElementById('camera-button');
    el.addEventListener('click', function (e) {
        e.stopPropagation();

        // Only allow the user to control the camera when the first room is loaded
        // or they'll fall through the world!
        if (app.root.findByName('Gamesroom').enabled) {
            el = document.getElementById('camera-button');
            el.classList.toggle('checked');

            var cameraTrack = app.root.findByName('Camera Track');
            var characterController = app.root.findByName('Character Controller');

            cameraTrack.enabled = !cameraTrack.enabled;
            characterController.enabled = !characterController.enabled;
        }
    });

    el = document.getElementById('fullscreen-button');
    if (document.documentElement.requestFullscreen) {
        el.addEventListener('click', function (e) {
            if (!el.classList.contains('checked')) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
            el.classList.toggle('checked');
        });
    } else {
        el.classList.add('hidden');
    }
};

// update code called every frame
Ui.prototype.update = function(dt) {
    var el = document.getElementById('stats');
    if (!el.classList.contains('hidden')) {
        var frameTime = Date.now() - this.lastFrameStartTime;
        this.fpsAccum += 1000 / frameTime;
        this.fpsTicks++;
        if (Date.now() > this.fpsTimeToCount) {
            this.FPS = this.fpsAccum / this.fpsTicks;
            this.fpsAccum = this.fpsTicks = 0;
            this.fpsTimeToCount = Date.now() + 1000;
        }
        this.lastFrameStartTime = Date.now();

        el = document.getElementById('fps');
        el.innerHTML = 'FPS: ' + Math.round(this.FPS);

        // To calculate the number of draw calls without a profile engine, we need
        // to access some non-API engine internals. Naughty!
        var worldLayer = this.app.scene.layers.getLayerById(pc.LAYERID_WORLD);
        var visibleOpaque = worldLayer.instances.visibleOpaque;
        var visibleTransparent = worldLayer.instances.visibleTransparent;
        var numOpaque = visibleOpaque.length > 0 ? visibleOpaque[0].list.length : 0;
        var numTransparent = visibleTransparent > 0 ? visibleTransparent[0].list.length : 0;
        var numDrawCalls = numOpaque + numTransparent;
        
        el = document.getElementById('draw-calls');
        el.innerHTML = 'Draw Calls: ' + numDrawCalls;

        var numShadowDrawCalls = worldLayer.instances.shadowCasters.length;

        el = document.getElementById('shadow-draw-calls');
        el.innerHTML = 'Shadow Draw Calls: ' + numShadowDrawCalls;

        var vram = 0;
        var assetRegistry = this.app.assets;
        assetRegistry.findByTag('vram').forEach(function (asset) {
            if (asset.loaded) {
                vram += asset.resource.gpuSize;
            }
        });
        
        el = document.getElementById('texture-vram');
        el.innerHTML = 'Texture VRAM: ' + Math.round(vram / (1024 * 1014)) + 'MB';
    }
};
