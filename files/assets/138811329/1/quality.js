var Quality = pc.createScript('quality');

// initialize code called once per entity
Quality.prototype.initialize = function() {
    var lowQualityGpu = false;

    if (pc.platform.android) {
        var renderer = this.app.graphicsDevice.unmaskedRenderer;
        if (renderer) {
            // Low level GPUs
            if (renderer.search(/Adreno\D*3/) !== -1 ||
                renderer.search(/Adreno\D*4/) !== -1 ||
                renderer.search(/Adreno\D*505/) !== -1 ||
                renderer.search(/Adreno\D*506/) !== -1 ||
                renderer.search(/Mali\D*4/) !== -1 ||
                renderer.search(/Mali\D*5/) !== -1 ||
                renderer.search(/Mali\D*6/) !== -1 ||
                renderer.search(/Mali\D*T7/) !== -1 ||
                renderer.search(/Mali\D*T82/) !== -1 ||
                renderer.search(/Mali\D*T83/) !== -1) {
                lowQualityGpu = true;
            }
        }
    }

    this.app.graphicsDevice.maxPixelRatio = lowQualityGpu ? 1 : window.devicePixelRatio;
};
