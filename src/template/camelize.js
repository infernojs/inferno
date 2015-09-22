function camelize(str) {
  return str.toLowerCase()
    .replace( /['"]/g, '' )
    .replace( /\W+/g, ' ' )
    .replace( / (.)/g, function($1) { return $1.toUpperCase(); })
    .replace( / /g, '' );
}
export default camelize;