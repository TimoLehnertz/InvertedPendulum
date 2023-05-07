class Vec2 {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
}

class PhysicObject {
    constructor(pos, rot) {
        this.children = [];
        this.pos = pos || new Vec2();
        this.vel = pos || new Vec2();
        this.rot = rot || 0;
    }
}

class RenderObject {
    constructor() {
        
    }
}

const p = new Pos();
console.log(p);

class physic {
    constructor(canvas) {

    }
}

class Renderer {
    constructor(canvas) {
        this.objects = [];
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.background = 'black';
    }

    add(object) {
        this.objects.push(object);
    }

    remove(object) {
        const index = this.objects.indexOf(object);
        if(index === 0) {
            return false;
        }
        this.objects.splice(index, 1);
        return true;
    }

    render() {
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.background;
        this.ctx.fill();
        for (const object of this.objects) {
            
        }
    }
}