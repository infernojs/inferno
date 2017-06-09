import { render } from 'inferno';
import Component from 'inferno-component';

describe('BUG: instance - null', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function () {
		container.innerHTML = '';
		document.body.removeChild(container);
	});

	const Triangle = ({ direction }) => (
		<svg className={`popover-triangle ${direction}`}>
			<polygon points={'0,0'}/>
		</svg>
	);

	function DropdownItem({ className, children, attached }) {
		return (
			<li ref={attached} className={`dd-item ${className}`}>
				{children}
			</li>
		);
	}

	class Icon extends Component {
		constructor(props, context) {
			super(props, context);
		}

		componentWillMount() {
		}

		render() {
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
					<use xlink:href={props.icon}/>
				</svg>
			);
		}
	}

	class Popover extends Component {
		constructor(props) {
			super(props);

			this.state = {
				placement: 'below'
			};

			// Element references
			this._elements = {
				popover: null,
				target: props.target || null,
				container: null,
				parentPopover: null,
				popoverBody: null
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

		_popoverRef(node) {
			this._elements.popover = node;
			if (node !== null) {
				this.setState({
					placement: ''
				});
			}
		}

		_refContainer(node) {
			this._elements.container = node;
		}

		_refPopoverBody(node) {
			this._elements.popoverBody = node;
		}

		_refTarget(node) {
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
		render() {
			const props = this.props;
			let popover = null,
				closeButton = null;

			if (props.isOpen) {
				let triangle = null;

				if (props.arrow !== false) {
					triangle = <Triangle direction={this.state.placement}/>;
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
				closeButton = <div className="inverse-action popover-close" onClick={props.onOuterAction}></div>;
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

	class Dropdown extends Component {
		constructor(props) {
			super(props);

			// Element references
			this._elements = {};
			this._elements.list = null;
			this._elements.activeNode = null;
			this._elements.bottomLoader = null;

			this.state = {
				isEditMode: false,
				editableText: '',
				activeValue: props.value,
				filteredItems: null,
				filteredCustomItems: null
			};

			this._popover = null;

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
		_closePopover(event, propagate) {
			if (!propagate) {
				event.stopPropagation();
			}

			this.setState({
				editableText: '',
				isEditMode: false,
				filteredItems: null,
				filteredCustomItems: null,
				activeValue: this.props.value
			});
		}

		_onDropDownCreating(node) {
			this._elements.list = node;
		}

		_onActiveItemAttached(node) {
			this._elements.activeNode = node;
		}

		_refPopover(instance) {
			this._popover = instance;
		}

		_refBottomLoader(node) {
			this._elements.bottomLoader = node;
		}

		_renderItems(searchText, activeValue) {
			const items = this.state.filteredItems || this.props.items || [];
			const itemsToRender = [];

			for (let i = 0; i < items.length; i++) {
				const item = items[ i ];
				const isActive = activeValue === item.value;

				itemsToRender.push(this._renderItem(item, i, items, isActive, searchText));
			}

			return itemsToRender;
		}

		_renderDropdown() {
			const currentState = this.state;

			// Shortcut dropdown rendering process when its not visible
			if (!currentState.isEditMode) {
				return null;
			}

			const props = this.props;
			const searchText = this.state.editableText;
			const activeValue = this.state.activeValue;
			// Render items
			const items = this._renderItems(searchText, activeValue);

			return (
				<ul
					className="editable-dropdown"
					ref={this._onDropDownCreating}>
					{items}
				</ul>
			);
		}

		_renderItem(dropdownItem, isActive) {
			return (
				<DropdownItem
					attached={isActive ? this._onActiveItemAttached : null}
					key={dropdownItem.value}
					item={dropdownItem}
					clickHandler={this._select}
					className={'dd-item-icon'}>
					<Icon className="dd-icon" icon={dropdownItem.icon}/>
					{dropdownItem.text}
				</DropdownItem>
			);
		}

		_makeEditable() {
			const state = this.state;
			const props = this.props;

			if (state.isEditMode) {
				return;
			}

			// Updating editable and changing into editmode
			this.setState({
				isEditMode: true,
				activeValue: props.value
			});
		}

//
// OVERRIDDEN FROM COMPONENT
//

		render() {
			return (
				<Popover
					ref={this._refPopover}
					arrow={true}
					align="begin"
					hasMobileClose={true}
					popoverClassName={this._popoverClassName}
					isOpen={this.state.isEditMode}
					body={this._renderDropdown()}
					onOuterAction={this._closePopover}>
					<div id="MAGICBUTTON" onclick={this.state.isEditMode ? this._closePopover : this._makeEditable}>
						TEST
					</div>
				</Popover>
			);
		}
	}


	it('Should not fail', (done) => {
		const items = [{
			text: 'Implementation',
			value: 'b73ea78d-350d-f764-e429-9bebd9d8b4b3',
			icon: '#user'
		}, { text: 'Issue', value: '4e0a069d-899a-418a-df27-8ff5ef18d459', icon: '#reminder' }, {
			text: 'LomaTaski',
			value: 'd9a54cc9-2a16-08e3-85da-c230b5d0b121',
			icon: '#favourite'
		}];
		const value = 'b73ea78d-350d-f764-e429-9bebd9d8b4b3';
		const text = 'pena';

		render(
			<div>
				<Dropdown
					items={items}
					changeCallback={function () {
					}}
					changeParams={{ guid: 'foo', field: 'activityType' }}
					value={value}
				/>
			</div>,
			container
		);

		setTimeout(function () {
			container.querySelector('#MAGICBUTTON').click();

			setTimeout(function () {
				container.querySelector('#MAGICBUTTON').click();

				setTimeout(function () {
					render(null, container);

					done();
				}, 10);
			}, 10);
		}, 10);
	});

	it('Should not fail #2', () => {
		const items = [{
			text: 'Implementation',
			value: 'b73ea78d-350d-f764-e429-9bebd9d8b4b3',
			icon: '#user'
		}, { text: 'Issue', value: '4e0a069d-899a-418a-df27-8ff5ef18d459', icon: '#reminder' }, {
			text: 'LomaTaski',
			value: 'd9a54cc9-2a16-08e3-85da-c230b5d0b121',
			icon: '#favourite'
		}];
		const value = 'b73ea78d-350d-f764-e429-9bebd9d8b4b3';
		const text = 'pena';

		render(
			<div>
				<Dropdown
					items={items}
					changeCallback={function () {
					}}
					changeParams={{ guid: 'foo', field: 'activityType' }}
					value={value}
				/>
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
		const items = [{
			text: 'Implementation',
			value: 'b73ea78d-350d-f764-e429-9bebd9d8b4b3',
			icon: '#user'
		}, { text: 'Issue', value: '4e0a069d-899a-418a-df27-8ff5ef18d459', icon: '#reminder' }, {
			text: 'LomaTaski',
			value: 'd9a54cc9-2a16-08e3-85da-c230b5d0b121',
			icon: '#favourite'
		}];
		const value = 'b73ea78d-350d-f764-e429-9bebd9d8b4b3';
		const text = 'pena';

		render(
			<div>
				<Dropdown
					items={items}
					changeCallback={function () {
					}}
					changeParams={{ guid: 'foo', field: 'activityType' }}
					value={value}
				/>
			</div>,
			container
		);

		container.querySelector('#MAGICBUTTON').click();


		render(
			<div>
				<Dropdown
					items={items}
					changeCallback={function () {
					}}
					changeParams={{ guid: 'dwqwdq', field: 'activityType' }}
					value={value}
				/>
			</div>,
			container
		);
	});
});
