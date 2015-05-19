/*
 * Cloth Simulation using a relaxed constrains solver
 */


var MASS = 1;
var restDistance = 15;
var DAMP = 0.01;
var DRAG = 0.99;
var mouse_influence = 20;
var xSegs = 40; //
var ySegs = 40; //
var forceDown = 600;

/* Parametric function representing the shape of the cloth. For more info, see: http://prideout.net/blog/?p=44*/
var clothFunction = function(u, v){
		var x = u;
	    var y = v;
		var z = 0.0;
		return new THREE.Vector3(x, y, z);
}



//var GRAVITY = 981 * 1.4; // what gravity should be
var GRAVITY = 0;
var gravity = new THREE.Vector3( 0, -GRAVITY, 0).multiplyScalar(MASS);

var TIMESTEP = 18 / 1000;
var TIMESTEP_SQ = TIMESTEP * TIMESTEP;
          

var lastTime;



function satisifyConstrains(p1, p2, distance) {
	var diff = new THREE.Vector3();
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
	this.damping = DAMP;
	this.drag = DRAG;
	this.external_force = new THREE.Vector3(0, 0, 0);
	this.particles = [];
	this.constrains = [];
	this.forces = {};

}

Cloth.prototype.index = function(i, j){
	return i + j * (this.w + 1);
}



Cloth.prototype.addParticle = function(x , y){
	var p = clothFunction(x, y); // get rid of this
	this.particles.push(new Particle(x, y, 0, MASS, p));
	return this.particles[this.particles.length-1];
}

Cloth.prototype.addLink = function(part1, part2){
	//var dist = part1.position.distanceTo()
	if(part1==undefined) debugger;
	if(part2==undefined) debugger;
	this.constrains.push([part1, part2, part1.position.distanceTo(part2.position)]);
	//console.log("ths link " + JSON.stringify(this.constrains[0]));
}




Cloth.prototype.addExternalForce = function(index, position){
	var currPos = position;
	var prevPos = position;
	var diff = new THREE.Vector3(0, 0, 0);
	this.forces[index] = {position: currPos, previous: prevPos, diff: diff};
	//console.log("adding external force");
	//console.log(this.forces[index]);
}

Cloth.prototype.updateExternalForce = function(index, position, magnitude){
	
	this.forces[index].previous.copy(this.forces[index].position);
	this.forces[index].position = position;
	this.forces[index].diff.subVectors(this.forces[index].position, this.forces[index].previous);
	this.forces[index].diff.multiplyScalar(magnitude);
	//console.log("updating external force");
	//console.log(this.forces[index]);
}

Cloth.prototype.removeExternalForce = function(index){
	delete this.forces[index];
}





Cloth.prototype.simulate = function(time) {
	if (!lastTime) {
		lastTime = time;
		return;
	}
	
	var particles = this.particles;
	var i, il, particles, particle, pt, constrains, constrain;
	forceDown -= 40; 
	var forceLoc = new THREE.Vector3(200, forceDown, 0);
	//var forceDir = new THREE.Vector3(100-forceDown, 100-forceDown, 5);
	var forceDir = new THREE.Vector3(4, 4, 0);
	//add gravity
	for (particles = this.particles, i = 0, il = particles.length
			; i < il; i ++) {
		particle = particles[i];
		particle.snapBack();
		particle.addForce(gravity);
		//if(this.mouse.down) particle.mouseUpdate(this.mouse.position, this.mouse.diff);

		// downward force at the beginning
		if(forceDown > -1000) particle.externalForceUpdate(forceLoc, forceDir);

		//apply touch and mouse forces
		for (var index in this.forces) {
  			if (this.forces.hasOwnProperty(index)) {
    			particle.externalForceUpdate(this.forces[index].position, this.forces[index].diff);
  			}
		}
		particle.integrate(TIMESTEP_SQ, this.drag);


	}


	//apply external force 
	// // Start Constrains

	constrains = this.constrains,
	il = constrains.length;
	for (i = 0; i < il; i ++) {
		constrain = constrains[i];
		//console.log(constrain.position);
		satisifyConstrains(constrain[0], constrain[1], constrain[2]);
	}

	


}
