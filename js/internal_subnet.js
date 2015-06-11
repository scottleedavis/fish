function getSubnet(ip, callback){
	 
	try{
	 	callback(buildCandidates(ip));
	} catch( e ){
		alert(e)
	}
}

function buildCandidates(ip){
	var subnet = ip.split(".").slice(0,3).join(".");
	var candidates = [];
	var i = 0;
	while(i++ < 256){
		candidates.push(subnet + "." + i);
	}
	return candidates;
}