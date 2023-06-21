var VirtualJoystick = pc.createScript('virtualJoystick');

VirtualJoystick.attributes.add('stick', { type: 'entity' });
VirtualJoystick.attributes.add('enableEvent', { type: 'string' });
VirtualJoystick.attributes.add('moveEvent', { type: 'string' });
VirtualJoystick.attributes.add('disableEvent', { type: 'string' });

// initialize code called once per entity
VirtualJoystick.prototype.initialize = function() {
    var app = this.app;

    this.listen(app, this.enableEvent, function (x, y) {
        this.entity.setLocalPosition(x, -y, 0);
        this.stick.setLocalPosition(x, -y, 0);

        this.entity.element.enabled = true;
        this.stick.element.enabled = true;
    }, this);
    this.listen(app, this.moveEvent, function (x, y) {
        this.stick.setLocalPosition(x, -y, 0);
    }, this);
    this.listen(app, this.disableEvent, function () {
        this.entity.element.enabled = false;
        this.stick.element.enabled = false;
    }, this);
};
