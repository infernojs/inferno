(function() {
	"use strict";
	var elem = document.getElementById('app');

	perfMonitor.startFPSMonitor();
	perfMonitor.startMemMonitor();
	perfMonitor.initProfiler('view update');

	var staticNode = {
		children: null,
		dom: null,
		flags: 1 << 1,
		key: null,
		props: {
			className: 'arrow'
		},
		ref: null,
		type: 'div'
	};

	function renderBenchmark(dbs) {
		var length = dbs.length;
		var databases = new Array(length);

		for (var i = 0; i < length; i++) {
			var db = dbs[i];
			var lastSample = db.lastSample;
			var children = new Array(7);

			children[0] = {
				children: db.dbname,
				dom: null,
				flags: 1 << 1,
				key: null,
				props: dbName,
				ref: null,
				type: 'td'				
			};
			children[1] = {
				children: {
					children: lastSample.nbQueries + '',
					dom: null,
					flags: 1 << 1,
					key: null,
					props: {
						className: lastSample.countClassName
					},
					ref: null,
					type: 'span'					
				},
				dom: null,
				flags: 1 << 1,
				key: null,
				props: dbQueryCount,
				ref: null,
				type: 'td'				
			};

			for (var i2 = 0; i2 < 5; i2++) {
				var query = lastSample.topFiveQueries[i2];

				children[i2 + 2] = {
					children: [
						{
							children: query.formatElapsed,
							dom: null,
							flags: 1 << 1,
							key: null,
							props: foo,
							ref: null,
							type: 'div'
						},
						{
							children: [
								{
									children: query.query,
									dom: null,
									flags: 1 << 1,
									key: null,
									props: popoverContent,
									ref: null,
									type: 'div'
								},
								staticNode
							],
							dom: null,
							flags: 1 << 1,
							key: null,
							props: popoverLeft,
							ref: null,
							type: 'div'
						}
					],
					dom: null,
					flags: 1 << 1,
					key: null,
					props: {
						className: query.elapsedClassName
					},
					ref: null,
					type: 'td'					
				}
			// 	children[i2 + 2] = {
			// 		bp: bp1,
			// 		dom: null,
			// 		type: OPT_ELEMENT,
			// 		v0: query.elapsedClassName,
			// 		v1: [
			// 			{
			// 				bp: bp2,
			// 				dom: null,
			// 				type: OPT_ELEMENT,
			// 				v0: {
			// 					dom: null,
			// 					type: TEXT,
			// 					text: query.formatElapsed
			// 				},
			// 				v1: null
			// 			},
			// 			{
			// 				bp: bp3,
			// 				dom: null,
			// 				type: OPT_ELEMENT,
			// 				v0: [
			// 					{
			// 						bp: bp4,
			// 						dom: null,
			// 						type: OPT_ELEMENT,
			// 						v0: {
			// 							dom: null,
			// 							type: NodeTypes.TEXT,
			// 							text: query.query
			// 						},
			// 						v1: null
			// 					},
			// 					staticNode
			// 				],
			// 				v1: null
			// 			}
			// 		]
			// 	};
			}
			databases[i] = {
				children: children,
				dom: null,
				flags: 1 << 1,
				key: null,
				props: null,
				ref: null,
				type: 'tr'
			};
		}

		Inferno.render({
			children: {
				children: databases,
				dom: null,
				flags: 1 << 1,
				key: null,
				props: null,
				ref: null,
				type: 'tbody'
			},
			dom: null,
			flags: 1 << 1,
			key: null,
			props: tableProps,
			ref: null,
			type: 'table'
		}, elem);
	}

	var tableProps = {
		className: 'table table-striped latest-data'
	};
	var dbName = {
		className: 'dbname'
	};
	var dbQueryCount = {
		className: 'query-count'
	};
	var foo = {
		className: 'foo'
	};
	var popoverLeft = {
		className: 'popover left'
	};
	var popoverContent = {
		className: 'popover-content'
	};

// export enum VNodeFlags {
//     Text = 1,
//     HtmlElement = 1 << 1 === 2,
//     SvgElement = 1 << 2 === 4,
//     MediaElement = 1 << 3,
//     InputElement = 1 << 4,
//     TextAreaElement = 1 << 5,
//     Fragment = 1 << 6,
//     Void = 1 << 7,
//     ComponentClass = 1 << 8,
//     ComponentFunction = 1 << 9
// }

	function render() {
		var dbs = ENV.generateData(false).toArray();
		perfMonitor.startProfile('view update');
		renderBenchmark(dbs);
		perfMonitor.endProfile('view update');
		setTimeout(render, ENV.timeout);
	}
	render();
})();
