/*
 * Cloth Simulation using a relaxed constrains solver
 */


var MASS = 1;
var restDistance = 15;
var DAMP = 0.01;
var DRAG = 0.99;
var mouse_influence = 40;
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
	this.mouse = {
		down: false,
        button: 1,
       position: new THREE.Vector3(),
       previous: new THREE.Vector3(),
       diff: new THREE.Vector3(0, 0, 0)
	}

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


Cloth.prototype.addMouseForce = function(mousePos){
	this.mouse.down = true;
	this.mouse.position.x = mousePos.x;
	this.mouse.position.y = mousePos.y;
	this.mouse.position.z = 10.0;
	this.mouse.previous.copy(this.mouse.position);
}

Cloth.prototype.updateMouseForce = function(mousePos){
	//this.mouse.previous = this.mouse.position;
	this.mouse.previous.copy(this.mouse.position);
	this.mouse.position.x = mousePos.x;
	this.mouse.position.y = mousePos.y;
	this.mouse.position.z = 10.0;
	this.mouse.diff.subVectors(this.mouse.position, this.mouse.previous);
//	console.log("previous " + JSON.stringify(this.mouse.previous) + " current " + JSON.stringify(this.mouse.position) + "diff " + JSON.stringify(this.mouse.diff));
	
	
}

Cloth.prototype.addExternalForce = function(posVec){

}

Cloth.prototype.removeMouseForce = function(mousePos){
	this.mouse.down = false;
	this.mouse.diff = new THREE.Vector3(0, 0, 0);
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
		if(this.mouse.down) particle.mouseUpdate(this.mouse.position, this.mouse.diff);

		// downward force at the beginning
		if(forceDown > -1000) particle.mouseUpdate(forceLoc, forceDir);

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
