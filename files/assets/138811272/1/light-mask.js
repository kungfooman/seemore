var LightMask = pc.createScript('lightMask');

LightMask.attributes.add('mask', { type: 'number', default: 0 });

// initialize code called once per entity
LightMask.prototype.initialize = function() {
    if (!this.entity.light) return;

    this.entity.light.enabled = true;
    this.entity.light.mask = this.mask;

    this.on('attr:mask', function (value, prev) {
        this.entity.light.mask = value;
    });
};
