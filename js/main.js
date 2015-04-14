var json = require('./data/data.json');
var Z_DIST = 800;
var rotate = false;





/*init vars */
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var camera, scene, renderer, cloth;

var clothGeometry;
var sphere;
var object, arrow;

init();

/* testing cloth simulation */
function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );
	cloth = new Cloth(xSegs, ySegs);
	//var data = new GeoData(json, cloth);
	init3DScene();
} 

function init3DScene(){
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );
	initCamera();
	initLights();
	initObjects();
	initRenderer();
	animate();
	window.addEventListener( 'resize', onWindowResize, false );
}

function initCamera(){
	camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.y = 50;
//	camera.position.z = 1500;
	camera.position.z = Z_DIST;
	scene.add( camera );
}

function initLights(){
	var light, materials;

	scene.add( new THREE.AmbientLight( 0x666666 ) );

	light = new THREE.DirectionalLight( 0xdfebff, 1.75 );
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

	scene.add( light );

}


function initObjects(){
	

var clothMaterial = new THREE.MeshPhongMaterial( { alphaTest: 0.5, color: 0xff0000, specular: 0x030303, wireframe: true, emissive: 0x111111, shiness: 0, side: THREE.DoubleSide } );

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
scene.add( object );



// sphere

var ballGeo = new THREE.SphereGeometry( ballSize, 20, 20 );
var ballMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff } );

sphere = new THREE.Mesh( ballGeo, ballMaterial );
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add( sphere );
sphere.visible = !true
}


// arrow
function initRenderer(){
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( scene.fog.color );

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

	var p = cloth.particles;

	for ( var i = 0, il = p.length; i < il; i ++ ) {

		clothGeometry.vertices[ i ].copy( p[ i ].position );

	}

	clothGeometry.computeFaceNormals();
	clothGeometry.computeVertexNormals();

	clothGeometry.normalsNeedUpdate = true;
	clothGeometry.verticesNeedUpdate = true;

	sphere.position.copy( ballPosition );

	if ( rotate ) {

		camera.position.x = Math.cos( timer ) * Z_DIST;
		camera.position.z = Math.sin( timer ) * Z_DIST;

	}

	camera.lookAt( scene.position );

	renderer.render( scene, camera );

}