class Vec2 {

    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public add(summand: Vec2 | number): Vec2 {
        if(summand instanceof Vec2) {
            this.x += summand.x;
            this.y += summand.y;
        } else {
            this.x += summand;
            this.y += summand;
        }
        return this;
    }

    public subtract(subtrahend: Vec2 | number): Vec2 {
        if(subtrahend instanceof Vec2) {
            this.x -= subtrahend.x;
            this.y -= subtrahend.y;
        } else {
            this.x -= subtrahend;
            this.y -= subtrahend;
        }
        return this;
    }

    public multiply(factor: Vec2 | number): Vec2 {
        if(factor instanceof Vec2) {
            this.x *= factor.x;
            this.y *= factor.y;
        } else {
            this.x *= factor;
            this.y *= factor;
        }
        return this;
    }

    public divide(divisor: Vec2): Vec2 {
        if(divisor instanceof Vec2) {
            this.x /= divisor.x;
            this.y /= divisor.y;
        } else {
            this.x /= divisor;
            this.y /= divisor;
        }
        return this;
    }

    public clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }
}

interface PhysixModel {
    applyPhysix(dt: number): void;
}

class PendulumPhysixModel implements PhysixModel {

    private pendulumObject: PendulumObject;

    constructor(pendulumObject: PendulumObject) {
        this.pendulumObject = pendulumObject;
    }

    applyPhysix(dt: number): void {
        this.pendulumObject.rotVel += this.pendulumObject.acceleration.x * Math.cos(this.pendulumObject.rot) * dt * -5;
        this.pendulumObject.rotVel -= Math.sin(this.pendulumObject.rot) * dt * 10;
        this.pendulumObject.rotVel *= 1 - 0.2 * dt;
    }
}

class PhysixObject {

    public pos: Vec2;
    public rot: number;
    public vel: Vec2;
    public rotVel: number; // rad/s
    public scale: Vec2;
    public acceleration: Vec2;

    private physicsModels: PhysixModel[];

    constructor(pos: Vec2 = new Vec2(), rot: number = 0, scale: Vec2 = new Vec2(1,1)) {
        this.pos = pos;
        this.rot = rot;
        this.vel = new Vec2();
        this.rotVel = 0;
        this.scale = scale;
        this.physicsModels = [];
        this.acceleration = new Vec2();
    }

    public addPhysixModel(physixModel: PhysixModel) {
        this.physicsModels.push(physixModel);
    }

    public removePhysixModel(physixModel: PhysixModel): boolean {
        const index = this.physicsModels.indexOf(physixModel);
        if(index === 0) {
            return false;
        }
        this.physicsModels.splice(index, 1);
        return true;
    }

    /**
     * @param dt time since last call in seconds
     */
    public applyPhysix(dt: number): void {
        for (const physicsModel of this.physicsModels) {
            physicsModel.applyPhysix(dt);
        }
        this.vel.add(this.acceleration.multiply(dt));
        this.pos.add(this.vel.clone().multiply(dt));
        this.rot += this.rotVel * dt;
    }

    get normalizedRot(): number {
        return PhysixObject.normalizeAngle(this.rot);
    }

    static normalizeAngle(angle: number): number {
        return Math.atan2(Math.sin(angle), Math.cos(angle));
    }
}

abstract class WorldObject extends PhysixObject {
    
    // public origin: Vec2;
    private children: WorldObject[];
    
    constructor(pos: Vec2 = new Vec2(), rot: number = 0) {
        super(pos, rot)
        // this.origin = new Vec2();
        this.children = [];
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.translate(this.pos.x, this.pos.y);
        ctx.scale(this.scale.x, this.scale.y);
        ctx.rotate(-this.rot);
        // ctx.translate(-this.origin.x, -this.origin.y);
        this.renderObject(ctx);
        // ctx.translate(this.origin.x, this.origin.y);
        for (const children of this.children) {
            children.render(ctx);
        }
        ctx.rotate(this.rot);
        ctx.scale(1 / this.scale.x, 1 / this.scale.y);
        ctx.translate(-this.pos.x, -this.pos.y);
    }

    public add(worldObject: WorldObject): void {
        this.children.push(worldObject);
    }

    public remove(worldObject: WorldObject): boolean {
        const index = this.children.indexOf(worldObject);
        if(index === 0) {
            return false;
        }
        this.children.splice(index, 1);
        return true;
    }

    public update(dt: number): void {
        this.applyPhysix(dt);
        for (const child of this.children) {
            child.update(dt);
        }
    }

    /**
     * Renders this Object at position 0, 0
     */
    protected abstract renderObject(ctx: CanvasRenderingContext2D): void;
}

class RectObject extends WorldObject {

    public width: number;
    public height: number;
    public color: string;

