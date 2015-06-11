
var internal_subnet = (function(){

    var pingTimeout = 4000; //in milliseconds

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
        var i = 1;
        while(i < 255){
            candidates.push(subnet + "." + i++);
        }
        return candidates;
    }

    function pruneCandidates(hosts){
        var pruned_hosts = new Array();
        hosts.forEach(function(host){
            var scanWindow = host.startTime + pingTimeout;
            if( scanWindow > host.whenClose ||
                scanWindow > host.whenOpen ||
                (host.whenClose && host.whenOpen === null))
                pruned_hosts.push(host);
        });
         return pruned_hosts;
    }

    function scanSubnet(net, callback){
        var hosts = new Array();
        net.forEach(function(ip){
            hosts.push( testIP(ip) );
        });

        setTimeout(function(){
            callback(pruneCandidates(hosts));
        }, pingTimeout*2.5);
    }

    function testIP(ip) {
        var host = {};
        host.ip = ip;

        try {
            host.startTime = Date.now();
            host.websocket = new WebSocket("wss://"+ip+"/");
            host.websocket.host = host;
            host.websocket.onopen = function(evt) {
                host.whenOpen = Date.now();
            };
            host.websocket.onclose = function(evt) {
                host.whenClose = Date.now();
            };
            host.websocket.onmessage = function(evt) {
            };
            host.websocket.onerror = function(evt) {
                host.whenError = Date.now();
            };
        } catch (e) {
            logger.error("error in socket: "+host.ip);
        }
        return host;
    }

    return {
        scan: function(ip, callback){
            getSubnet(ip, function(net){
                scanSubnet(net, callback);
            });
        }
    }
})();