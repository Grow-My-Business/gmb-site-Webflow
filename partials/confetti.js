export class Confetti {
    constructor(n, p) {
        this.gravity = 10,
        this.particle_count = 75,
        this.particle_size = 1,
        this.explosion_power = 25,
        this.destroy_target = !0,
        this.fade = !1
        this.ctx = null;
        this.drawer = new RectangleDrawer(this.ctx);
        this.bursts = [];
    }

    setCount(t) {
        if ("number" != typeof t)
            throw new Error("Input must be of type 'number'");
            this.particle_count = t
    }

    setPower(t) {
        if ("number" != typeof t)
            throw new Error("Input must be of type 'number'");
            this.explosion_power = t
    }

    setSize(t) {
        if ("number" != typeof t)
            throw new Error("Input must be of type 'number'");
            this.particle_size = t
    }

    setFade(t) {
        if ("boolean" != typeof t)
            throw new Error("Input must be of type 'boolean'");
            this.fade = t
    }

    destroyTarget(t) {
        if ("boolean" != typeof t)
            throw new Error("Input must be of type 'boolean'");
            this.destroy_target = t
    }

    setupCanvasContext() {
        if (!this.ctx) {
            var t = document.createElement("canvas");
            this.ctx = t.getContext("2d"),
            t.width = 2 * window.innerWidth,
            t.height = 2 * window.innerHeight,
            t.style.position = "fixed",
            t.style.top = "0",
            t.style.left = "0",
            t.style.width = "calc(100%)",
            t.style.height = "calc(100%)",
            t.style.margin = "0",
            t.style.padding = "0",
            t.style.zIndex = "999999999",
            t.style.pointerEvents = "none",
            document.body.appendChild(t),
            window.addEventListener("resize", function() {
                t.width = 2 * window.innerWidth,
                t.height = 2 * window.innerHeight
            })
        }
    }

    setupElement(t) {
        this.element.addEventListener("click", (t) => {
            var n = new Point(2 * t.clientX,2 * t.clientY); // Set position
            this.bursts.push(new Particle(n, this.drawer)); // Add burst
            this.destroy_target && (this.element.style.visibility = "hidden"); // Hide element
        });
    }

    setupElementForScroll(t) {
        this.element = document.querySelector(t);
        let fired = false;
        window.addEventListener('scroll', () => {
            if (fired) return;
            
            // Check if the element is within 10% bounds of the viewport (top and bottom)
            var rect = this.element.getBoundingClientRect(); // Get the location of the element on the page
            if (rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2) {
                setTimeout(function() {
                    rect = this.element.getBoundingClientRect(); // Get the location of the element on the page
                    var n = new Point(2 * (rect.x + (rect.width / 2)), 2 * (rect.y + (rect.height / 2))); // Set position
                    this.bursts.push(new Particle(n, this.drawer)); // Add burst
                    this.destroy_target && (this.element.style.visibility = "hidden"); // Hide element
                }, 500);
                fired = true;
            }
        });
    }

    update(t) {
        this.delta_time = (t - this.time) / 1e3,
        this.time = t;
        for (var e = this.bursts.length - 1; e >= 0; e--)
            this.bursts[e].update(this.delta_time),
            0 == this.bursts[e].particles.length && this.bursts.splice(e, 1);
        this.draw(),
        window.requestAnimationFrame(this.update.bind(this))
    }

    draw() {
        this.drawer.clearScreen();
        for (var t = 0, e = this.bursts; t < e.length; t++) {
            e[t].draw()
        }
    }
}

class Burst {
    constructor(t) {
        this.particles = [];
        for (var i = 0; i < this.particle_count; i++)
            this.particles.push(new n(t))
    }

    update(t) {
        for (var e = this.particles.length - 1; e >= 0; e--)
            this.particles[e].update(t),
            this.particles[e].checkBounds() && this.particles.splice(e, 1)
    }

    draw() {
        for (var t = this.particles.length - 1; t >= 0; t--)
            this.particles[t].draw()
    }
}

class Particle {
    constructor(t, drawer) {
        this.drawer = drawer,
        this.size = new Point((16 * Math.random() + 4) * this.particle_size,(4 * Math.random() + 4) * this.particle_size),
        this.position = new Point(t.x - this.size.x / 2,t.y - this.size.y / 2),
        this.velocity = this.generateVelocity(),
        this.rotation = 360 * Math.random(),
        this.rotation_speed = 10 * (Math.random() - .5),
        this.hue = 360 * Math.random(),
        this.opacity = 100,
        this.lifetime = Math.random() + .25
    }

    update(t) {
        this.velocity.y += this.gravity * (this.size.y / (10 * this.particle_size)) * t,
        this.velocity.x += 25 * (Math.random() - .5) * t,
        this.velocity.y *= .98,
        this.velocity.x *= .98,
        this.position.x += this.velocity.x,
        this.position.y += this.velocity.y,
        this.rotation += this.rotation_speed,
        this.fade && (this.opacity -= this.lifetime)
    }

    checkBounds() {
        return this.position.y - 2 * this.size.x > 2 * window.innerHeight
    }

    draw() {
        this.drawer.drawRectangle(this.position, this.size, this.rotation, this.hue, this.opacity)
    }
}

class Point {
    constructor(t, e) {
        this.x = t || 0,
        this.y = e || 0
    }
}

class VelocityGenerator {
    constructor() {}

    generateVelocity() {
        var t = Math.random() - .5
          , i = Math.random() - .7
          , n = Math.sqrt(t * t + i * i);
        return i /= n,
        new Point((t /= n) * (Math.random() * this.explosion_power),i * (Math.random() * this.explosion_power))
    }
}

class RectangleDrawer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    clearScreen() {
        this.ctx && this.ctx.clearRect(0, 0, 2 * window.innerWidth, 2 * window.innerHeight)
    }

    drawRectangle(t, i, n, o, r) {
        this.ctx && (this.ctx.save(),
        this.ctx.beginPath(),
        this.ctx.translate(t.x + i.x / 2, t.y + i.y / 2),
        this.ctx.rotate(n * Math.PI / 180),
        this.ctx.rect(-i.x / 2, -i.y / 2, i.x, i.y),
        this.ctx.fillStyle = "hsla(" + o + "deg, 90%, 65%, " + r + "%)",
        this.ctx.fill(),
        this.ctx.restore())
    }
}

export default Confetti;