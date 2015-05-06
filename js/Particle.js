function Particle(x, y, z, mass, p) {
	this.position = clothFunction(x, y);
	this.previous = clothFunction(x, y); // previous
	this.original = clothFunction(x, y); 
	//debugger;
	// this.positionP = p;
	// this.previousP = p; WHY WONT P WORK?
	// this.originalP = p;
	//debugger;
	this.a = new THREE.Vector3(0, 0, 0); // acceleration
	this.mass = mass;
	this.invMass = 1 / mass;
	this.tmp = new THREE.Vector3();
	this.tmp2 = new THREE.Vector3();
	//debugger;
}

// Force -> Acceleration
Particle.prototype.addForce = function(force) {
	this.a.add(
		this.tmp2.copy(force).multiplyScalar(this.invMass)
	);
};

Particle.prototype.mouseUpdate = function(mousePos, mouseDiff) {

	var thisDist = this.position.distanceTo(mousePos);
	if(thisDist < mouse_influence){
		//console.log("updating ");
		//var mouseDiff = this.tmp.subVectors(mousePrevious, mousePos)
		mouseDiff.multiplyScalar(1.0);
		this.previous.subVectors(this.position, mouseDiff);
	}
}

//moves particle back towards original position

Particle.prototype.snapBack = function(){
	var diff = new THREE.Vector3();
	diff.subVectors(this.position, this.original);

	//var correction = diff.multiplyScalar(1 - distance / currentDist);
	var correctionHalf = diff.multiplyScalar(0.002);
	this.position.sub(correctionHalf);
}


// Performs verlet integration
Particle.prototype.integrate = function(timesq, drag) {

	//debugger;
	var newPos = this.tmp.subVectors(this.position, this.previous);
	newPos.multiplyScalar(drag).add(this.position);
	newPos.add(this.a.multiplyScalar(timesq));

	this.tmp = this.previous;
	this.previous = this.position;
	this.position = newPos;

	this.a.set(0, 0, 0);
}

