import { Component, render, rerender } from 'inferno';
import { createElement } from 'inferno-create-element';

describe('Callbacks in constructor', () => {
  // https://github.com/infernojs/inferno/issues/1103
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  describe('Github #1103', () => {
    it('Should be possible to call callbacks from Component constructor - Use case 1', () => {
      function InfoLi(props) {
        const iddy = props.conf.key;
        return (
          <li>
            <input
              id={iddy}
              type="checkbox"
              checked={props.checked}
              onClick={props.onChange}
            />
            <label for={iddy}>{props.conf.label}</label>
            <div>{props.children}</div>
          </li>
        );
      }

      interface ConfigsListProps {
        onConfChanged: (arg: {
          targetIndex: number;
          newValue: unknown;
        }) => void;
        configs: unknown[];
      }
      interface ConfigsListState {
        checks: boolean[];
      }

      class ConfigsList extends Component<ConfigsListProps, ConfigsListState> {
        public state: ConfigsListState;

        constructor(props) {
          super(props);
          this.state = {
            checks: props.configs.map((conf) => Boolean(conf.value)),
          };
        }

        public handleCheck(index, ifChecked) {
          this.setState({
            checks: this.state.checks.map((ch, i) =>
              i === index ? ifChecked : ch,
            ),
          });
        }

        public handleNewValue(index, newValue) {
          this.props.onConfChanged({
            newValue,
            targetIndex: index,
          });
        }

        public render(props) {
          return (
            <ol>
              {props.configs.map((conf, index) => {
                const childElement = props.configToChild?.[conf.key];

                const child =
                  childElement &&
                  this.state.checks[index] &&
                  createElement(childElement, {
                    ...props,
                    conf,
                    onNewValue: (newValue) => {
                      this.handleNewValue(index, newValue);
                    },
                  });

                return (
                  <InfoLi
                    conf={conf}
                    checked={conf.value}
                    onChange={(event) => {
                      this.handleCheck(index, event.target.checked);
                    }}
                  >
                    {child}
                  </InfoLi>
                );
              })}
            </ol>
          );
        }
      }

      interface ProxyEditorProps {
        onNewValue: (arg: string) => void;
      }

      class ProxyEditor extends Component<ProxyEditorProps> {
        constructor(props) {
          super(props);

          const oldValue = props.conf.value;
          const newValue = oldValue || 'BA BA BA!';
          if (!oldValue) {
            this.props.onNewValue(newValue);
          }
        }

        public render() {
          return <div />;
        }
      }

      interface MainState {
        configs: Array<{
          category: string;
          key: string;
          label: string;
          value: boolean;
        }>;
      }

      class Main extends Component<any, MainState> {
        public state: MainState;

        constructor(props) {
          super(props);
          this.state = {
            configs: [
              {
                category: 'ownProxies',
                key: 'customProxyStringRaw',
                label: 'Use proxy? (click this)',
                value: false,
              },
              {
                category: 'ownProxies',
                key: 'This one is needed for reproduction too!',
                label: 'needed too',
                value: false,
              },
            ],
          };
          this.handleModChange = this.handleModChange.bind(this);
        }

        public handleModChange({ targetIndex, newValue }) {
          this.setState({
            configs: this.state.configs.map((oldConf, index) =>
              index !== targetIndex ? oldConf : { ...oldConf, value: newValue },
            ),
          });
        }

        public render(props) {
          return createElement(ConfigsList, {
            ...props,
            configToChild: {
              customProxyStringRaw: ProxyEditor,
            },
            configs: this.state.configs,
            onConfChanged: this.handleModChange,
          });
        }
      }

      render(<Main />, container);

      // Renders correctly
      expect(container.innerHTML).toBe(
        '<ol><li><input id="customProxyStringRaw" type="checkbox"><label for="customProxyStringRaw">Use proxy? (click this)</label><div></div></li><li><input id="This one is needed for reproduction too!" type="checkbox"><label for="This one is needed for reproduction too!">needed too</label><div></div></li></ol>',
      );

      let checkBoxes = container.querySelectorAll('input');

      expect(checkBoxes.length).toBe(2);

      expect(checkBoxes[0].checked).toBe(false);
      expect(checkBoxes[1].checked).toBe(false);

      checkBoxes[0].click(); // Click first checkbox
      rerender();
      checkBoxes = container.querySelectorAll('input');

      expect(checkBoxes.length).toBe(2);

      expect(checkBoxes[0].checked).toBe(true);
      expect(checkBoxes[1].checked).toBe(false);

      checkBoxes[0].click(); // Click first checkbox again
      rerender();
      checkBoxes = container.querySelectorAll('input');

      expect(checkBoxes.length).toBe(2);

      expect(checkBoxes[0].checked).toBe(true); // This is current expected behavior, same as React
      expect(checkBoxes[1].checked).toBe(false);

      checkBoxes[1].click(); // Click second checkbox, it should do nothing
      rerender();
      expect(checkBoxes[1].checked).toBe(false);
    });
  });
});
