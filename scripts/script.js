var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Vec2 = /** @class */ (function () {
    function Vec2(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    Vec2.prototype.add = function (summand) {
        if (summand instanceof Vec2) {
            this.x += summand.x;
            this.y += summand.y;
        }
        else {
            this.x += summand;
            this.y += summand;
        }
        return this;
    };
    Vec2.prototype.subtract = function (subtrahend) {
        if (subtrahend instanceof Vec2) {
            this.x -= subtrahend.x;
            this.y -= subtrahend.y;
        }
        else {
            this.x -= subtrahend;
            this.y -= subtrahend;
        }
        return this;
    };
    Vec2.prototype.multiply = function (factor) {
        if (factor instanceof Vec2) {
            this.x *= factor.x;
            this.y *= factor.y;
        }
        else {
            this.x *= factor;
            this.y *= factor;
        }
        return this;
    };
    Vec2.prototype.divide = function (divisor) {
        if (divisor instanceof Vec2) {
            this.x /= divisor.x;
            this.y /= divisor.y;
        }
        else {
            this.x /= divisor;
            this.y /= divisor;
        }
        return this;
    };
    Vec2.prototype.clone = function () {
        return new Vec2(this.x, this.y);
    };
    return Vec2;
}());
var PendulumPhysixModel = /** @class */ (function () {
    function PendulumPhysixModel(pendulumObject) {
        this.pendulumObject = pendulumObject;
    }
    PendulumPhysixModel.prototype.applyPhysix = function (dt) {
        this.pendulumObject.rotVel += this.pendulumObject.acceleration.x * Math.cos(this.pendulumObject.rot) * dt * -5;
        this.pendulumObject.rotVel -= Math.sin(this.pendulumObject.rot) * dt * 10;
        this.pendulumObject.rotVel *= 1 - 0.2 * dt;
    };
    return PendulumPhysixModel;
}());
var PhysixObject = /** @class */ (function () {
    function PhysixObject(pos, rot, scale) {
        if (pos === void 0) { pos = new Vec2(); }
        if (rot === void 0) { rot = 0; }
        if (scale === void 0) { scale = new Vec2(1, 1); }
        this.pos = pos;
        this.rot = rot;
        this.vel = new Vec2();
        this.rotVel = 0;
        this.scale = scale;
        this.physicsModels = [];
        this.acceleration = new Vec2();
    }
    PhysixObject.prototype.addPhysixModel = function (physixModel) {
        this.physicsModels.push(physixModel);
    };
    PhysixObject.prototype.removePhysixModel = function (physixModel) {
        var index = this.physicsModels.indexOf(physixModel);
        if (index === 0) {
            return false;
        }
        this.physicsModels.splice(index, 1);
        return true;
    };
    /**
     * @param dt time since last call in seconds
     */
    PhysixObject.prototype.applyPhysix = function (dt) {
        for (var _i = 0, _a = this.physicsModels; _i < _a.length; _i++) {
            var physicsModel = _a[_i];
            physicsModel.applyPhysix(dt);
        }
        this.vel.add(this.acceleration.multiply(dt));
        this.pos.add(this.vel.clone().multiply(dt));
        this.rot += this.rotVel * dt;
    };
    Object.defineProperty(PhysixObject.prototype, "normalizedRot", {
        get: function () {
            return PhysixObject.normalizeAngle(this.rot);
        },
        enumerable: false,
        configurable: true
    });
    PhysixObject.normalizeAngle = function (angle) {
        return Math.atan2(Math.sin(angle), Math.cos(angle));
    };
    return PhysixObject;
}());
var WorldObject = /** @class */ (function (_super) {
    __extends(WorldObject, _super);
    function WorldObject(pos, rot) {
        if (pos === void 0) { pos = new Vec2(); }
        if (rot === void 0) { rot = 0; }
        var _this = _super.call(this, pos, rot) || this;
        // this.origin = new Vec2();
        _this.children = [];
        return _this;
    }
    WorldObject.prototype.render = function (ctx) {
        ctx.translate(this.pos.x, this.pos.y);
        ctx.scale(this.scale.x, this.scale.y);
        ctx.rotate(-this.rot);
        // ctx.translate(-this.origin.x, -this.origin.y);
        this.renderObject(ctx);
        // ctx.translate(this.origin.x, this.origin.y);
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var children = _a[_i];
            children.render(ctx);
        }
        ctx.rotate(this.rot);
        ctx.scale(1 / this.scale.x, 1 / this.scale.y);
        ctx.translate(-this.pos.x, -this.pos.y);
    };
    WorldObject.prototype.add = function (worldObject) {
        this.children.push(worldObject);
    };
    WorldObject.prototype.remove = function (worldObject) {
        var index = this.children.indexOf(worldObject);
        if (index === 0) {
            return false;
        }
        this.children.splice(index, 1);
        return true;
    };
    WorldObject.prototype.update = function (dt) {
        this.applyPhysix(dt);
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            child.update(dt);
        }
    };
    return WorldObject;
}(PhysixObject));
var RectObject = /** @class */ (function (_super) {
    __extends(RectObject, _super);
    function RectObject(pos, rot, width, height) {
        if (pos === void 0) { pos = new Vec2(); }
        if (rot === void 0) { rot = 0; }
        if (width === void 0) { width = 100; }
        if (height === void 0) { height = 100; }
        var _this = _super.call(this, pos, rot) || this;
        _this.width = width;
        _this.height = height;
        _this.color = 'white';
        return _this;
    }
    RectObject.prototype.renderObject = function (ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    };
    return RectObject;
}(WorldObject));
var EllipseObject = /** @class */ (function (_super) {
    __extends(EllipseObject, _super);
    function EllipseObject(pos, rot, radiusX, radiusY) {
        if (pos === void 0) { pos = new Vec2(); }
        if (rot === void 0) { rot = 0; }
        if (radiusX === void 0) { radiusX = 100; }
        if (radiusY === void 0) { radiusY = 100; }
        var _this = _super.call(this, pos, rot) || this;
        _this.radiusX = radiusX;
        _this.radiusY = radiusY;
        _this.color = 'white';
        _this.borderColor = 'gray';
        _this.borderWidth = 2;
        _this.useBorder = true;
        return _this;
    }
    EllipseObject.prototype.renderObject = function (ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, 2 * Math.PI);
        ctx.fill();
        // if(this.useBorder) {
        //     ctx.strokeStyle = this.borderColor;
        //     ctx.lineWidth = this.borderWidth;
        //     ctx.beginPath();
        //     ctx.ellipse(0, 0, this.radiusX - this.borderWidth / 2, this.radiusY - this.borderWidth / 2, 0, 0, 2 * Math.PI);
        //     ctx.stroke();
        // }
    };
    return EllipseObject;
}(WorldObject));
var PendulumObject = /** @class */ (function (_super) {
    __extends(PendulumObject, _super);
    function PendulumObject(pos, width, height) {
        var _this = _super.call(this, pos, 0) || this;
        _this.stick = new RectObject(new Vec2(0, height / 2));
        _this.add(_this.stick);
        _this.ballTop = new EllipseObject();
        _this.add(_this.ballTop);
        _this.railBall = new EllipseObject();
        _this.add(_this.railBall);
        _this.width = width;
        _this.height = height;
        _this.addPhysixModel(new PendulumPhysixModel(_this));
        return _this;
    }
    Object.defineProperty(PendulumObject.prototype, "width", {
        get: function () {
            return this.stick.width;
        },
        set: function (width) {
            this.railBall.radiusX = width * 0.75;
            this.railBall.radiusY = width * 0.75;
            this.ballTop.radiusX = width * 0.75;
            this.ballTop.radiusY = width * 0.75;
            this.stick.width = width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PendulumObject.prototype, "height", {
        get: function () {
            return this.stick.height;
        },
        set: function (height) {
            this.stick.height = height;
            this.stick.pos.y = height / 2;
            this.ballTop.pos.y = height;
        },
        enumerable: false,
        configurable: true
    });
    PendulumObject.prototype.renderObject = function (ctx) {
        // do nothing
    };
    return PendulumObject;
}(WorldObject));
var TextObject = /** @class */ (function (_super) {
    __extends(TextObject, _super);
    function TextObject(pos, text, color) {
        if (pos === void 0) { pos = new Vec2(); }
        if (text === void 0) { text = ''; }
        if (color === void 0) { color = 'white'; }
        var _this = _super.call(this, pos) || this;
        _this.text = text;
        _this.color = color;
        return _this;
    }
    TextObject.prototype.renderObject = function (ctx) {
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 0);
    };
    return TextObject;
}(WorldObject));
var World = /** @class */ (function () {
    function World(canvas) {
        var _this = this;
        this.background = 'black';
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.worldObjects = [];
        this.running = true;
        this.timeMs = 0;
        this.sps = 20;
        this.physixUpdateListeners = [];
        this.pxPerMeter = 500;
        window.requestAnimationFrame(function () { return _this.update(); });
    }
    World.prototype.add = function (object) {
        this.worldObjects.push(object);
    };
    World.prototype.remove = function (object) {
        var index = this.worldObjects.indexOf(object);
        if (index === 0) {
            return false;
        }
        this.worldObjects.splice(index, 1);
        return true;
    };
    World.prototype.addPhysixUpdateListener = function (listener) {
        this.physixUpdateListeners.push(listener);
    };
    World.prototype.update = function () {
        var _this = this;
        this.render();
        this.runPhysix();
        window.requestAnimationFrame(function () { return _this.update(); });
    };
    World.prototype.runPhysix = function () {
        if (!this.running)
            return;
        var nowMs = Date.now();
        var dt = 1 / this.sps;
        if (this.timeMs === 0) {
            this.timeMs = nowMs - 1;
        }
        while (this.timeMs < nowMs) {
            for (var _i = 0, _a = this.worldObjects; _i < _a.length; _i++) {
                var worldObject = _a[_i];
                worldObject.update(dt);
            }
            for (var _b = 0, _c = this.physixUpdateListeners; _b < _c.length; _b++) {
                var physixUpdateListener = _c[_b];
                physixUpdateListener(dt);
            }
            this.timeMs += 1000 / this.sps;
        }
    };
    World.prototype.render = function () {
        this.ctx.save();
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.scale(this.pxPerMeter, this.pxPerMeter);
        for (var _i = 0, _a = this.worldObjects; _i < _a.length; _i++) {
            var worldObject = _a[_i];
            worldObject.render(this.ctx);
        }
        this.ctx.restore();
    };
    return World;
}());
var PIDController = /** @class */ (function () {
    function PIDController(p, i, d, dt, minI, maxI) {
        if (minI === void 0) { minI = -1; }
        if (maxI === void 0) { maxI = 1; }
        this.p = p;
        this.i = i;
        this.d = d;
        this.dt = dt;
        this.minI = minI;
        this.maxI = maxI;
        this.setpoint = 0;
        this.integrator = 0;
        this.lastMeasurement = null;
        this.isAngleController = false;
        // this.lastUpdateMs = null;
    }
    PIDController.prototype.update = function (measurement) {
        // const nowMs = window.performance.now();
        if (this.lastMeasurement === null) {
            this.lastMeasurement = measurement;
        }
        // if(this.lastUpdateMs === null) {
        //     this.lastMeasurement = nowMs;
        // }
        // const dt = (nowMs - this.lastUpdateMs) / 1000;
        var error;
        if (this.isAngleController) {
            error = PIDController.angleFromTo(this.setpoint, measurement);
            console.log(error * (180 / Math.PI), PhysixObject.normalizeAngle(this.setpoint) * (180 / Math.PI), PhysixObject.normalizeAngle(measurement) * (180 / Math.PI));
        }
        else {
            error = measurement - this.setpoint;
        }
        var pTerm = -error * this.p;
        this.integrator += error * this.dt;
        if (this.integrator > this.maxI)
            this.integrator = this.maxI;
        if (this.integrator < this.minI)
            this.integrator = this.minI;
        var iTerm = this.integrator * this.i;
        var dTerm;
        if (this.isAngleController) {
            dTerm = (PIDController.angleFromTo(this.lastMeasurement, measurement) / this.dt) * this.d;
        }
        else {
            dTerm = ((measurement - this.lastMeasurement) / this.dt) * this.d;
        }
        // this.lastUpdateMs = nowMs;
        this.lastMeasurement = measurement;
        return pTerm + iTerm - dTerm;
    };
    PIDController.angleFromTo = function (from, to) {
        // from = PhysixObject.normalizeAngle(from);
        // to = PhysixObject.normalizeAngle(to);
        return Math.atan2(Math.sin(to - from), Math.cos(to - from));
    };
    PIDController.prototype.reset = function () {
        this.setpoint = 0;
        this.integrator = 0;
        this.lastMeasurement = null;
    };
    return PIDController;
}());
var pidRunning = true;
function toggle() {
    pidRunning = !pidRunning;
    if (pidRunning) {
        document.getElementById('startStop').innerText = 'Stop';
    }
    else {
        document.getElementById('startStop').innerText = 'Start';
    }
}
window.onload = function () {
    var canvas = document.getElementById('canvas');
    var world = new World(document.getElementById('canvas'));
    var setPoint = new RectObject(new Vec2(1, 0.5));
    setPoint.height = 10;
    setPoint.width = 0.01;
    setPoint.color = '#222';
    world.add(setPoint);
    var helper = new RectObject(new Vec2(1, 0.5));
    helper.height = 10;
    helper.width = 0.01;
    helper.color = '#225';
    world.add(helper);
    var rail = new RectObject(new Vec2(1, 0.5));
    rail.color = 'gray';
    rail.width = 1.5;
    rail.height = 0.02;
    world.add(rail);
    var pendulum = new PendulumObject(new Vec2(1, 0.5), 0.02, 0.4);
    var angleSetpoint = new RectObject(new Vec2(0, 0.15));
    angleSetpoint.height = 0.3;
    angleSetpoint.width = 0.01;
    angleSetpoint.color = '#252';
    pendulum.add(angleSetpoint);
    var text = new TextObject();
    text.scale = new Vec2(1 / world.pxPerMeter, 1 / world.pxPerMeter);
    pendulum.add(text);
    world.add(pendulum);
    pendulum.rot = Math.PI * 3 + 0.01;
    var dt = 1 / 20;
    var levelPID = new PIDController(40, 0, 5, dt);
    levelPID.isAngleController = true;
    var posPID = new PIDController(4, 0, 38, dt);
    world.addPhysixUpdateListener(function (dt) {
        // console.log(pendulum.normalizedRot);
        var pos = pendulum.pos.x + Math.sin(pendulum.rot) * pendulum.height;
        helper.pos.x = pos;
        if (!pidRunning) {
            levelPID.reset();
            posPID.reset();
            return;
        }
        // const maxAngle = Math.PI / 4;
        // if((pendulum.normalizedRot > -Math.PI + maxAngle) && pendulum.normalizedRot < Math.PI - maxAngle) return;
        posPID.setpoint = setPoint.pos.x;
        // let posPidOut = posPID.update(pos); // angle
        // posPidOut = Math.atan(posPidOut);
        // angleSetpoint.rot = posPidOut;
        // console.log(posPidOut);
        // const maxCommandedAngle = Math.PI * 0.25;
        // if(posPidOut < -maxCommandedAngle) posPidOut = -maxCommandedAngle;
        // if(posPidOut > maxCommandedAngle) posPidOut = maxCommandedAngle;
        levelPID.setpoint = setPoint.pos.x - 1 + Math.PI;
        // console.log(PIDController.angleFromTo(pendulum.rot, Math.PI));
        // return;
        // levelPID.setpoint = posPidOut;
        // console.log(pendulum.rot);
        var levelPIDOut = levelPID.update(pendulum.rot) * (Math.abs(Math.tan(pendulum.rot)) + 1);
        // const maxAcceleration = 9.81; // 1G
        var maxAcceleration = 20; // 1G
        if (levelPIDOut > maxAcceleration) {
            levelPIDOut = maxAcceleration;
        }
        else if (levelPIDOut < -maxAcceleration) {
            levelPIDOut = maxAcceleration;
        }
        pendulum.acceleration.x = levelPIDOut;
        // speedPID.setpoint = setPoint.pos.x - 1;
        // pendulum.acceleration.x = speedPID.update(pendulum.vel.x);
        // text.text = Math.round(pendulum.vel.x * 100) / 100 + 'm/s';
    });
    document.addEventListener('keydown', function (e) {
        if (e.key == 'ArrowLeft') {
            pendulum.rotVel += 0.5;
        }
        if (e.key == 'ArrowRight') {
            pendulum.rotVel -= 0.5;
        }
    });
    var mouseDown = false;
    canvas.addEventListener('mousedown', function (e) {
        mouseDown = true;
        setPoint.pos.x = e.offsetX / world.pxPerMeter;
    });
    canvas.addEventListener('mouseup', function (e) {
        mouseDown = false;
    });
    canvas.addEventListener('mousemove', function (e) {
        if (mouseDown) {
            setPoint.pos.x = e.offsetX / world.pxPerMeter;
        }
    });
};
//# sourceMappingURL=script.js.map