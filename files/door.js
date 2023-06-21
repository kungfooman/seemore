var Door = pc.createScript('door');

// initialize code called once per entity
Door.prototype.initialize = function() {
    // Only collide with:
    // - camera bodies (camera track is kinematic and first person is dynamic)
    // - boxes
    // - chess pieces
    this.entity.rigidbody.mask = pc.BODYMASK_NOT_STATIC;

    this.closed = true;
    this.rightOrig = this.entity.right.clone();
};

Door.prototype.postInitialize = function() {
    var doorPos = this.entity.getPosition().clone();
    var cameraToDoor = new pc.Vec3();

    var hingeConstraint = this.entity.script.hingeConstraint;
    this.limits = hingeConstraint.limits.clone();

    this.listen(this.app, 'cameramove', function (cameraPos) {
        cameraToDoor.sub2(cameraPos, doorPos);
        if (cameraToDoor.length() > 5) {
            var limits = hingeConstraint.limits;
            var closedAngle = (limits.x + limits.y) * 0.5;
            hingeConstraint.limits = new pc.Vec2(closedAngle, closedAngle);
        } else {
            hingeConstraint.limits = this.limits;
        }
    }, this);
};

Door.prototype.lock = function () {
    this.entity.rigidbody.angularFactor = pc.Vec3.ZERO;
    this.entity.rigidbody.linearFactor = pc.Vec3.ZERO;
};

Door.prototype.unlock = function () {
    this.entity.rigidbody.angularFactor = pc.Vec3.ONE;
    this.entity.rigidbody.linearFactor = pc.Vec3.ONE;
};

// update code called every frame
Door.prototype.update = function(dt) {
    this.closed = this.entity.right.dot(this.rightOrig) < 0.999;    
};

// swap method called for script hot-reloading
// inherit your script state here
// Door.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/