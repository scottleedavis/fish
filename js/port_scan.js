
var port_scan = (function(){

    var scanTimeout = 10000; //milliseconds
    var portTimeout = 1500; //milliseconds
    var portList = [
       21, 22, 23, 25, 37, 42, 53, 80, 88, 123, 139, 161, 443, 445, 548, 660,
       1025, 3000, 4040, 5009, 7070, 8080, 9292, 10000
    ];

    function scanPort(ip, port) {
        var host = {};
        host.ip = ip;
        host.port = port;

        try {
            host.startTime = Date.now();
            host.websocket = new WebSocket("wss://"+ip+":"+port+"/");
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
            logger.error("error creating socket: "+host.ip+":"+host.port);
        }
        return host;
    }

    function prunePorts(ports){
        var pruned_ports = new Array();
        ports.forEach(function(port){
            var scanWindow = port.startTime + portTimeout;
            if( scanWindow > port.whenClose ||
                scanWindow > port.whenOpen)
                pruned_ports.push(port);
        });

        return pluck(pruned_ports);
    }

    function pluck(ports){
        var i, rv = [];
        for (i = 0; i < ports.length; ++i) {
            rv[i] = ports[i]["port"];
        }
        return rv;
    }

    function run(ip, callback){
        var ports = new Array();
        portList.forEach(function(port){
            ports.push(scanPort(ip, port));
        });
        setTimeout(function(){
            callback(prunePorts(ports));
        }, scanTimeout);

    }

    return {
        run: function(ip, callback){
            run(ip, callback);
        }
    };

})();