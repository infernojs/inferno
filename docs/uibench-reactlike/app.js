import {version, Component, render} from 'inferno';

uibench.init('Inferno [same as react]', version);

class TableCell extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.text !== nextProps.text;
  }

  onClick(e) {
    console.log('Clicked' + this.props.text);
    e.stopPropagation();
  }

  render() {
    return <td className="TableCell" onClick={this.onClick}>{this.props.text}</td>;
  }
}

class TableRow extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data !== nextProps.data;
  }

  render() {
    const { data } = this.props;

    // Interned strings
    const classes = (data.active) ? 'TableRow active' : 'TableRow';

    const cells = data.props;

    const children = [<TableCell key={-1} text={'#' + data.id}></TableCell>];
    for (let i = 0; i < cells.length; i++) {
      // Key is used because React prints warnings that there should be a key, libraries that can detect that children
      // shape isn't changing should render cells without keys.
      children.push(<TableCell key={i} text={cells[i]}></TableCell>);
    }

    // First table cell is inserted this way to prevent react from printing warning that it doesn't have key property
    return <tr className={classes} data-id={data.id}>{children}</tr>;
  }
}

class Table extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data !== nextProps.data;
  }

  render() {
    const items = this.props.data.items;

    const children = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      children.push((<TableRow key={item.id} data={item} />));
    }

    return <table className="Table"><tbody>{children}</tbody></table>;
  }
}

class AnimBox extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data !== nextProps.data;
  }

  render() {
    const { data } = this.props;
    const time = data.time;
    const style = {
      'border-radius': (time % 10).toString() + 'px',
      'background': 'rgba(0,0,0,' + (0.5 + ((time % 10) / 10)).toString() + ')'
    };

    return <div className="AnimBox" data-id={data.id} style={style} />;
  }
}

class Anim extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data !== nextProps.data;
  }

  render() {
    const items = this.props.data.items;

    const children = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      children.push(<AnimBox key={item.id} data={item} />);
    }

    return <div className="Anim">{children}</div>;
  }
}

class TreeLeaf extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data !== nextProps.data;
  }

  render() {
    return <li className="TreeLeaf">{this.props.data.id}</li>;
  }
}

class TreeNode extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data !== nextProps.data;
  }

  render() {
    const { data } = this.props;
    const children = [];

    for (let i = 0; i < data.children.length; i++) {
      const n = data.children[i];
      if (n.container) {
        children.push(<TreeNode key={n.id} data={n} />);
      } else {
        children.push(<TreeLeaf key={n.id} data={n} />);
      }
    }

    return <ul className="TreeNode">{children}</ul>;
  }
}

class Tree extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data !== nextProps.data;
  }

  render() {
    return <div className="Tree"><TreeNode data={this.props.data.root} /></div>;
  }
}

class Main extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.data !== nextProps.data;
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
      render(<pre>{JSON.stringify(samples, null, ' ')}</pre>, container);
    }
  );
});
