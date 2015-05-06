//var json = require('./data/streets.json');

init();

/* testing cloth simulation */
function init() {

	
	
	
} 

/* set up canvas */
function initCanvas(){
	canvas = document.createElement('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	context = canvas.getContext('2d');
	document.body.appendChild(canvas);
}

function renderCloth(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	//var lineLocs = street_data.getLinks();
	var lines = cloth.constrains;
	var xMult = canvas.width/100;
	var yMult = canvas.height/100;
	//console.log("rendering cloth " + JSON.stringify(lines[0][0].position) + " particle "+ JSON.stringify(cloth.particles[0].position));
	for(var i = 0; i < lines.length; i++){
		//console.log(lineLocs[i]);
		//console.log(lines[i][0].position);
		context.beginPath();
		context.moveTo(lines[i][0].position.x*xMult, lines[i][0].position.y*yMult);
		context.lineTo(lines[i][1].position.x*xMult, lines[i][1].position.y*yMult);
		context.stroke();
		//mapGeometry.vertices.push(lineLocs[i]);
	}
}

function animateCanvas(){
	requestAnimationFrame( animateCanvas );
	var time = Date.now();
	cloth.simulate(time);
	renderCloth();
}

function init3DScene(){
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );
	initCamera();
	initObjects();
	initRenderer();
	mouse = new THREE.Vector2();
	raycaster = new THREE.Raycaster();
	raycaster.linePrecision = 20;
	animate();
	
}

function initDomEvents(){
	window.addEventListener( 'resize', onWindowResize, false );
/*	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	
	document.addEventListener( 'touchend', onDocumentTouchEnd, false );
	document.addEventListener( 'mouseup', onMouseUp, false );
	document.onkeydown = checkKey;*/
}

function initCamera(){
	camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.y = 100;
//	camera.position.z = 1500;
	camera.position.z = Z_DIST;
	scene.add( camera );
}

function initObjects(){
	drawLines();
}

function drawToCanvas(){

}

function drawLines(){
	var material = new THREE.LineBasicMaterial({
		color: 0x000000,
		linewidth: 1,
		linevertex: 0xff0000
	});

	mapGeometry = new THREE.Geometry();
	var lineLocs = street_data.getLinks();
	for(var i = 0; i < lineLocs.length; i++){
		mapGeometry.vertices.push(lineLocs[i]);
	}
	var line = new THREE.Line( mapGeometry, material, THREE.LinePieces);
	scene.add( line );
	objects.push(line);
}


function initRenderer(){
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0xffffff );

	container.appendChild( renderer.domElement );
	stats = new Stats();
	container.appendChild( stats.domElement );
}

//

/* Called via requestAnimationFrame() when ready to update positions*/
function animate() {
	/* add initial movement */
	//forceMove++;
	//cloth.updateMouseForce(new THREE.Vector2( forceMove, 1 ));

	requestAnimationFrame( animate );
	var time = Date.now();
	cloth.simulate(time);
	render();
	stats.update();
}

/*render scene*/
function render() {

	var timer = Date.now() * 0.0002;

	var part = cloth.particles;

	var mapVert = mapGeometry.vertices.length;
	for ( var i = 0, il = mapVert.length; i < il; i ++ ) {
		mapGeometry.vertices[ i ].copy( part[ i ].position );
	}

	mapGeometry.verticesNeedUpdate = true;

	if ( rotate ) {
		camera.position.x = Math.cos( timer ) * Z_DIST;
		camera.position.z = Math.sin( timer ) * Z_DIST;

	}
	camera.position.z = Z_DIST;
	camera.lookAt( scene.position );

	renderer.render( scene, camera );
}


/* 
Event Handlers
*/
function checkKey(e) {
	if (e.keyCode == '38') {
		Z_DIST -= 200;
        // up arrow
    } else if (e.keyCode == '40'){
    	Z_DIST += 200;
    }
}

function onWindowResize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	/*camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );*/

}

function onDocumentTouchMove( event ) {		
				event.preventDefault();
				event.clientX = event.touches[0].clientX;
				event.clientY = event.touches[0].clientY;
			mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects, true );	
	if ( intersects.length > 0 ) {
		cloth.updateMouseForce(intersects[0].point);
	}
}

function onDocumentTouchEnd(  ) {
			document.removeEventListener( 'touchmove', onDocumentTouchMove, false );
	cloth.removeMouseForce();
}

function onDocumentTouchStart( event ) {
				console.log("touch down");
				event.preventDefault();
				
				event.clientX = event.touches[0].clientX;
				event.clientY = event.touches[0].clientY;
				mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects, true );
	//console.log(" mousedown " + mouse.x + " intersected "+ intersects.length);
	if ( intersects.length > 0 ) {
		cloth.addMouseForce(intersects[0].point);
	}
				document.addEventListener( 'touchmove', onDocumentTouchMove, false );

}

function onDocumentMouseDown( event ) {
	event.preventDefault();
	mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects, true );
	//console.log(" mousedown " + mouse.x + " intersected "+ intersects.length);
	if ( intersects.length > 0 ) {
		cloth.addMouseForce(intersects[0].point);
	}
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
}

function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects, true );	
	if ( intersects.length > 0 ) {
		cloth.updateMouseForce(intersects[0].point);
	}
}

function onMouseUp(){
	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	cloth.removeMouseForce();
}