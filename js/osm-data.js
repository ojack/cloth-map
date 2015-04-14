/*Load Open Street map Data from a JSON file. */



function OSMdata(data){
	this.data = data;
	for(var i = 0; i < data.elements.length; i++){
		var node = data.elements[i];
		if (node.type == "node"){
			addNode(node);
		}
		//this.addNode(data.elements[i]);
	}
	//console.log(JSON.stringify(data.elements[0]));
}

function addNode(node){
	console.log(node.lat);
}