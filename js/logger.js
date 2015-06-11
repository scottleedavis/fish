
var logger = (function(){

    function info(output){
        console.log("INFO ("+Date.now()+"): "+output);
    }

    function error(output){
        console.log("ERROR ("+Date.now()+"): "+output);
    }

    function warning(output){
         console.log("WARNING ("+Date.now()+"): "+output);
    }

    return {
        info: function(output){
            info(output);
        },
        error: function(output){
            error(output);
        },
        warning: function(output){
            warning(output);
        }
    };

})();