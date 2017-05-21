// import test from 'tape'
// import mobx from 'mobx'
// import { observer } from '../'
//
// // TODO:
// test.skip('testIsComponentReactive', t => {
//     const component = observer({ render: () => null });
//     t.equal(component.isMobXReactObserver, true);
//     t.equal(mobx.isObservable(component), false); // dependencies not known yet
//     t.equal(mobx.isObservable(component.render), false); // dependencies not known yet
//
//     component.componentWillMount();
//     component.render();
//     t.equal(mobx.isObservable(component.render), true); // dependencies not known yet
//     t.equal(mobx.isObservable(component), false);
//
//     mobx.extendObservable(component, {});
//     t.equal(mobx.isObservable(component), true);
//
//     t.end();
// });
//
// // TODO:
// test.skip('testGetDNode', t => {
//     var getD = mobx.extras.getDNode;
//
//     const c = observer({ render: function() {}});
//     c.componentWillMount();
//     c.render();
//     t.ok(c.$mobx);
//
//     t.end();
// });
