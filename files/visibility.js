var Visibility = pc.createScript('visibility');

Visibility.attributes.add('cullDistance', { type: 'number', default: 10 });

// initialize code called once per entity
Visibility.prototype.initialize = function() {
    var room = this.entity.findByName('Room');

    var meshInstances = room.model.meshInstances;
    this.aabb = meshInstances[0].aabb.clone();
    for (var i = 1; i < meshInstances.length; i++) {
        this.aabb.add(meshInstances[i].aabb);
    }
    
    var camToCenter = new pc.Vec3();
    this.listen(this.app, 'cameramove', function (cameraPos) {
        camToCenter.sub2(cameraPos, this.aabb.center);
        var dist = camToCenter.length();
        if (dist < this.cullDistance && !room.model.enabled) {
            room.model.enabled = true;
        } else if (dist >= this.cullDistance && room.model.enabled) {
            room.model.enabled = false;
        }
    }, this);
};
