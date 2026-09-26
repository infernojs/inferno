// Port of js-framework-benchmark frameworks/keyed/inferno-9/src/main.jsx (markup kept identical).
import { Store } from '../jfb-shared/store.js';
import { linkEvent, Component } from 'inferno';

function Row({ label, id, selected, deleteFunc, selectFunc }) {
  return (
    <tr className={selected ? 'danger' : null}>
      <td className="col-md-1" $HasTextChildren>{id}</td>
      <td className="col-md-4">
        <a onClick={linkEvent(id, selectFunc)} $HasTextChildren>{label}</a>
      </td>
      <td className="col-md-1">
        <a onClick={linkEvent(id, deleteFunc)}>
          <span className="glyphicon glyphicon-remove" aria-hidden="true"/>
        </a>
      </td>
      <td className="col-md-6"/>
    </tr>
  );
}

// Inferno functional components has hooks, when they are static they can be defined in defaultHooks property
Row.defaultHooks = {
  onComponentShouldUpdate(lastProps, nextProps) {
    return nextProps.label !== lastProps.label || nextProps.selected !== lastProps.selected;
  }
};

function createRows(store, deleteFunc, selectFunc) {
  const rows = [];
  const data = store.data;
  const selected = store.selected;

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const id = d.id;

    rows.push(
      <Row
        key={id}
        selected={id === selected}
        label={d.label}
        id={id}
        deleteFunc={deleteFunc}
        selectFunc={selectFunc}
      />
    );
  }

  return rows;
}

function Button({ id, title, onClick }) {
  return (
    <div className="col-sm-6 smallpad">
      <button type="button" className="btn btn-primary btn-block" id={id} onClick={onClick} $HasTextChildren>{title}</button>
    </div>
  );
}

function Header({ run, runLots, add, update, clear, swapRows }) {
  return (
    <div className="jumbotron">
      <div className="row">
        <div className="col-md-6">
          <h1>Inferno</h1>
        </div>
        <div className="col-md-6">
          <div className="row">
            <Button id="run" title="Create 1,000 rows" onClick={run}/>
            <Button id="runlots" title="Create 10,000 rows" onClick={runLots}/>
            <Button id="add" title="Append 1,000 rows" onClick={add}/>
            <Button id="update" title="Update every 10th row" onClick={update}/>
            <Button id="clear" title="Clear" onClick={clear}/>
            <Button id="swaprows" title="Swap Rows" onClick={swapRows}/>
          </div>
        </div>
      </div>
    </div>
  );
}

Header.defaultHooks = {
  onComponentShouldUpdate() {
    return false;
  }
};

export class Main extends Component {
  store = new Store();

  run = (event) => {
    event.stopPropagation();
    this.store.run();
    this.forceUpdate();
  };

  runLots = (event) => {
    event.stopPropagation();
    this.store.runLots();
    this.forceUpdate();
  };

  add = (event) => {
    event.stopPropagation();
    this.store.add();
    this.forceUpdate();
  };

  update = (event) => {
    event.stopPropagation();
    this.store.update();
    this.forceUpdate();
  };

  clear = (event) => {
    event.stopPropagation();
    this.store.clear();
    this.forceUpdate();
  };

  swapRows = (event) => {
    event.stopPropagation();
    this.store.swapRows();
    this.forceUpdate();
  };

  select = (id, event) => {
    event.stopPropagation();
    this.store.select(id);
    this.forceUpdate();
  };

  delete = (id, event) => {
    event.stopPropagation();
    this.store.delete(id);
    this.forceUpdate();
  };

  render() {
    return (
      <div className="container">
        <Header
          run={this.run}
          runLots={this.runLots}
          add={this.add}
          update={this.update}
          clear={this.clear}
          swapRows={this.swapRows}
        />
        <table className="table table-hover table-striped test-data">
          <tbody $HasKeyedChildren>
            {createRows(this.store, this.delete, this.select)}
          </tbody>
        </table>
        <span className="preloadicon glyphicon glyphicon-remove" aria-hidden="true"/>
      </div>
    );
  }
}