    constructor(pos: Vec2 = new Vec2(), rot: number = 0, width: number = 100, height: number = 100) {
        super(pos, rot);
        this.width = width;
        this.height = height;
        this.color = 'white';
    }

    protected renderObject(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
}

class EllipseObject extends WorldObject {

    public radiusX: number;
    public radiusY: number;
    public color: string;
    public useBorder: boolean;
    public borderWidth: number;
    public borderColor: string;

    constructor(pos: Vec2 = new Vec2(), rot: number = 0, radiusX: number = 100, radiusY: number = 100) {
        super(pos, rot);
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.color = 'white';
        this.borderColor = 'gray';
        this.borderWidth = 2;
        this.useBorder = true;
    }

    protected renderObject(ctx: CanvasRenderingContext2D): void {
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
    }
}

class PendulumObject extends WorldObject {

    private railBall: EllipseObject;
    private stick: RectObject;
    private ballTop: EllipseObject;

    constructor(pos: Vec2, width: number, height: number) {
        super(pos, 0);
        
        this.stick = new RectObject(new Vec2(0, height / 2));
        this.add(this.stick);
        
        this.ballTop = new EllipseObject();
        this.add(this.ballTop);
        
        this.railBall = new EllipseObject();
        this.add(this.railBall);

        this.width = width;
        this.height = height;

        this.addPhysixModel(new PendulumPhysixModel(this));
    }

    set width(width: number) {
        this.railBall.radiusX = width * 0.75;
        this.railBall.radiusY = width * 0.75;
        this.ballTop.radiusX = width * 0.75;
        this.ballTop.radiusY = width * 0.75;
        this.stick.width = width;
    }

    set height(height: number) {
        this.stick.height = height;
        this.stick.pos.y = height / 2;
        this.ballTop.pos.y = height;
    }

    get height(): number {
        return this.stick.height;
    }

    get width(): number {
        return this.stick.width;
    }

    protected renderObject(ctx: CanvasRenderingContext2D): void {
        // do nothing
    }
}

class TextObject extends WorldObject {
    public text: string;
    public color: string;

    constructor(pos: Vec2 = new Vec2(), text: string = '', color: string = 'white') {
        super(pos);
        this.text = text;
        this.color = color;
    }

    protected renderObject(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 0);
    }
}

class World {
    public background: string;

    private worldObjects: WorldObject[];
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    
    private running: boolean;
    private timeMs: number;
    private sps: number; // steps per second
    private physixUpdateListeners: ((dt: number)=>void)[];

    public pxPerMeter: number;

    constructor(canvas: HTMLCanvasElement) {
        this.background = 'black';
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.worldObjects = [];

        this.running = true;
        this.timeMs = 0;
        this.sps = 20;
        
        this.physixUpdateListeners = [];

        this.pxPerMeter = 500;

        window.requestAnimationFrame(() => this.update());
    }

    public add(object: WorldObject): void {
        this.worldObjects.push(object);
    }

    public remove(object: WorldObject): boolean {
        const index = this.worldObjects.indexOf(object);
        if(index === 0) {
            return false;
        }
        this.worldObjects.splice(index, 1);
        return true;
    }

    public addPhysixUpdateListener(listener: (dt: number)=>void): void {
        this.physixUpdateListeners.push(listener);
    }

    private update(): void {
        this.render();
        this.runPhysix();
        window.requestAnimationFrame(() => this.update());
    }

    private runPhysix(): void {
        if(!this.running) return;
        const nowMs = Date.now();
        const dt = 1 / this.sps;
        if(this.timeMs === 0) {
            this.timeMs = nowMs - 1;
        }
        while(this.timeMs < nowMs) {
            for (const worldObject of this.worldObjects) {
                worldObject.update(dt);
            }
            for (const physixUpdateListener of this.physixUpdateListeners) {
                physixUpdateListener(dt);
            }
            this.timeMs += 1000 / this.sps;
        }
    }

    private render() {
        this.ctx.save();
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.scale(this.pxPerMeter, this.pxPerMeter);
        for (const worldObject of this.worldObjects) {
            worldObject.render(this.ctx);
        }
        this.ctx.restore();
    }
}

class PIDController {
    private p: number;
    private i: number;
    private d: number;
    
    public minI: number;
    public maxI: number;

    public setpoint: number;

    private integrator: number;
    private lastMeasurement: number|null;
    // private lastUpdateMs: number|null;

    private dt: number;

    public isAngleController: boolean;


