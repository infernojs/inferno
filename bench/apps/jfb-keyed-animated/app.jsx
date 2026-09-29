// jfb-keyed (../jfb-keyed/app.jsx) with animated rows: createMain(Base) makes the rows class
// components extending an inferno-animation component, with the same markup and the same update
// check as the jfb row's onComponentShouldUpdate hook.
import { Store } from '../jfb-shared/store.js';
import { linkEvent, Component } from 'inferno';

/**
 * The runner's checksum of #main would include animation classes and styles in flight and rows
 * still leaving; this one hashes the text of the rows that stay, in order.
 */
export function installChecksum() {
  window.__bench = {
    checksum() {
      const rows = [...document.querySelectorAll('tbody > tr')].filter((row) => !/Row-leave/.test(row.className));
      const text = rows.map((row) => row.textContent).join('|');
      let h = 0x811c9dc5;
      for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
      }
      return `${(h >>> 0).toString(16).padStart(8, '0')}:${rows.length}`;
    },
  };
}

export function createMain(Base) {
  class Row extends Base {
    shouldComponentUpdate(nextProps) {
      return nextProps.label !== this.props.label || nextProps.selected !== this.props.selected;
    }

    render() {
      const { label, id, selected, deleteFunc, selectFunc } = this.props;
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
  }

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
          animation="Row"
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

  return class Main extends Component {
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
}
