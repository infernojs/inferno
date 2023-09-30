import { version, Component, render, linkEvent } from 'inferno';

uibench.init('Inferno [lifecycle overhead]', version);

let counter = 0;

function onComponentWillMountCounter() {
  counter++;
}

function onComponentDidMountCounter() {
  counter++;
}

function onComponentShouldUpdateCounter() {
  counter++;
  return true;
}

function onComponentWillUpdateCounter() {
  counter++;
}

function onComponentDidUpdateCounter() {
  counter++;
}

function onComponentWillUnmountCounter() {
  counter++;
}

function onComponentDidAppearCounter() {
  counter++;
}

function onComponentWillDisappearCounter(dom, props, callback) {
  counter++;
  callback();
}

function onClick(text, e) {
  console.log('Clicked', text);
  e.stopPropagation();
}

function TableCell({ children }) {
  return (
    <td $HasTextChildren onClick={linkEvent(children, onClick)} className="TableCell">
      {children}
    </td>
  );
}

class TableRow extends Component {
  componentDidMount() {
    counter++;
  }

  componentWillMount() {
    counter++;
  }

  componentWillReceiveProps() {
    counter++;
  }

  shouldComponentUpdate(nextProps, nextState) {
    counter++;

    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    counter++;
  }

  componentWillUnmount() {
    counter++;
  }

  componentDidAppear() {
    counter++;
  }

  componentWillDisappear(dom, callback) {
    counter++;
    callback()
  }

  render() {
    const { data } = this.props;

    // Interned strings
    const classes = data.active ? 'TableRow active' : 'TableRow';

    const cells = data.props;

    const children = [
      <TableCell
        onComponentWillMount={onComponentWillMountCounter}
        onComponentDidMount={onComponentDidMountCounter}
        onComponentShouldUpdate={onComponentShouldUpdateCounter}
        onComponentWillUpdate={onComponentWillUpdateCounter}
        onComponentDidUpdate={onComponentDidUpdateCounter}
        onComponentWillUnmount={onComponentWillUnmountCounter}
        onComponentDidAppear={onComponentDidAppearCounter}
        onComponentWillDisappear={onComponentWillDisappearCounter}
        key={-1}
      >
        {'#' + data.id}
      </TableCell>
    ];
    for (let i = 0; i < cells.length; i++) {
      // Key is used because React prints warnings that there should be a key, libraries that can detect that children
      // shape isn't changing should render cells without keys.
      children.push(
        <TableCell
          onComponentWillMount={onComponentWillMountCounter}
          onComponentDidMount={onComponentDidMountCounter}
          onComponentShouldUpdate={onComponentShouldUpdateCounter}
          onComponentWillUpdate={onComponentWillUpdateCounter}
          onComponentDidUpdate={onComponentDidUpdateCounter}
          onComponentWillUnmount={onComponentWillUnmountCounter}
          onComponentDidAppear={onComponentDidAppearCounter}
          onComponentWillDisappear={onComponentWillDisappearCounter}
          key={i}
        >
          {cells[i]}
        </TableCell>);
    }

    // First table cell is inserted this way to prevent react from printing warning that it doesn't have key property
    return (
      <tr className={classes} data-id={data.id}>
        {children}
      </tr>
    );
  }
}

class Table extends Component {
  componentDidMount() {
    counter++;
  }

  componentWillMount() {
    counter++;
  }

  componentWillReceiveProps() {
    counter++;
  }

  shouldComponentUpdate(nextProps, nextState) {
    counter++;

    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    counter++;
  }

  componentWillUnmount() {
    counter++;
  }

  componentDidAppear() {
    counter++;
  }

  componentWillDisappear(dom, callback) {
    counter++;
    callback()
  }

  render() {
    const items = this.props.data.items;

    const children = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      children.push(<TableRow key={item.id} data={item} />);
    }

    return (
      <table className="Table">
        <tbody>{children}</tbody>
      </table>
    );
  }
}

function AnimBox({ data }) {
  var time = data.time % 10;
  var style = 'border-radius:' + time + 'px;' + 'background:rgba(0,0,0,' + (0.5 + time / 10) + ')';

  return <div data-id={data.id} style={style} className="AnimBox" />;
}


class Anim extends Component {
  componentDidMount() {
    counter++;
  }

  componentWillMount() {
    counter++;
  }

