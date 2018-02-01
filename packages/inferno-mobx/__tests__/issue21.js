// TODO: Convert this
// import React, { createClass, createElement, DOM } from 'react'
// import ReactDOM from 'react-dom'
// import test from 'tape'
// import mobx from 'mobx'
// import { observer } from 'inferno-mobx'
// import {createTestRoot} from "./index"
//
// const testRoot = createTestRoot();
// let topRenderCount = 0;
//
// const wizardModel = mobx.observable({
//   steps: [
//     {
//       title: 'Size',
//       active: true
//     },
//     {
//       title: 'Fabric',
//       active: false
//     },
//     {
//       title: 'Finish',
//       active: false
//     }
//   ],
//   get activeStep() {
//     return _.find(this.steps, 'active');
//   },
//   activateNextStep: mobx.asReference(function () {
//     const nextStep = this.steps[_.findIndex(this.steps, 'active') + 1];
//     if(!nextStep) {
//       return false;
//     }
//     this.setActiveStep(nextStep);
//   }),
//   setActiveStep(modeToActivate) {
//     const self = this;
//     mobx.transaction(() => {
//       _.find(self.steps, 'active').active = false;
//       modeToActivate.active = true;
//     });
//   }
// });
//
// /** RENDERS **/
//
// const Wizard = observer(createClass({
//   displayName: 'Wizard',
//   render() {
//     return DOM.div(null,
//       <div>
//         <h1>Active Step: </h1>
//         <WizardStep step={ this.props.model.activeStep } key='activeMode' tester />
//       </div>,
//       <div>
//         <h1>All Step: </h1>
//         <p>Clicking on these steps will render the active step just once.  This is what I expected.</p>
//         <WizardStep step={ this.props.model.steps } key='modeList' />
//       </div>
//     );
//   }
// }));
//
// const WizardSteps = observer(createClass({
//   displayName: 'WizardSteps',
//   componentWillMount() {
//     this.renderCount = 0;
//   },
//   render() {
//     var steps = _.map(this.props.steps, step =>
//       DOM.div({key: step.title},
//         <WizardStep step={ step } key={ step.title } />
//       )
//     );
//     return DOM.div(null, steps);
//   }
// }));
//
// const WizardStep = observer(createClass({
//   displayName: 'WizardStep',
//   componentWillMount() {
//     this.renderCount = 0;
//   },
//   componentWillUnmount() {
//     console.log('Unmounting!');
//   },
//   render() {
//     // weird test hack:
//     if (this.props.tester === true) {
//       topRenderCount++;
//     }
//     return DOM.div(
//       {onClick: this.modeClickHandler},
//       'RenderCount: ' + (this.renderCount++) + ' ' + this.props.step.title + ': isActive:' + this.props.step.active
//     );
//   },
//   modeClickHandler() {
//     var step = this.props.step;
//     wizardModel.setActiveStep(step);
//   }
// }));
//
// /** END RENDERERS **/
//
// const changeStep = stepNumber => wizardModel.setActiveStep(wizardModel.steps[stepNumber]);
//
// test('verify issue 21', t => {
//   ReactDOM.render(<Wizard model={ wizardModel } />, testRoot, () => {
//     t.equal(topRenderCount, 1);
//     changeStep(0);
//     setTimeout(() => {
//       t.equal(topRenderCount, 2);
//       changeStep(2);
//       setTimeout(() => t.ok(topRenderCount, 3), 100);
//     }, 100);
//   });
// });
//
// test('verify prop changes are picked up', t => {
//   function createItem(subid, label) {
//     const res = mobx.observable({
//       id: 1,
//       label: label,
//       get text() {
//         events.push(['compute', this.subid]);
//         return this.id + '.' + this.subid + '.' + this.label + '.' + data.items.indexOf(this);
//       }
//     });
//     res.subid = subid; // non reactive
//     return res;
//   }
//   const data = mobx.observable({
//     items: [createItem(1, 'hi')]
//   });
//   const events = []
//   const Child = observer(createClass({
//     componentWillReceiveProps(nextProps) {
//       events.push(['receive', this.props.item.subid, nextProps.item.subid]);
//     },
//     componentWillUpdate(nextProps) {
//       events.push(['update', this.props.item.subid, nextProps.item.subid]);
//     },
//     componentWillReact() {
//       events.push(['react', this.props.item.subid]);
//     },
//     render() {
//       events.push(['render', this.props.item.subid, this.props.item.text]);
//       return <span>{ this.props.item.text }</span>
//     }
//   }))
//
//   const Parent = observer(createClass({
//     render() {
//       return (
//         <div
//           onClick={ changeStuff.bind(this) }
//           id='testDiv'
//         >
//           { data.items.map(item => <Child key='fixed' item={ item } />) }
//         </div>
//       )
//     }
//   }));
//
//   const Wrapper = () => <Parent />
//
//   function changeStuff() {
//     mobx.transaction(() => {
//       data.items[0].label = 'hello' // schedules state change for Child
//       data.items[0] = createItem(2, 'test') // Child should still receive new prop!
//     });
//     this.setState({}); // trigger update
//   }
//
//   ReactDOM.render(<Wrapper />, testRoot, () => {
//     t.deepEqual(events, [
//       ['compute', 1],
//       ['render', 1, '1.1.hi.0'],
//     ])
//     events.splice(0)
//     testRoot.querySelector('#testDiv').click()
//     setTimeout(() => t.deepEqual(events, [
//       [ 'compute', 1 ],
//       [ 'react', 1 ],
//       [ 'receive', 1, 2 ],
//       [ 'update', 1, 2 ],
//       [ 'compute', 2 ],
//       [ 'render', 2, '1.2.test.0' ]
//     ]), 100);
//   });
// });
//
// test('verify props is reactive', function(t) {
//   function createItem(subid, label) {
//     const res = mobx.observable({
//       id: 1,
//       label: label,
//       get text() {
//         events.push(['compute', this.subid])
//         return this.id + '.' + this.subid + '.' + this.label + '.' + data.items.indexOf(this)
//       }
//     })
//     res.subid = subid // non reactive
//     return res
//   }
//
//   const data = mobx.observable({
//     items: [createItem(1, 'hi')]
//   });
//   const events = [];
//
//   const Child = observer(createClass({
//     componentWillMount() {
//       events.push(['mount'])
//       mobx.extendObservable(this, {
//         get computedLabel() {
//           events.push(['computed label', this.props.item.subid])
//           return this.props.item.label
//         }
//       })
//     },
//     componentWillReceiveProps(nextProps) {
//       events.push(['receive', this.props.item.subid, nextProps.item.subid])
//     },
//     componentWillUpdate(nextProps) {
//       events.push(['update', this.props.item.subid, nextProps.item.subid])
//     },
//     componentWillReact() {
//       events.push(['react', this.props.item.subid])
//     },
//     render() {
//       events.push(['render', this.props.item.subid, this.props.item.text, this.computedLabel])
//       return <span>{this.props.item.text}{this.computedLabel}</span>
//     }
//   }));
//
//   const Parent = observer(createClass({
//     render() {
//       return (
//         <div onClick={ changeStuff.bind(this) } id='testDiv'>
//           { data.items.map(item => <Child key='fixed' item={ item } />) }
//         </div>
//       )
//     }
//   }));
//
//   const Wrapper = () => <Parent />
//
//   function changeStuff() {
//     mobx.transaction(() => {
//       // components start rendeirng a new item, but computed is still based on old value
//       data.items = [createItem(2, 'test')]
//     })
//   }
//
//   ReactDOM.render(<Wrapper />, testRoot, () => {
//     t.deepEqual(events, [
//       ['mount'],
//       ['compute', 1],
//       ['computed label', 1],
//       ['render', 1, '1.1.hi.0', 'hi'],
//     ]);
//     events.splice(0);
//     testRoot.querySelector('#testDiv').click();
//     setTimeout(() => t.deepEqual(events, [
//       [ 'compute', 1 ],
//       [ 'react', 1 ],
//       [ 'receive', 1, 2 ],
//       [ 'update', 1, 2 ],
//       [ 'compute', 2 ],
//       [ 'computed label', 2],
//       [ 'render', 2, '1.2.test.0', 'test' ]
//     ]), 100);
//   });
// });
//
// test('no re-render for shallow equal props', function(t) {
//   function createItem(subid, label) {
//     const res = mobx.observable({
//       id: 1,
//       label: label,
//     })
//     res.subid = subid // non reactive
//     return res
//   }
//
//   const data = mobx.observable({
//     items: [createItem(1, 'hi')],
//     parentValue: 0
//   });
//   const events = [];
//
//   const Child = observer(createClass({
//     componentWillMount() {
//       events.push(['mount']);
//     },
//     componentWillReceiveProps(nextProps) {
//       events.push(['receive', this.props.item.subid, nextProps.item.subid]);
//     },
//
//     componentWillUpdate(nextProps) {
//       events.push(['update', this.props.item.subid, nextProps.item.subid]);
//     },
//     componentWillReact() {
//       events.push(['react', this.props.item.subid]);
//     },
//     render() {
//       events.push(['render', this.props.item.subid, this.props.item.label]);
//       return <span>{this.props.item.label}</span>;
//     }
//   }));
//
//   const Parent = observer(createClass({
//     render() {
//       t.equal(mobx.isObservable(this.props.nonObservable), false, 'object has become observable!')
//       events.push(['parent render', data.parentValue])
//       return (
//         <div
//           onClick={ changeStuff.bind(this) }
//           id='testDiv'
//         >
//           { data.items.map(item => <Child key='fixed' item={ item } value={ 5 } />) }
//         </div>
//       )
//     }
//   }));
//
//   const Wrapper = () => <Parent nonObservable={{}} />
//
//   function changeStuff() {
//     data.items[0].label = 'hi'; // no change
//     data.parentValue = 1; // rerender parent
//   }
//
//   ReactDOM.render(<Wrapper />, testRoot, () => {
//     t.deepEqual(events, [
//       ['parent render', 0],
//       ['mount'],
//       ['render', 1, 'hi'],
//     ]);
//     events.splice(0);
//     testRoot.querySelector('#testDiv').click();
//     setTimeout(() => t.deepEqual(events, [
//       ['parent render', 1],
//       [ 'receive', 1, 1 ],
//     ]), 100);
//   });
// });
//
// test('lifecycle callbacks called with correct arguments', t => {
//   t.timeoutAfter(200);
//   var Component = observer(createClass({
//     componentWillReceiveProps(nextProps) {
//       t.equal(nextProps.counter, 1, 'componentWillReceiveProps: nextProps.counter === 1');
//       t.equal(this.props.counter, 0, 'componentWillReceiveProps: this.props.counter === 1');
//     },
//     componentWillUpdate(nextProps, nextState) {
//       t.equal(nextProps.counter, 1, 'componentWillUpdate: nextProps.counter === 1');
//       t.equal(this.props.counter, 0, 'componentWillUpdate: this.props.counter === 0');
//     },
//     componentDidUpdate(prevProps, prevState) {
//       t.equal(prevProps.counter, 0, 'componentDidUpdate: prevProps.counter === 0');
//       t.equal(this.props.counter, 1, 'componentDidUpdate: this.props.counter === 1');
//     },
//     render() {
//       return (
//         <div>
//           <span key='1'>{ [this.props.counter] }</span>
//           <button  key='2' id='testButton' onClick={ this.props.onClick } />
//         </div>
//       )
//     }
//   }));
//   const Root = createClass({
//     getInitialState() {
//       return {};
//     },
//     onButtonClick() {
//       this.setState({counter: (this.state.counter || 0) + 1});
//     },
//     render() {
//       return <Component
//         counter={ this.state.counter || 0 }
//         onClick={ this.onButtonClick }
//       />
//     },
//   });
//   ReactDOM.render(<Root />, testRoot, () => testRoot.querySelector('#testButton').click());
// });
