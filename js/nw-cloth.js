/*
 * Cloth Simulation using a relaxed constrains solver
 */

// Suggested Readings

// Advanced Character Physics by Thomas Jakobsen Character
// http://freespace.virgin.net/hugo.elias/models/m_cloth.htm
// http://en.wikipedia.org/wiki/Cloth_modeling
// http://cg.alexandra.dk/tag/spring-mass-system/
// Real-time Cloth Animation http://www.darwin3d.com/gamedev/articles/col0599.pdf

var DAMPING = 0.03;
var DRAG = 1 - DAMPING;
var MASS = .1;
var restDistance = 25;
var xSegs = 30; //
var ySegs = 10; //





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
/*var clothFunction = plane(restDistance * xSegs, restDistance * ySegs);
function plane(width, height) {

	return function(u, v) {
		var x = (u - 0.5) * width;
		var y = (v + 0.5) * height;
		var z = 0;

		return new THREE.Vector3(x, y, z);
	};
}*/

function Particle(x, y, z, mass, func) {
	this.position = func(x, y);
	this.previous = func(x, y); // previous
	this.original = func(x, y); 
	this.a = new THREE.Vector3(0, 0, 0); // acceleration
	this.mass = mass;
	this.invMass = 1 / mass;
	this.tmp = new THREE.Vector3();
	this.tmp2 = new THREE.Vector3();
}

// Force -> Acceleration
Particle.prototype.addForce = function(force) {
	this.a.add(
		this.tmp2.copy(force).multiplyScalar(this.invMass)
	);
};


// Performs verlet integration
Particle.prototype.integrate = function(timesq) {
	var newPos = this.tmp.subVectors(this.position, this.previous);
	newPos.multiplyScalar(DRAG).add(this.position);
	newPos.add(this.a.multiplyScalar(timesq));

	this.tmp = this.previous;
	this.previous = this.position;
	this.position = newPos;

	this.a.set(0, 0, 0);
}


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
	this.restDistance = 25;
	this.xSegs = 30;
	this.ySegs = 10;
	this.particles = [];
	this.constrains = [];
	this.clothFunction = this.plane(this.restDistance * this.xSegs, this.restDistance * this.ySegs);
	var u, v;
	this.createParticles();
}

Cloth.prototype.plane = function(width, height) {
	return function(u, v) {
		var x = (u - 0.5) * width;
		var y = (v + 0.5) * height;
		var z = 0;
		return new THREE.Vector3(x, y, z);
	}
};

//Cloth.prototype
	

Cloth.prototype.createParticles = function(){
	// Create particles
	for (v = 0; v <= this.h; v ++) {
		for (u = 0; u <= this.w; u ++) {
			this.particles.push(
				new Particle((u+Math.random(0,10))/ this.w, v / this.h, 0, MASS, this.clothFunction)
			);
		}
	}
}

Cloth.prototype.addLinks = function(){
	var particles = this.particles
	for (v = 0; v < h; v ++) {
		for (u = 0; u < w; u ++) {

			this.constrains.push([
				particles[index(u, v)],
				particles[index(u, v + 1)],
				particles[index(u, v)].position.distanceTo(particles[index(u, v + 1)].position)
			]);

			this.constrains.push([
				particles[index(u, v)],
				particles[index(u + 1, v)],
				particles[index(u, v)].position.distanceTo(particles[index(u+1, v)].position)
				//restDistance
			]);

		}
	}

	for (u = w, v = 0; v < h; v ++) {
		this.constrains.push([
			particles[index(u, v)],
			particles[index(u, v + 1)],
			particles[index(u, v)].position.distanceTo(particles[index(u, v + 1)].position)
			//restDistance
		]);
	}

	for (v = h, u = 0; u < w; u ++) {
		this.constrains.push([
			particles[index(u, v)],
			particles[index(u + 1, v)],
			particles[index(u, v)].position.distanceTo(particles[index(u+1, v)].position)
			//restDistance
		]);
	}
}
	
Cloth.prototype.index = function(u, v){
		return u + v * (this.w + 1);
}

Cloth.prototype.simulate = function(time) {
	if (!lastTime) {
		lastTime = time;
		return;
	}
	
	var i, il, particles, particle, pt, constrains, constrain;

	// Aerodynamics forces
	/*if (wind) {
		var face, faces = clothGeometry.faces, normal;

		particles = cloth.particles;

		for (i = 0,il = faces.length; i < il; i ++) {
			face = faces[i];
			normal = face.normal;

			tmpForce.copy(normal).normalize().multiplyScalar(normal.dot(windForce));
			particles[face.a].addForce(tmpForce);
			particles[face.b].addForce(tmpForce);
			particles[face.c].addForce(tmpForce);
		}
	}*/
	
	for (particles = cloth.particles, i = 0, il = particles.length
			; i < il; i ++) {
		particle = particles[i];
		particle.addForce(gravity);

		particle.integrate(TIMESTEP_SQ);
	}

	// Start Constrains

	constrains = cloth.constrains,
	il = constrains.length;
	for (i = 0; i < il; i ++) {
		constrain = constrains[i];
		satisifyConstrains(constrain[0], constrain[1], constrain[2]);
	}

	// Ball Constrains


	/*ballPosition.z = -Math.sin(Date.now() / 600) * 90 ; //+ 40;
	ballPosition.x = Math.cos(Date.now() / 400) * 70

	if (sphere.visible)
	for (particles = cloth.particles, i = 0, il = particles.length
			; i < il; i ++) {
		particle = particles[i];
		pos = particle.position;
		diff.subVectors(pos, ballPosition);
		if (diff.length() < ballSize) {
			// collided
			diff.normalize().multiplyScalar(ballSize);
			pos.copy(ballPosition).add(diff);
		}
	}
	*/
	// Floor Constains
	for (particles = cloth.particles, i = 0, il = particles.length
			; i < il; i ++) {
		particle = particles[i];
		pos = particle.position;
		if (pos.y < -250) {
			pos.y = -250;
		}
	}
	
	// Pin Constrains
	for (i = 0, il = pins.length; i < il; i ++) {
		var xy = pins[i];
		var p = particles[xy];
		p.position.copy(p.original);
		p.previous.copy(p.original);
	}


}
