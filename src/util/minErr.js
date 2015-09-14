export default function (module, msg) {
    var wrapper = function() {
        this.message = module ? ( msg ? msg : "This operation is not supported" ) +
            ( module.length > 4 ? " -> Module: " + module : " -> Core " ) : "The string did not match the expected pattern";
        // use the name on the framework
        this.name = "Inferno";
    };
    wrapper.prototype = Object.create( Error.prototype );
    throw new wrapper( module, msg );
};