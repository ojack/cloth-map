/*Load Open Street map Data from a JSON file. */

//var boundingBox = {s: 40.71849,w: -74.0044,n: 40.722638,e:-73.99832};
var maxY = 100;
var maxX = 100;
var sLat = 40.72;
var nLat = 40.72;
var wLon = -74.00;
var eLon = -74.00;



/* Prototype for loading and parsing open street map data. The constructor receives a
Json file and a bounding box, and parses it into a set of Nodes and Links.

Nodes are stored as an object containing an id and position. 

Links are stored as pairs of connected ids.

bounding box is an object containing the geographic boundaries of the inputted data.
Coordinates are calculated between 0 and 100
*/

var StreetData = function(data, bounding){
	this.data = data;
	this.particles = {};
	this.links = [];
	var numParticles = 0;
	var numLinks = 0;
	this.bounding = bounding;
	var numNodes = 0;
	//for(var i = 0; i < 1000; i++){
	for(var i = 0; i < this.data.elements.length; i++){
		var el = this.data.elements[i];
			if (el.type == "node"){
				if(this.addParticle(el, numNodes)) numNodes++;
			}
			if(el.type == "way"){			
				if(this.addLink(el));
			}
	}
}

/*GeoData.prototype.loadData = function(){
	/*for(var i = 0; i < 10; i++){
		var node = this.data.elements[i];
		if (node.type == "node"){
			this.addNode(node);
		}
		//this.addNode(data.elements[i]);
	}
}*/

StreetData.prototype.addParticle = function(node, thisIndex){
	var y = this.latToCanvasY(node.lat)*10;
	var x = this.lonToCanvasX(node.lon)*5;
	var vec = new Vec2(x, y);
	
	if(!this.particles.hasOwnProperty(node.id)){
		//console.log("duplicate!! was " + this.particles[node.id].vec.x + " new "+ vec.x);
		this.particles[node.id] = {"vec": vec, "index": thisIndex};
		return true;
	} 
	return false;
	//console.log(this.particles[node.id]);
}

StreetData.prototype.addLink = function(link){
	var net = link.nodes;
	for(var i = 0; i < net.length-1; i++){
		if(this.particles[net[i]]!=undefined){
			if(this.particles[net[i+1]]!=undefined){
				var linkArr = [net[i], net[i+1]];
				this.links.push(linkArr);
				//console.log(this.links);
			}
		}
	}
}

StreetData.prototype.getLinks = function(){
	return this.links;
}

//TO DO: use projection, deal with edge cases or locations other than ny
StreetData.prototype.latToCanvasY = function(lat){
	var len = (this.bounding.n-lat)/(this.bounding.n-this.bounding.s);
	if(lat < sLat) {
		sLat = lat;
		//console.log(" south lat " + sLat);
	}
	if(lat > nLat){
		nLat = lat;
		//console.log(" north lat " + nLat);
	}
	return Math.abs(len*maxY);
}

StreetData.prototype.lonToCanvasX = function(lon){
	var len = (this.bounding.w-lon)/(this.bounding.w-this.bounding.e);
	if(lon < wLon){
		wLon = lon;
		//console.log("w lon "+ lon);
	}
	if( lon > eLon){
		eLon = lon;
		//console.log(" e lon "+ lon);
	}
	return Math.abs(len*maxX);
}

function latToY(lat){
	var len = (lat-this.bounding.s)/(this.bounding.n-this.bounding.s);
	return len*maxY-maxY/2;
	//return len*maxY;
}

function lonToX(lon){
	var len = (lon-this.bounding.w)/(this.bounding.e-this.bounding.w);
	return len*maxX-maxX/2;
	//return len*maxX;
}