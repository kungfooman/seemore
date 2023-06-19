var Plant = pc.createScript('plant');

Plant.attributes.add('tentacleMat', { type: 'asset', assetType: 'material' });
Plant.attributes.add('bodyMat', { type: 'asset', assetType: 'material' });
Plant.attributes.add('foliageMat', { type: 'asset', assetType: 'material' });
Plant.attributes.add('transformTentacle', { type: 'asset', assetType: 'shader' });
Plant.attributes.add('transformPlant', { type: 'asset', assetType: 'shader' });
Plant.attributes.add('normalTentacle', { type: 'asset', assetType: 'shader' });
Plant.attributes.add('tangentBinormalTentacle', { type: 'asset', assetType: 'shader' });

// initialize code called once per entity
Plant.prototype.initialize = function () {
    this.tentacles = [];
    this.neck = null;
    this.neckMesh = null;
    this.Tcontrol = [];
    this.Tincrement = [];
    this.Ttarget = [];
    this.TtargetRefreshTime = [];
    this.totalTime = 0;
    this.deformN = new Float32Array(4);
    this.deformT = new Float32Array(4);
    this.neckLength = 0;
    this.tongueLength = 0;
    this.headNode = null;
    this.ljNode = null;
    this.ujNode = null;
    this.ljRot = new pc.Quat();
    this.ujRot = new pc.Quat();
    this.opened = false;
    this.open = 0;
    this.tongue = null;
    this.tongueShift = 0;
    this.tongueDir = 0.1;
    
    var material;

    material = this.bodyMat.resource;
    material.ambient.set(2.5, 2.5, 2.5);
    
    material = this.tentacleMat.resource;
    material.ambient.set(2.5, 2.5, 2.5);
    material.chunks.transformVS = this.transformTentacle.resource;
    material.chunks.normalVS = this.normalTentacle.resource;
    material.chunks.tangentBinormalVS = this.tangentBinormalTentacle.resource;

    material.center = new pc.Vec3();

    this.tentacles.push(material);
    var vec = new Float32Array(4);
    vec[3] = Math.random() * 3;
    this.Tcontrol.push(vec);
    this.Tincrement.push(0);
    this.Ttarget.push(0);
    this.TtargetRefreshTime.push(0);

    var meshInstances = this.entity.model.meshInstances;
    for (var i = 0; i < meshInstances.length; i++) {
        var meshInstance = meshInstances[i];

        switch (meshInstance.node.name) {
            case 'obj_plant_neck':
            case 'obj_plant_tongue':
                material = meshInstance.material;
                material.chunks.transformVS = this.transformPlant.resource;
                material.chunks.normalVS = this.normalTentacle.resource;
                material.chunks.tangentBinormalVS = this.tangentBinormalTentacle.resource;

                if (meshInstance.node.name === 'obj_plant_neck') {
                    this.neck = meshInstance;
                    this.neckLength = meshInstance.aabb.halfExtents.y * 2 * 10;
                } else {
                    this.tongue = meshInstance;
                    this.tongueLength = meshInstance.aabb.halfExtents.y * 2 * 10;
                }
                break;
            case 'obj_plant_botjaw':
                this.ljNode = meshInstance.node;
                break;
            case 'obj_plant_topjaw':
                this.ujNode = meshInstance.node;
                break;
            case 'obj_plant_head':
                this.headNode = meshInstance.node;
                break;
        }

        material = meshInstance.material;
        material.chunks.uv0VS = this.app.assets.find("uv0FoliageCentered.vert", "shader").resource;        
        material.chunks.emissivePS = this.app.assets.find("emissiveFoliageCentered.frag", "shader").resource;
    }

    this.constantAOLerp = this.app.graphicsDevice.scope.resolve("aoLerp");
};

