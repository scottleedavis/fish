local_host.info(about);

function about(host){
    if( host.internal ){
        logger.info("localhost IP: "+host.ip );
        internal_subnet.scan(host.ip, subnet_scanned);
    } else {
        logger.info("found external IP: "+host.ip);
        /*
         TODO: determine information about external IP
         */
    }
}
function subnet_scanned(net_hosts){
    logger.info("found "+net_hosts.length+" subnet hosts...");
    net_hosts.forEach(scan);
}

function scan(net_host){
    logger.info("scanning: "+net_host.ip);
    port_scan.run(net_host.ip, function(ports){
        net_host.ports = ports;
        logger.info("ports open on "+net_host.ip+": "+ports.join(","));
    });
}