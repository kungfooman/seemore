var VirtualJoystick = pc.createScript('virtualJoystick');

VirtualJoystick.attributes.add('stick', { type: 'entity' });
VirtualJoystick.attributes.add('enableEvent', { type: 'string' });
VirtualJoystick.attributes.add('moveEvent', { type: 'string' });
VirtualJoystick.attributes.add('disableEvent', { type: 'string' });

// initialize code called once per entity
VirtualJoystick.prototype.initialize = function() {
    var app = this.app;

    app.on(this.enableEvent, function (x, y) {
        this.entity.setLocalPosition(x, -y, 0);
        this.stick.setLocalPosition(x, -y, 0);

        this.entity.element.enabled = true;
        this.stick.element.enabled = true;
    }, this);
    app.on(this.moveEvent, function (x, y) {
        this.stick.setLocalPosition(x, -y, 0);
    }, this);
    app.on(this.disableEvent, function () {
        this.entity.element.enabled = false;
        this.stick.element.enabled = false;
    }, this);
};
