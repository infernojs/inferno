import {createTextVNode, linkEvent, version, render} from "inferno";

uibench.init('Inferno', version);

function shouldDataUpdate(lastProps, nextProps) {
  return lastProps !== nextProps;
}

const SCU_hooks = {
  onComponentShouldUpdate: shouldDataUpdate
};

function TreeLeaf({children}) {
  return (
    <li
      $HasTextChildren
      className="TreeLeaf">
      {children}
    </li>
  );
}

TreeLeaf.defaultHooks = SCU_hooks;

function TreeNode({data}) {
  var length = data.children.length;
  var children = new Array(length);

  for (var i = 0; i < length; i++) {
    var n = data.children[i];
    var id = n.id;

    if (n.container) {
      children[i] = <TreeNode data={n} key={id}/>;
    } else {
      children[i] = <TreeLeaf key={id}>{id}</TreeLeaf>;
    }
  }

  return (
    <ul
      $HasKeyedChildren
      className="TreeNode">
      {children}
    </ul>
  );
}

TreeNode.defaultHooks = SCU_hooks;

function tree(data) {
  /*
   * $HasVNodeChildren flag is not needed here, because shape of children is known by the compiler
   * <div> has static children <TreeNode> so there is no need for $HasVNodeChildren
   */
  return (
    <div className="Tree">
      <TreeNode data={data.root}/>
    </div>
  );
}

function AnimBox({data}) {
  var time = data.time % 10;
  var style = 'border-radius:' + (time) + 'px;' +
    'background:rgba(0,0,0,' + (0.5 + ((time) / 10)) + ')';

  // We don't need to use $HasVNodeChildren here, because there is no Children
  return (
    <div
      data-id={data.id}
      style={style}
      className="AnimBox"
    />
  );
}

AnimBox.defaultHooks = SCU_hooks;

function anim(data) {
  var items = data.items;
  var length = items.length;
  var children = [];

  for (var i = 0; i < length; i++) {
    var item = items[i];

    children.push(<AnimBox data={item} key={item.id}/>);
  }

  return (
    <div
      $HasKeyedChildren
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
  /*
   * Here we want to optimize for having text child vNode,
   * It can be done by using $HasVNodeChildren on parent element
   * and manually calling createTextVNode(value) for the children
   *
   * linkEvent is used here to bind the first parameter (text) into second parameter onClick function
   * linkEvent has benefit of not creating function, it basically returns pre-defined object shape that inferno knows how to handle
   * the main benefit is that no ".bind" or arrow function "() => {}" is needed. It works well with functional Components
   */
  return (
    <td
      $HasTextChildren
      onClick={linkEvent(children, onClick)}
      className="TableCell">
      {children}
    </td>
  );
}

TableCell.defaultHooks = SCU_hooks;

function TableRow({data}) {
  var classes = 'TableRow';

  if (data.active) {
    classes = 'TableRow active';
  }
  var cells = data.props;
  var length = cells.length + 1;
  var children = [<TableCell>{'#' + data.id}</TableCell>];

  for (var i = 1; i < length; i++) {
    children.push(<TableCell>{cells[i - 1]}</TableCell>);
  }

  /*
   * Again there is element vNode which children is always constant shape.
   * Add optimization flags for Children type
   * This time childrens does not have key, so the type is $HasNonKeyedChildren
   */
  return (
    <tr
      data-id={data.id}
      className={classes}
      $HasNonKeyedChildren>
      {children}
    </tr>
  );
}

TableRow.defaultHooks = SCU_hooks;

function table(data) {
  var items = data.items;
  var length = items.length;
  var children = [];

  for (var i = 0; i < length; i++) {
    var item = items[i];

    // Components does not need ChildrenType flags, it does not hurt, but gains nothing
    // Because Component children will be passed through props and will not be normalized before rendering anyway
    children.push(<TableRow data={item} key={item.id}/>);
  }

  /*
   * When its known that given element has only one type of children we can optimize this compile time
   * by adding children type $HasKeyedChildren (list of children - all keyed)
   * $HasKeyedChildren means that there are no holes in the children array and all keys are correctly set
   */
  return (
    <table
      $HasKeyedChildren
      className="Table">
      {children}
    </table>
  );
}

function main(data) {
  var location = data.location;
  var section;

  if (location === 'table') {
    section = table(data.table);
  } else if (location === 'anim') {
    section = anim(data.anim);
  } else if (location === 'tree') {
    section = tree(data.tree);
  }

  /*
   * We know that this div will always have single vNode as its children,
   * so we can optimize here and add flag $NoNormalize
   */
  return (
    <div
      $HasVNodeChildren
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
      render(<pre $HasTextChildren>{JSON.stringify(samples, null, ' ')}</pre>, container);
    }
  );
});