Plant.prototype.plantVS = function (localPos) {
    localPos.y += 1.8;
    localPos.z += -0.5;

    var topx = pc.Vec3.RIGHT.clone();
    var topy = pc.Vec3.UP.clone();
    var topz = pc.Vec3.FORWARD.clone();
    var position = pc.Vec3.ZERO.clone();

    var hAng = this.deformN[3] * localPos.y;
    var c1 = Math.min(Math.max(localPos.y, 0.0), this.deformN[2]);
    var c2 = Math.max(localPos.y - this.deformN[2], 0.0);

    var crossect = localPos.clone();
    crossect.y = 0;

    var cAngle, icurl, gradient, foreshorten;

    if (Math.abs(this.deformN[0]) > 0 && c1 > 0) {
        icurl=1.0 / this.deformN[0];

        cAngle=(c1 * 3.14159 / 2.0) / icurl;

        gradient = Math.sin(cAngle);
        foreshorten = Math.cos(cAngle);
        topy.y = foreshorten;
        topy.z = -gradient;

        topz.y = gradient;
        topz.z = foreshorten;

        localPos.y = Math.sin(cAngle) / (3.14159 * 0.5) * icurl;
        localPos.z = (Math.cos(cAngle) - 1.0) * icurl;

        localPos.x = 0.0;
    } else {
        localPos.y = c1;
        localPos.z = 0.0;
        localPos.x = 0.0;
    }

    if (Math.abs(this.deformN[1])>0.0 && c2>0.0){
        icurl=1.0 / this.deformN[1];

        cAngle = (c2 * 3.14159 * 0.5) / icurl;

        gradient = Math.sin(cAngle);
        foreshorten = Math.cos(cAngle);
        var tempy = topy.clone().scale(foreshorten).sub(topz.clone().scale(gradient));
        var tempz = topy.clone().scale(gradient).add(topz.clone().scale(foreshorten));

        localPos.add( topy.clone().scale(Math.sin(cAngle) / (3.14159 * 0.5) * icurl) );
        localPos.add( topz.clone().scale((Math.cos(cAngle) - 1.0) * icurl) );
        topz = tempz;
        topy = tempy;
    }else{
        localPos.add(topy.clone().scale(c2));
    }

    localPos.add(topx.clone().scale(crossect.x));
    localPos.add(topz.clone().scale(crossect.z));
    crossect = localPos.clone();
    var ca = Math.cos(hAng);
    var sa = Math.sin(hAng);
    localPos.x = ca * crossect.x + sa * crossect.z;
    localPos.z = -sa * crossect.x + ca * crossect.z;

    localPos.x *= -1;
    localPos.z *= -1;

    topy.x *= -1;
    topy.z *= -1;

    topz.x *= -1;
    topz.z *= -1;

    return {
        pos: localPos,
        up: topy,
        forward: topz
    };
};

// update code called every frame
Plant.prototype.update = function (dt) {
    var i;
    for (i = 0; i < this.tentacles.length; i++) {
        var p = Math.sin(this.Tcontrol[i][3]) * 0.35;
        p *= 0.05;
        this.Tcontrol[i][0] = pc.math.lerp(0, this.tentacles[i].center.x, p);
        this.Tcontrol[i][1] = pc.math.lerp(0, this.tentacles[i].center.z, p);
        this.Tcontrol[i][2] += dt * 0.5;

        if (Date.now() > this.TtargetRefreshTime[i]) {
            this.Ttarget[i] = Math.random();
            this.Ttarget[i] *= this.Ttarget[i] * this.Ttarget[i] * this.Ttarget[i] * this.Ttarget[i] * 5;
            this.TtargetRefreshTime[i] = Date.now() + Math.random() * 2;
        }
        this.Tincrement[i] = pc.math.lerp(this.Tincrement[i], this.Ttarget[i], dt);
        this.Tcontrol[i][3] += this.Tincrement[i] * dt;
        this.tentacles[i].setParameter('uTentacleControl', this.Tcontrol[i]);
    }
    this.totalTime += dt;

    if (this.tentacles.length === 0) return;

    var offangle = Math.cos(this.totalTime) + 1;
    var headang = Math.PI * 0.5 * Math.sin(this.totalTime * 0.116);

    this.deformN[0] = -0.030;
    this.deformN[1] = 0.040;
    this.deformN[2] = (0.3 + offangle * 0.025) * this.neckLength;
    this.deformN[3] = headang / this.neckLength;
    this.neck.setParameter('Tcontrol', this.deformN);

    var posEnd = this.plantVS(new pc.Vec3(0, this.neckLength, 0)).pos;
    var posStart = this.plantVS(new pc.Vec3(0, this.neckLength - 5, 0)).pos;
    var posUp = this.plantVS(new pc.Vec3(0, this.neckLength, -5)).pos;
    var lookPoint = (posEnd.clone().sub(posStart)).add(posStart);
    var up = (posEnd.clone().sub(posUp)).normalize();
    this.headNode.setLocalPosition(posStart);

    this.headNode.lookAt(lookPoint, up);

    var angle = Math.sin(this.totalTime) + 1;

    if (angle > 1) this.opened = true;
    if (angle < 0.01 && this.opened) {
        this.opened = false;
        this.open = ((Math.random())>0.3)?(((Math.random())>0.5)?(0.35):(0.08)):(0.03);
    }
    var mouth = angle * this.open;

    var le = this.ljNode.getLocalEulerAngles();
    le.x = mouth * 60 + 30;
    this.ljNode.setLocalEulerAngles(le);

    le = this.ujNode.getLocalEulerAngles();
    le.x = mouth * -60 + 30;
    this.ujNode.setLocalEulerAngles(le);

    this.constantAOLerp.setValue(mouth);

    this.tongueShift += dt * 2;
    if (this.tongueShift >= 1){
        this.tongueDir = -this.tongueDir;
        this.tongueShift -= 1;
    }

    var mTongueC1 = this.tongueDir * this.tongueShift - this.tongueDir * 0.5;
    var mTongueC2 = -this.tongueDir * (this.tongueShift + 0.5);

    this.deformT[0] = mTongueC1 * 0.6 * mouth;
    this.deformT[1] = mTongueC2 * 0.6 * mouth;
    this.deformT[2] = this.tongueShift * this.tongueLength;
    this.deformT[3] = 0;
    this.tongue.setParameter('Tcontrol', this.deformT);
};
