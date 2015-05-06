/*Load Open Street map Data from a JSON file. */

var boundingBox = {s: 40.71849,w: -74.0044,n: 40.722638,e:-73.99832};
var maxY = 100;
var maxX = 100;



var GeoData = function(data, c){
	this.data = data;
	this.cloth = c;
	this.nodes = {};
	this.links = [];

	//this.loadData();
	var numNodes = 0;
	var numLinks = 0;
	for(var i = 0; i < this.data.elements.length; i++){
		var el = this.data.elements[i];
		//if(numNodes < 11){
			if (el.type == "node"){
				numNodes++;
				this.addNode(el);
			}
		//}
		//if(numLinks < 11){
			if(el.type == "way"){
					
				if(this.addLinks(el)) numLinks++;;
			}
		//}
		//this.addNode(data.elements[i]);
	}
	//for(var i = 0; i < data.elements.length; i++){
	
	//console.log(JSON.stringify(data.elements[0]));
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

GeoData.prototype.addNode = function(node){
	
	var particle = {};
	particle.y = latToY(node.lat);
	particle.x = lonToX(node.lon);
	this.nodes[node.id] = this.cloth.addParticle(particle.x, particle.y);
	//this.nodes[node.id] = new THREE.Vector3(particle.x, particle.y, 0);
	//console.log(node.lat+ " screen " + particle.y + " x " + particle.x);
	//console.log(particle.x + "y " + particle.y + "node" +this.nodes[node.id]);
}

GeoData.prototype.addLinks = function(link){
	var net = link.nodes;
	var foundNode = false;
	//if(link.tags["highway"]!=null){
	for(var i = 0; i < net.length-1; i++){
		if(this.nodes[net[i]]!=undefined){
			if(this.nodes[net[i+1]]!=undefined){
				//console.log("link " + net[i] + " p "+ JSON.stringify(this.nodes[net[i]]));
				this.links.push(this.nodes[net[i]].position);
				this.links.push(this.nodes[net[i+1]].position);
				this.cloth.addLink(this.nodes[net[i]], this.nodes[net[i+1]]);
				foundNode = true;
			}
		}
		//if(nodes[net[i]]!=)
	}
}
	//return foundNode;
//}

GeoData.prototype.getLinks = function(){
	return this.links;
}

//TO DO: use projection
function latToY(lat){
	var len = (lat-boundingBox.s)/(boundingBox.n-boundingBox.s);
	return len*maxY-maxY/2;
}

function lonToX(lon){
	var len = (lon-boundingBox.w)/(boundingBox.e-boundingBox.w);
	return len*maxX-maxX/2;

}