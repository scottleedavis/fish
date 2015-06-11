 //borrowed original from https://github.com/diafygi/webrtc-ips

var local_host = (function() {

       //get the IP addresses associated with an account
    function getIPs(callback){
        var ip_dups = {};

        //compatibility for firefox and chrome
        var RTCPeerConnection = window.RTCPeerConnection
            || window.mozRTCPeerConnection
            || window.webkitRTCPeerConnection;
        var useWebKit = !!window.webkitRTCPeerConnection;

        //bypass naive webrtc blocking using an iframe
        if(!RTCPeerConnection){
            var win = iframe.contentWindow;
            RTCPeerConnection = win.RTCPeerConnection
                || win.mozRTCPeerConnection
                || win.webkitRTCPeerConnection;
            useWebKit = !!win.webkitRTCPeerConnection;
        }

        //minimal requirements for data connection
        var mediaConstraints = {
            optional: [{RtpDataChannels: true}]
        };

        //firefox already has a default stun server in about:config
        //    media.peerconnection.default_iceservers =
        //    [{"url": "stun:stun.services.mozilla.com"}]
        var servers = undefined;

        //add same stun server for chrome
        if(useWebKit)
            servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};

        //construct a new RTCPeerConnection
        var pc = new RTCPeerConnection(servers, mediaConstraints);

        function handleCandidate(candidate){
            //match just the IP address
            var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/
            var ip_addr = ip_regex.exec(candidate)[1];

            //remove duplicates
            if(ip_dups[ip_addr] === undefined)
                callback(ip_addr);

            ip_dups[ip_addr] = true;
        }

        //listen for candidate events
        pc.onicecandidate = function(ice){

            //skip non-candidate events
            if(ice.candidate)
                handleCandidate(ice.candidate.candidate);
        };

        //create a bogus data channel
        pc.createDataChannel("");

        //create an offer sdp
        pc.createOffer(function(result){

            //trigger the stun server request
            pc.setLocalDescription(result, function(){}, function(){});

        }, function(){});

        //wait for a while to let everything done
        setTimeout(function(){
            //read candidate info from local description
            var lines = pc.localDescription.sdp.split('\n');

            lines.forEach(function(line){
                if(line.indexOf('a=candidate:') === 0)
                    handleCandidate(line);
            });
        }, 1000);
    }

    function info(callback) {

        getIPs(function(ip){
            callback({
                ip: ip,
                internal: ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/) !== null
            });
        });

    }

    return {
        info: function(callback){
            info(callback);
        }
    }
})();