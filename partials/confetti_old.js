class Confetti {
    constructor(element, event, offset, confettiSettings) {
        this.element = document.querySelector(element);
        this.event = event;
        this.offset = offset;
        this.confettiSettings = confettiSettings;
        this.CTX = null;
        this.particles = [];
        this.confettiColors = [];

        if (this.element === null) {
            return;
        }

        switch (this.event) {
            case 'click':
                this.element.addEventListener('click', (e) => this.triggerConfetti(e));
                break;
            case 'load':
                window.addEventListener('load', () => this.triggerConfetti());
                break;
            case 'scroll':
                window.addEventListener('scroll', () => {
                    const rect = this.element.getBoundingClientRect();
                    if (rect.bottom <= window.innerHeight * (1 - this.offset / 100)) {
                        this.triggerConfetti();
                    }
                });
                break;
        }

        // this.confettiColors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']; // Add more colors if you want!
    }

    triggerConfetti() {
        console.log('triggerConfetti')
        this.setupCanvasContext();
        this.particles = [];
        this.confettiSettings.count = this.confettiSettings.count || 100;
        for (let i = 0; i < this.confettiSettings.count; i++) {
            this.createParticle(this.confettiSettings, this.getElementCenter(), this.confettiColors, this.CTX);
        }
    
        // this.drawConfetti();
        this.animate();
      }

    getElementCenter() {
        const rect = this.element.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    setupCanvasContext() {
        if (!this.CTX) {
            var t = document.createElement("canvas");
            this.CTX = t.getContext("2d"),
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

    createParticle (confettiSettings, t, confettiColors, CTX) {
        const particle = new Particle(confettiSettings, t, confettiColors, CTX);
        this.particles.push(particle);
    }
    
    updateParticle () {
        this.velocity.y += this.confettiSettings.gravity * (this.size.y / (10 * this.confettiSettings.size)) * t,
        this.velocity.x += 25 * (Math.random() - .5) * t,
        this.velocity.y *= .98,
        this.velocity.x *= .98,
        this.position.x += this.velocity.x,
        this.position.y += this.velocity.y,
        this.rotation += this.rotation_speed,
        this.confettiSettings.FadeOut && (this.opacity -= this.lifetime)
    }

    drawParticle () {
        this.CTX.save(),
        this.CTX.translate(this.position.x, this.position.y),
        this.CTX.rotate(this.rotation * Math.PI / 180),
        this.CTX.scale(1, this.size.y / this.size.x),
        this.CTX.translate(-this.position.x, -this.position.y),
        this.CTX.beginPath(),
        this.CTX.moveTo(this.position.x, this.position.y),
        this.CTX.rect(this.position.x - this.size.x / 2, this.position.y - this.size.y / 2, this.size.x, this.size.y),
        this.CTX.closePath(),
        this.CTX.fillStyle = "hsla(" + this.hue + ", 100%, 50%, " + this.opacity / 100 + ")",
        this.CTX.fill(),
        this.CTX.restore()
    }

    drawConfetti () {
        this.CTX.clearRect(0, 0, 2 * window.innerWidth, 2 * window.innerHeight);
        for (let t = 0; t < this.particles.length; t++) {
            this.particles[t].updateParticle(1); // Assuming t=1 for now
            this.particles[t].drawParticle()
        }
        this.removeParticles()
    }

    removeParticles () {
        for (let t = 0; t < this.particles.length; t++) {
            this.particles[t].position.y > 2 * window.innerHeight && this.particles.splice(t, 1)
        }
    }

    animate () {
        this.drawConfetti();
        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(confettiSettings, t, confettiColors, CTX) {
        this.confettiSettings = confettiSettings;
        this.confettiColors = confettiColors;
        this.CTX = CTX;
        this.size = null;
        this.position = null;
        this.velocity = null;
        this.rotation = null;
        this.rotation_speed = null;
        this.hue = null;
        this.opacity = null;
        this.lifetime = null;
        
        if (t === null) {
            return;
        }

        this.createParticle(t);
    }

    createParticle (t) {
        this.size = new Vector((16 * Math.random() + 4) * this.confettiSettings.size, (4 * Math.random() + 4) * this.confettiSettings.size),
        this.position = new Vector(t.x - this.size.x / 2,t.y - this.size.y / 2),
        this.velocity = Vector.generateVelocity(),
        this.rotation = 360 * Math.random(),
        this.rotation_speed = 10 * (Math.random() - .5),
        this.hue = 360 * Math.random(),
        this.opacity = 1,
        this.lifetime = Math.random() + .25
    }

    
    updateParticle (t) {
        this.velocity.y += this.confettiSettings.gravity * (this.size.y / (10 * this.confettiSettings.size)) * t,
        this.velocity.x += 25 * (Math.random() - .5) * t,
        this.velocity.y *= .98,
        this.velocity.x *= .98,
        this.position.x += this.velocity.x,
        this.position.y += this.velocity.y,
        this.rotation += this.rotation_speed,
        this.confettiSettings.FadeOut && (this.opacity -= this.lifetime * t)
    }

    drawParticle () {
        if (this.CTX === undefined) {
            return;
        }
        this.CTX.save(),
        this.CTX.translate(this.position.x, this.position.y),
        this.CTX.rotate(this.rotation * Math.PI / 180),
        this.CTX.scale(1, this.size.y / this.size.x),
        this.CTX.translate(-this.position.x, -this.position.y),
        this.CTX.beginPath(),
        this.CTX.moveTo(this.position.x, this.position.y),
        this.CTX.rect(this.position.x - this.size.x / 2, this.position.y - this.size.y / 2, this.size.x, this.size.y),
        this.CTX.closePath(),
        this.CTX.fillStyle = "hsla(" + this.hue + ", 100%, 50%, " + this.opacity + ")", this.CTX.fill(), this.CTX.restore()
    }
}

class Vector {
    constructor(t, e) {
        this.x = t,
        this.y = e
    }
    static generateVelocity() {
        return new Vector(10 * (Math.random() - .5), -20 * Math.random())
    }
}

export default Confetti;