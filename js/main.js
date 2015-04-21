var json = require('./data/streets.json');
var Z_DIST = 2000;
var rotate = !true;


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
} 

function init3DScene(){
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );
	initCamera();
	//initLights();
	initObjects();
	initRenderer();
	mouse = new THREE.Vector2();
	raycaster = new THREE.Raycaster();
	raycaster.linePrecision = 20;
	animate();
	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mouseup', onMouseUp, false );
}

function initCamera(){
	camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.y = 100;
//	camera.position.z = 1500;
	camera.position.z = Z_DIST;
	scene.add( camera );
}

function initLights(){
	var light, materials;

	scene.add( new THREE.AmbientLight( 0x666666 ) );

	/*light = new THREE.DirectionalLight( 0xdfebff, 1.75 );
	light.position.set( 50, 200, 100 );
	light.position.multiplyScalar( 1.3 );

	light.castShadow = true;
	//light.shadowCameraVisible = true;

	light.shadowMapWidth = 1024;
	light.shadowMapHeight = 1024;

	var d = 300;

	light.shadowCameraLeft = -d;
	light.shadowCameraRight = d;
	light.shadowCameraTop = d;
	light.shadowCameraBottom = -d;

	light.shadowCameraFar = 1000;
	light.shadowDarkness = 0.5;

	scene.add( light );*/

}

function onDocumentMouseDown( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects( objects, true );
	console.log(" mousedown " + mouse.x + " intersected "+ intersects.length);

	if ( intersects.length > 0 ) {

		//intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
		cloth.addMouseForce(intersects[0].point);
		/*var particle = new THREE.Sprite( particleMaterial );
		particle.position.copy( intersects[ 0 ].point );
		particle.scale.x = particle.scale.y = 16;
		scene.add( particle );*/
		//console.log(" intersect at " + JSON.stringify(intersects[0]));

	}
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	/*
	// Parse all the faces
	for ( var i in intersects ) {

		intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );

	}
	*/
}

function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects( objects, true );
	console.log(" mousedown " + mouse.x + " intersected "+ intersects.length);
	
	if ( intersects.length > 0 ) {
		cloth.updateMouseForce(intersects[0].point);
		//intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
	//	cloth.updateMouseForce(mouse);
		/*var particle = new THREE.Sprite( particleMaterial );
		particle.position.copy( intersects[ 0 ].point );
		particle.scale.x = particle.scale.y = 16;
		scene.add( particle );*/
		//console.log(" intersect at " + JSON.stringify(intersects[0]));

	}
	

}

function onMouseUp(){
	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	cloth.removeMouseForce();
}

function initObjects(){
	

	/*var clothMaterial = new THREE.MeshPhongMaterial( { alphaTest: 0.5, color: 0xff0000, specular: 0x030303, wireframe: true, emissive: 0x111111, shiness: 0, side: THREE.DoubleSide } );

	// cloth geometry
	clothGeometry = new THREE.ParametricGeometry( clothFunction, cloth.w, cloth.h );
	clothGeometry.dynamic = true;
	clothGeometry.computeFaceNormals();

	cloth.addWind(clothGeometry.faces);
	var pins = [0, 2];
	cloth.addPins(pins);
	// cloth mesh

	object = new THREE.Mesh( clothGeometry, clothMaterial );
	object.position.set( 0, 0, 0 );
	object.castShadow = true;
	object.receiveShadow = true;
	scene.add( object );*/



	// sphere

	var ballGeo = new THREE.SphereGeometry( ballSize, 20, 20 );
	var ballMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff } );

	sphere = new THREE.Mesh( ballGeo, ballMaterial );
	sphere.castShadow = true;
	sphere.receiveShadow = true;
	scene.add( sphere );
	sphere.visible = !true;

	console.log(" added objects");

	drawLines();
}

function drawLines(){
	var material = new THREE.LineBasicMaterial({
		color: 0x000000,
		linewidth: 1,
		linevertex: 0xff0000
	});

	mapGeometry = new THREE.Geometry();
	/*geometry.vertices.push(
		new THREE.Vector3( -10, 0, 0 ),
		new THREE.Vector3( 0, 10, 0 ),
		new THREE.Vector3( 10, 0, 0 )
	);*/

	var lineLocs = street_data.getLinks();
	for(var i = 0; i < lineLocs.length; i++){
		mapGeometry.vertices.push(lineLocs[i]);
		//console.log(JSON.stringify(lineLocs[i]));
	}

	var line = new THREE.Line( mapGeometry, material, THREE.LinePieces);
	//cloth.addWind(clothGeometry.faces);
	
	scene.add( line );
	objects.push(line);
}

// arrow
function initRenderer(){
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0xffffff );

	container.appendChild( renderer.domElement );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	renderer.shadowMapEnabled = true;

stats = new Stats();
container.appendChild( stats.domElement );
}




//




//

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

	requestAnimationFrame( animate );

	var time = Date.now();

	windStrength = Math.cos( time / 7000 ) * 20 + 40;
	windForce.set( Math.sin( time / 2000 ), Math.cos( time / 3000 ), Math.sin( time / 1000 ) ).normalize().multiplyScalar( windStrength );
	
	cloth.simulate(time);
	render();
	stats.update();

}

function render() {

	var timer = Date.now() * 0.0002;

	var part = cloth.particles;
	//TO DO: learn what this is doing//generate irregular mesh
	var mapVert = mapGeometry.vertices.length;
	for ( var i = 0, il = mapVert.length; i < il; i ++ ) {

		mapGeometry.vertices[ i ].copy( part[ i ].position );

	}

	//clothGeometry.computeFaceNormals();
	//clothGeometry.computeVertexNormals();

	//clothGeometry.normalsNeedUpdate = true;
	mapGeometry.verticesNeedUpdate = true;

	//sphere.position.copy( ballPosition );

	if ( rotate ) {

		camera.position.x = Math.cos( timer ) * Z_DIST;
		camera.position.z = Math.sin( timer ) * Z_DIST;

	}

	camera.lookAt( scene.position );

	renderer.render( scene, camera );

}