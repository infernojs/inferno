let _uppercasePattern = /([A-Z])/g;

export default ( string ) => string.replace( _uppercasePattern, "-$1" ).toLowerCase();
