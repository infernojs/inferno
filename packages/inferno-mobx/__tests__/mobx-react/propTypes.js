// PropTypes are not supported
//
// import React from 'react'
// import { PropTypes } from '../'
// import test from 'tape'
// import { observable, asMap } from 'mobx'
//
// function typeCheckFail(test, declaration, value, message) {
//   const props = {testProp: value};
//   const error = declaration(
//     props,
//     'testProp',
//     'testComponent',
//     'prop',
//     null
//   );
//   test.equal(error instanceof Error, true);
//   test.equal(error.message, message);
// }
//
// function typeCheckFailRequiredValues(test, declaration) {
//   const specifiedButIsNullMsg = 'The prop `testProp` is marked as required in ' +
//     '`testComponent`, but its value is `null`.';
//   const unspecifiedMsg = 'The prop `testProp` is marked as required in ' +
//     '`testComponent`, but its value is \`undefined\`.';
//   const props1 = {testProp: null};
//   const error1 = declaration(
//     props1,
//     'testProp',
//     'testComponent',
//     'prop',
//     null
//   );
//   test.equal(error1 instanceof Error, true);
//   test.equal(error1.message, specifiedButIsNullMsg);
//   const props2 = {testProp: undefined};
//   const error2 = declaration(
//     props2,
//     'testProp',
//     'testComponent',
//     'prop',
//     null
//   );
//   test.equal(error2 instanceof Error, true);
//   test.equal(error2.message, unspecifiedMsg);
//   const props3 = {};
//   const error3 = declaration(
//     props3,
//     'testProp',
//     'testComponent',
//     'prop',
//     null
//   );
//   test.equal(error3 instanceof Error, true);
//   test.equal(error3.message, unspecifiedMsg);
// }
//
// function typeCheckPass(test, declaration, value) {
//   const props = {testProp: value};
//   const error = declaration(
//     props,
//     'testProp',
//     'testComponent',
//     'prop',
//     null
//   );
//   test.equal(error, null);
// }
//
// test('Valid values', t => {
//   typeCheckPass(t, PropTypes.observableArray, observable([]));
//   typeCheckPass(t, PropTypes.observableArrayOf(React.PropTypes.string), observable(['']));
//   typeCheckPass(t, PropTypes.arrayOrObservableArray, observable([]));
//   typeCheckPass(t, PropTypes.arrayOrObservableArray, []);
//   typeCheckPass(t, PropTypes.arrayOrObservableArrayOf(React.PropTypes.string), observable(['']));
//   typeCheckPass(t, PropTypes.arrayOrObservableArrayOf(React.PropTypes.string), ['']);
//   typeCheckPass(t, PropTypes.observableObject, observable({}));
//   typeCheckPass(t, PropTypes.objectOrObservableObject, {});
//   typeCheckPass(t, PropTypes.objectOrObservableObject, observable({}));
//   typeCheckPass(t, PropTypes.observableMap, observable(asMap({})));
//   t.end();
// });
//
// test('should be implicitly optional and not warn', t => {
//   typeCheckPass(t, PropTypes.observableArray, undefined);
//   typeCheckPass(t, PropTypes.observableArrayOf(React.PropTypes.string), undefined);
//   typeCheckPass(t, PropTypes.arrayOrObservableArray, undefined);
//   typeCheckPass(t, PropTypes.arrayOrObservableArrayOf(React.PropTypes.string), undefined);
//   typeCheckPass(t, PropTypes.observableObject, undefined);
//   typeCheckPass(t, PropTypes.objectOrObservableObject, undefined);
//   typeCheckPass(t, PropTypes.observableMap, undefined);
//   t.end()
// });
//
// test('should warn for missing required values, function (test)', t => {
//   typeCheckFailRequiredValues(t, PropTypes.observableArray.isRequired, undefined);
//   typeCheckFailRequiredValues(t, PropTypes.observableArrayOf(React.PropTypes.string).isRequired, undefined);
//   typeCheckFailRequiredValues(t, PropTypes.arrayOrObservableArray.isRequired, undefined);
//   typeCheckFailRequiredValues(t, PropTypes.arrayOrObservableArrayOf(React.PropTypes.string).isRequired, undefined);
//   typeCheckFailRequiredValues(t, PropTypes.observableObject.isRequired, undefined);
//   typeCheckFailRequiredValues(t, PropTypes.objectOrObservableObject.isRequired, undefined);
//   typeCheckFailRequiredValues(t, PropTypes.observableMap.isRequired, undefined);
//   t.end()
// });
//
// test('should fail date and regexp correctly', t => {
//   typeCheckFail(
//     t,
//     PropTypes.observableObject,
//     new Date(),
//     'Invalid prop `testProp` of type `date` supplied to ' +
//     '`testComponent`, expected `mobx.ObservableObject`.'
//   );
//   typeCheckFail(
//     t,
//     PropTypes.observableArray,
//     /please/,
//     'Invalid prop `testProp` of type `regexp` supplied to ' +
//     '`testComponent`, expected `mobx.ObservableArray`.'
//   );
//   t.end()
// });
//
// test('observableArray', t => {
//   typeCheckFail(
//     t,
//     PropTypes.observableArray,
//     [],
//     'Invalid prop `testProp` of type `array` supplied to ' +
//     '`testComponent`, expected `mobx.ObservableArray`.'
//   );
//   typeCheckFail(
//     t,
//     PropTypes.observableArray,
//     '',
//     'Invalid prop `testProp` of type `string` supplied to ' +
//     '`testComponent`, expected `mobx.ObservableArray`.'
//   );
//   t.end();
// });
//
// test('arrayOrObservableArray', t => {
//   typeCheckFail(
//     t,
//     PropTypes.arrayOrObservableArray,
//     '',
//     'Invalid prop `testProp` of type `string` supplied to ' +
//     '`testComponent`, expected `mobx.ObservableArray` or javascript `array`.'
//   );
//   t.end();
// });
//
// test('observableObject', t => {
//   typeCheckFail(
//     t,
//     PropTypes.observableObject,
//     {},
//     'Invalid prop `testProp` of type `object` supplied to ' +
//     '`testComponent`, expected `mobx.ObservableObject`.'
//   );
//   typeCheckFail(
//     t,
//     PropTypes.observableObject,
//     '',
//     'Invalid prop `testProp` of type `string` supplied to ' +
//     '`testComponent`, expected `mobx.ObservableObject`.'
//   );
//   t.end();
// });
//
// test('objectOrObservableObject', t => {
//   typeCheckFail(
//     t,
//     PropTypes.objectOrObservableObject,
//     '',
//     'Invalid prop `testProp` of type `string` supplied to ' +
//     '`testComponent`, expected `mobx.ObservableObject` or javascript `object`.'
//   );
//   t.end();
// });
//
// test('observableMap', t => {
//   typeCheckFail(
//     t,
//     PropTypes.observableMap,
//     {},
//     'Invalid prop `testProp` of type `object` supplied to ' +
//     '`testComponent`, expected `mobx.ObservableMap`.'
//   );
//   t.end();
// });
//
// test('observableArrayOf', t => {
//   typeCheckFail(
//     t,
//     PropTypes.observableArrayOf(React.PropTypes.string),
//     2,
//     'Invalid prop `testProp` of type `number` supplied to ' +
//     '`testComponent`, expected `mobx.ObservableArray`.'
//   );
//   typeCheckFail(
//     t,
//     PropTypes.observableArrayOf(React.PropTypes.string),
//     observable([2]),
//     'Invalid prop `testProp[0]` of type `number` supplied to ' +
//     '`testComponent`, expected `string`.'
//   );
//   typeCheckFail(
//     t,
//     PropTypes.observableArrayOf({ foo: PropTypes.string }),
//     { foo: 'bar' },
//     'Property `testProp` of component `testComponent` has invalid PropType notation.'
//   );
//   t.end();
// });
//
// test('arrayOrObservableArrayOf', t => {
//   typeCheckFail(
//     t,
//     PropTypes.arrayOrObservableArrayOf(React.PropTypes.string),
//     2,
//     'Invalid prop `testProp` of type `number` supplied to ' +
//     '`testComponent`, expected `mobx.ObservableArray` or javascript `array`.'
//   );
//   typeCheckFail(
//     t,
//     PropTypes.arrayOrObservableArrayOf(React.PropTypes.string),
//     observable([2]),
//     'Invalid prop `testProp[0]` of type `number` supplied to ' +
//     '`testComponent`, expected `string`.'
//   );
//   typeCheckFail(
//     t,
//     PropTypes.arrayOrObservableArrayOf(React.PropTypes.string),
//     [2],
//     'Invalid prop `testProp[0]` of type `number` supplied to ' +
//     '`testComponent`, expected `string`.'
//   );
//   typeCheckFail(
//     t,
//     PropTypes.arrayOrObservableArrayOf({ foo: PropTypes.string }),
//     { foo: 'bar' },
//     'Property `testProp` of component `testComponent` has invalid PropType notation.'
//   );
//   t.end();
// });