    constructor(p: number, i: number, d: number, dt: number, minI: number = -1, maxI: number = 1) {
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

    public update(measurement: number): number {
        // const nowMs = window.performance.now();
        if(this.lastMeasurement === null) {
            this.lastMeasurement = measurement;
        }
        // if(this.lastUpdateMs === null) {
        //     this.lastMeasurement = nowMs;
        // }
        // const dt = (nowMs - this.lastUpdateMs) / 1000;

        let error: number;
        if(this.isAngleController) {
            error = PIDController.angleFromTo(this.setpoint, measurement);
            console.log(error * (180/Math.PI), PhysixObject.normalizeAngle(this.setpoint) * (180/Math.PI), PhysixObject.normalizeAngle(measurement) * (180/Math.PI));
        } else {
            error = measurement - this.setpoint;
        }

        const pTerm = -error * this.p;

        this.integrator += error * this.dt;
        if(this.integrator > this.maxI) this.integrator = this.maxI;
        if(this.integrator < this.minI) this.integrator = this.minI;
        const iTerm = this.integrator * this.i;

        let dTerm: number;
        if(this.isAngleController) {
            dTerm = (PIDController.angleFromTo(this.lastMeasurement, measurement) / this.dt) * this.d;
        } else {
            dTerm = ((measurement - this.lastMeasurement) / this.dt) * this.d;
        }

        // this.lastUpdateMs = nowMs;
        this.lastMeasurement = measurement;
        return pTerm + iTerm - dTerm;
    }

    static angleFromTo(from: number, to: number): number {
        // from = PhysixObject.normalizeAngle(from);
        // to = PhysixObject.normalizeAngle(to);
        return Math.atan2(Math.sin(to - from), Math.cos(to - from));
    }

    reset(): void {
        this.setpoint = 0;
        this.integrator = 0;
        this.lastMeasurement = null;
    }
}

let pidRunning = true;

function toggle() {
    pidRunning = !pidRunning;
    if(pidRunning) {
        document.getElementById('startStop').innerText = 'Stop';
    } else {
        document.getElementById('startStop').innerText = 'Start';
    }
}

window.onload = () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const world = new World(document.getElementById('canvas') as HTMLCanvasElement);
    
    const setPoint = new RectObject(new Vec2(1, 0.5));
    setPoint.height = 10;
    setPoint.width = 0.01;
    setPoint.color = '#222';
    world.add(setPoint);

    const helper = new RectObject(new Vec2(1, 0.5));
    helper.height = 10;
    helper.width = 0.01;
    helper.color = '#225';
    world.add(helper);

    const rail = new RectObject(new Vec2(1, 0.5));
    rail.color = 'gray';
    rail.width = 1.5;
    rail.height = 0.02;
    world.add(rail);

    const pendulum = new PendulumObject(new Vec2(1, 0.5), 0.02, 0.4);

    const angleSetpoint = new RectObject(new Vec2(0, 0.15));
    angleSetpoint.height = 0.3;
    angleSetpoint.width = 0.01;
    angleSetpoint.color = '#252';
    pendulum.add(angleSetpoint);

    const text = new TextObject();
    text.scale = new Vec2(1 / world.pxPerMeter, 1 / world.pxPerMeter);
    pendulum.add(text);

    world.add(pendulum);

    pendulum.rot = Math.PI * 3 + 0.01;

    const dt = 1 / 20;

    const levelPID = new PIDController(40,0,5,dt);
    levelPID.isAngleController = true;

    const posPID = new PIDController(4, 0,38, dt);

    world.addPhysixUpdateListener((dt: number) => {
        // console.log(pendulum.normalizedRot);

        const pos = pendulum.pos.x + Math.sin(pendulum.rot) * pendulum.height;

        helper.pos.x = pos;

        if(!pidRunning) {
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
        let levelPIDOut = levelPID.update(pendulum.rot) * (Math.abs(Math.tan(pendulum.rot)) + 1);
        // const maxAcceleration = 9.81; // 1G
        const maxAcceleration = 20; // 1G
        if(levelPIDOut > maxAcceleration) {
            levelPIDOut = maxAcceleration;
        } else if(levelPIDOut < -maxAcceleration) {
            levelPIDOut = maxAcceleration;
        }
        pendulum.acceleration.x = levelPIDOut;
        
        

        // speedPID.setpoint = setPoint.pos.x - 1;
        // pendulum.acceleration.x = speedPID.update(pendulum.vel.x);
        // text.text = Math.round(pendulum.vel.x * 100) / 100 + 'm/s';

    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if(e.key == 'ArrowLeft') {
            pendulum.rotVel += 0.5;
        }
        if(e.key == 'ArrowRight') {
            pendulum.rotVel -= 0.5;
        }
    });
    let mouseDown = false;
    canvas.addEventListener('mousedown', (e: MouseEvent) => {
        mouseDown = true;
        setPoint.pos.x = e.offsetX / world.pxPerMeter;
    });
    canvas.addEventListener('mouseup', (e: MouseEvent) => {
        mouseDown = false;
    });
    canvas.addEventListener('mousemove', (e: MouseEvent) => {
        if(mouseDown) {
            setPoint.pos.x = e.offsetX / world.pxPerMeter;
        }
    });
};