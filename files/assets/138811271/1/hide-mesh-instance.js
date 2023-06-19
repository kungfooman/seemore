var HideMeshInstance = pc.createScript('hideMeshInstance');

HideMeshInstance.attributes.add('nodeName', { type: 'string' });

// initialize code called once per entity
HideMeshInstance.prototype.initialize = function() {
    this.entity.model.meshInstances.forEach(function (meshInstance) {
        if (meshInstance.node.name === this.nodeName) {
            meshInstance.visible = false;
        }
    }.bind(this));
};
