var json = require('./data/streets.json');

//var boundingBox = {s: 40.6814335, w: -74.0211217, n: 40.7715378, e: -73.9617643};
var boundingBox = {s: 40.6814335, w: -74.0211217, n: 40.75, e: -73.97};
var canvas, stats;
//var boundingBox = {s: 40.7252, w: -73.98, n: 40.727, e: -73.97};
var testData = {
	"elements": [{
	  "type": "node",
	  "id": 42421828,
	  "lat": 40.7253260,
	  "lon": -73.9762120
	},
	{
	  "type": "node",
	  "id": 42421833,
	  "lat": 40.7259200,
	  "lon": -73.9757850
	},
	{
	  "type": "node",
	  "id": 42421837,
	  "lat": 40.7265446,
	  "lon": -73.9753144
	},
	{
  "type": "node",
  "id": 42421889,
  "lat": 40.7341340,
  "lon": -73.9991880,
  "tags": {
    "highway": "traffic_signals"
  }
},
{
  "type": "node",
  "id": 42421901,
  "lat": 40.7347830,
  "lon": -73.9992480
},
{
  "type": "node",
  "id": 42421905,
  "lat": 40.7351891,
  "lon": -73.9993707
},
{
  "type": "node",
  "id": 42421923,
  "lat": 40.7260350,
  "lon": -73.9938450
},
	{
	"type": "way",
	  "id": 5669190,
	  "nodes": [
	    42421828,
	    42421833,
	    42421837
	  ]
	},
	{
	"type": "way",
	  "id": 5669190,
	  "nodes": [
	    42421901,
	    42421923
	  ]
	},
	{
	"type": "way",
	  "id": 5669190,
	  "nodes": [
	   42421828,
	    42421901,
	    42421833
	  ]
	}
	]
};

VerletJS.prototype.streetMap = function(particles, links){
		var composite = new this.Composite();
		//console.log(particles);
		//console.log(links);
		var numParts = 0;
		var other = 0;
		for (var id in particles) {
			other++;
	    	if (particles.hasOwnProperty(id)) {
	        	//console.log(particles[id].vec);
	        	numParts++;
	        	composite.particles.push(new Particle(particles[id].vec));
	    	}
		}

		/*for (i=0;i<numParts;i+=4){
			composite.pin(i);
		}*/
		var stiffness = 0.3; //look into what this does!
		//console.log("composite length " +composite.particles.length);
		//console.log("part length " +numParts);
		//console.log("other count " +other);
		for(var i = 0; i < links.length; i++){
			var link = links[i];
			var p1 = particles[link[0]];
			var p2 = particles[link[1]];
			//console.log(p1);
			//console.log(composite.particles[p1.index]);
			composite.constraints.push(new DistanceConstraint(composite.particles[p1.index], composite.particles[p2.index], stiffness));
			//console.log("dist "+ dist);
		}	


	//	console.log(composite.constraints);

		this.composites.push(composite);
		return composite;
}


/* testing cloth simulation */
function init() {
	stats = new Stats();
	stats.setMode(0); // 0: fps, 1: ms
	
	stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );

	var streets = new StreetData(json, boundingBox);
	initCanvas();
	initVerlet(streets.particles, streets.links);
	
}




function initVerlet(particles, links){
	// simulation
	var sim = new VerletJS(canvas.width, canvas.height, canvas);
	

	var map = sim.streetMap(particles, links);
	sim.gravity = new Vec2(0,0);
	sim.friction = 0.9;
	var loop = function() {
			stats.begin();
			sim.frame(2);
			sim.draw();
			stats.end();
			requestAnimFrame(loop);
		};

		loop();
	
	map.drawParticles = function(ctx, composite){
		/*for (i=0;i<composite.particles.length;++i) {
				var particle = composite.particles[i];
				
			}*/
	}

	map.drawConstraints = function(ctx, composite){
		ctx.save();
			ctx.strokeStyle = "#000";
			
			
			for (i=0;i<composite.constraints.length;++i) {
				var constraint = composite.constraints[i];
				
				ctx.beginPath();
				ctx.moveTo(constraint.a.pos.x, constraint.a.pos.y);
				ctx.lineTo(constraint.b.pos.x, constraint.b.pos.y);
			//	ctx.lineWidth = lerp(10,2,constraint.p);
				ctx.stroke();
			}
			
			ctx.restore();
		
	}
}


function initCanvas(){
	canvas = document.createElement('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	context = canvas.getContext('2d');
	document.body.appendChild(canvas);
}

init();