  componentWillReceiveProps() {
    counter++;
  }

  shouldComponentUpdate(nextProps, nextState) {
    counter++;

    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    counter++;
  }

  componentWillUnmount() {
    counter++;
  }

  componentDidAppear() {
    counter++;
  }

  componentWillDisappear(dom, callback) {
    counter++;
    callback()
  }

  render() {
    const items = this.props.data.items;

    const children = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      children.push(<AnimBox
        onComponentWillMount={onComponentWillMountCounter}
        onComponentDidMount={onComponentDidMountCounter}
        onComponentShouldUpdate={onComponentShouldUpdateCounter}
        onComponentWillUpdate={onComponentWillUpdateCounter}
        onComponentDidUpdate={onComponentDidUpdateCounter}
        onComponentWillUnmount={onComponentWillUnmountCounter}
        onComponentDidAppear={onComponentDidAppearCounter}
        onComponentWillDisappear={onComponentWillDisappearCounter}
        key={item.id}
        data={item}
      />);
    }

    return <div className="Anim">{children}</div>;
  }
}

function TreeLeaf({ children }) {
  return (
    <li $HasTextChildren className="TreeLeaf">
      {children}
    </li>
  );
}

class TreeNode extends Component {
  componentDidMount() {
    counter++;
  }

  componentWillMount() {
    counter++;
  }

  componentWillReceiveProps() {
    counter++;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    counter++;
  }

  componentWillUnmount() {
    counter++;
  }

  componentDidAppear() {
    counter++;
  }

  componentWillDisappear(dom, callback) {
    counter++;
    callback()
  }

  render() {
    const { data } = this.props;
    const children = [];

    for (let i = 0; i < data.children.length; i++) {
      const n = data.children[i];
      const id = n.id;

      if (n.container) {
        children.push(<TreeNode key={id} data={n} />);
      } else {
        children.push(<TreeLeaf
          onComponentWillMount={onComponentWillMountCounter}
          onComponentDidMount={onComponentDidMountCounter}
          onComponentShouldUpdate={onComponentShouldUpdateCounter}
          onComponentWillUpdate={onComponentWillUpdateCounter}
          onComponentDidUpdate={onComponentDidUpdateCounter}
          onComponentWillUnmount={onComponentWillUnmountCounter}
          onComponentDidAppear={onComponentDidAppearCounter}
          onComponentWillDisappear={onComponentWillDisappearCounter}
          key={id}
        >
          {id}
        </TreeLeaf>);
      }
    }

    return <ul className="TreeNode">{children}</ul>;
  }
}

class Tree extends Component {

  componentDidMount() {
    counter++;
  }

  componentWillMount() {
    counter++;
  }

  componentWillReceiveProps() {
    counter++;
  }

  shouldComponentUpdate(nextProps, nextState) {
    counter++;

    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    counter++;
  }

  componentWillUnmount() {
    counter++;
  }

  componentDidAppear() {
    counter++;
  }

  componentWillDisappear(dom, callback) {
    counter++;
    callback()
  }

  render() {
    return (
      <div className="Tree">
        <TreeNode data={this.props.data.root} />
      </div>
    );
  }
}

class Main extends Component {
  componentDidMount() {
    counter++;
  }

  componentWillMount() {
    counter++;
  }

  componentWillReceiveProps() {
    counter++;
  }

  shouldComponentUpdate(nextProps, nextState) {
    counter++;

    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    counter++;
  }

  componentWillUnmount() {
    counter++;
  }

  componentDidAppear() {
    counter++;
  }

  componentWillDisappear(dom, callback) {
    counter++;
    callback()
  }

  render() {
    const { data } = this.props;
    const location = data.location;

    var section;
    if (location === 'table') {
      section = <Table data={data.table}></Table>;
    } else if (location === 'anim') {
      section = <Anim data={data.anim}></Anim>;
    } else if (location === 'tree') {
      section = <Tree data={data.tree}></Tree>;
    }

    return <div className="Main">{section}</div>;
  }
}

document.addEventListener('DOMContentLoaded', function (e) {
  var container = document.querySelector('#App');

  uibench.run(
    function (state) {
      render(<Main data={state} />, container);
    },
    function (samples) {
      // console log the counter to avoid the variable being removed by JIT
      console.log(counter);
      render(<pre>{JSON.stringify(samples, null, ' ')}</pre>, container);
    }
  );
});
