import {createTextVNode, linkEvent, render, version} from "inferno-compat";

/*
 * Inferno + inferno-compat without any Inferno specific optimizations
 * Optimization flags could be used, but the purpose is to track performance of slow code paths
 */

uibench.init('Inferno compat (simple)', version);

function TreeLeaf({children}) {
  return (
    <li
      className="TreeLeaf">
      {createTextVNode(children)}
    </li>
  );
}

function shouldDataUpdate(lastProps, nextProps) {
  return lastProps !== nextProps;
}

function TreeNode({data}) {
  var length = data.children.length;
  var children = new Array(length);

  for (var i = 0; i < length; i++) {
    var n = data.children[i];
    var id = n.id;

    if (n.container) {
      children[i] = <TreeNode onComponentShouldUpdate={shouldDataUpdate} data={n} key={id}/>;
    } else {
      children[i] = <TreeLeaf onComponentShouldUpdate={shouldDataUpdate} key={id}>{id}</TreeLeaf>;
    }
  }

  return (
    <ul
      className="TreeNode">
      {children}
    </ul>
  );
}

function tree(data) {
  return (
    <div className="Tree">
      <TreeNode data={data.root} onComponentShouldUpdate={shouldDataUpdate}/>
    </div>
  );
}

function AnimBox({data}) {
  var time = data.time % 10;
  var style = 'border-radius:' + (time) + 'px;' +
    'background:rgba(0,0,0,' + (0.5 + ((time) / 10)) + ')';

  return (
    <div
      data-id={data.id}
      style={style}
      className="AnimBox"
    />
  );
}

function anim(data) {
  var items = data.items;
  var length = items.length;
  var children = new Array(length);

  for (var i = 0; i < length; i++) {
    var item = items[i];

    // Here we are using onComponentShouldUpdate functional Component hook, to short circuit rendering process of AnimBox Component
    // When the data does not change
    children[i] = <AnimBox data={item} onComponentShouldUpdate={shouldDataUpdate} key={item.id}/>;
  }

  return (
    <div
      className="Anim">
      {children}
    </div>
  );
}

function onClick(text, e) {
  console.log('Clicked', text);
  e.stopPropagation();
}

function TableCell({children}) {
  return (
    <td
      onClick={linkEvent(children, onClick)}
      className="TableCell">
      {createTextVNode(children)}
    </td>
  );
}

function TableRow({data}) {
  var classes = 'TableRow';

  if (data.active) {
    classes = 'TableRow active';
  }
  var cells = data.props;
  var length = cells.length + 1;
  var children = new Array(length);

  children[0] = <TableCell onComponentShouldUpdate={shouldDataUpdate}>{'#' + data.id}</TableCell>;

  for (var i = 1; i < length; i++) {
    children[i] = <TableCell onComponentShouldUpdate={shouldDataUpdate}>{cells[i - 1]}</TableCell>;
  }

  return (
    <tr
      data-id={data.id}
      className={classes}>
      {children}
    </tr>
  );
}

function table(data) {
  var items = data.items;
  var length = items.length;
  var children = new Array(length);

  for (var i = 0; i < length; i++) {
    var item = items[i];

    children[i] = <TableRow data={item} onComponentShouldUpdate={shouldDataUpdate} key={item.id}>{item}</TableRow>;
  }

  return (
    <table
      className="Table">
      {children}
    </table>
  );
}

var lastMainData;

function main(data) {
  lastMainData = data;
  var location = data.location;
  var section;

  if (location === 'table') {
    section = table(data.table);
  } else if (location === 'anim') {
    section = anim(data.anim);
  } else if (location === 'tree') {
    section = tree(data.tree);
  }

  return (
    <div
      className="Main">
      {section}
    </div>
  );
}

document.addEventListener('DOMContentLoaded', function(e) {
  var container = document.querySelector('#App');

  uibench.run(
    function(state) {
      render(main(state), container);
    },
    function(samples) {
      render(<pre>{JSON.stringify(samples, null, ' ')}</pre>, container);
    }
  );
});
