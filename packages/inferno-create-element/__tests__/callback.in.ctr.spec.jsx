import { render, Component } from 'inferno';
import { createElement } from 'inferno-create-element';
import { innerHTML } from 'inferno-utils';

describe('Callbacks in constructor', () => {
  // https://github.com/infernojs/inferno/issues/1103
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  describe('Github #1103', () => {
    it('Should be possible to call callbacks from Component constructor - Use case 1', () => {
      const InfoLi = function InfoLi(props) {
        const iddy = props.conf.key;
        return (
          <li>
            <input type="checkbox" checked={props.checked} id={iddy} onClick={props.onChange} />
            <label for={iddy}>{props.conf.label}</label>
            <div>{props.children}</div>
          </li>
        );
      };

      class ConfigsList extends Component {
        constructor(props) {
          super(props);
          this.state = {
            checks: props.configs.map(conf => Boolean(conf.value))
          };
        }

        handleCheck(index, ifChecked) {
          console.log('handle CHECK', index, ifChecked);
          this.setState({
            checks: this.state.checks.map((ch, i) => (i === index ? ifChecked : ch))
          });
        }

        handleNewValue(index, newValue) {
          console.log('handle NEW VALUE', index, newValue);
          this.props.onConfChanged({
            targetIndex: index,
            newValue: newValue
          });
        }

        render(props) {
          return (
            <ol>
              {props.configs.map((conf, index) => {
                const childElement = props.configToChild && props.configToChild[conf.key];

                const child =
                  childElement &&
                  this.state.checks[index] &&
                  createElement(
                    childElement,
                    Object.assign({}, props, {
                      conf,
                      onNewValue: newValue => this.handleNewValue(index, newValue)
                    })
                  );

                console.log('CHIIIIILD', child);

                // return (
                //   <li>
                //     <input
                //       type="checkbox"
                //       checked={conf.value}
                //       onChange={(event) => this.handleCheck(index, event.target.checked)}
                //     /><label>{conf.label}</label>
                //     <div>{child}</div>
                //   </li>);

                return (
                  <InfoLi conf={conf} checked={conf.value} onChange={event => this.handleCheck(index, event.target.checked)}>
                    {child}
                  </InfoLi>
                );
              })}
            </ol>
          );
        }
      }

      class ProxyEditor extends Component {
        constructor(props /*{ conf, onNewValue }*/) {
          super(props);
          console.log('CONSTRUCTOR');
          const oldValue = props.conf.value;
          const newValue = oldValue || 'BA BA BA!';
          if (!oldValue) {
            this.props.onNewValue(newValue);
          }
        }

        render() {
          return <div />;
        }
      }

      class Main extends Component {
        constructor(props) {
          super(props);
          this.state = {
            configs: [
              {
                key: 'customProxyStringRaw',
                value: false,
                label: 'Use proxy? (click this)',
                category: 'ownProxies'
              },
              {
                key: 'This one is needed for reproduction too!',
                value: false,
                label: 'needed too',
                category: 'ownProxies'
              }
            ]
          };
          this.handleModChange = this.handleModChange.bind(this);
        }

        handleModChange({ targetIndex, newValue }) {
          this.setState({
            configs: this.state.configs.map((oldConf, index) => (index !== targetIndex ? oldConf : Object.assign({}, oldConf, { value: newValue })))
          });
        }

        render(props) {
          return createElement(
            ConfigsList,
            Object.assign({}, props, {
              configs: this.state.configs,
              configToChild: {
                customProxyStringRaw: ProxyEditor
              },
              onConfChanged: this.handleModChange
            })
          );
        }
      }

      render(<Main />, container);

      // Renders correctly
      expect(innerHTML(container.innerHTML)).toBe(
        innerHTML(
          '<ol><li><input type="checkbox" id="customProxyStringRaw"><label for="customProxyStringRaw">Use proxy? (click this)</label><div></div></li><li><input type="checkbox" id="This one is needed for reproduction too!"><label for="This one is needed for reproduction too!">needed too</label><div></div></li></ol>'
        )
      );

      let checkBoxes = container.querySelectorAll('input');

      expect(checkBoxes.length).toBe(2);

      expect(checkBoxes[0].checked).toBe(false);
      expect(checkBoxes[1].checked).toBe(false);

      checkBoxes[0].click(); // Click first checkbox

      checkBoxes = container.querySelectorAll('input');

      expect(checkBoxes.length).toBe(2);

      expect(checkBoxes[0].checked).toBe(true);
      expect(checkBoxes[1].checked).toBe(false);

      checkBoxes[0].click(); // Click first checkbox again

      checkBoxes = container.querySelectorAll('input');

      expect(checkBoxes.length).toBe(2);

      expect(checkBoxes[0].checked).toBe(true); // This is current expected behavior, same as React
      expect(checkBoxes[1].checked).toBe(false);

      checkBoxes[1].click(); // Click second checkbox, it should do nothing
      expect(checkBoxes[1].checked).toBe(false);
    });
  });
});
