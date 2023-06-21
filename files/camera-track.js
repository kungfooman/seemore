var CameraTrack = pc.createScript('cameraTrack');

// initialize code called once per entity
CameraTrack.prototype.initialize = function() {
    var animNode = this.entity.findByName('cam_demo_mode_02');
    var camera = this.entity.findByName('Camera');
    camera.reparent(animNode);
};

// update code called every frame
CameraTrack.prototype.update = function(dt) {
    var camera = this.entity.findByName('Camera');
    var pos = camera.getPosition();
    this.app.fire('cameramove', pos);
};
