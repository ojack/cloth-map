/*
 * Cloth Simulation using a relaxed constrains solver
 */

// Suggested Readings

// Advanced Character Physics by Thomas Jakobsen Character
// http://freespace.virgin.net/hugo.elias/models/m_cloth.htm
// http://en.wikipedia.org/wiki/Cloth_modeling
// http://cg.alexandra.dk/tag/spring-mass-system/
// Real-time Cloth Animation http://www.darwin3d.com/gamedev/articles/col0599.pdf

//var DAMPING = 0.03;
//var DRAG = 1 - DAMPING;
var MASS = .1;
var restDistance = 25;


var xSegs = 4; //
var ySegs = 4; //

/* Parametric function representing the shape of the cloth. For more info, see: http://prideout.net/blog/?p=44*/
var clothFunction = function(u, v){
	var x = (u - 0.5) * restDistance * xSegs;
		var y = (v + 0.5) *  restDistance * ySegs;
		var z = 0;

		return new THREE.Vector3(x, y, z);
}



var GRAVITY = 981 * 1.4; // 
var gravity = new THREE.Vector3( 0, -GRAVITY, 0 ).multiplyScalar(MASS);


var TIMESTEP = 18 / 1000;
var TIMESTEP_SQ = TIMESTEP * TIMESTEP;

var pins = [];


var wind = true;
var windStrength = 2;
var windForce = new THREE.Vector3(0,0,0);

var ballPosition = new THREE.Vector3(0, -45, 0);
var ballSize = 60; //40

var tmpForce = new THREE.Vector3();

var lastTime;

var diff = new THREE.Vector3();

function satisifyConstrains(p1, p2, distance) {
	diff.subVectors(p2.position, p1.position);
	var currentDist = diff.length();
	if (currentDist == 0) return; // prevents division by 0
	var correction = diff.multiplyScalar(1 - distance / currentDist);
	var correctionHalf = correction.multiplyScalar(0.5);
	p1.position.add(correctionHalf);
	p2.position.sub(correctionHalf);
}


function Cloth(w, h) {
	w = w || 10;
	h = h || 10;
	this.w = w;
	this.h = h;
	this.damping = 0.03;
	this.drag = 1-this.damping;

	this.particles = [];
	this.constrains = [];

	this.createParticles();
	this.createLinkConstrains();
}

Cloth.prototype.index = function(i, j){
	return i + j * (this.w + 1);
}

Cloth.prototype.createParticles = function(){
	var u, v;
	// Create particles
	for (v = 0; v <= this.h; v ++) {
		for (u = 0; u <= this.w; u ++) {
			var p = clothFunction(u/ this.w, v / this.h);
			this.particles.push(
				new Particle(u/ this.w, v / this.h, 0, MASS, p)
			);
		}
	}
}

Cloth.prototype.createLinkConstrains = function(){
	// Structural

	for (v = 0; v < this.h; v ++) {
		for (u = 0; u < this.w; u ++) {
			var thisParticle = this.particles[this.index(u, v)];
			var nextParticle = this.particles[this.index(u, v+1)];
			console.log(" u " + u + "v "+ v + "index " + this.index(u, v));
			this.constrains.push([
				this.particles[this.index(u, v)],
				this.particles[this.index(u, v + 1)],
				this.particles[this.index(u, v)].position.distanceTo(this.particles[this.index(u, v + 1)].position)
			]);

			this.constrains.push([
				this.particles[this.index(u, v)],
				this.particles[this.index(u + 1, v)],
				this.particles[this.index(u, v)].position.distanceTo(this.particles[this.index(u+1, v)].position)
			]);

		}
	}

	for (u = this.w, v = 0; v < this.h; v ++) {
		this.constrains.push([
			this.particles[this.index(u, v)],
			this.particles[this.index(u, v + 1)],
			this.particles[this.index(u, v)].position.distanceTo(this.particles[this.index(u, v + 1)].position)
		]);
	}

	for (v = this.h, u = 0; u < this.w; u ++) {
		this.constrains.push([
			this.particles[this.index(u, v)],
			this.particles[this.index(u + 1, v)],
			this.particles[this.index(u, v)].position.distanceTo(this.particles[this.index(u+1, v)].position)
		]);
	}
}

Cloth.prototype.addWind = function(faces){
	this.faces = faces;
}

Cloth.prototype.addPins = function(pins){
	console.log(" pins are " + pins)
	this.pins = pins;
}

Cloth.prototype.simulate = function(time) {
	if (!lastTime) {
		lastTime = time;
		return;
	}
	
	var particles = this.particles;
	var i, il, particles, particle, pt, constrains, constrain;

	// Aerodynamics forces
	if (wind) {
		var face, faces = this.faces, normal;

		particles = this.particles;

		for (i = 0,il = faces.length; i < il; i ++) {
			face = faces[i];
			normal = face.normal;

			tmpForce.copy(normal).normalize().multiplyScalar(normal.dot(windForce));
			particles[face.a].addForce(tmpForce);
			particles[face.b].addForce(tmpForce);
			particles[face.c].addForce(tmpForce);
		}
	}
	
	//add gravity
	for (particles = this.particles, i = 0, il = particles.length
			; i < il; i ++) {
		particle = particles[i];
		particle.addForce(gravity);
		particle.integrate(TIMESTEP_SQ, this.drag);
	}

	// // Start Constrains

	constrains = this.constrains,
	il = constrains.length;
	for (i = 0; i < il; i ++) {
		constrain = constrains[i];
		satisifyConstrains(constrain[0], constrain[1], constrain[2]);
	}

	// // Ball Constrains


	// ballPosition.z = -Math.sin(Date.now() / 600) * 90 ; //+ 40;
	// ballPosition.x = Math.cos(Date.now() / 400) * 70

	// if (sphere.visible)
	// for (particles = cloth.particles, i = 0, il = particles.length
	// 		; i < il; i ++) {
	// 	particle = particles[i];
	// 	pos = particle.position;
	// 	diff.subVectors(pos, ballPosition);
	// 	if (diff.length() < ballSize) {
	// 		// collided
	// 		diff.normalize().multiplyScalar(ballSize);
	// 		pos.copy(ballPosition).add(diff);
	// 	}
	// }

	// // Floor Constains
	// for (particles = cloth.particles, i = 0, il = particles.length
	// 		; i < il; i ++) {
	// 	particle = particles[i];
	// 	pos = particle.position;
	// 	if (pos.y < -250) {
	// 		pos.y = -250;
	// 	}
	// }

	// // Pin Constrains
	for (i = 0, il = this.pins.length; i < il; i ++) {
		var xy = this.pins[i];
		var p = particles[xy];
		p.position.copy(p.original);
		p.previous.copy(p.original);
	}


}
