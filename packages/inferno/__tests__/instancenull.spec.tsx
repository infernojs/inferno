import { Component, InfernoNode, render, rerender } from 'inferno';
import { triggerEvent } from 'inferno-utils';

describe('BUG: instance - null', () => {
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

  const Triangle = ({ direction }) => (
    <svg className={`popover-triangle ${direction}`}>
      <polygon points={'0,0'} />
    </svg>
  );

  function DropdownItem({ className, children, attached }) {
    return (
      <li ref={attached} className={`dd-item ${className}`}>
        {children}
      </li>
    );
  }

  interface IconProps {
    icon?: string;
  }

  class Icon extends Component<IconProps> {
    constructor(props, context) {
      super(props, context);
    }

    public componentWillMount() {}

    public render() {
      const props = this.props;

      if (!props.icon) {
        return null;
      }

      /*
       * FireFox v51.0 fixes issue with href
       * iOS still broken (21.1.2017)
       */

      return (
        <svg focusable="false" className={'svgicon'}>
          <use xlink:href={props.icon} />
        </svg>
      );
    }
  }

  interface PopoverProps {
    popoverClassName?: string;
    align?: string;
    arrow?: boolean;
    isOpen?: boolean;
    target?: HTMLDivElement | null;
    hasMobileClose?: boolean;
    body?: InfernoNode;
    onOuterAction?: (ev: any) => void;
  }

  interface PopoverState {
    placement: string;
  }

  class Popover extends Component<PopoverProps, PopoverState> {
    private _elements: {
      container: HTMLDivElement | null;
      parentPopover: HTMLDivElement | null;
      popover: HTMLDivElement | null;
      target: HTMLDivElement | null;
      popoverBody: HTMLDivElement | null;
    };

    public state: PopoverState;

    constructor(props) {
      super(props);

      this.state = {
        placement: 'below'
      };

      // Element references
      this._elements = {
        container: null,
        parentPopover: null,
        popover: null,
        popoverBody: null,
        target: props.target || null
      };

      // Lexical bindings
      this._refContainer = this._refContainer.bind(this);
      this._refTarget = this._refTarget.bind(this);
      this._refPopoverBody = this._refPopoverBody.bind(this);
      this._popoverRef = this._popoverRef.bind(this);
    }

    //
    // PRIVATE GETTER
    //

    //
    // Private
    //

    public _popoverRef(node) {
      this._elements.popover = node;
      if (node !== null) {
        this.setState({
          placement: ''
        });
      }
    }

    public _refContainer(node) {
      this._elements.container = node;
    }

    public _refPopoverBody(node) {
      this._elements.popoverBody = node;
    }

    public _refTarget(node) {
      if (!this.props.target) {
        this._elements.target = node;
      }
    }

    //
    // PRIVATE STATIC
    //

    //
    // OVERRIDEN FROM COMPONENT
    //
    public render() {
      const props = this.props;
      let popover = null;
      let closeButton = null;

      if (props.isOpen) {
        let triangle = null;

        if (props.arrow !== false) {
          triangle = <Triangle direction={this.state.placement} />;
        }

        popover = (
          <div ref={this._popoverRef} className="popover">
            <div className="popover-layer">
              {triangle}
              <div ref={this._refPopoverBody} className="popover-body">
                {props.body}
              </div>
            </div>
          </div>
        );
      }

      if (props.hasMobileClose) {
        closeButton = <div className="inverse-action popover-close" onClick={props.onOuterAction} />;
      }

      return (
        <div ref={this._refContainer} className="popover-placeholder">
          {closeButton}
          <div className="popover-target" ref={this._refTarget}>
            {props.children}
          </div>
          {popover}
        </div>
      );
    }
  }

  interface DropdownProps {
    items: {
      icon: string;
      text: string;
      value: string;
    }[];

    changeCallback?: () => void;
    changeParams?: unknown;
    value?: string;
  }

  interface DropdownState {
    activeValue?: string | null;
    editableText: string;
    isEditMode: boolean;
    filteredItems:
      | {
          icon: string;
          text: string;
          value: string;
        }[]
      | null;
  }

  class Dropdown extends Component<DropdownProps, DropdownState> {
    private _elements: { bottomLoader: null; activeNode: null; list: null };
    // @ts-expect-error
    private _popover: HTMLDivElement | null;

    public state: DropdownState;

    constructor(props) {
      super(props);

      // Element references
      this._elements = {
        activeNode: null,
        bottomLoader: null,
        list: null
      };

      this.state = {
        activeValue: props.value,
        editableText: '',
        filteredItems: null,
        isEditMode: false
      };

      // Lexical bindings
      this._closePopover = this._closePopover.bind(this);
      this._onActiveItemAttached = this._onActiveItemAttached.bind(this);
      this._onDropDownCreating = this._onDropDownCreating.bind(this);
      this._refPopover = this._refPopover.bind(this);
      this._refBottomLoader = this._refBottomLoader.bind(this);
      this._makeEditable = this._makeEditable.bind(this);
    }

    //
    // PRIVATE
    //

    // In some cases, we don't want to stop event propagation, f.e. listView editMode and movements with shift + TAB
    public _closePopover(event) {
      event.stopPropagation();

      this.setState({
        activeValue: this.props.value,
        editableText: '',
        filteredItems: null,
        isEditMode: false
      });
    }

    public _onDropDownCreating(node) {
      this._elements.list = node;
    }

    public _onActiveItemAttached(node) {
      this._elements.activeNode = node;
    }

    public _refPopover(instance) {
      this._popover = instance;
    }

    public _refBottomLoader(node) {
      this._elements.bottomLoader = node;
    }

    public _renderItems() {
      const items = this.state.filteredItems || this.props.items || [];
      const itemsToRender: InfernoNode[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        itemsToRender.push(this._renderItem(item, i));
      }

      return itemsToRender;
    }

    public _renderDropdown() {
      const currentState = this.state;

      // Shortcut dropdown rendering process when its not visible
      if (!currentState.isEditMode) {
        return null;
      }

      // Render items
      const items = this._renderItems();

      return (
        <ul className="editable-dropdown" ref={this._onDropDownCreating}>
          {items}
        </ul>
      );
    }

    public _renderItem(dropdownItem, isActive) {
      return (
        <DropdownItem attached={isActive ? this._onActiveItemAttached : null} key={dropdownItem.value} className={'dd-item-icon'}>
          <Icon icon={dropdownItem.icon} />
          {dropdownItem.text}
        </DropdownItem>
      );
    }

    public _makeEditable() {
      const state = this.state;
      const props = this.props;

      if (state.isEditMode) {
        return;
      }

      // Updating editable and changing into editmode
      this.setState({
        activeValue: props.value,
        isEditMode: true
      });
    }

    //
    // OVERRIDDEN FROM COMPONENT
    //

    public render() {
      return (
        <Popover
          ref={this._refPopover}
          arrow={true}
          align="begin"
          hasMobileClose={true}
          isOpen={this.state.isEditMode}
          body={this._renderDropdown()}
          onOuterAction={this._closePopover}
        >
          <div id="MAGICBUTTON" onclick={this.state.isEditMode ? this._closePopover : this._makeEditable}>
            TEST
          </div>
        </Popover>
      );
    }
  }

  it('Should not fail', () => {
    const items = [
      {
        icon: '#user',
        text: 'Implementation',
        value: 'b73ea78d-350d-f764-e429-9bebd9d8b4b3'
      },
      {
        icon: '#reminder',
        text: 'Issue',
        value: '4e0a069d-899a-418a-df27-8ff5ef18d459'
      },
      {
        icon: '#favourite',
        text: 'LomaTaski',
        value: 'd9a54cc9-2a16-08e3-85da-c230b5d0b121'
      }
    ];
    const value = 'b73ea78d-350d-f764-e429-9bebd9d8b4b3';

    render(
      <div>
        <Dropdown items={items} changeCallback={function () {}} changeParams={{ guid: 'foo', field: 'activityType' }} value={value} />
      </div>,
      container
    );

    triggerEvent('click', container.querySelector('#MAGICBUTTON'));

    rerender();
    expect(container.querySelectorAll('.dd-item').length).toBe(3);

    triggerEvent('click', container.querySelector('#MAGICBUTTON'));

    rerender();
    expect(container.querySelectorAll('.dd-item').length).toBe(0);

    rerender();
    triggerEvent('click', container.querySelector('#MAGICBUTTON'));

    expect(container.querySelectorAll('.dd-item').length).toBe(3);

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should not propagate mid/right mouse buttons clicks', (done) => {
    const obj = {
      spy() {}
    };
    const spy = spyOn(obj, 'spy');

    render(
      <div>
        <div onClick={spy} id="MAGICBUTTON">
          test
        </div>
      </div>,
      container
    );

    const event = document.createEvent('MouseEvents');
    // Simulate right click
    Object.defineProperty(event, 'button', {
      value: 2
    });

    // If changing button for click event is not supported, then we can skip this test.
    if (event.button === 0) {
      done();
      return;
    }

    event.initEvent('click', true, true);

    expect(spy.calls.count()).toBe(0);

    const node = container.querySelector('#MAGICBUTTON');
    node.dispatchEvent(event);

    setTimeout(function () {
      expect(spy.calls.count()).toBe(0);
      done();
    }, 10);
  });

  it('Should not fail #2', () => {
    const items = [
      {
        icon: '#user',
        text: 'Implementation',
        value: 'b73ea78d-350d-f764-e429-9bebd9d8b4b3'
      },
      {
        icon: '#reminder',
        text: 'Issue',
        value: '4e0a069d-899a-418a-df27-8ff5ef18d459'
      },
      {
        icon: '#favourite',
        text: 'LomaTaski',
        value: 'd9a54cc9-2a16-08e3-85da-c230b5d0b121'
      }
    ];
    const value = 'b73ea78d-350d-f764-e429-9bebd9d8b4b3';

    render(
      <div>
        <Dropdown items={items} changeCallback={function () {}} changeParams={{ guid: 'foo', field: 'activityType' }} value={value} />
      </div>,
      container
    );

    container.querySelector('#MAGICBUTTON').click();

    render(
      <div>
        <Icon />
      </div>,
      container
    );
  });

  it('Should not fail #3', () => {
    const items = [
      {
        icon: '#user',
        text: 'Implementation',
        value: 'b73ea78d-350d-f764-e429-9bebd9d8b4b3'
      },
      {
        icon: '#reminder',
        text: 'Issue',
        value: '4e0a069d-899a-418a-df27-8ff5ef18d459'
      },
      {
        icon: '#favourite',
        text: 'LomaTaski',
        value: 'd9a54cc9-2a16-08e3-85da-c230b5d0b121'
      }
    ];
    const value = 'b73ea78d-350d-f764-e429-9bebd9d8b4b3';

    render(
      <div>
        <Dropdown items={items} changeCallback={function () {}} changeParams={{ guid: 'foo', field: 'activityType' }} value={value} />
      </div>,
      container
    );

    container.querySelector('#MAGICBUTTON').click();

    render(
      <div>
        <Dropdown items={items} changeCallback={function () {}} changeParams={{ guid: 'dwqwdq', field: 'activityType' }} value={value} />
      </div>,
      container
    );
  });
});
