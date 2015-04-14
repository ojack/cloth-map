function Particle(x, y, z, mass) {
	this.position = clothFunction(x, y);
	this.previous = clothFunction(x, y); // previous
	this.original = clothFunction(x, y); 
	//debugger;
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