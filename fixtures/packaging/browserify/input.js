/* eslint-disable */
var Inferno = require('inferno');
var Component = require('inferno-component');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isProduction = process.env.NODE_ENV === 'production';

var Example = function (_Component) {
	_inherits(Example, _Component);

	function Example() {
		_classCallCheck(this, Example);

		return _possibleConstructorReturn(this, _Component.apply(this, arguments));
	}

	Example.prototype.render = function render() {
		return Inferno.createVNode(2, 'h1', null, isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
	};

	return Example;
}(Component);

Inferno.render(
	Inferno.createVNode(16, Example),
  document.getElementById(isProduction ? 'prod' : 'dev')
);

// Wait 1 second to verify error message
setTimeout(function () {
	Inferno.render(
		{error: 'test'},
		document.getElementById(isProduction ? 'prod' : 'dev')
	)
}, 1000);
