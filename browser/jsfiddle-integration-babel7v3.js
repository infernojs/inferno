document.addEventListener('DOMContentLoaded', function(event) {
  Babel.registerPlugin("inferno", window["babel-plugin-inferno"]);
  window.inferno = window.Inferno;

  var tag = document.querySelector('script[type="application/javascript"]');
  if (!tag || tag.textContent.indexOf('window.onload=function(){') !== -1) {
    alert('Bad JSFiddle configuration, please fork the original Inferno JSFiddle');
  }
  tag.setAttribute('type', 'text/babel');
  tag.setAttribute('data-plugins', 'inferno,transform-modules-umd');
  tag.setAttribute('data-presets', 'es2017');

  tag.textContent = tag.textContent.replace(/^\/\/<!\[CDATA\[/, '');
});
