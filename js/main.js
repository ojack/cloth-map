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
	document.addEventListener( 'mousedown', onMouseDown, false );
	document.addEventListener( 'touchmove', onTouchMove, false );
	document.addEventListener( 'touchstart', onTouchStart, false );
	document.addEventListener( 'touchend', onTouchEnd, false );
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

var touches = {};

function onTouchStart( event){
	event.preventDefault();
	//console.log("touch start!!");
		//console.log(event);
		for(var i = 0; i < event.changedTouches.length; i++){
			//console.log(event.changedTouches[i]);
			var point = get3Dpoint(event.changedTouches[i].clientX, event.touches[i].clientY);
			//var touchObj = {curr: point, prev: point};
			cloth.addExternalForce(i, point);
			//touches[event.changedTouches[i].identifier] = touchObj;
			//addCube(get3Dpoint(event.changedTouches[i].clientX, event.changedTouches[i].clientY));
			//console.log(touches);
		}
}
function onTouchMove( event ) {		
				event.preventDefault();
//console.log(event);
			for(var i = 0; i < event.changedTouches.length; i++){
			//console.log(event.changedTouches[i]);
			var point = get3Dpoint(event.changedTouches[i].clientX, event.touches[i].clientY);
			//var touchObj = {curr: point, prev: point};
			cloth.updateExternalForce(i, point, 0.5);
			//touches[event.changedTouches[i].identifier] = touchObj;
			//addCube(get3Dpoint(event.changedTouches[i].clientX, event.changedTouches[i].clientY));
			//console.log(touches);
		}
}

function onTouchEnd( event){
	//console.log("touch end!");
		//console.log(event);
		for(var i = 0; i < event.changedTouches.length; i++){
			//var point = get3Dpoint(event.touches[i].clientX, event.touches[i].clientY);
			//var touchObj = {curr: point, prev: point};
			cloth.removeExternalForce(i);
			//delete touches[event.changedTouches[i].identifier];
			//addCube(get3Dpoint(event.touches[i].clientX, event.touches[i].clientY));
			//console.log(touches);
		}
}

function addCube(point){
//	console.log(point);
   var geometry = new THREE.BoxGeometry( 10, 10, 10 );

   var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );

   var mesh = new THREE.Mesh( geometry, material );
   
  //scene is global
   scene.add(mesh);
   mesh.position.copy(point);
   
}



function onMouseDown( event ) {
	event.preventDefault();

	//addCube(get3Dpoint(event.clientX, event.clientY));
	var point = get3Dpoint(event.clientX, event.clientY);
			//var touchObj = {curr: point, prev: point};
	cloth.addExternalForce("mouse", point);
	document.addEventListener( 'mousemove', onMouseMove, false );
}

function onMouseMove( event ) {
	//console.log('mouse mocv');
	event.preventDefault();
	var point = get3Dpoint(event.clientX, event.clientY);
			//var touchObj = {curr: point, prev: point};
	cloth.updateExternalForce("mouse", point, 0.7);
	//addCube(get3Dpoint(event.clientX, event.clientY));
	//addCube(mouse.x, mouse.y);
	/*mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
	mouse.y = - ( event.clientY / renderer.domElement.height ) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects, true );	
	if ( intersects.length > 0 ) {
	//	addCube(intersects[0].point);
		cloth.updateMouseForce(intersects[0].point);
	}*/
}

function onMouseUp(){
	document.removeEventListener( 'mousemove', onMouseMove, false );
	cloth.removeExternalForce("mouse");
}

function get3Dpoint(x, y){
		var vector = new THREE.Vector3();

vector.set(
    ( x / window.innerWidth ) * 2 - 1,
    - ( y / window.innerHeight ) * 2 + 1,
    0.5 );

vector.unproject( camera );

var dir = vector.sub( camera.position ).normalize();

var distance = - camera.position.z / dir.z;

return camera.position.clone().add( dir.multiplyScalar( distance ) );
	
}

