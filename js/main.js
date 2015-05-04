var json = require('./data/streets.json');
var Z_DIST = 1900;
var rotate = !true;
var forceMove = 0;

/*init vars */
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var camera, scene, renderer, cloth, street_data, raycaster;

var clothGeometry;
var sphere;
var object, arrow;
var mapGeometry;
var objects = [];
init();

/* testing cloth simulation */
function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );
	cloth = new Cloth(xSegs, ySegs);
	street_data = new GeoData(json, cloth);
	init3DScene();
	//cloth.addMouseForce(new THREE.Vector2( forceMove, 1 ));
	
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
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	
	document.addEventListener( 'touchend', onDocumentTouchEnd, false );
	document.addEventListener( 'mouseup', onMouseUp, false );
	document.onkeydown = checkKey;
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

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

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