var MeshInstanceMask = pc.createScript('meshInstanceMask');

MeshInstanceMask.attributes.add('mask', { type: 'number', default: 0 });

// initialize code called once per entity
MeshInstanceMask.prototype.initialize = function() {
    if (!this.entity.model) return;

    var mask = this.mask;
    this.entity.model.meshInstances.forEach(function (meshInstance) {
        meshInstance.mask = mask;
    });

    this.on('attr:mask', function (value, prev) {
        this.entity.model.meshInstances.forEach(function (meshInstance) {
            meshInstance.mask = value;
        });
    });
};
