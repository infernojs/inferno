import { render } from './../../../DOM/rendering';
import { createVTemplate, createVElement, createVComponent } from './../../../core/shapes';
import { createTemplateReducers } from './../../../DOM/templates';

const Inferno = {
	createVTemplate,
	createVElement,
	createVComponent
};
const InfernoDOM = {
	createTemplateReducers
};

function runBenchmark(container) {
	var Link0 = function () {
		return <a href2={"/"} className={"_5ljn"} rel={undefined} onClick={function () { } }></a>;
	}

	var ReactImage1 = function () {
		return <i alt={""} className={"_3-99 img sp_UuU9HmrQ397 sx_7e56e9"} src={null}></i>;
	}

	var Link2 = function () {
		return (
			<a style={{ "maxWidth": "200px" }} image={null} label={null} imageRight={{}} className={"_387r _55pi _2agf _387r _55pi _4jy0 _4jy3 _517h _51sy _42ft"} href2={"#"} haschevron={true} onClick={function () { } } onToggle={function () { } } size={"medium"} use={"default"} borderShade={"light"} suppressed={false} disabled={null} rel={undefined}>
				{null}
				<span className={"_55pe"} style={{ "maxWidth": "186px" }}>
					{null}
					{"Dick Madanson (10149999073643408)"}
				</span>
				<ReactImage1 />
			</a>
		);
	}

	var AbstractButton3 = function () {
		return <Link2 />;
	}

	var XUIButton4 = function () {
		return <AbstractButton3 />;
	}

	var AbstractPopoverButton5 = function () {
		return <XUIButton4 />;
	}

	var ReactXUIPopoverButton6 = function () {
		return <AbstractPopoverButton5 />;
	}

	var AdsPEAccountSelector7 = function () {
		return <ReactXUIPopoverButton6 ref2={"button"} />;
	}

	var AdsPEAccountSelectorContainer8 = function () {
		return <AdsPEAccountSelector7 />;
	}

	var AbstractButton9 = function () {
		return (
			<button id={"downloadButton"} className={"_5lk0 _4jy0 _4jy3 _517h _51sy _42ft"} label={null} onClick={function () { } } use={"default"} size={"medium"} borderShade={"light"} suppressed={false} type={"submit"} value={"1"}>
				{undefined}
				{"Download to Power Editor"}
				{undefined}
			</button>
		);
	}

	var XUIButton10 = function () {
		return <AbstractButton9 />;
	}

	var DownloadUploadTimestamp11 = function () {
		return (
			<div>
				{"Last downloaded"}
				{" "}
				<abbr className={"livetimestamp"} data-utime={1446062352} data-shorten={false}>{"a few seconds ago"}</abbr>
			</div>
		);
	}

	var ReactImage12 = function () {
		return <i alt={""} className={"_3-8_ img sp_UuU9HmrQ397 sx_dbc06a"} src={null}></i>;
	}

	var AbstractButton13 = function () {
		return (
			<button id={"uploadButton"} className={"_5lk0 _4jy0 _4jy3 _517h _51sy _42ft"} image={{}} use={"default"} label={null} onClick={function () { } } size={"medium"} borderShade={"light"} suppressed={false} type={"submit"} value={"1"}>
				<ReactImage12 />
				{"Upload Changes"}
				{undefined}
			</button>
		);
	}

	var XUIButton14 = function () {
		return <AbstractButton13 />;
	}

	var DownloadUploadTimestamp15 = function () {
		return <div></div>;
	}

	var AbstractButton16 = function () {
		return (
			<button className={"_5ljz _4jy0 _4jy3 _517h _51sy _42ft"} label={null} onClick={function () { } } use={"default"} size={"medium"} borderShade={"light"} suppressed={false} type={"submit"} value={"1"}>
				{undefined}
				{"Help"}
				{undefined}
			</button>
		);
	}

	var XUIButton17 = function () {
		return <AbstractButton16 />;
	}

	var ReactImage18 = function () {
		return <i src={null} className={"img sp_UuU9HmrQ397 sx_d5a685"}></i>;
	}

	var AbstractButton19 = function () {
		return (
			<button className={"_5ljw _p _4jy0 _4jy3 _517h _51sy _42ft"} image={{}} use={"default"} size={"medium"} borderShade={"light"} suppressed={false} label={null} type={"submit"} value={"1"}>
				<ReactImage18 />
				{undefined}
				{undefined}
			</button>
		);
	}

	var XUIButton20 = function () {
		return <AbstractButton19 />;
	}

	var InlineBlock21 = function () {
		return (
			<div className={"_5ljz uiPopover _6a _6b"} alignh={"right"} menu={{}} alignv={"middle"} disabled={null} fullWidth={false}>
				<XUIButton20 key={"/.0"} />
			</div>
		);
	}

	var ReactPopoverMenu22 = function () {
		return <InlineBlock21 ref2={"root"} />;
	}

	var XUIButtonGroup23 = function () {
		return (
			<div className={"_13xj _51xa"} id={"helpButton"}>
				<XUIButton17 />
				<ReactPopoverMenu22 />
			</div>
		);
	}

	var AdsPEResetDialog24 = function () {
		return <span></span>;
	}

	var AdsPETopNav25 = function () {
		return (
			<div className={"_5ljl"} id={"ads_pe_top_nav"}>
				<div ref2={"logo"} className={"_5ljm"}>
					<Link0 />
					<div className={"_5rne"}>
						<span className={"_5ljs"} data-testid={"PETopNavLogoText"}>{"Power Editor"}</span>
					</div>
					<span className={"_5ljt _5lju"}>{"Dick Madanson"}</span>
				</div>
				<div ref2={"leftButtonGroup"} className={"_5ljy"}>
					<div ref2={"accountDropdown"} className={"_5ljz _5mun"}>
						<AdsPEAccountSelectorContainer8 />
						<div className={"_5lj- _5lju"}>{"Account 10149999073643408"}</div>
					</div>
					<div className={"_5ljz"}>
						<div className={"_5lj_"}>
							<XUIButton10 />
						</div>
						<div className={"_5lj- _5lju"}>
							<DownloadUploadTimestamp11 />
						</div>
					</div>
					<div className={"_5ljz"}>
						<div className={"_5lj_"}>
							<XUIButton14 />
						</div>
						<div className={"_5lj- _5lju"}>
							<DownloadUploadTimestamp15 />
						</div>
					</div>
				</div>
				<div ref2={"rightButtonGroup"} className={"_5lk3"}>
					<XUIButtonGroup23 />
				</div>
				<AdsPEResetDialog24 />
			</div>
		);
	}

	var FluxContainer_ja_26 = function () {
		return <AdsPETopNav25 />;
	}

	var _wrapper27 = function () {
		return (
			<li selected={true} focused={false} tabIndex={null} hideFocusRing={true} onClick={function () { } } onMouseDown={function () { } } onFocus={function () { } } onBlur={function () { } } className={"_5vwz _5vwy _45hc _1hqh"} wrapper={function () { } } shouldWrapTab={true} mockSpacebarClick={true} role={"presentation"}>
				<a ref2={"tab"} ajaxify={undefined} href2={"#"} role={"tab"} rel={undefined} target={undefined} tabIndex={0} className={""} aria-selected={true} onKeyDown={function () { } }>
					<div className={"_4jq5"}>{"Manage Ads"}</div>
					<span className={"_13xf"}></span>
				</a>
			</li>
		);
	}

	var TabBarItem28 = function () {
		return <_wrapper27 />;
	}

	var XUIPageNavigationItem29 = function () {
		return <TabBarItem28 />;
	}

	var TabBarItemWrapper30 = function () {
		return <XUIPageNavigationItem29 key={"MANAGE_ADS"} />;
	}

	var _wrapper31 = function () {
		return (
			<li selected={false} focused={false} tabIndex={null} hideFocusRing={true} onClick={function () { } } onMouseDown={function () { } } onFocus={function () { } } onBlur={function () { } } className={"_5vwz _45hc"} wrapper={function () { } } shouldWrapTab={true} mockSpacebarClick={true} role={"presentation"}>
				<a ref2={"tab"} ajaxify={undefined} href2={"#"} role={"tab"} rel={undefined} target={undefined} tabIndex={-1} className={""} aria-selected={false} onKeyDown={function () { } }>
					<div className={"_4jq5"}>{"Audiences"}</div>
					<span className={"_13xf"}></span>
				</a>
			</li>
		);
	}

	var TabBarItem32 = function () {
		return <_wrapper31 />;
	}

	var XUIPageNavigationItem33 = function () {
		return <TabBarItem32 />;
	}

	var TabBarItemWrapper34 = function () {
		return <XUIPageNavigationItem33 key={"AUDIENCES"} />;
	}

	var _wrapper35 = function () {
		return (
			<li selected={false} focused={false} tabIndex={null} hideFocusRing={true} onClick={function () { } } onMouseDown={function () { } } onFocus={function () { } } onBlur={function () { } } className={"_5vwz _45hc"} wrapper={function () { } } shouldWrapTab={true} mockSpacebarClick={true} role={"presentation"}>
				<a ref2={"tab"} ajaxify={undefined} href2={"#"} role={"tab"} rel={undefined} target={undefined} tabIndex={-1} className={""} aria-selected={false} onKeyDown={function () { } }>
					<div className={"_4jq5"}>{"Image Library"}</div>
					<span className={"_13xf"}></span>
				</a>
			</li>
		);
	}

	var TabBarItem36 = function () {
		return <_wrapper35 />;
	}

	var XUIPageNavigationItem37 = function () {
		return <TabBarItem36 />;
	}

	var TabBarItemWrapper38 = function () {
		return <XUIPageNavigationItem37 key={"IMAGES"} />;
	}

	var _wrapper39 = function () {
		return (
			<li selected={false} focused={false} tabIndex={null} hideFocusRing={true} onClick={function () { } } onMouseDown={function () { } } onFocus={function () { } } onBlur={function () { } } className={"_5vwz _45hc"} wrapper={function () { } } shouldWrapTab={true} mockSpacebarClick={true} role={"presentation"}>
				<a ref2={"tab"} ajaxify={undefined} href2={"#"} role={"tab"} rel={undefined} target={undefined} tabIndex={-1} className={""} aria-selected={false} onKeyDown={function () { } }>
					<div className={"_4jq5"}>
						{"Reporting"}
						{null}
					</div>
					<span className={"_13xf"}></span>
				</a>
			</li>
		);
	}

	var TabBarItem40 = function () {
		return <_wrapper39 />;
	}

	var XUIPageNavigationItem41 = function () {
		return <TabBarItem40 />;
	}

	var TabBarItemWrapper42 = function () {
		return <XUIPageNavigationItem41 key={"REPORTING"} />;
	}

	var _wrapper43 = function () {
		return (
			<li selected={false} focused={false} tabIndex={null} hideFocusRing={true} onClick={function () { } } onMouseDown={function () { } } onFocus={function () { } } onBlur={function () { } } className={"_5vwz _45hc"} wrapper={function () { } } shouldWrapTab={true} mockSpacebarClick={true} role={"presentation"}>
				<a ref2={"tab"} ajaxify={undefined} href2={"#"} role={"tab"} rel={undefined} target={undefined} tabIndex={-1} className={""} aria-selected={false} onKeyDown={function () { } }>
					<div className={"_4jq5"}>{"Page Posts"}</div>
					<span className={"_13xf"}></span>
				</a>
			</li>
		);
	}

	var TabBarItem44 = function () {
		return <_wrapper43 />;
	}

	var XUIPageNavigationItem45 = function () {
		return <TabBarItem44 />;
	}

	var TabBarItemWrapper46 = function () {
		return <XUIPageNavigationItem45 key={"PAGES"} />;
	}

	var TabBarItem47 = function () {
		return (
			<a ref2={"tab"} menuClassName={undefined} selected={false} focused={false} hideFocusRing={true} onMouseDown={function () { } } onFocus={function () { } } onBlur={function () { } } label={"Tools"} tabComponent={function () { } } shouldWrapTab={false} className={"_45hd _45hc _p _45hc"} tabIndex={-1} mockSpacebarClick={false} wrapper={function () { } } href2={"#"} role={"tab"} aria-selected={false}>
				<span className={"_1b0"}>
					{"Tools"}
					<span className={"accessible_elem"}>{"additional tabs menu"}</span>
				</span>
			</a>
		);
	}

	var InlineBlock48 = function () {
		return (
			<div menu={{}} layerBehaviors={{}} alignv={"middle"} className={"uiPopover _6a _6b"} disabled={null} fullWidth={false}>
				<TabBarItem47 key={"/.0"} />
			</div>
		);
	}

	var ReactPopoverMenu49 = function () {
		return <InlineBlock48 ref2={"root"} />;
	}

	var TabBarDropdownItem50 = function () {
		return (
			<li className={" _45hd"} role={"tab"}>
				<ReactPopoverMenu49 />
			</li>
		);
	}

	var TabBar51 = function () {
		return (
			<ul onTabClick={function () { } } activeTabKey={"MANAGE_ADS"} onWidthCalculated={function () { } } width={null} maxTabsVisible={5} moreLabel={"Tools"} alwaysShowActive={true} dropdownTabComponent={function () { } } shouldCalculateVisibleTabs={true} className={"_43o4"} role={"tablist"} onKeyDown={function () { } } onKeyUp={function () { } }>
				<TabBarItemWrapper30 key={"MANAGE_ADS"} />
				<TabBarItemWrapper34 key={"AUDIENCES"} />
				<TabBarItemWrapper38 key={"IMAGES"} />
				<TabBarItemWrapper42 key={"REPORTING"} />
				<TabBarItemWrapper46 key={"PAGES"} />
				<TabBarDropdownItem50 key={"_dropdown"} ref2={"more"} />
			</ul>
		);
	}

	var XUIPageNavigationGroup52 = function () {
		return <TabBar51 ref2={"bar"} />;
	}

	var LeftRight53 = function () {
		return (
			<div className={"_5vx7 clearfix"}>
				<div key={"left"} className={"_ohe lfloat"}>
					<XUIPageNavigationGroup52 key={"0"} ref2={"left"} />
				</div>
				{null}
			</div>
		);
	}

	var XUIPageNavigation54 = function () {
		return (
			<div className={"_5vx2 _5vx4 _5vx6 _5kkt"}>
				<LeftRight53 />
			</div>
		);
	}

	var AdsPENavigationBar55 = function () {
		return (
			<div className={"_5_a"} id={"ads_pe_navigation_bar"}>
				<XUIPageNavigation54 />
			</div>
		);
	}

	var FluxContainer_w_56 = function () {
		return <AdsPENavigationBar55 />;
	}

	var ReactImage57 = function () {
		return (
			<i alt={"Warning"} className={"_585p img sp_R48dKBxiJkP sx_aed870"} src={null}>
				<u>{"Warning"}</u>
			</i>
		);
	}

	var Link58 = function () {
		return (
			<a className={"_585q _50zy _50-0 _50z- _5upp _42ft"} href2={"#"} onClick={function () { } } size={"medium"} shade={"dark"} type={null} label={null} title={"Remove"} aria-label={undefined} data-hover={undefined} data-tooltip-alignh={undefined} disabled={null} rel={undefined}>
				{undefined}
				{"Remove"}
				{undefined}
			</a>
		);
	}

	var AbstractButton59 = function () {
		return <Link58 />;
	}

	var XUIAbstractGlyphButton60 = function () {
		return <AbstractButton59 />;
	}

	var XUICloseButton61 = function () {
		return <XUIAbstractGlyphButton60 />;
	}

	var XUIText62 = function () {
		return <span weight={"bold"} size={"inherit"} display={"inline"} className={" _50f7"}>{"Ads Manager"}</span>;
	}

	var Link63 = function () {
		return (
			<a href2={"/ads/manage/billing.php?act=10149999073643408"} target={"_blank"} rel={undefined} onClick={function () { } }>
				<XUIText62 />
			</a>
		);
	}

	var XUINotice64 = function () {
		return (
			<div size={"medium"} className={"_585n _585o _2wdd"}>
				<ReactImage57 />
				<XUICloseButton61 />
				<div className={"_585r _2i-a _50f4"}>
					{"Please go to "}
					<Link63 />
					{" to set up a payment method for this ad account."}
				</div>
			</div>
		);
	}

	var ReactCSSTransitionGroupChild65 = function () {
		return <XUINotice64 />;
	}

	var ReactTransitionGroup66 = function () {
		return (
			<span transitionEnterTimeout={500} transitionLeaveTimeout={500} transitionName={{}} transitionAppear={false} transitionEnter={true} transitionLeave={true} childFactory={function () { } } component={"span"}>
				<ReactCSSTransitionGroupChild65 key={".0"} ref2={".0"} />
			</span>
		);
	}

	var ReactCSSTransitionGroup67 = function () {
		return <ReactTransitionGroup66 />;
	}

	var AdsPETopError68 = function () {
		return (
			<div className={"_2wdc"}>
				<ReactCSSTransitionGroup67 />
			</div>
		);
	}

	var FluxContainer_r_69 = function () {
		return <AdsPETopError68 />;
	}

	var ReactImage70 = function () {
		return <i className={"_3-8_ img sp_UuU9HmrQ397 sx_bae57d"} src={null}></i>;
	}

	var ReactImage71 = function () {
		return <i alt={""} className={"_3-99 img sp_UuU9HmrQ397 sx_7e56e9"} src={null}></i>;
	}

	var Link72 = function () {
		return (
			<a style={{ "maxWidth": "200px" }} image={null} label={null} imageRight={{}} className={" _5bbf _55pi _2agf  _5bbf _55pi _4jy0 _4jy4 _517h _51sy _42ft"} href2={"#"} haschevron={true} onClick={function () { } } size={"large"} use={"default"} borderShade={"light"} suppressed={false} disabled={null} rel={undefined}>
				{null}
				<span className={"_55pe"} style={{ "maxWidth": "186px" }}>
					<ReactImage70 />
					{"Search"}
				</span>
				<ReactImage71 />
			</a>
		);
	}

	var AbstractButton73 = function () {
		return <Link72 />;
	}

	var XUIButton74 = function () {
		return <AbstractButton73 />;
	}

	var AbstractPopoverButton75 = function () {
		return <XUIButton74 />;
	}

	var ReactXUIPopoverButton76 = function () {
		return <AbstractPopoverButton75 />;
	}

	var ReactImage77 = function () {
		return <i className={"_3-8_ img sp_UuU9HmrQ397 sx_81d5f0"} src={null}></i>;
	}

	var ReactImage78 = function () {
		return <i alt={""} className={"_3-99 img sp_UuU9HmrQ397 sx_7e56e9"} src={null}></i>;
	}

	var Link79 = function () {
		return (
			<a style={{ "maxWidth": "200px" }} image={null} label={null} imageRight={{}} className={" _5bbf _55pi _2agf  _5bbf _55pi _4jy0 _4jy4 _517h _51sy _42ft"} href2={"#"} haschevron={true} onClick={function () { } } size={"large"} use={"default"} borderShade={"light"} suppressed={false} disabled={null} rel={undefined}>
				{null}
				<span className={"_55pe"} style={{ "maxWidth": "186px" }}>
					<ReactImage77 />
					{"Filters"}
				</span>
				<ReactImage78 />
			</a>
		);
	}

	var AbstractButton80 = function () {
		return <Link79 />;
	}

	var XUIButton81 = function () {
		return <AbstractButton80 />;
	}

	var AbstractPopoverButton82 = function () {
		return <XUIButton81 />;
	}

	var ReactXUIPopoverButton83 = function () {
		return <AbstractPopoverButton82 />;
	}

	var AdsPEFiltersPopover84 = function () {
		return (
			<span className={"_5b-l  _5bbe"}>
				<ReactXUIPopoverButton76 ref2={"searchButton"} />
				<ReactXUIPopoverButton83 ref2={"filterButton"} />
			</span>
		);
	}

	var ReactImage85 = function () {
		return <i className={"_3yz6 _5whs img sp_UuU9HmrQ397 sx_5fe5c2"} src={null}></i>;
	}

	var AbstractButton86 = function () {
		return (
			<button className={"_3yz9 _1t-2 _50z_ _50zy _50zz _50z- _5upp _42ft"} size={"small"} onClick={function () { } } shade={"dark"} type={"button"} label={null} title={"Remove"} aria-label={undefined} data-hover={undefined} data-tooltip-alignh={undefined}>
				{undefined}
				{"Remove"}
				{undefined}
			</button>
		);
	}

	var XUIAbstractGlyphButton87 = function () {
		return <AbstractButton86 />;
	}

	var XUICloseButton88 = function () {
		return <XUIAbstractGlyphButton87 />;
	}

	var ReactImage89 = function () {
		return <i className={"_5b5p _4gem img sp_UuU9HmrQ397 sx_5fe5c2"} src={null}></i>;
	}

	var ReactImage90 = function () {
		return <i src={null} className={"_541d img sp_R48dKBxiJkP sx_dc2cdb"}></i>;
	}

	var AdsPopoverLink91 = function () {
		return (
			<span ref2={"tipIcon"} onMouseEnter={function () { } } onMouseLeave={function () { } }>
				<span className={"_3o_j"}></span>
				<ReactImage90 />
			</span>
		);
	}

	var AdsHelpLink92 = function () {
		return <AdsPopoverLink91 />;
	}

	var AbstractButton93 = function () {
		return (
			<button className={"_5b5u _5b5v _4jy0 _4jy3 _517h _51sy _42ft"} label={null} use={"default"} onClick={function () { } } size={"medium"} borderShade={"light"} suppressed={false} type={"submit"} value={"1"}>
				{undefined}
				{"Apply"}
				{undefined}
			</button>
		);
	}

	var XUIButton94 = function () {
		return <AbstractButton93 />;
	}

	var BUIFilterTokenInput95 = function () {
		return (
			<div className={"_5b5o _3yz3 _4cld"}>
				<div className={"_5b5t _2d2k"}>
					<ReactImage89 />
					<div className={"_5b5r"}>
						{"Ads: (1)"}
						<AdsHelpLink92 />
					</div>
				</div>
				<XUIButton94 />
			</div>
		);
	}

	var BUIFilterToken96 = function () {
		return (
			<div className={"_3yz1 _3yz2 _3dad"}>
				<div ref2={"filterToken"} className={"_3yz4"} aria-hidden={false}>
					<div onClick={function () { } } className={"_3yz5"}>
						<ReactImage85 />
						<div className={"_3yz7"}>{"Ads:"}</div>
						<div className={"ellipsis _3yz8"} data-hover={"tooltip"} data-tooltip-display={"overflow"}>{"(1)"}</div>
					</div>
					<XUICloseButton88 />
				</div>
				<BUIFilterTokenInput95 ref2={"filterTokenInput"} />
			</div>
		);
	}

	var ReactImage97 = function () {
		return <i src={null} className={"img sp_UuU9HmrQ397 sx_158e8d"}></i>;
	}

	var AbstractButton98 = function () {
		return (
			<button className={"_1wdf _4jy0 _517i _517h _51sy _42ft"} size={"small"} onClick={function () { } } image={{}} use={"default"} borderShade={"light"} suppressed={false} label={null} type={"submit"} value={"1"}>
				<ReactImage97 />
				{undefined}
				{undefined}
			</button>
		);
	}

	var XUIButton99 = function () {
		return <AbstractButton98 />;
	}

	var BUIFilterTokenCreateButton100 = function () {
		return (
			<div className={"_1tc"}>
				<XUIButton99 />
			</div>
		);
	}

	var BUIFilterTokenizer101 = function () {
		return (
			<div className={"_5b-m _3o1v clearfix"}>
				{undefined}
				{[]}
				<BUIFilterToken96 key={"token0"} />
				<BUIFilterTokenCreateButton100 />
				{null}
				<div className={"_49u3"}></div>
			</div>
		);
	}

	var AdsPEAmbientNUXMegaphone102 = function () {
		return <span ref2={"mainChild"}></span>;
	}

	var AdsPEFilters103 = function () {
		return (
			<div className={"_4rw_"}>
				<AdsPEFiltersPopover84 />
				{null}
				<BUIFilterTokenizer101 />
				{""}
				<AdsPEAmbientNUXMegaphone102 />
			</div>
		);
	}

	var AdsPEFilterContainer104 = function () {
		return <AdsPEFilters103 />;
	}

	var AdsPECampaignTimeLimitNotice105 = function () {
		return <div></div>;
	}

	var AdsPECampaignTimeLimitNoticeContainer106 = function () {
		return <AdsPECampaignTimeLimitNotice105 />;
	}

	var AdsPETablePager107 = function () {
		return null;
	}

	var AdsPEAdgroupTablePagerContainer108 = function () {
		return <AdsPETablePager107 />;
	}

	var AdsPETablePagerContainer109 = function () {
		return <AdsPEAdgroupTablePagerContainer108 />;
	}

	var ReactImage110 = function () {
		return <i alt={""} className={"_3-99 img sp_UuU9HmrQ397 sx_132804"} src={null}></i>;
	}

	var Link111 = function () {
		return (
			<a style={{ "maxWidth": "200px" }} image={null} label={null} imageRight={{}} className={"_55pi _2agf _55pi _4jy0 _4jy4 _517h _51sy _42ft"} href2={"#"} disabled={null} maxwidth={undefined} size={"large"} suppressed={false} chevron={{}} use={"default"} borderShade={"light"} onClick={function () { } } rel={undefined}>
				{null}
				<span className={"_55pe"} style={{ "maxWidth": "186px" }}>
					{null}
					{"Lifetime"}
				</span>
				<ReactImage110 />
			</a>
		);
	}

	var AbstractButton112 = function () {
		return <Link111 />;
	}

	var XUIButton113 = function () {
		return <AbstractButton112 />;
	}

	var AbstractPopoverButton114 = function () {
		return <XUIButton113 />;
	}

	var ReactXUIPopoverButton115 = function () {
		return <AbstractPopoverButton114 />;
	}

	var XUISingleSelectorButton116 = function () {
		return <ReactXUIPopoverButton115 />;
	}

	var InlineBlock117 = function () {
		return (
			<div className={"_3c5o _3c5p _6a _6b"} defaultValue={"LIFETIME"} size={"large"} onChange={function () { } } disabled={false} alignv={"middle"} fullWidth={false}>
				<input type={"hidden"} autoComplete={"off"} name={undefined} value={"LIFETIME"}></input>
				<XUISingleSelectorButton116 ref2={"button"} />
			</div>
		);
	}

	var XUISingleSelector118 = function () {
		return <InlineBlock117 />;
	}

	var ReactImage119 = function () {
		return <i src={null} className={"img sp_UuU9HmrQ397 sx_6c732d"}></i>;
	}

	var AbstractButton120 = function () {
		return (
			<button aria-label={"List Settings"} className={"_u_k _3c5o _1-r0 _4jy0 _4jy4 _517h _51sy _42ft"} data-hover={"tooltip"} image={{}} size={"large"} onClick={function () { } } use={"default"} borderShade={"light"} suppressed={false} label={null} type={"submit"} value={"1"}>
				<ReactImage119 />
				{undefined}
				{undefined}
			</button>
		);
	}

	var XUIButton121 = function () {
		return <AbstractButton120 />;
	}

	var AdsPEStatRange122 = function () {
		return (
			<div className={"_3c5k"}>
				<span className={"_3c5j"}>{"Stats:"}</span>
				<span className={"_3c5l"}>
					<XUISingleSelector118 key={"range"} />
					{null}
					<XUIButton121 key={"settings"} />
				</span>
			</div>
		);
	}

	var AdsPEStatRangeContainer123 = function () {
		return <AdsPEStatRange122 />;
	}

	var Column124 = function () {
		return (
			<div className={"_4bl8 _4bl7"}>
				<div className={"_3c5f"}>
					{null}
					<AdsPETablePagerContainer109 />
					<div className={"_3c5i"}></div>
					<AdsPEStatRangeContainer123 />
				</div>
			</div>
		);
	}

	var ReactImage125 = function () {
		return <i alt={""} className={"_3-8_ img sp_UuU9HmrQ397 sx_158e8d"} src={null}></i>;
	}

	var AbstractButton126 = function () {
		return (
			<button className={"_u_k _4jy0 _4jy4 _517h _51sy _42ft"} label={null} size={"large"} onClick={function () { } } image={{}} use={"default"} borderShade={"light"} suppressed={false} type={"submit"} value={"1"}>
				<ReactImage125 />
				{"Create Ad"}
				{undefined}
			</button>
		);
	}

	var XUIButton127 = function () {
		return <AbstractButton126 />;
	}

	var ReactImage128 = function () {
		return <i src={null} className={"img sp_UuU9HmrQ397 sx_d5a685"}></i>;
	}

	var AbstractButton129 = function () {
		return (
			<button className={"_u_k _p _4jy0 _4jy4 _517h _51sy _42ft"} image={{}} size={"large"} use={"default"} borderShade={"light"} suppressed={false} label={null} type={"submit"} value={"1"}>
				<ReactImage128 />
				{undefined}
				{undefined}
			</button>
		);
	}

	var XUIButton130 = function () {
		return <AbstractButton129 />;
	}

	var InlineBlock131 = function () {
		return (
			<div menu={{}} alignh={"right"} layerBehaviors={{}} alignv={"middle"} className={"uiPopover _6a _6b"} disabled={null} fullWidth={false}>
				<XUIButton130 key={"/.0"} />
			</div>
		);
	}

	var ReactPopoverMenu132 = function () {
		return <InlineBlock131 ref2={"root"} />;
	}

	var XUIButtonGroup133 = function () {
		return (
			<div className={"_5n7z _51xa"}>
				<XUIButton127 />
				<ReactPopoverMenu132 />
			</div>
		);
	}

	var ReactImage134 = function () {
		return <i alt={""} className={"_3-8_ img sp_UuU9HmrQ397 sx_990b54"} src={null}></i>;
	}

	var AbstractButton135 = function () {
		return (
			<button size={"large"} disabled={false} className={"_d2_ _u_k _5n7z _4jy0 _4jy4 _517h _51sy _42ft"} image={{}} data-hover={"tooltip"} aria-label={"Edit Ads (Ctrl+U)"} onClick={function () { } } use={"default"} label={null} borderShade={"light"} suppressed={false} type={"submit"} value={"1"}>
				<ReactImage134 />
				{"Edit"}
				{undefined}
			</button>
		);
	}

	var XUIButton136 = function () {
		return <AbstractButton135 />;
	}

	var ReactImage137 = function () {
		return <i src={null} className={"img sp_UuU9HmrQ397 sx_203adb"}></i>;
	}

	var AbstractButton138 = function () {
		return (
			<button aria-label={"Duplicate"} className={"_u_k _4jy0 _4jy4 _517h _51sy _42ft"} data-hover={"tooltip"} disabled={false} image={{}} size={"large"} onClick={function () { } } use={"default"} borderShade={"light"} suppressed={false} label={null} type={"submit"} value={"1"}>
				<ReactImage137 />
				{undefined}
				{undefined}
			</button>
		);
	}

	var XUIButton139 = function () {
		return <AbstractButton138 />;
	}

	var ReactImage140 = function () {
		return <i src={null} className={"img sp_UuU9HmrQ397 sx_0c342e"}></i>;
	}

	var AbstractButton141 = function () {
		return (
			<button aria-label={"Revert"} className={"_u_k _4jy0 _4jy4 _517h _51sy _42ft _42fr"} data-hover={"tooltip"} disabled={true} image={{}} size={"large"} onClick={function () { } } use={"default"} borderShade={"light"} suppressed={false} label={null} type={"submit"} value={"1"}>
				<ReactImage140 />
				{undefined}
				{undefined}
			</button>
		);
	}

	var XUIButton142 = function () {
		return <AbstractButton141 />;
	}

	var ReactImage143 = function () {
		return <i src={null} className={"img sp_UuU9HmrQ397 sx_0e75f5"}></i>;
	}

	var AbstractButton144 = function () {
		return (
			<button aria-label={"Delete"} className={"_u_k _4jy0 _4jy4 _517h _51sy _42ft"} image={{}} data-hover={"tooltip"} disabled={false} size={"large"} onClick={function () { } } use={"default"} borderShade={"light"} suppressed={false} label={null} type={"submit"} value={"1"}>
				<ReactImage143 />
				{undefined}
				{undefined}
			</button>
		);
	}

	var XUIButton145 = function () {
		return <AbstractButton144 />;
	}

	var XUIButtonGroup146 = function () {
		return (
			<div className={"_5n7z _51xa"}>
				<XUIButton139 key={"duplicate"} />
				<XUIButton142 key={"revert"} />
				<XUIButton145 key={"delete"} />
			</div>
		);
	}

	var ReactImage147 = function () {
		return <i src={null} className={"img sp_UuU9HmrQ397 sx_8c19ae"}></i>;
	}

	var AbstractButton148 = function () {
		return (
			<button size={"large"} disabled={false} className={"_u_k _4jy0 _4jy4 _517h _51sy _42ft"} image={{}} data-hover={"tooltip"} aria-label={"Save Audience"} onClick={function () { } } use={"default"} borderShade={"light"} suppressed={false} label={null} type={"submit"} value={"1"}>
				<ReactImage147 />
				{undefined}
				{undefined}
			</button>
		);
	}

	var XUIButton149 = function () {
		return <AbstractButton148 />;
	}

	var ReactImage150 = function () {
		return <i src={null} className={"img sp_UuU9HmrQ397 sx_d2b33c"}></i>;
	}

	var AbstractButton151 = function () {
		return (
			<button size={"large"} className={"_u_k noMargin _p _4jy0 _4jy4 _517h _51sy _42ft"} onClick={function () { } } image={{}} data-hover={"tooltip"} aria-label={"Export & Import"} use={"default"} borderShade={"light"} suppressed={false} label={null} type={"submit"} value={"1"}>
				<ReactImage150 />
				{undefined}
				{undefined}
			</button>
		);
	}

	var XUIButton152 = function () {
		return <AbstractButton151 />;
	}

	var InlineBlock153 = function () {
		return (
			<div menu={{}} size={"large"} alignv={"middle"} className={"uiPopover _6a _6b"} disabled={null} fullWidth={false}>
				<XUIButton152 key={"/.0"} />
			</div>
		);
	}

	var ReactPopoverMenu154 = function () {
		return <InlineBlock153 ref2={"root"} />;
	}

	var AdsPEExportImportMenu155 = function () {
		return <ReactPopoverMenu154 key={"export"} />;
	}

	var FluxContainer_x_156 = function () {
		return null;
	}

	var AdsPEExportAsTextDialog157 = function () {
		return null;
	}

	var FluxContainer_q_158 = function () {
		return <AdsPEExportAsTextDialog157 />;
	}

	var AdsPEExportImportMenuContainer159 = function () {
		return (
			<span>
				<AdsPEExportImportMenu155 />
				<FluxContainer_x_156 />
				<FluxContainer_q_158 />
				{null}
			</span>
		);
	}

	var ReactImage160 = function () {
		return <i src={null} className={"img sp_UuU9HmrQ397 sx_872db1"}></i>;
	}

	var AbstractButton161 = function () {
		return (
			<button size={"large"} disabled={false} onClick={function () { } } className={"_u_k _5n7z _4jy0 _4jy4 _517h _51sy _42ft"} image={{}} style={{ "boxSizing": "border-box", "height": "28px", "width": "48px" }} data-hover={"tooltip"} aria-label={"Create Report"} use={"default"} borderShade={"light"} suppressed={false} label={null} type={"submit"} value={"1"}>
				<ReactImage160 />
				{undefined}
				{undefined}
			</button>
		);
	}

	var XUIButton162 = function () {
		return <AbstractButton161 />;
	}

	var AbstractButton163 = function () {
		return (
			<button size={"large"} disabled={true} className={"hidden_elem _5n7z _4jy0 _4jy4 _517h _51sy _42ft _42fr"} label={null} onClick={function () { } } use={"default"} borderShade={"light"} suppressed={false} type={"submit"} value={"1"}>
				{undefined}
				{"Generate Variations"}
				{undefined}
			</button>
		);
	}

	var XUIButton164 = function () {
		return <AbstractButton163 />;
	}

	var XUIButtonGroup165 = function () {
		return (
			<div className={"_5n7z _51xa"}>
				<XUIButton149 key={"saveAudience"} />
				<AdsPEExportImportMenuContainer159 />
				<XUIButton162 key={"createReport"} ref2={"ads_create_report_button"} />
				<XUIButton164 key={"variations"} />
			</div>
		);
	}

	var FillColumn166 = function () {
		return (
			<div className={"_4bl9"}>
				<span className={"_3c5e"}>
					<span>
						<XUIButtonGroup133 />
						<XUIButton136 key={"edit"} />
						<XUIButtonGroup146 />
					</span>
					<XUIButtonGroup165 />
				</span>
			</div>
		);
	}

	var Layout167 = function () {
		return (
			<div className={"clearfix"}>
				<Column124 key={"1"} />
				<FillColumn166 key={"0"} />
			</div>
		);
	}

	var AdsPEMainPaneToolbar168 = function () {
		return (
			<div className={"_3c5b clearfix"}>
				<Layout167 />
			</div>
		);
	}

	var AdsPEAdgroupToolbarContainer169 = function () {
		return (
			<div>
				<AdsPEMainPaneToolbar168 />
				{null}
			</div>
		);
	}

	var AbstractButton170 = function () {
		return (
			<button className={"_tm3 _tm6 _4jy0 _4jy6 _517h _51sy _42ft"} label={null} data-tooltip-position={"right"} aria-label={"Campaigns"} data-hover={"tooltip"} onClick={function () { } } size={"xxlarge"} use={"default"} borderShade={"light"} suppressed={false} type={"submit"} value={"1"}>
				{undefined}
				<div>
					<div className={"_tma"}></div>
					<div className={"_tm8"}></div>
					<div className={"_tm9"}>{1}</div>
				</div>
				{undefined}
			</button>
		);
	}

	var XUIButton171 = function () {
		return <AbstractButton170 />;
	}

	var AbstractButton172 = function () {
		return (
			<button className={"_tm4 _tm6 _4jy0 _4jy6 _517h _51sy _42ft"} label={null} data-tooltip-position={"right"} aria-label={"Ad Sets"} data-hover={"tooltip"} onClick={function () { } } size={"xxlarge"} use={"default"} borderShade={"light"} suppressed={false} type={"submit"} value={"1"}>
				{undefined}
				<div>
					<div className={"_tma"}></div>
					<div className={"_tm8"}></div>
					<div className={"_tm9"}>{1}</div>
				</div>
				{undefined}
			</button>
		);
	}

	var XUIButton173 = function () {
		return <AbstractButton172 />;
	}

	var AbstractButton174 = function () {
		return (
			<button className={"_tm5 _tm6 _tm7 _4jy0 _4jy6 _517h _51sy _42ft"} label={null} data-tooltip-position={"right"} aria-label={"Ads"} data-hover={"tooltip"} onClick={function () { } } size={"xxlarge"} use={"default"} borderShade={"light"} suppressed={false} type={"submit"} value={"1"}>
				{undefined}
				<div>
					<div className={"_tma"}></div>
					<div className={"_tm8"}></div>
					<div className={"_tm9"}>{1}</div>
				</div>
				{undefined}
			</button>
		);
	}

	var XUIButton175 = function () {
		return <AbstractButton174 />;
	}

	var AdsPESimpleOrganizer176 = function () {
		return (
			<div className={"_tm2"}>
				<XUIButton171 />
				<XUIButton173 />
				<XUIButton175 />
			</div>
		);
	}

	var AdsPEOrganizerContainer177 = function () {
		return (
			<div>
				<AdsPESimpleOrganizer176 />
			</div>
		);
	}

	var FixedDataTableColumnResizeHandle178 = function () {
		return (
			<div className={"_3487 _3488 _3489"} style={{ "width": 0, "height": 532, "left": 0 }}>
				<div className={"_348a"} style={{ "height": 532 }}></div>
			</div>
		);
	}

	var ReactImage179 = function () {
		return <i className={"_1cie _1cif img sp_R48dKBxiJkP sx_dc0ad2"} src={null}></i>;
	}

	var AdsPETableHeader180 = function () {
		return (
			<div className={"_1cig _1ksv _1vd7 _4h2r"}>
				<ReactImage179 />
				<span className={"_1cid"}>{"Ads"}</span>
			</div>
		);
	}

	var TransitionCell181 = function () {
		return (
			<div isHeaderCell={true} label={"Ads"} dataKey={0} groupHeaderRenderer={function () { } } groupHeaderLabels={{}} groupHeaderData={{}} columnKey={undefined} height={40} width={521} rowIndex={0} className={"_4lgc _4h2u"} style={{ "height": 40, "width": 521 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<AdsPETableHeader180 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell182 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 40, "width": 521, "left": 0 }}>
				{undefined}
				<TransitionCell181 />
			</div>
		);
	}

	var FixedDataTableCellGroupImpl183 = function () {
		return (
			<div className={"_3pzj"} style={{ "height": 40, "position": "absolute", "width": 521, "zIndex": 2, "transform": "translate3d(0px,0px,0)", "backfaceVisibility": "hidden" }}>
				<FixedDataTableCell182 key={"cell_0"} />
			</div>
		);
	}

	var FixedDataTableCellGroup184 = function () {
		return (
			<div style={{ "height": 40, "left": 0 }} className={"_3pzk"}>
				<FixedDataTableCellGroupImpl183 />
			</div>
		);
	}

	var AdsPETableHeader185 = function () {
		return (
			<div className={"_1cig _1vd7 _4h2r"}>
				{null}
				<span className={"_1cid"}>{"Delivery"}</span>
			</div>
		);
	}

	var TransitionCell186 = function () {
		return (
			<div isHeaderCell={true} label={"Delivery"} dataKey={1} groupHeaderRenderer={function () { } } groupHeaderLabels={{}} groupHeaderData={{}} columnKey={undefined} height={40} width={298} rowIndex={0} className={"_4lgc _4h2u"} style={{ "height": 40, "width": 298 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<AdsPETableHeader185 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell187 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 40, "width": 298, "left": 0 }}>
				{undefined}
				<TransitionCell186 />
			</div>
		);
	}

	var AdsPETableHeader188 = function () {
		return (
			<div className={"_1cig _1vd7 _4h2r"}>
				{null}
				<span className={"_1cid"}>{"Performance"}</span>
			</div>
		);
	}

	var TransitionCell189 = function () {
		return (
			<div isHeaderCell={true} label={"Performance"} dataKey={2} groupHeaderRenderer={function () { } } groupHeaderLabels={{}} groupHeaderData={{}} columnKey={undefined} height={40} width={490} rowIndex={0} className={"_4lgc _4h2u"} style={{ "height": 40, "width": 490 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<AdsPETableHeader188 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell190 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 40, "width": 490, "left": 298 }}>
				{undefined}
				<TransitionCell189 />
			</div>
		);
	}

	var AdsPETableHeader191 = function () {
		return (
			<div className={"_1cig _1vd7 _4h2r"}>
				{null}
				<span className={"_1cid"}>{"Overview"}</span>
			</div>
		);
	}

	var TransitionCell192 = function () {
		return (
			<div isHeaderCell={true} label={"Overview"} dataKey={3} groupHeaderRenderer={function () { } } groupHeaderLabels={{}} groupHeaderData={{}} columnKey={undefined} height={40} width={972} rowIndex={0} className={"_4lgc _4h2u"} style={{ "height": 40, "width": 972 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<AdsPETableHeader191 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell193 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 40, "width": 972, "left": 788 }}>
				{undefined}
				<TransitionCell192 />
			</div>
		);
	}

	var AdsPETableHeader194 = function () {
		return (
			<div className={"_1cig _1vd7 _4h2r"}>
				{null}
				<span className={"_1cid"}>{"Creative Assets"}</span>
			</div>
		);
	}

	var TransitionCell195 = function () {
		return (
			<div isHeaderCell={true} label={"Creative Assets"} dataKey={4} groupHeaderRenderer={function () { } } groupHeaderLabels={{}} groupHeaderData={{}} columnKey={undefined} height={40} width={514} rowIndex={0} className={"_4lgc _4h2u"} style={{ "height": 40, "width": 514 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<AdsPETableHeader194 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell196 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 40, "width": 514, "left": 1760 }}>
				{undefined}
				<TransitionCell195 />
			</div>
		);
	}

	var AdsPETableHeader197 = function () {
		return (
			<div className={"_1cig _1vd7 _4h2r"}>
				{null}
				<span className={"_1cid"}>{"Toplines"}</span>
			</div>
		);
	}

	var TransitionCell198 = function () {
		return (
			<div isHeaderCell={true} label={"Toplines"} dataKey={5} groupHeaderRenderer={function () { } } groupHeaderLabels={{}} groupHeaderData={{}} columnKey={undefined} height={40} width={0} rowIndex={0} className={"_4lgc _4h2u"} style={{ "height": 40, "width": 0 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<AdsPETableHeader197 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell199 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 40, "width": 0, "left": 2274 }}>
				{undefined}
				<TransitionCell198 />
			</div>
		);
	}

	var AdsPETableHeader200 = function () {
		return <div className={"_1cig _1vd7 _4h2r"}></div>;
	}

	var TransitionCell201 = function () {
		return (
			<div isHeaderCell={true} label={""} dataKey={6} groupHeaderRenderer={function () { } } groupHeaderLabels={{}} groupHeaderData={{}} columnKey={undefined} height={40} width={25} rowIndex={0} className={"_4lgc _4h2u"} style={{ "height": 40, "width": 25 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<AdsPETableHeader200 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell202 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 40, "width": 25, "left": 2274 }}>
				{undefined}
				<TransitionCell201 />
			</div>
		);
	}

	var FixedDataTableCellGroupImpl203 = function () {
		return (
			<div className={"_3pzj"} style={{ "height": 40, "position": "absolute", "width": 2299, "zIndex": 0, "transform": "translate3d(0px,0px,0)", "backfaceVisibility": "hidden" }}>
				<FixedDataTableCell187 key={"cell_0"} />
				<FixedDataTableCell190 key={"cell_1"} />
				<FixedDataTableCell193 key={"cell_2"} />
				<FixedDataTableCell196 key={"cell_3"} />
				<FixedDataTableCell199 key={"cell_4"} />
				<FixedDataTableCell202 key={"cell_5"} />
			</div>
		);
	}

	var FixedDataTableCellGroup204 = function () {
		return (
			<div style={{ "height": 40, "left": 521 }} className={"_3pzk"}>
				<FixedDataTableCellGroupImpl203 />
			</div>
		);
	}

	var FixedDataTableRowImpl205 = function () {
		return (
			<div className={"_1gd4 _4li _52no _3h1a _1mib"} onClick={null} onDoubleClick={null} onMouseDown={null} onMouseEnter={null} onMouseLeave={null} style={{ "width": 1083, "height": 40 }}>
				<div className={"_1gd5"}>
					<FixedDataTableCellGroup184 key={"fixed_cells"} />
					<FixedDataTableCellGroup204 key={"scrollable_cells"} />
					<div className={"_1gd6 _1gd8"} style={{ "left": 521, "height": 40 }}></div>
				</div>
			</div>
		);
	}

	var FixedDataTableRow206 = function () {
		return (
			<div style={{ "width": 1083, "height": 40, "zIndex": 1, "transform": "translate3d(0px,0px,0)", "backfaceVisibility": "hidden" }} className={"_1gda"}>
				<FixedDataTableRowImpl205 />
			</div>
		);
	}

	var AbstractCheckboxInput207 = function () {
		return (
			<label className={"_4h2r _55sg _kv1"}>
				<input checked={undefined} onChange={function () { } } className={null} type={"checkbox"}></input>
				<span data-hover={null} aria-label={undefined}></span>
			</label>
		);
	}

	var XUICheckboxInput208 = function () {
		return <AbstractCheckboxInput207 />;
	}

	var TransitionCell209 = function () {
		return (
			<div isHeaderCell={true} label={undefined} width={42} dataKey={"common.id"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"common.id"} height={25} style={{ "height": 25, "width": 42 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<XUICheckboxInput208 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell210 = function () {
		return (
			<div className={"_4lg0 _4lg6 _4h2m"} style={{ "height": 25, "width": 42, "left": 0 }}>
				{undefined}
				<TransitionCell209 />
			</div>
		);
	}

	var AdsPETableHeader211 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Ad Name"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader212 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader211 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader213 = function () {
		return <FixedDataTableAbstractSortableHeader212 />;
	}

	var TransitionCell214 = function () {
		return (
			<div isHeaderCell={true} label={"Ad Name"} width={200} dataKey={"ad.name"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"ad.name"} height={25} style={{ "height": 25, "width": 200 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader213 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell215 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 200, "left": 42 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell214 />
			</div>
		);
	}

	var ReactImage216 = function () {
		return <i className={"_1cie img sp_UuU9HmrQ397 sx_844e7d"} src={null}></i>;
	}

	var AdsPETableHeader217 = function () {
		return (
			<div className={"_1cig _25fg"}>
				<ReactImage216 />
				{null}
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader218 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _1kst _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader217 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader219 = function () {
		return <FixedDataTableAbstractSortableHeader218 />;
	}

	var TransitionCell220 = function () {
		return (
			<div isHeaderCell={true} label={undefined} width={33} dataKey={"edit_status"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"edit_status"} height={25} style={{ "height": 25, "width": 33 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader219 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell221 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 33, "left": 242 }}>
				{undefined}
				<TransitionCell220 />
			</div>
		);
	}

	var ReactImage222 = function () {
		return <i className={"_1cie img sp_UuU9HmrQ397 sx_36dc45"} src={null}></i>;
	}

	var AdsPETableHeader223 = function () {
		return (
			<div className={"_1cig _25fg"}>
				<ReactImage222 />
				{null}
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader224 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _1kst _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader223 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader225 = function () {
		return <FixedDataTableAbstractSortableHeader224 />;
	}

	var TransitionCell226 = function () {
		return (
			<div isHeaderCell={true} label={undefined} width={36} dataKey={"errors"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"errors"} height={25} style={{ "height": 25, "width": 36 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader225 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell227 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 36, "left": 275 }}>
				{undefined}
				<TransitionCell226 />
			</div>
		);
	}

	var AdsPETableHeader228 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Status"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader229 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader228 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader230 = function () {
		return <FixedDataTableAbstractSortableHeader229 />;
	}

	var TransitionCell231 = function () {
		return (
			<div isHeaderCell={true} label={"Status"} width={60} dataKey={"ad.adgroup_status"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"ad.adgroup_status"} height={25} style={{ "height": 25, "width": 60 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader230 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell232 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 60, "left": 311 }}>
				{undefined}
				<TransitionCell231 />
			</div>
		);
	}

	var AdsPETableHeader233 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Delivery"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader234 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader233 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader235 = function () {
		return <FixedDataTableAbstractSortableHeader234 />;
	}

	var TransitionCell236 = function () {
		return (
			<div isHeaderCell={true} label={"Delivery"} width={150} dataKey={"ukiAdData.computed_activity_status"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"ukiAdData.computed_activity_status"} height={25} style={{ "height": 25, "width": 150 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader235 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell237 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 150, "left": 371 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell236 />
			</div>
		);
	}

	var FixedDataTableCellGroupImpl238 = function () {
		return (
			<div className={"_3pzj"} style={{ "height": 25, "position": "absolute", "width": 521, "zIndex": 2, "transform": "translate3d(0px,0px,0)", "backfaceVisibility": "hidden" }}>
				<FixedDataTableCell210 key={"cell_0"} />
				<FixedDataTableCell215 key={"cell_1"} />
				<FixedDataTableCell221 key={"cell_2"} />
				<FixedDataTableCell227 key={"cell_3"} />
				<FixedDataTableCell232 key={"cell_4"} />
				<FixedDataTableCell237 key={"cell_5"} />
			</div>
		);
	}

	var FixedDataTableCellGroup239 = function () {
		return (
			<div style={{ "height": 25, "left": 0 }} className={"_3pzk"}>
				<FixedDataTableCellGroupImpl238 />
			</div>
		);
	}

	var AdsPETableHeader240 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Reach"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader241 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader240 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader242 = function () {
		return <FixedDataTableAbstractSortableHeader241 />;
	}

	var TransitionCell243 = function () {
		return (
			<div isHeaderCell={true} label={"Reach"} width={60} dataKey={"stats.unique_impressions"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"stats.unique_impressions"} height={25} style={{ "height": 25, "width": 60 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader242 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell244 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 25, "width": 60, "left": 0 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell243 />
			</div>
		);
	}

	var AdsPETableHeader245 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Ad Impressions"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader246 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader245 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader247 = function () {
		return <FixedDataTableAbstractSortableHeader246 />;
	}

	var TransitionCell248 = function () {
		return (
			<div isHeaderCell={true} label={"Ad Impressions"} width={80} dataKey={"stats.impressions"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"stats.impressions"} height={25} style={{ "height": 25, "width": 80 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader247 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell249 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 25, "width": 80, "left": 60 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell248 />
			</div>
		);
	}

	var AdsPETableHeader250 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Avg. CPM"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader251 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader250 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader252 = function () {
		return <FixedDataTableAbstractSortableHeader251 />;
	}

	var TransitionCell253 = function () {
		return (
			<div isHeaderCell={true} label={"Avg. CPM"} width={80} dataKey={"stats.avg_cpm"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"stats.avg_cpm"} height={25} style={{ "height": 25, "width": 80 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader252 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell254 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 25, "width": 80, "left": 140 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell253 />
			</div>
		);
	}

	var AdsPETableHeader255 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Avg. CPC"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader256 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader255 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader257 = function () {
		return <FixedDataTableAbstractSortableHeader256 />;
	}

	var TransitionCell258 = function () {
		return (
			<div isHeaderCell={true} label={"Avg. CPC"} width={78} dataKey={"stats.avg_cpc"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"stats.avg_cpc"} height={25} style={{ "height": 25, "width": 78 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader257 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell259 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 25, "width": 78, "left": 220 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell258 />
			</div>
		);
	}

	var AdsPETableHeader260 = function () {
		return (
			<div className={"_1cig _25fg _4h2r"}>
				{null}
				<span className={"_1cid"}>{"Results"}</span>
			</div>
		);
	}

	var TransitionCell261 = function () {
		return (
			<div isHeaderCell={true} label={"Results"} width={140} dataKey={"stats.actions"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"stats.actions"} height={25} style={{ "height": 25, "width": 140 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<AdsPETableHeader260 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell262 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 25, "width": 140, "left": 298 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell261 />
			</div>
		);
	}

	var AdsPETableHeader263 = function () {
		return (
			<div className={"_1cig _25fg _4h2r"}>
				{null}
				<span className={"_1cid"}>{"Cost"}</span>
			</div>
		);
	}

	var TransitionCell264 = function () {
		return (
			<div isHeaderCell={true} label={"Cost"} width={140} dataKey={"stats.cpa"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"stats.cpa"} height={25} style={{ "height": 25, "width": 140 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<AdsPETableHeader263 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell265 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 25, "width": 140, "left": 438 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell264 />
			</div>
		);
	}

	var AdsPETableHeader266 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Clicks"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader267 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader266 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader268 = function () {
		return <FixedDataTableAbstractSortableHeader267 />;
	}

	var TransitionCell269 = function () {
		return (
			<div isHeaderCell={true} label={"Clicks"} width={60} dataKey={"stats.clicks"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"stats.clicks"} height={25} style={{ "height": 25, "width": 60 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader268 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell270 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 25, "width": 60, "left": 578 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell269 />
			</div>
		);
	}

	var AdsPETableHeader271 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"CTR %"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader272 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader271 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader273 = function () {
		return <FixedDataTableAbstractSortableHeader272 />;
	}

	var TransitionCell274 = function () {
		return (
			<div isHeaderCell={true} label={"CTR %"} width={70} dataKey={"stats.ctr"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"stats.ctr"} height={25} style={{ "height": 25, "width": 70 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader273 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell275 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 25, "width": 70, "left": 638 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell274 />
			</div>
		);
	}

	var AdsPETableHeader276 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Social %"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader277 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader276 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader278 = function () {
		return <FixedDataTableAbstractSortableHeader277 />;
	}

	var TransitionCell279 = function () {
		return (
			<div isHeaderCell={true} label={"Social %"} width={80} dataKey={"stats.social_percent"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"stats.social_percent"} height={25} style={{ "height": 25, "width": 80 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader278 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell280 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 25, "width": 80, "left": 708 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell279 />
			</div>
		);
	}

	var AdsPETableHeader281 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Ad Set Name"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader282 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader281 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader283 = function () {
		return <FixedDataTableAbstractSortableHeader282 />;
	}

	var TransitionCell284 = function () {
		return (
			<div isHeaderCell={true} label={"Ad Set Name"} width={100} dataKey={"campaign.name"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"campaign.name"} height={25} style={{ "height": 25, "width": 100 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader283 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell285 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 100, "left": 788 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell284 />
			</div>
		);
	}

	var AdsPETableHeader286 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Campaign Name"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader287 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader286 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader288 = function () {
		return <FixedDataTableAbstractSortableHeader287 />;
	}

	var TransitionCell289 = function () {
		return (
			<div isHeaderCell={true} label={"Campaign Name"} width={150} dataKey={"campaignGroup.name"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"campaignGroup.name"} height={25} style={{ "height": 25, "width": 150 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader288 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell290 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 150, "left": 888 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell289 />
			</div>
		);
	}

	var AdsPETableHeader291 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Ad ID"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader292 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader291 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader293 = function () {
		return <FixedDataTableAbstractSortableHeader292 />;
	}

	var TransitionCell294 = function () {
		return (
			<div isHeaderCell={true} label={"Ad ID"} width={120} dataKey={"ad.id"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"ad.id"} height={25} style={{ "height": 25, "width": 120 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader293 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell295 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 120, "left": 1038 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell294 />
			</div>
		);
	}

	var AdsPETableHeader296 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Objective"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader297 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader296 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader298 = function () {
		return <FixedDataTableAbstractSortableHeader297 />;
	}

	var TransitionCell299 = function () {
		return (
			<div isHeaderCell={true} label={"Objective"} width={80} dataKey={"campaignGroup.objective"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"campaignGroup.objective"} height={25} style={{ "height": 25, "width": 80 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader298 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell300 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 80, "left": 1158 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell299 />
			</div>
		);
	}

	var AdsPETableHeader301 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Spent"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader302 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader301 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader303 = function () {
		return <FixedDataTableAbstractSortableHeader302 />;
	}

	var TransitionCell304 = function () {
		return (
			<div isHeaderCell={true} label={"Spent"} width={70} dataKey={"stats.spent_100"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"stats.spent_100"} height={25} style={{ "height": 25, "width": 70 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader303 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell305 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 25, "width": 70, "left": 1238 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell304 />
			</div>
		);
	}

	var AdsPETableHeader306 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Start"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader307 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader306 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader308 = function () {
		return <FixedDataTableAbstractSortableHeader307 />;
	}

	var TransitionCell309 = function () {
		return (
			<div isHeaderCell={true} label={"Start"} width={113} dataKey={"derivedCampaign.startDate"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"derivedCampaign.startDate"} height={25} style={{ "height": 25, "width": 113 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader308 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell310 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 113, "left": 1308 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell309 />
			</div>
		);
	}

	var AdsPETableHeader311 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"End"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader312 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader311 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader313 = function () {
		return <FixedDataTableAbstractSortableHeader312 />;
	}

	var TransitionCell314 = function () {
		return (
			<div isHeaderCell={true} label={"End"} width={113} dataKey={"derivedCampaign.endDate"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"derivedCampaign.endDate"} height={25} style={{ "height": 25, "width": 113 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader313 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell315 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 113, "left": 1421 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell314 />
			</div>
		);
	}

	var AdsPETableHeader316 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Date created"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader317 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader316 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader318 = function () {
		return <FixedDataTableAbstractSortableHeader317 />;
	}

	var TransitionCell319 = function () {
		return (
			<div isHeaderCell={true} label={"Date created"} width={113} dataKey={"ad.created_time"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"ad.created_time"} height={25} style={{ "height": 25, "width": 113 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader318 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell320 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 113, "left": 1534 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell319 />
			</div>
		);
	}

	var AdsPETableHeader321 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Date last edited"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader322 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader321 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader323 = function () {
		return <FixedDataTableAbstractSortableHeader322 />;
	}

	var TransitionCell324 = function () {
		return (
			<div isHeaderCell={true} label={"Date last edited"} width={113} dataKey={"ad.updated_time"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"ad.updated_time"} height={25} style={{ "height": 25, "width": 113 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader323 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell325 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 113, "left": 1647 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell324 />
			</div>
		);
	}

	var AdsPETableHeader326 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Title"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader327 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader326 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader328 = function () {
		return <FixedDataTableAbstractSortableHeader327 />;
	}

	var TransitionCell329 = function () {
		return (
			<div isHeaderCell={true} label={"Title"} width={80} dataKey={"ad.title"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"ad.title"} height={25} style={{ "height": 25, "width": 80 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader328 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell330 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 80, "left": 1760 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell329 />
			</div>
		);
	}

	var AdsPETableHeader331 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Body"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader332 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader331 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader333 = function () {
		return <FixedDataTableAbstractSortableHeader332 />;
	}

	var TransitionCell334 = function () {
		return (
			<div isHeaderCell={true} label={"Body"} width={80} dataKey={"ad.creative.body"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"ad.creative.body"} height={25} style={{ "height": 25, "width": 80 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader333 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell335 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 80, "left": 1840 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell334 />
			</div>
		);
	}

	var AdsPETableHeader336 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Destination"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader337 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader336 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader338 = function () {
		return <FixedDataTableAbstractSortableHeader337 />;
	}

	var TransitionCell339 = function () {
		return (
			<div isHeaderCell={true} label={"Destination"} width={92} dataKey={"destination"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"destination"} height={25} style={{ "height": 25, "width": 92 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader338 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell340 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 92, "left": 1920 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell339 />
			</div>
		);
	}

	var AdsPETableHeader341 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Link"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader342 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader341 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader343 = function () {
		return <FixedDataTableAbstractSortableHeader342 />;
	}

	var TransitionCell344 = function () {
		return (
			<div isHeaderCell={true} label={"Link"} width={70} dataKey={"ad.creative.link_url"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"ad.creative.link_url"} height={25} style={{ "height": 25, "width": 70 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader343 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell345 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 70, "left": 2012 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell344 />
			</div>
		);
	}

	var AdsPETableHeader346 = function () {
		return (
			<div className={"_1cig _25fg"}>
				{null}
				<span className={"_1cid"}>{"Related Page"}</span>
			</div>
		);
	}

	var FixedDataTableAbstractSortableHeader347 = function () {
		return (
			<div onClick={function () { } } className={"_54_8 _4h2r _2wzx"}>
				<div className={"_2eq6"}>
					{null}
					<AdsPETableHeader346 />
				</div>
			</div>
		);
	}

	var FixedDataTableSortableHeader348 = function () {
		return <FixedDataTableAbstractSortableHeader347 />;
	}

	var TransitionCell349 = function () {
		return (
			<div isHeaderCell={true} label={"Related Page"} width={92} dataKey={"page"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"page"} height={25} style={{ "height": 25, "width": 92 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<FixedDataTableSortableHeader348 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell350 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 92, "left": 2082 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell349 />
			</div>
		);
	}

	var AdsPETableHeader351 = function () {
		return (
			<div className={"_1cig _25fg _4h2r"}>
				{null}
				<span className={"_1cid"}>{"Preview Link"}</span>
			</div>
		);
	}

	var TransitionCell352 = function () {
		return (
			<div isHeaderCell={true} label={"Preview Link"} width={100} dataKey={"ad.demolink_hash"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"ad.demolink_hash"} height={25} style={{ "height": 25, "width": 100 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<AdsPETableHeader351 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell353 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 100, "left": 2174 }}>
				<div className={"_4lg9"} style={{ "height": 25 }} onMouseDown={function () { } }>
					<div className={"_4lga _4lgb"} style={{ "height": 25 }}></div>
				</div>
				<TransitionCell352 />
			</div>
		);
	}

	var AdsPETableHeader354 = function () {
		return <div className={"_1cig _25fg _4h2r"}></div>;
	}

	var TransitionCell355 = function () {
		return (
			<div isHeaderCell={true} label={""} width={25} dataKey={"scrollbar_spacer"} className={"_4lgc _4h2u"} columnData={{}} cellRenderer={function () { } } headerDataGetter={function () { } } columnKey={"scrollbar_spacer"} height={25} style={{ "height": 25, "width": 25 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<AdsPETableHeader354 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell356 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 25, "width": 25, "left": 2274 }}>
				{undefined}
				<TransitionCell355 />
			</div>
		);
	}

	var FixedDataTableCellGroupImpl357 = function () {
		return (
			<div className={"_3pzj"} style={{ "height": 25, "position": "absolute", "width": 2299, "zIndex": 0, "transform": "translate3d(0px,0px,0)", "backfaceVisibility": "hidden" }}>
				<FixedDataTableCell244 key={"cell_0"} />
				<FixedDataTableCell249 key={"cell_1"} />
				<FixedDataTableCell254 key={"cell_2"} />
				<FixedDataTableCell259 key={"cell_3"} />
				<FixedDataTableCell262 key={"cell_4"} />
				<FixedDataTableCell265 key={"cell_5"} />
				<FixedDataTableCell270 key={"cell_6"} />
				<FixedDataTableCell275 key={"cell_7"} />
				<FixedDataTableCell280 key={"cell_8"} />
				<FixedDataTableCell285 key={"cell_9"} />
				<FixedDataTableCell290 key={"cell_10"} />
				<FixedDataTableCell295 key={"cell_11"} />
				<FixedDataTableCell300 key={"cell_12"} />
				<FixedDataTableCell305 key={"cell_13"} />
				<FixedDataTableCell310 key={"cell_14"} />
				<FixedDataTableCell315 key={"cell_15"} />
				<FixedDataTableCell320 key={"cell_16"} />
				<FixedDataTableCell325 key={"cell_17"} />
				<FixedDataTableCell330 key={"cell_18"} />
				<FixedDataTableCell335 key={"cell_19"} />
				<FixedDataTableCell340 key={"cell_20"} />
				<FixedDataTableCell345 key={"cell_21"} />
				<FixedDataTableCell350 key={"cell_22"} />
				<FixedDataTableCell353 key={"cell_23"} />
				<FixedDataTableCell356 key={"cell_24"} />
			</div>
		);
	}

	var FixedDataTableCellGroup358 = function () {
		return (
			<div style={{ "height": 25, "left": 521 }} className={"_3pzk"}>
				<FixedDataTableCellGroupImpl357 />
			</div>
		);
	}

	var FixedDataTableRowImpl359 = function () {
		return (
			<div className={"_1gd4 _4li _3h1a _1mib"} onClick={null} onDoubleClick={null} onMouseDown={null} onMouseEnter={null} onMouseLeave={null} style={{ "width": 1083, "height": 25 }}>
				<div className={"_1gd5"}>
					<FixedDataTableCellGroup239 key={"fixed_cells"} />
					<FixedDataTableCellGroup358 key={"scrollable_cells"} />
					<div className={"_1gd6 _1gd8"} style={{ "left": 521, "height": 25 }}></div>
				</div>
			</div>
		);
	}

	var FixedDataTableRow360 = function () {
		return (
			<div style={{ "width": 1083, "height": 25, "zIndex": 1, "transform": "translate3d(0px,40px,0)", "backfaceVisibility": "hidden" }} className={"_1gda"}>
				<FixedDataTableRowImpl359 />
			</div>
		);
	}

	var AbstractCheckboxInput361 = function () {
		return (
			<label className={"_5hhv _55sg _kv1"}>
				<input className={null} disabled={false} inline={true} checked={true} value={undefined} onChange={function () { } } type={"checkbox"}></input>
				<span data-hover={null} aria-label={undefined}></span>
			</label>
		);
	}

	var XUICheckboxInput362 = function () {
		return <AbstractCheckboxInput361 />;
	}

	var TransitionCell363 = function () {
		return (
			<div dataKey={"common.id"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={42} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"common.id"} height={32} rowIndex={0} style={{ "height": 32, "width": 42 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<span className={"_5hhu _4h2r"} onMouseDown={function () { } }>
							<XUICheckboxInput362 />
						</span>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell364 = function () {
		return (
			<div className={"_4lg0 _4lg6 _4h2m"} style={{ "height": 32, "width": 42, "left": 0 }}>
				{undefined}
				<TransitionCell363 />
			</div>
		);
	}

	var AdsEditableTextCellDisplay365 = function () {
		return (
			<div className={"_vew"} onDoubleClick={function () { } } onMouseEnter={function () { } } onMouseLeave={function () { } }>
				<div className={"_vex _5w6k"}>
					<div className={"_vey"}>{"Test Ad"}</div>
					<div className={"_5w6_"}></div>
				</div>
			</div>
		);
	}

	var AdsEditableCell366 = function () {
		return (
			<div className={"_2d6h _2-ev _4h2r _5abb"}>
				<AdsEditableTextCellDisplay365 />
			</div>
		);
	}

	var TransitionCell367 = function () {
		return (
			<div dataKey={"ad.name"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={200} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"ad.name"} height={32} rowIndex={0} style={{ "height": 32, "width": 200 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<AdsEditableCell366 />
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell368 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 200, "left": 42 }}>
				{undefined}
				<TransitionCell367 />
			</div>
		);
	}

	var FixedDataTableCellDefault369 = function () {
		return (
			<div dataKey={"edit_status"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={33} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"edit_status"} height={32} rowIndex={0} style={{ "height": 32, "width": 33 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_4h2r"}>{""}</div>
					</div>
				</div>
			</div>
		);
	}

	var TransitionCell370 = function () {
		return <FixedDataTableCellDefault369 />;
	}

	var FixedDataTableCell371 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 33, "left": 242 }}>
				{undefined}
				<TransitionCell370 />
			</div>
		);
	}

	var FixedDataTableCellDefault372 = function () {
		return (
			<div dataKey={"errors"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={36} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"errors"} height={32} rowIndex={0} style={{ "height": 32, "width": 36 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_4h2r"}></div>
					</div>
				</div>
			</div>
		);
	}

	var TransitionCell373 = function () {
		return <FixedDataTableCellDefault372 />;
	}

	var FixedDataTableCell374 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 36, "left": 275 }}>
				{undefined}
				<TransitionCell373 />
			</div>
		);
	}

	var BUISwitch375 = function () {
		return (
			<div value={true} disabled={true} onToggle={function () { } } data-hover={"tooltip"} data-tooltip-position={"below"} aria-label={"Currently active and you can not deactivate it."} animate={true} className={"_128j _128k _128m _128n"} role={"checkbox"} aria-checked={"true"}>
				<div className={"_128o"} onClick={function () { } } onKeyDown={function () { } } onMouseDown={function () { } } tabIndex={"-1"}>
					<div className={"_128p"}></div>
				</div>
				{null}
			</div>
		);
	}

	var AdsStatusSwitchInternal376 = function () {
		return <BUISwitch375 />;
	}

	var AdsStatusSwitch377 = function () {
		return <AdsStatusSwitchInternal376 />;
	}

	var TransitionCell378 = function () {
		return (
			<div dataKey={"ad.adgroup_status"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={60} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"ad.adgroup_status"} height={32} rowIndex={0} style={{ "height": 32, "width": 60 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_15si _4h2r"}>
							<AdsStatusSwitch377 />
						</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell379 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 60, "left": 311 }}>
				{undefined}
				<TransitionCell378 />
			</div>
		);
	}

	var ReactImage380 = function () {
		return <i aria-label={"Pending Review"} data-hover={"tooltip"} className={"_4ms8 img sp_UuU9HmrQ397 sx_ced63f"} src={null} width={"7"} height={"7"}></i>;
	}

	var AdsPEActivityStatusIndicator381 = function () {
		return (
			<div className={"_k4-"}>
				<ReactImage380 />
				{"Pending Review"}
				{undefined}
			</div>
		);
	}

	var TransitionCell382 = function () {
		return (
			<div dataKey={"ukiAdData.computed_activity_status"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={150} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"ukiAdData.computed_activity_status"} height={32} rowIndex={0} style={{ "height": 32, "width": 150 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _4h2r"}>
							<AdsPEActivityStatusIndicator381 />
						</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell383 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 150, "left": 371 }}>
				{undefined}
				<TransitionCell382 />
			</div>
		);
	}

	var FixedDataTableCellGroupImpl384 = function () {
		return (
			<div className={"_3pzj"} style={{ "height": 32, "position": "absolute", "width": 521, "zIndex": 2, "transform": "translate3d(0px,0px,0)", "backfaceVisibility": "hidden" }}>
				<FixedDataTableCell364 key={"cell_0"} />
				<FixedDataTableCell368 key={"cell_1"} />
				<FixedDataTableCell371 key={"cell_2"} />
				<FixedDataTableCell374 key={"cell_3"} />
				<FixedDataTableCell379 key={"cell_4"} />
				<FixedDataTableCell383 key={"cell_5"} />
			</div>
		);
	}

	var FixedDataTableCellGroup385 = function () {
		return (
			<div style={{ "height": 32, "left": 0 }} className={"_3pzk"}>
				<FixedDataTableCellGroupImpl384 />
			</div>
		);
	}

	var TransitionCell386 = function () {
		return (
			<div dataKey={"stats.unique_impressions"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={60} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"stats.unique_impressions"} height={32} rowIndex={0} style={{ "height": 32, "width": 60 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _2g7x _4h2r"}>{" — "}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell387 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 32, "width": 60, "left": 0 }}>
				{undefined}
				<TransitionCell386 />
			</div>
		);
	}

	var TransitionCell388 = function () {
		return (
			<div dataKey={"stats.impressions"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={80} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"stats.impressions"} height={32} rowIndex={0} style={{ "height": 32, "width": 80 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _2g7x _4h2r"}>{" — "}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell389 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 32, "width": 80, "left": 60 }}>
				{undefined}
				<TransitionCell388 />
			</div>
		);
	}

	var TransitionCell390 = function () {
		return (
			<div dataKey={"stats.avg_cpm"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={80} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"stats.avg_cpm"} height={32} rowIndex={0} style={{ "height": 32, "width": 80 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _2g7x _4h2r"}>{" — "}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell391 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 32, "width": 80, "left": 140 }}>
				{undefined}
				<TransitionCell390 />
			</div>
		);
	}

	var TransitionCell392 = function () {
		return (
			<div dataKey={"stats.avg_cpc"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={78} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"stats.avg_cpc"} height={32} rowIndex={0} style={{ "height": 32, "width": 78 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _2g7x _4h2r"}>{" — "}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell393 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 32, "width": 78, "left": 220 }}>
				{undefined}
				<TransitionCell392 />
			</div>
		);
	}

	var TransitionCell394 = function () {
		return (
			<div dataKey={"stats.actions"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={140} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"stats.actions"} height={32} rowIndex={0} style={{ "height": 32, "width": 140 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _2g7x _4h2r"}>{" — "}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell395 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 32, "width": 140, "left": 298 }}>
				{undefined}
				<TransitionCell394 />
			</div>
		);
	}

	var TransitionCell396 = function () {
		return (
			<div dataKey={"stats.cpa"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={140} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"stats.cpa"} height={32} rowIndex={0} style={{ "height": 32, "width": 140 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _2g7x _4h2r"}>{" — "}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell397 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 32, "width": 140, "left": 438 }}>
				{undefined}
				<TransitionCell396 />
			</div>
		);
	}

	var TransitionCell398 = function () {
		return (
			<div dataKey={"stats.clicks"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={60} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"stats.clicks"} height={32} rowIndex={0} style={{ "height": 32, "width": 60 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _2g7x _4h2r"}>{" — "}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell399 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 32, "width": 60, "left": 578 }}>
				{undefined}
				<TransitionCell398 />
			</div>
		);
	}

	var TransitionCell400 = function () {
		return (
			<div dataKey={"stats.ctr"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={70} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"stats.ctr"} height={32} rowIndex={0} style={{ "height": 32, "width": 70 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _2g7x _4h2r"}>{" — "}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell401 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 32, "width": 70, "left": 638 }}>
				{undefined}
				<TransitionCell400 />
			</div>
		);
	}

	var TransitionCell402 = function () {
		return (
			<div dataKey={"stats.social_percent"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={80} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"stats.social_percent"} height={32} rowIndex={0} style={{ "height": 32, "width": 80 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _2g7x _4h2r"}>{" — "}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell403 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 32, "width": 80, "left": 708 }}>
				{undefined}
				<TransitionCell402 />
			</div>
		);
	}

	var FixedDataTableCellDefault404 = function () {
		return (
			<div dataKey={"campaign.name"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={100} columnData={{}} cellDataGetter={function () { } } cellRenderer={undefined} columnKey={"campaign.name"} height={32} rowIndex={0} style={{ "height": 32, "width": 100 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_4h2r"}>{"Test Ad Set"}</div>
					</div>
				</div>
			</div>
		);
	}

	var TransitionCell405 = function () {
		return <FixedDataTableCellDefault404 />;
	}

	var FixedDataTableCell406 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 100, "left": 788 }}>
				{undefined}
				<TransitionCell405 />
			</div>
		);
	}

	var FixedDataTableCellDefault407 = function () {
		return (
			<div dataKey={"campaignGroup.name"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={150} columnData={{}} cellDataGetter={function () { } } cellRenderer={undefined} columnKey={"campaignGroup.name"} height={32} rowIndex={0} style={{ "height": 32, "width": 150 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_4h2r"}>{"Test Campaign"}</div>
					</div>
				</div>
			</div>
		);
	}

	var TransitionCell408 = function () {
		return <FixedDataTableCellDefault407 />;
	}

	var FixedDataTableCell409 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 150, "left": 888 }}>
				{undefined}
				<TransitionCell408 />
			</div>
		);
	}

	var TransitionCell410 = function () {
		return (
			<div dataKey={"ad.id"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={120} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"ad.id"} height={32} rowIndex={0} style={{ "height": 32, "width": 120 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _4h2r"}>{"98010048849345"}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell411 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 120, "left": 1038 }}>
				{undefined}
				<TransitionCell410 />
			</div>
		);
	}

	var TransitionCell412 = function () {
		return (
			<div dataKey={"campaignGroup.objective"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={80} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"campaignGroup.objective"} height={32} rowIndex={0} style={{ "height": 32, "width": 80 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _4h2r"}>{"Clicks to Website"}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell413 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 80, "left": 1158 }}>
				{undefined}
				<TransitionCell412 />
			</div>
		);
	}

	var TransitionCell414 = function () {
		return (
			<div dataKey={"stats.spent_100"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={70} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"stats.spent_100"} height={32} rowIndex={0} style={{ "height": 32, "width": 70 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _2g7x _4h2r"}>{" — "}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell415 = function () {
		return (
			<div className={"_4lg0 _4lg5 _4h2p _4h2m"} style={{ "height": 32, "width": 70, "left": 1238 }}>
				{undefined}
				<TransitionCell414 />
			</div>
		);
	}

	var ReactDate416 = function () {
		return <span>{"10/24/2015"}</span>;
	}

	var TransitionCell417 = function () {
		return (
			<div dataKey={"derivedCampaign.startDate"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={113} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"derivedCampaign.startDate"} height={32} rowIndex={0} style={{ "height": 32, "width": 113 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _4h2r"}>
							<ReactDate416 />
						</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell418 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 113, "left": 1308 }}>
				{undefined}
				<TransitionCell417 />
			</div>
		);
	}

	var TransitionCell419 = function () {
		return (
			<div dataKey={"derivedCampaign.endDate"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={113} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"derivedCampaign.endDate"} height={32} rowIndex={0} style={{ "height": 32, "width": 113 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _4h2r"}>{"Ongoing"}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell420 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 113, "left": 1421 }}>
				{undefined}
				<TransitionCell419 />
			</div>
		);
	}

	var ReactDate421 = function () {
		return <span>{"10/24/2015"}</span>;
	}

	var TransitionCell422 = function () {
		return (
			<div dataKey={"ad.created_time"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={113} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"ad.created_time"} height={32} rowIndex={0} style={{ "height": 32, "width": 113 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _4h2r"}>
							<ReactDate421 />
						</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell423 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 113, "left": 1534 }}>
				{undefined}
				<TransitionCell422 />
			</div>
		);
	}

	var ReactDate424 = function () {
		return <span>{"10/24/2015"}</span>;
	}

	var TransitionCell425 = function () {
		return (
			<div dataKey={"ad.updated_time"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={113} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"ad.updated_time"} height={32} rowIndex={0} style={{ "height": 32, "width": 113 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _4h2r"}>
							<ReactDate424 />
						</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell426 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 113, "left": 1647 }}>
				{undefined}
				<TransitionCell425 />
			</div>
		);
	}

	var TransitionCell427 = function () {
		return (
			<div dataKey={"ad.title"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={80} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"ad.title"} height={32} rowIndex={0} style={{ "height": 32, "width": 80 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _4h2r"}>{"Example"}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell428 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 80, "left": 1760 }}>
				{undefined}
				<TransitionCell427 />
			</div>
		);
	}

	var TransitionCell429 = function () {
		return (
			<div dataKey={"ad.creative.body"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={80} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"ad.creative.body"} height={32} rowIndex={0} style={{ "height": 32, "width": 80 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _4h2r"}>{"It's an example."}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell430 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 80, "left": 1840 }}>
				{undefined}
				<TransitionCell429 />
			</div>
		);
	}

	var TransitionCell431 = function () {
		return (
			<div dataKey={"destination"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={92} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"destination"} height={32} rowIndex={0} style={{ "height": 32, "width": 92 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _4h2r"}></div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell432 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 92, "left": 1920 }}>
				{undefined}
				<TransitionCell431 />
			</div>
		);
	}

	var TransitionCell433 = function () {
		return (
			<div dataKey={"ad.creative.link_url"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={70} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"ad.creative.link_url"} height={32} rowIndex={0} style={{ "height": 32, "width": 70 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _4h2r"}>{"http://www.example.com/"}</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell434 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 70, "left": 2012 }}>
				{undefined}
				<TransitionCell433 />
			</div>
		);
	}

	var FixedDataTableCellDefault435 = function () {
		return (
			<div dataKey={"page"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={92} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"page"} height={32} rowIndex={0} style={{ "height": 32, "width": 92 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_4h2r"}></div>
					</div>
				</div>
			</div>
		);
	}

	var TransitionCell436 = function () {
		return <FixedDataTableCellDefault435 />;
	}

	var FixedDataTableCell437 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 92, "left": 2082 }}>
				{undefined}
				<TransitionCell436 />
			</div>
		);
	}

	var Link438 = function () {
		return <a href2={"https://www.facebook.com/?demo_ad=98010048849345&h=AQA24w3temAtB-5f#pagelet_ego_pane"} target={"_blank"} rel={undefined} onClick={function () { } }>{"Preview Ad"}</a>;
	}

	var ReactImage439 = function () {
		return <i src={null} className={"_541d img sp_R48dKBxiJkP sx_dc2cdb"}></i>;
	}

	var AdsPopoverLink440 = function () {
		return (
			<span ref2={"tipIcon"} onMouseEnter={function () { } } onMouseLeave={function () { } }>
				<span className={"_3o_j"}></span>
				<ReactImage439 />
			</span>
		);
	}

	var AdsHelpLink441 = function () {
		return <AdsPopoverLink440 />;
	}

	var TransitionCell442 = function () {
		return (
			<div dataKey={"ad.demolink_hash"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={100} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"ad.demolink_hash"} height={32} rowIndex={0} style={{ "height": 32, "width": 100 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_4h2r"}>
							<Link438 />
							<AdsHelpLink441 />
						</div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell443 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 100, "left": 2174 }}>
				{undefined}
				<TransitionCell442 />
			</div>
		);
	}

	var TransitionCell444 = function () {
		return (
			<div dataKey={"scrollbar_spacer"} className={"_4lgc _4h2u"} rowGetter={function () { } } width={25} columnData={{}} cellDataGetter={function () { } } cellRenderer={function () { } } columnKey={"scrollbar_spacer"} height={32} rowIndex={0} style={{ "height": 32, "width": 25 }}>
				<div className={"_4lgd _4h2w"}>
					<div className={"_4lge _4h2x"}>
						<div className={"_2d6h _4h2r"}></div>
					</div>
				</div>
			</div>
		);
	}

	var FixedDataTableCell445 = function () {
		return (
			<div className={"_4lg0 _4h2m"} style={{ "height": 32, "width": 25, "left": 2274 }}>
				{undefined}
				<TransitionCell444 />
			</div>
		);
	}

	var FixedDataTableCellGroupImpl446 = function () {
		return (
			<div className={"_3pzj"} style={{ "height": 32, "position": "absolute", "width": 2299, "zIndex": 0, "transform": "translate3d(0px,0px,0)", "backfaceVisibility": "hidden" }}>
				<FixedDataTableCell387 key={"cell_0"} />
				<FixedDataTableCell389 key={"cell_1"} />
				<FixedDataTableCell391 key={"cell_2"} />
				<FixedDataTableCell393 key={"cell_3"} />
				<FixedDataTableCell395 key={"cell_4"} />
				<FixedDataTableCell397 key={"cell_5"} />
				<FixedDataTableCell399 key={"cell_6"} />
				<FixedDataTableCell401 key={"cell_7"} />
				<FixedDataTableCell403 key={"cell_8"} />
				<FixedDataTableCell406 key={"cell_9"} />
				<FixedDataTableCell409 key={"cell_10"} />
				<FixedDataTableCell411 key={"cell_11"} />
				<FixedDataTableCell413 key={"cell_12"} />
				<FixedDataTableCell415 key={"cell_13"} />
				<FixedDataTableCell418 key={"cell_14"} />
				<FixedDataTableCell420 key={"cell_15"} />
				<FixedDataTableCell423 key={"cell_16"} />
				<FixedDataTableCell426 key={"cell_17"} />
				<FixedDataTableCell428 key={"cell_18"} />
				<FixedDataTableCell430 key={"cell_19"} />
				<FixedDataTableCell432 key={"cell_20"} />
				<FixedDataTableCell434 key={"cell_21"} />
				<FixedDataTableCell437 key={"cell_22"} />
				<FixedDataTableCell443 key={"cell_23"} />
				<FixedDataTableCell445 key={"cell_24"} />
			</div>
		);
	}

	var FixedDataTableCellGroup447 = function () {
		return (
			<div style={{ "height": 32, "left": 521 }} className={"_3pzk"}>
				<FixedDataTableCellGroupImpl446 />
			</div>
		);
	}

	var FixedDataTableRowImpl448 = function () {
		return (
			<div className={"_1gd4 _4li _52no _35m0 _35m1 _3c7k _4efq _4efs"} onClick={null} onDoubleClick={null} onMouseDown={function () { } } onMouseEnter={null} onMouseLeave={null} style={{ "width": 1083, "height": 32 }}>
				<div className={"_1gd5"}>
					<FixedDataTableCellGroup385 key={"fixed_cells"} />
					<FixedDataTableCellGroup447 key={"scrollable_cells"} />
					<div className={"_1gd6 _1gd8"} style={{ "left": 521, "height": 32 }}></div>
				</div>
			</div>
		);
	}

	var FixedDataTableRow449 = function () {
		return (
			<div style={{ "width": 1083, "height": 32, "zIndex": 0, "transform": "translate3d(0px,0px,0)", "backfaceVisibility": "hidden" }} className={"_1gda"}>
				<FixedDataTableRowImpl448 />
			</div>
		);
	}

	var FixedDataTableBufferedRows450 = function () {
		return (
			<div style={{ "position": "absolute", "pointerEvents": "auto", "transform": "translate3d(0px,65px,0)", "backfaceVisibility": "hidden" }}>
				<FixedDataTableRow449 key={"0"} />
			</div>
		);
	}

	var Scrollbar451 = function () {
		return (
			<div onFocus={function () { } } onBlur={function () { } } onKeyDown={function () { } } onMouseDown={function () { } } onWheel={function () { } } className={"_1t0r _1t0t _4jdr _1t0u"} style={{ "width": 1083, "zIndex": 99 }} tabIndex={0}>
				<div ref2={"face"} className={"_1t0w _1t0y _1t0_"} style={{ "width": 407.918085106383, "transform": "translate3d(4px,0px,0)", "backfaceVisibility": "hidden" }}></div>
			</div>
		);
	}

	var HorizontalScrollbar452 = function () {
		return (
			<div className={"_3h1k _3h1m"} style={{ "height": 15, "width": 1083 }}>
				<div style={{ "height": 15, "position": "absolute", "overflow": "hidden", "width": 1083, "transform": "translate3d(0px,0px,0)", "backfaceVisibility": "hidden" }}>
					<Scrollbar451 />
				</div>
			</div>
		);
	}

	var FixedDataTable453 = function () {
		return (
			<div className={"_3h1i _1mie"} onWheel={function () { } } style={{ "height": 532, "width": 1083 }}>
				<div className={"_3h1j"} style={{ "height": 515, "width": 1083 }}>
					<FixedDataTableColumnResizeHandle178 />
					<FixedDataTableRow206 key={"group_header"} />
					<FixedDataTableRow360 key={"header"} />
					<FixedDataTableBufferedRows450 />
					{null}
					{undefined}
					{undefined}
				</div>
				{undefined}
				<HorizontalScrollbar452 />
			</div>
		);
	}

	var TransitionTable454 = function () {
		return <FixedDataTable453 />;
	}

	var AdsSelectableFixedDataTable455 = function () {
		return (
			<div className={"_5hht"}>
				<TransitionTable454 />
			</div>
		);
	}

	var AdsDataTableKeyboardSupportDecorator456 = function () {
		return (
			<div ref2={"tableContainer"} className={"_5d6f"} tabIndex={"0"} onKeyDown={function () { } }>
				<AdsSelectableFixedDataTable455 />
			</div>
		);
	}

	var AdsEditableDataTableDecorator457 = function () {
		return (
			<div onCopy={function () { } }>
				<AdsDataTableKeyboardSupportDecorator456 ref2={"decoratedTable"} />
			</div>
		);
	}

	var AdsPEDataTableContainer458 = function () {
		return (
			<div className={"_35l_"}>
				{null}
				{null}
				<AdsEditableDataTableDecorator457 />
			</div>
		);
	}

	var ResponsiveBlock459 = function () {
		return (
			<div onResize={function () { } } className={"_4u-c"}>
				<AdsPEDataTableContainer458 />
				<div key={"sensor"} className={"_4u-f"}>
					<iframe ref2={"sensorNode"} aria-hidden={"true"} className={"_4u-g"} tabIndex={"-1"}></iframe>
				</div>
			</div>
		);
	}

	var AdsPEAdTableContainer460 = function () {
		return <ResponsiveBlock459 />;
	}

	var AdsPEManageAdsPaneContainer461 = function () {
		return (
			<div className={"_2utw"}>
				{null}
				<div className={"_2utx _41tt"}>
					<AdsPEFilterContainer104 />
					<AdsPECampaignTimeLimitNoticeContainer106 />
					{null}
				</div>
				<div className={" _41ts"}>
					<AdsPEAdgroupToolbarContainer169 />
				</div>
				<div className={"_2utz"}>
					<div className={"_2ut-"}>
						<AdsPEOrganizerContainer177 />
					</div>
					<div className={"_2ut_"}>
						<AdsPEAdTableContainer460 />
					</div>
				</div>
			</div>
		);
	}

	var AdsPEContentContainer462 = function () {
		return <AdsPEManageAdsPaneContainer461 />;
	}

	var FluxContainer_r_463 = function () {
		return (
			<div className={"mainWrapper"} style={{ "width": 1192 }}>
				<FluxContainer_r_69 />
				<AdsPEContentContainer462 />
				{null}
			</div>
		);
	}

	var FluxContainer_q_464 = function () {
		return null;
	}

	var AdsPEUploadDialog465 = function () {
		return null;
	}

	var FluxContainer_y_466 = function () {
		return <AdsPEUploadDialog465 />;
	}

	var ReactImage467 = function () {
		return <i className={"_1-lx img sp_UuU9HmrQ397 sx_990b54"} src={null}></i>;
	}

	var AdsPESideTrayTabButton468 = function () {
		return (
			<div onClick={function () { } } className={"_1-ly _59j9 _d9a"}>
				<ReactImage467 />
				<div className={"_vf7"}></div>
				<div className={"_vf8"}></div>
			</div>
		);
	}

	var AdsPEEditorTrayTabButton469 = function () {
		return <AdsPESideTrayTabButton468 />;
	}

	var ReactImage470 = function () {
		return <i className={"_1-lx img sp_UuU9HmrQ397 sx_94017f"} src={null}></i>;
	}

	var AdsPESideTrayTabButton471 = function () {
		return (
			<div onClick={function () { } } className={" _1-lz _d9a"}>
				<ReactImage470 />
				<div className={"_vf7"}></div>
				<div className={"_vf8"}></div>
			</div>
		);
	}

	var AdsPEInsightsTrayTabButton472 = function () {
		return <AdsPESideTrayTabButton471 />;
	}

	var AdsPESideTrayTabButton473 = function () {
		return null;
	}

	var AdsPENekoDebuggerTrayTabButton474 = function () {
		return <AdsPESideTrayTabButton473 />;
	}

	var FBDragHandle475 = function () {
		return <div style={{ "height": 550 }} className={"_4a2j _2ciy _2ciz"} horizontal={true} onStart={function () { } } onEnd={function () { } } onChange={function () { } } initialData={function () { } } vertical={false} throttle={25} delay={0} threshold={0} onMouseDown={function () { } } onMouseUp={function () { } } onMouseLeave={function () { } }></div>;
	}

	var XUIText476 = function () {
		return <span size={"large"} weight={"bold"} className={"_2x9f  _50f5 _50f7"} display={"inline"}>{"Editing Ad"}</span>;
	}

	var XUIText477 = function () {
		return <span size={"large"} weight={"bold"} display={"inline"} className={" _50f5 _50f7"}>{"Test Ad"}</span>;
	}

	var AdsPEEditorChildLink478 = function () {
		return null;
	}

	var AdsPEEditorChildLinkContainer479 = function () {
		return <AdsPEEditorChildLink478 />;
	}

	var AdsPEHeaderSection480 = function () {
		return (
			<div className={"_yke"}>
				<div className={"_2x9d _pry"}></div>
				<XUIText476 />
				<div className={"_3a-a"}>
					<div className={"_3a-b"}>
						<XUIText477 />
					</div>
				</div>
				{null}
				<AdsPEEditorChildLinkContainer479 />
			</div>
		);
	}

	var AdsPEAdgroupHeaderSectionContainer481 = function () {
		return <AdsPEHeaderSection480 />;
	}

	var AdsPEAdgroupDisapprovalMessage482 = function () {
		return null;
	}

	var FluxContainer_r_483 = function () {
		return <AdsPEAdgroupDisapprovalMessage482 />;
	}

	var AdsPEAdgroupAutoNamingConfirmationContainer484 = function () {
		return null;
	}

	var AdsLabeledField485 = function () {
		return (
			<div className={"_5ir9 _3bvz"} label={"Ad Name"} labelSize={"small"}>
				<label className={"_4el4 _3qwj _3hy-"} htmlFor={undefined}>
					{"Ad Name"}
					{" "}
					{undefined}
				</label>
				{null}
				<div className={"_3bv-"}></div>
			</div>
		);
	}

	var ReactXUIError486 = function () {
		return (
			<div className={"_5ira _2vl4 _1h18"}>
				{null}
				{null}
				<div className={"_2vl9 _1h1f"} style={{ "backgroundColor": "#fff" }}>
					<div className={"_2vla _1h1g"}>
						<div>
							{null}
							<textarea ref2={"input"} id={undefined} disabled={undefined} onKeyDown={function () { } } onFocus={function () { } } onBlur={function () { } } onChange={function () { } } dir={"auto"} maxLength={null} className={"_2vli _2vlj _1h26 _1h27"} value={"Test Ad"}></textarea>
							{null}
						</div>
						<div ref2={"shadowText"} aria-hidden={"true"} className={"_2vlk"}></div>
					</div>
				</div>
				{null}
			</div>
		);
	}

	var AdsTextInput487 = function () {
		return <ReactXUIError486 />;
	}

	var Link488 = function () {
		return <a className={"_5ir9"} label={"Rename using available fields"} onMouseDown={function () { } } href2={"#"} rel={undefined} onClick={function () { } }>{"Rename using available fields"}</a>;
	}

	var AdsAutoNamingTemplateDialog489 = function () {
		return <Link488 ref2={"link"} />;
	}

	var AdsPEAmbientNUXMegaphone490 = function () {
		return (
			<span ref2={"mainChild"}>
				<AdsAutoNamingTemplateDialog489 />
			</span>
		);
	}

	var AdsLabeledField491 = function () {
		return (
			<div className={"_5ir9 _3bvz"} label={"Status"} labelSize={"small"}>
				<label className={"_4el4 _3qwj _3hy-"} htmlFor={undefined}>
					{"Status"}
					{" "}
					{undefined}
				</label>
				{null}
				<div className={"_3bv-"}></div>
			</div>
		);
	}

	var BUISwitch492 = function () {
		return (
			<div value={true} disabled={true} onToggle={function () { } } data-hover={"tooltip"} data-tooltip-position={"below"} aria-label={"Currently active and you can not deactivate it."} animate={true} className={"_128j _128k _128m _128n"} role={"checkbox"} aria-checked={"true"}>
				<div className={"_128o"} onClick={function () { } } onKeyDown={function () { } } onMouseDown={function () { } } tabIndex={"-1"}>
					<div className={"_128p"}></div>
				</div>
				{null}
			</div>
		);
	}

	var AdsStatusSwitchInternal493 = function () {
		return <BUISwitch492 />;
	}

	var AdsStatusSwitch494 = function () {
		return <AdsStatusSwitchInternal493 />;
	}

	var LeftRight495 = function () {
		return (
			<div className={"clearfix"}>
				<div key={"left"} className={"_ohe lfloat"}>
					<div>
						<AdsLabeledField485 />
						<span className={"_5irl"}>
							<AdsTextInput487 key={"nameEditor98010048849345"} ref2={"nameTextInput"} />
							<AdsPEAmbientNUXMegaphone490 />
						</span>
					</div>
				</div>
				<div key={"right"} className={"_ohf rfloat"}>
					<div>
						<AdsLabeledField491 />
						<div className={"_5irp"}>
							<AdsStatusSwitch494 />
						</div>
					</div>
				</div>
			</div>
		);
	}

	var XUICard496 = function () {
		return (
			<div className={"_5ir8 _12k2 _4-u2  _4-u8"} xuiErrorPosition={"above"} background={"white"}>
				<LeftRight495 />
			</div>
		);
	}

	var ReactXUIError497 = function () {
		return <XUICard496 />;
	}

	var AdsCard498 = function () {
		return <ReactXUIError497 />;
	}

	var AdsPENameSection499 = function () {
		return <AdsCard498 />;
	}

	var AdsPEAdgroupNameSectionContainer500 = function () {
		return <AdsPENameSection499 />;
	}

	var XUICardHeaderTitle501 = function () {
		return (
			<span itemComponent={"span"} className={"_38my"}>
				{"Ad Links"}
				{null}
				<span className={"_c1c"}></span>
			</span>
		);
	}

	var XUICardSection502 = function () {
		return (
			<div className={"_5dw9 _5dwa _4-u3"} background={"transparent"}>
				{[
					<XUICardHeaderTitle501 key={"/.0"} />,
				]}
				{undefined}
				{undefined}
				<div className={"_3s3-"}></div>
			</div>
		);
	}

	var XUICardHeader503 = function () {
		return <XUICardSection502 />;
	}

	var AdsCardHeader504 = function () {
		return <XUICardHeader503 />;
	}

	var XUIText505 = function () {
		return <div className={"_502s"} display={"block"} size={"inherit"} weight={"inherit"}>{"Ad ID 98010048849345"}</div>;
	}

	var Link506 = function () {
		return <a target={"_blank"} href2={"/ads/manager/ad/?ids=98010048849345"} onClick={function () { } } rel={undefined}>{"Open in Ads Manager"}</a>;
	}

	var Link507 = function () {
		return <a target={"_blank"} href2={"#"} onClick={function () { } } rel={undefined}>{"Open in Ads Reporting"}</a>;
	}

	var Link508 = function () {
		return <a target={"_blank"} href2={"https://www.facebook.com/?demo_ad=98010048849345&h=AQA24w3temAtB-5f#pagelet_ego_pane"} onClick={function () { } } rel={undefined}>{"View on Desktop Right Column"}</a>;
	}

	var Link509 = function () {
		return <a target={"_blank"} href2={"/ads/manage/powereditor/?act=10149999073643408&adgroup=98010048849345"} onClick={function () { } } rel={undefined}>{"Open Power Editor with this ad selected"}</a>;
	}

	var List510 = function () {
		return (
			<ul spacing={"small"} border={"none"} direction={"vertical"} valign={"top"} className={"uiList _4kg _6-i _6-h _704"}>
				{null}
				<li key={"/ads/manager/ad/?ids=98010048849345"}>
					<Link506 />
				</li>
				<li key={"#"}>
					<Link507 />
				</li>
				{null}
				<li key={"https://www.facebook.com/?demo_ad=98010048849345&h=AQA24w3temAtB-5f#pagelet_ego_pane"}>
					<Link508 />
				</li>
				{null}
				{null}
				{null}
				<li key={"/ads/manage/powereditor/?act=10149999073643408&adgroup=98010048849345"}>
					<Link509 />
				</li>
				{null}
			</ul>
		);
	}

	var XUICardSection511 = function () {
		return (
			<div className={"_12jy _4-u3"} background={"transparent"}>
				<div className={"_3-8j"}>
					<XUIText505 />
					<List510 />
				</div>
			</div>
		);
	}

	var AdsCardSection512 = function () {
		return <XUICardSection511 />;
	}

	var XUICard513 = function () {
		return (
			<div xuiErrorPosition={"above"} className={"_12k2 _4-u2  _4-u8"} background={"white"}>
				<AdsCardHeader504 />
				<AdsCardSection512 />
			</div>
		);
	}

	var ReactXUIError514 = function () {
		return <XUICard513 />;
	}

	var AdsCard515 = function () {
		return <ReactXUIError514 />;
	}

	var AdsPELinkList516 = function () {
		return <AdsCard515 />;
	}

	var AdsPEAdgroupLinksSection517 = function () {
		return <AdsPELinkList516 />;
	}

	var AdsPEAdgroupLinksSectionContainer518 = function () {
		return (
			<div>
				<AdsPEAdgroupLinksSection517 />
				{null}
			</div>
		);
	}

	var XUICardHeaderTitle519 = function () {
		return (
			<span itemComponent={"span"} className={"_38my"}>
				{"Preview"}
				{null}
				<span className={"_c1c"}></span>
			</span>
		);
	}

	var XUICardSection520 = function () {
		return (
			<div className={"_5dw9 _5dwa _4-u3"} background={"transparent"}>
				{[
					<XUICardHeaderTitle519 key={"/.0"} />,
				]}
				{undefined}
				{undefined}
				<div className={"_3s3-"}></div>
			</div>
		);
	}

	var XUICardHeader521 = function () {
		return <XUICardSection520 />;
	}

	var AdsCardHeader522 = function () {
		return <XUICardHeader521 />;
	}

	var PillButton523 = function () {
		return <a label={null} selected={true} onClick={function () { } } href2={"#"} className={"uiPillButton uiPillButtonSelected"}>{"Desktop Right Column"}</a>;
	}

	var List524 = function () {
		return (
			<ul className={"uiList  _4ki _509- _6-i _6-h _704"} border={"none"} direction={"horizontal"} spacing={"small"} valign={"top"}>
				<li key={"0/.$RIGHT_COLUMN_STANDARD"}>
					<PillButton523 key={"RIGHT_COLUMN_STANDARD"} />
				</li>
			</ul>
		);
	}

	var PillList525 = function () {
		return <List524 />;
	}

	var XUICardSection526 = function () {
		return (
			<div background={"light-wash"} className={"_14p9 _12jy _4-u3  _57d8"}>
				<div className={"_3-8j"}>
					<PillList525 />
				</div>
			</div>
		);
	}

	var AdsCardSection527 = function () {
		return <XUICardSection526 />;
	}

	var AdsPEPreviewPillList528 = function () {
		return <AdsCardSection527 />;
	}

	var XUISpinner529 = function () {
		return <span size={"large"} className={"hidden_elem img _55ym _55yq _55yo"} showOnAsync={false} background={"light"} aria-label={"Loading..."} aria-busy={true}></span>;
	}

	var ReactImage530 = function () {
		return (
			<i alt={"Warning"} className={"_585p img sp_R48dKBxiJkP sx_aed870"} src={null}>
				<u>{"Warning"}</u>
			</i>
		);
	}

	var XUINotice531 = function () {
		return (
			<div size={"medium"} className={"_585n _585o"}>
				<ReactImage530 />
				{null}
				<div className={"_585r _50f4"}>{"Unable to display a preview for this ad."}</div>
			</div>
		);
	}

	var AdPreview532 = function () {
		return (
			<div className={"_2hm6"}>
				<div className={undefined}>
					<div className={"_3akw"}>
						<XUISpinner529 />
					</div>
					<div className={"hidden_elem"}>
						<XUINotice531 />
					</div>
					<div ref2={"pageletContainer"} className={""}></div>
				</div>
			</div>
		);
	}

	var XUICardSection533 = function () {
		return (
			<div className={"_3m4g _12jy _4-u3"} style={{ "maxHeight": "425px" }} background={"transparent"}>
				<div className={"_3-8j"}>
					<div className={"_14p7"}>
						<div className={"_14p8"}>
							<AdPreview532 />
						</div>
					</div>
				</div>
			</div>
		);
	}

	var AdsCardSection534 = function () {
		return <XUICardSection533 />;
	}

	var AdsPEPreview535 = function () {
		return (
			<div>
				<AdsPEPreviewPillList528 ref2={"pillList"} />
				{undefined}
				<AdsCardSection534 />
			</div>
		);
	}

	var AdsPEStandardPreview536 = function () {
		return <AdsPEPreview535 />;
	}

	var AdsPEStandardPreviewContainer537 = function () {
		return <AdsPEStandardPreview536 />;
	}

	var XUICard538 = function () {
		return (
			<div xuiErrorPosition={"above"} className={"_12k2 _4-u2  _4-u8"} background={"white"}>
				<AdsCardHeader522 />
				{null}
				<AdsPEStandardPreviewContainer537 />
			</div>
		);
	}

	var ReactXUIError539 = function () {
		return <XUICard538 />;
	}

	var AdsCard540 = function () {
		return <ReactXUIError539 />;
	}

	var AdsPEAdgroupPreviewSection541 = function () {
		return <AdsCard540 />;
	}

	var AdsPEAdgroupPreviewSectionContainer542 = function () {
		return <AdsPEAdgroupPreviewSection541 />;
	}

	var AdsPEStickyArea543 = function () {
		return (
			<div>
				{null}
				<div ref2={"sticky"}>
					<AdsPEAdgroupPreviewSectionContainer542 />
				</div>
			</div>
		);
	}

	var XUICardHeaderTitle544 = function () {
		return (
			<span itemComponent={"span"} className={"_38my"}>
				{"Facebook Page"}
				{null}
				<span className={"_c1c"}></span>
			</span>
		);
	}

	var XUICardSection545 = function () {
		return (
			<div className={"_5dw9 _5dwa _4-u3"} background={"transparent"}>
				{[
					<XUICardHeaderTitle544 key={"/.0"} />,
				]}
				{undefined}
				{undefined}
				<div className={"_3s3-"}></div>
			</div>
		);
	}

	var XUICardHeader546 = function () {
		return <XUICardSection545 />;
	}

	var AdsCardHeader547 = function () {
		return <XUICardHeader546 />;
	}

	var Link548 = function () {
		return <a className={"fwb"} onClick={function () { } } href2={"#"} rel={undefined}>{"Connect a Facebook Page"}</a>;
	}

	var AdsPEWebsiteNoPageDestinationSection549 = function () {
		return (
			<div>
				<div className={"_3-95"}>{"This ad is not connected to a Facebook Page. It will not show in News Feed."}</div>
				<Link548 />
			</div>
		);
	}

	var AdsPEWebsiteNoPageDestinationSectionContainer550 = function () {
		return <AdsPEWebsiteNoPageDestinationSection549 />;
	}

	var XUICardSection551 = function () {
		return (
			<div className={"_12jy _4-u3"} background={"transparent"}>
				<div className={"_3-8j"}>
					<AdsPEWebsiteNoPageDestinationSectionContainer550 />
				</div>
			</div>
		);
	}

	var AdsCardSection552 = function () {
		return <XUICardSection551 />;
	}

	var XUICard553 = function () {
		return (
			<div xuiErrorPosition={"above"} className={"_12k2 _4-u2  _4-u8"} background={"white"}>
				<AdsCardHeader547 />
				<AdsCardSection552 />
			</div>
		);
	}

	var ReactXUIError554 = function () {
		return <XUICard553 />;
	}

	var AdsCard555 = function () {
		return <ReactXUIError554 />;
	}

	var AdsPEAdgroupDestinationSection556 = function () {
		return <AdsCard555 />;
	}

	var AdsPEAdgroupDestinationSectionContainer557 = function () {
		return <AdsPEAdgroupDestinationSection556 />;
	}

	var XUICardHeaderTitle558 = function () {
		return (
			<span itemComponent={"span"} className={"_38my"}>
				{"Creative"}
				{null}
				<span className={"_c1c"}></span>
			</span>
		);
	}

	var XUICardSection559 = function () {
		return (
			<div className={"_5dw9 _5dwa _4-u3"} background={"transparent"}>
				{[
					<XUICardHeaderTitle558 key={"/.0"} />,
				]}
				{undefined}
				{undefined}
				<div className={"_3s3-"}></div>
			</div>
		);
	}

	var XUICardHeader560 = function () {
		return <XUICardSection559 />;
	}

	var AdsCardHeader561 = function () {
		return <XUICardHeader560 />;
	}

	var ReactImage562 = function () {
		return <i src={null} className={"_541d img sp_R48dKBxiJkP sx_dc2cdb"}></i>;
	}

	var AdsPopoverLink563 = function () {
		return (
			<span ref2={"tipIcon"} onMouseEnter={function () { } } onMouseLeave={function () { } }>
				<span className={"_3o_j"}></span>
				<ReactImage562 />
			</span>
		);
	}

	var AdsHelpLink564 = function () {
		return <AdsPopoverLink563 />;
	}

	var AdsLabeledField565 = function () {
		return (
			<div htmlFor={undefined} label={"Website URL"} helpText={"Enter the website URL you want to promote. Ex: http://www.example.com/page"} helpLinger={undefined} optional={undefined} labelSize={"small"} className={"_3bvz"}>
				<label className={"_4el4 _3qwj _3hy-"} htmlFor={undefined}>
					{"Website URL"}
					{" "}
					{undefined}
				</label>
				<AdsHelpLink564 />
				<div className={"_3bv-"}></div>
			</div>
		);
	}

	var ReactXUIError566 = function () {
		return (
			<div className={"_gon _2vl4 _1h18"}>
				<div className={"_2vln"}>{1001}</div>
				<AdsLabeledField565 />
				<div className={"_2vl9 _1h1f"} style={{ "backgroundColor": "#fff" }}>
					<div className={"_2vla _1h1g"}>
						<div>
							{null}
							<textarea ref2={"input"} id={undefined} disabled={undefined} onKeyDown={function () { } } onFocus={function () { } } onBlur={function () { } } onChange={function () { } } dir={"auto"} maxLength={null} className={"_2vli _2vlj _1h26 _1h27"} value={"http://www.example.com/"}></textarea>
							{null}
						</div>
						<div ref2={"shadowText"} aria-hidden={"true"} className={"_2vlk"}></div>
					</div>
				</div>
				{null}
			</div>
		);
	}

	var AdsTextInput567 = function () {
		return <ReactXUIError566 />;
	}

	var AdsBulkTextInput568 = function () {
		return <AdsTextInput567 />;
	}

	var AdsPEWebsiteURLField569 = function () {
		return <AdsBulkTextInput568 />;
	}

	var ReactImage570 = function () {
		return <i src={null} className={"_541d img sp_R48dKBxiJkP sx_dc2cdb"}></i>;
	}

	var AdsPopoverLink571 = function () {
		return (
			<span ref2={"tipIcon"} onMouseEnter={function () { } } onMouseLeave={function () { } }>
				<span className={"_3o_j"}></span>
				<ReactImage570 />
			</span>
		);
	}

	var AdsHelpLink572 = function () {
		return <AdsPopoverLink571 />;
	}

	var AdsLabeledField573 = function () {
		return (
			<div htmlFor={undefined} label={"Headline"} helpText={"Your headline text will appear differently depending on the placement of your ad. Check the previews to make sure your headline looks the way you want in the placements it appears in."} helpLinger={undefined} optional={undefined} labelSize={"small"} className={"_3bvz"}>
				<label className={"_4el4 _3qwj _3hy-"} htmlFor={undefined}>
					{"Headline"}
					{" "}
					{undefined}
				</label>
				<AdsHelpLink572 />
				<div className={"_3bv-"}></div>
			</div>
		);
	}

	var ReactXUIError574 = function () {
		return (
			<div className={"_gon _2vl4 _1h18"}>
				<div className={"_2vln"}>{18}</div>
				<AdsLabeledField573 />
				<div className={"_2vl9 _1h1f"} style={{ "backgroundColor": "#fff" }}>
					<div className={"_2vla _1h1g"}>
						<div>
							{null}
							<textarea ref2={"input"} id={undefined} disabled={undefined} onKeyDown={function () { } } onFocus={function () { } } onBlur={function () { } } onChange={function () { } } dir={"auto"} maxLength={null} className={"_2vli _2vlj _1h26 _1h27"} value={"Example"}></textarea>
							{null}
						</div>
						<div ref2={"shadowText"} aria-hidden={"true"} className={"_2vlk"}></div>
					</div>
				</div>
				{null}
			</div>
		);
	}

	var AdsTextInput575 = function () {
		return <ReactXUIError574 />;
	}

	var AdsBulkTextInput576 = function () {
		return <AdsTextInput575 />;
	}

	var AdsPEHeadlineField577 = function () {
		return <AdsBulkTextInput576 />;
	}

	var AdsLabeledField578 = function () {
		return (
			<div htmlFor={undefined} label={"Text"} helpText={undefined} helpLinger={undefined} optional={undefined} labelSize={"small"} className={"_3bvz"}>
				<label className={"_4el4 _3qwj _3hy-"} htmlFor={undefined}>
					{"Text"}
					{" "}
					{undefined}
				</label>
				{null}
				<div className={"_3bv-"}></div>
			</div>
		);
	}

	var ReactXUIError579 = function () {
		return (
			<div className={"_gon _2vl4 _2vl6 _1h18 _1h1a"}>
				<div className={"_2vln"}>{74}</div>
				<AdsLabeledField578 />
				<div className={"_2vl9 _1h1f"} style={{ "backgroundColor": "#fff" }}>
					<div className={"_2vla _1h1g"}>
						<div>
							{null}
							<textarea ref2={"input"} id={undefined} disabled={undefined} onKeyDown={function () { } } onFocus={function () { } } onBlur={function () { } } onChange={function () { } } dir={"auto"} maxLength={null} className={"_2vli _2vlj _1h26 _1h27"} value={"It's an example."}></textarea>
							{null}
						</div>
						<div ref2={"shadowText"} aria-hidden={"true"} className={"_2vlk"}></div>
					</div>
				</div>
				{null}
			</div>
		);
	}

	var AdsTextInput580 = function () {
		return <ReactXUIError579 />;
	}

	var AdsBulkTextInput581 = function () {
		return <AdsTextInput580 />;
	}

	var AdsPEMessageField582 = function () {
		return (
			<div>
				<AdsBulkTextInput581 />
				{null}
			</div>
		);
	}

	var AbstractButton583 = function () {
		return (
			<button label={null} onClick={function () { } } size={"large"} use={"default"} borderShade={"light"} suppressed={false} className={"_4jy0 _4jy4 _517h _51sy _42ft"} type={"submit"} value={"1"}>
				{undefined}
				{"Change Image"}
				{undefined}
			</button>
		);
	}

	var XUIButton584 = function () {
		return <AbstractButton583 />;
	}

	var BackgroundImage585 = function () {
		return (
			<div src={"https://scontent.xx.fbcdn.net/hads-xap1/t45.1600-4/12124737_98010048849339_1665004369_n.png"} width={114.6} height={60} backgroundSize={"contain"} optimizeResizeSpeed={false} loadingIndicatorStyle={"none"} className={"_5f0d"} style={{ "width": "114.6px", "height": "60px" }} onContextMenu={undefined}>
				<img alt={""} className={"_5i4g"} style={{ "width": "90px", "height": "60px", "left": "12px", "top": "0px" }} src={"https://scontent.xx.fbcdn.net/hads-xap1/t45.1600-4/12124737_98010048849339_1665004369_n.png"}></img>
				{undefined}
				{null}
			</div>
		);
	}

	var XUIText586 = function () {
		return <span shade={"light"} className={"_50f8"} size={"inherit"} weight={"inherit"} display={"inline"}>{"1000 × 667"}</span>;
	}

	var XUIGrayText587 = function () {
		return <XUIText586 />;
	}

	var XUIText588 = function () {
		return (
			<div className={"_3-95  _50f7"} display={"block"} weight={"bold"} size={"inherit"}>
				{"untitled – "}
				<XUIGrayText587 />
				{""}
			</div>
		);
	}

	var CenteredContainer589 = function () {
			return (
				<div className={"_50vi"} horizontal={false} vertical={true} fullHeight={false}>
					<div className={"_3bwv"}>
						<div className={"_3bwy"}>
							<div key={"/.0"} className={"_3bwx"}>
								<XUIText588 />
							</div>
							<div key={"/.1"} className={"_3bwx"}></div>
						</div>
					</div>
				</div>
			);
		}

	var Link590 = function () {
			return <a href2={"/business/ads-guide/"} target={"_blank"} rel={undefined} onClick={function () { } }>{"Facebook Ad Guidelines"}</a>;
		}

	var XUIText591 = function () {
			return (
				<div className={"_3-96"} display={"block"} size={"inherit"} weight={"inherit"}>
					{"For questions and more information, see the "}
					<Link590 />
					{"."}
				</div>
			);
		}

	var AdsImageInput592 = function () {
			return (
				<div>
					<div>
						<XUIButton584 />
						{undefined}
					</div>
					{null}
					<div className={"_50vh _3-8n _2ph_"}>
						<div className={"_37xq"}>
							<div className={"_3-90"}>
								<div className={" _1yi2"} onContextMenu={undefined}>
									<BackgroundImage585 />
								</div>
							</div>
							<CenteredContainer589 />
						</div>
						{null}
					</div>
					<XUIText591 />
					{null}
				</div>
			);
		}

	var AdsBulkImageInput593 = function () {
			return <AdsImageInput592 />;
		}

	var AdsLabeledField594 = function () {
			return (
				<div className={"_3-96 _3bvz"} label={"Image"} labelSize={"small"}>
					<label className={"_4el4 _3qwj _3hy-"} htmlFor={undefined}>
						{"Image"}
						{" "}
						{undefined}
					</label>
					{null}
					<div className={"_3bv-"}>
						<AdsBulkImageInput593 />
					</div>
				</div>
			);
		}

	var AdsPEImageSelector595 = function () {
			return <AdsLabeledField594 />;
		}

	var AdsPEImageSelectorContainer596 = function () {
			return <AdsPEImageSelector595 />;
		}

	var AdsPEWebsiteNoPageCreative597 = function () {
			return (
				<div>
					<AdsPEWebsiteURLField569 />
					<AdsPEHeadlineField577 />
					<AdsPEMessageField582 />
					<AdsPEImageSelectorContainer596 />
				</div>
			);
		}

	var AdsPEWebsiteNoPageCreativeContainer598 = function () {
			return <AdsPEWebsiteNoPageCreative597 />;
		}

	var XUICardSection599 = function () {
			return (
				<div className={"_12jy _4-u3"} background={"transparent"}>
					<div className={"_3-8j"}>
						<div></div>
						<AdsPEWebsiteNoPageCreativeContainer598 />
					</div>
				</div>
			);
		}

	var AdsCardSection600 = function () {
			return <XUICardSection599 />;
		}

	var XUICard601 = function () {
			return (
				<div xuiErrorPosition={"above"} className={"_12k2 _4-u2  _4-u8"} background={"white"}>
					<AdsCardHeader561 />
					<AdsCardSection600 />
				</div>
			);
		}

	var ReactXUIError602 = function () {
			return <XUICard601 />;
		}

	var AdsCard603 = function () {
			return <ReactXUIError602 />;
		}

	var AdsPEAdgroupCreativeSection604 = function () {
			return <AdsCard603 />;
		}

	var AdsPEAdgroupCreativeSectionContainer605 = function () {
			return <AdsPEAdgroupCreativeSection604 />;
		}

	var AdsPELeadGenFormSection606 = function () {
			return null;
		}

	var AdsPELeadGenFormContainer607 = function () {
			return <AdsPELeadGenFormSection606 />;
		}

	var XUICardHeaderTitle608 = function () {
			return (
				<span itemComponent={"span"} className={"_38my"}>
					{"Tracking"}
					{null}
					<span className={"_c1c"}></span>
				</span>
			);
		}

	var XUICardSection609 = function () {
			return (
				<div className={"_5dw9 _5dwa _4-u3"} background={"transparent"}>
					{[
						<XUICardHeaderTitle608 key={"/.0"} />,
					]}
					{undefined}
					{undefined}
					<div className={"_3s3-"}></div>
				</div>
			);
		}

	var XUICardHeader610 = function () {
			return <XUICardSection609 />;
		}

	var AdsCardHeader611 = function () {
			return <XUICardHeader610 />;
		}

	var XUIText612 = function () {
			return <span weight={"bold"} className={"_3ga-  _50f7"} size={"inherit"} display={"inline"}>{"Conversion Tracking"}</span>;
		}

	var ReactImage613 = function () {
			return <i src={null} className={"_5s_w _541d img sp_R48dKBxiJkP sx_dc2cdb"}></i>;
		}

	var AdsPopoverLink614 = function () {
			return (
				<span ref2={"tipIcon"} onMouseEnter={function () { } } onMouseLeave={function () { } }>
					<span className={"_3o_j"}></span>
					<ReactImage613 />
				</span>
			);
		}

	var AdsHelpLink615 = function () {
			return <AdsPopoverLink614 />;
		}

	var AdsCFHelpLink616 = function () {
			return <AdsHelpLink615 />;
		}

	var AdsPixelTrackingLabel617 = function () {
			return (
				<div className={"_3gay"}>
					<XUIText612 />
					<AdsCFHelpLink616 />
				</div>
			);
		}

	var ReactImage618 = function () {
			return <i src={null} className={"img _8o _8r img sp_UuU9HmrQ397 sx_ad67ef"}></i>;
		}

	var XUIText619 = function () {
			return <div size={"medium"} weight={"bold"} shade={"medium"} display={"block"} className={"_3-8m  _c24  _50f4 _50f7"}>{"Facebook Pixel"}</div>;
		}

	var XUIGrayText620 = function () {
			return <XUIText619 />;
		}

	var XUIText621 = function () {
			return <span size={"medium"} weight={"inherit"} display={"inline"} className={" _50f4"}>{"Learn More"}</span>;
		}

	var Link622 = function () {
			return (
				<a href2={"/help/336923339852238"} target={"_blank"} rel={undefined} onClick={function () { } }>
					<XUIText621 />
				</a>
			);
		}

	var XUIText623 = function () {
		return (
			<span shade={"medium"} size={"medium"} className={" _c24  _50f4"} weight={"inherit"} display={"inline"}>
				{"You can now create one pixel for tracking, optimization and remarketing."}
				<span className={"_3-99"}>
					<Link622 />
				</span>
			</span>
		);
	}

	var XUIGrayText624 = function () {
		return <XUIText623 />;
	}

	var AbstractButton625 = function () {
		return (
			<button className={"_23ng _4jy0 _4jy4 _4jy1 _51sy selected _42ft"} label={null} onClick={function () { } } size={"large"} use={"confirm"} borderShade={"light"} suppressed={false} type={"submit"} value={"1"}>
				{undefined}
				{"Create a Pixel"}
				{undefined}
			</button>
		);
	}

	var XUIButton626 = function () {
		return <AbstractButton625 />;
	}

	var AdsPixelCreateButton627 = function () {
		return <XUIButton626 />;
	}

	var LeftRight628 = function () {
		return (
			<div className={"_23nf clearfix"} direction={"left"}>
				<div key={"left"} className={"_ohe lfloat"}>
					<ReactImage618 />
				</div>
				<div key={"right"} className={""}>
					<div className={"_42ef _8u"}>
						<div>
							<XUIGrayText620 />
							<XUIGrayText624 />
							<div className={"_3-8x"}>
								<AdsPixelCreateButton627 />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	var ImageBlock629 = function () {
		return <LeftRight628 />;
	}

	var AdsPixelCreationCard630 = function () {
		return (
			<div className={"_2pie"} horizontal={true}>
				<div className={"_23ne _4fsl"}>
					<ImageBlock629 />
				</div>
			</div>
		);
	}

	var AdsPixelTrackingSelector631 = function () {
		return (
			<div className={"_3-8x _4fsk"}>
				<AdsPixelCreationCard630 key={"FacebookPixelNUX"} />
			</div>
		);
	}

	var AdsPixelTracking632 = function () {
		return (
			<div className={undefined}>
				<AdsPixelTrackingLabel617 />
				<div className={"_3-8x"}>
					<div></div>
				</div>
				<AdsPixelTrackingSelector631 />
			</div>
		);
	}

	var AdsPEPixelTracking633 = function () {
		return <AdsPixelTracking632 key={"tracking"} />;
	}

	var AdsPEPixelTrackingContainer634 = function () {
		return <AdsPEPixelTracking633 />;
	}

	var AdsPEAdgroupAppTrackingSelectorContainer635 = function () {
		return null;
	}

	var AdsPEStandardTrackingSection636 = function () {
		return (
			<div>
				{null}
				<div className={"_3-96"}>
					<AdsPEPixelTrackingContainer634 />
				</div>
				<div className={"_3-96"}>
					<AdsPEAdgroupAppTrackingSelectorContainer635 />
				</div>
				{null}
			</div>
		);
	}

	var AdsPEStandardTrackingContainer637 = function () {
		return <AdsPEStandardTrackingSection636 />;
	}

	var XUICardSection638 = function () {
		return (
			<div className={"_12jy _4-u3"} background={"transparent"}>
				<div className={"_3-8j"}>
					<AdsPEStandardTrackingContainer637 />
				</div>
			</div>
		);
	}

	var AdsCardSection639 = function () {
			return <XUICardSection638 />;
		}

	var XUICard640 = function () {
		return (
			<div xuiErrorPosition={"above"} className={"_12k2 _4-u2  _4-u8"} background={"white"}>
				<AdsCardHeader611 />
				<AdsCardSection639 />
			</div>
		);
	}

	var ReactXUIError641 = function () {
		return <XUICard640 />;
	}

	var AdsCard642 = function () {
		return <ReactXUIError641 />;
	}

	var AdsPEAdgroupTrackingSection643 = function () {
		return <AdsCard642 />;
	}

	var AdsPEAdgroupTrackingSectionContainer644 = function () {
		return <AdsPEAdgroupTrackingSection643 />;
	}

	var AdsPEAdgroupIOSection645 = function () {
		return null;
	}

	var AdsPEAdgroupIOSectionContainer646 = function () {
		return <AdsPEAdgroupIOSection645 />;
	}

	var LeftRight647 = function () {
		return (
			<div flex={"left"} direction={"right"} className={"clearfix"}>
				<div key={"right"} className={"_ohf rfloat"}>
					<div className={"_20ro _20rp"}>
						<div>
							{null}
							<AdsPEAdgroupLinksSectionContainer518 />
							<AdsPEStickyArea543 />
						</div>
					</div>
				</div>
				<div key={"left"} className={""}>
					<div className={"_42ef"}>
						<div>
							<AdsPEAdgroupDestinationSectionContainer557 />
							<AdsPEAdgroupCreativeSectionContainer605 />
							<AdsPELeadGenFormContainer607 />
							<AdsPEAdgroupTrackingSectionContainer644 />
							<AdsPEAdgroupIOSectionContainer646 />
						</div>
					</div>
				</div>
			</div>
		);
	}

	var FlexibleBlock648 = function () {
		return <LeftRight647 />;
	}

	var AdsPEMultiColumnEditor649 = function () {
		return (
			<div className={"_2j_c _ykd"}>
				<div>
					<FluxContainer_r_483 />
					{null}
					<AdsPEAdgroupAutoNamingConfirmationContainer484 />
					<AdsPEAdgroupNameSectionContainer500 />
				</div>
				<FlexibleBlock648 />
			</div>
		);
	}

	var AdsPEAdgroupEditor650 = function () {
		return (
			<div>
				<AdsPEAdgroupHeaderSectionContainer481 />
				<AdsPEMultiColumnEditor649 />
			</div>
		);
	}

	var AdsPEAdgroupEditorContainer651 = function () {
		return <AdsPEAdgroupEditor650 key={"98010048849345"} />;
	}

	var AdsPESideTrayTabContent652 = function () {
		return (
			<div className={"_1o_8 _44ra _5cyn"}>
				<AdsPEAdgroupEditorContainer651 />
			</div>
		);
	}

	var AdsPEEditorTrayTabContent653 = function () {
		return <AdsPESideTrayTabContent652 />;
	}

	var AdsPEMultiTabDrawer654 = function () {
		return (
			<div style={{ "height": 550, "width": 1027 }} tabButtons={{}} tabContentPanes={{}} enableAnimation={true} showButton={true} className={"_2kev _2kew _2kex"}>
				<div className={"_2kf0"}>
					<AdsPEEditorTrayTabButton469 key={"editor_tray_button"} />
					<AdsPEInsightsTrayTabButton472 key={"insights_tray_button"} />
					<AdsPENekoDebuggerTrayTabButton474 key={"neko_debugger_tray_button"} />
				</div>
				<div className={"_2kf1"}>
					<FBDragHandle475 />
					<AdsPEEditorTrayTabContent653 key={"EDITOR_DRAWER"} />
					{null}
				</div>
			</div>
		);
	}

	var FluxContainer_x_655 = function () {
		return <AdsPEMultiTabDrawer654 />;
	}

	var AdsBugReportContainer656 = function () {
		return null;
	}

	var AdsPEAudienceSplittingDialog657 = function () {
		return null;
	}

	var AdsPEAudienceSplittingDialogContainer658 = function () {
		return (
			<div>
				<AdsPEAudienceSplittingDialog657 />
			</div>
		);
	}

	var FluxContainer_p_659 = function () {
		return null;
	};

	var AdsPECreateDialogContainer660 = function () {
		return null;
	}

	var AdsPEContainer661 = function () {
		return (
			<div id={"ads_pe_container"}>
				{null}
				<FluxContainer_ja_26 />
				<FluxContainer_w_56 />
				<FluxContainer_r_463 />
				<FluxContainer_q_464 />
				<FluxContainer_y_466 />
				{null}
				<FluxContainer_x_655 />
				<AdsBugReportContainer656 />
				{null}
				<AdsPEAudienceSplittingDialogContainer658 />
				{null}
				{null}
				{null}
				<FluxContainer_p_659 />
				<AdsPECreateDialogContainer660 />
			</div>
		);
	}

	var Benchmark = function () {
		return <AdsPEContainer661 />;
	}

	render(<Benchmark />, container);
}

describe('Benchmark - functionalComponent (JSX)', () => {
	let container;

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container)
	});
		
	afterEach(function () {
		document.body.removeChild(container);
		render(null, container);
	});

	it('Run the benchmark once', () => {
		runBenchmark(container)
	});
});