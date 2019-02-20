import { Component, render } from 'inferno';

const clicksCount = {
  0: 0,
  1: 0,
  2: 0,
};

class Com extends Component {
  render() {
    return (
      <div>
        <button type="button" onClick={() => { clicksCount[this.props.id] += 1; }}>Click Me</button>
      </div>
    );
  }
}

const removeIframes = () => {
  document.querySelectorAll('iframe').forEach(e => {
    if (e && e.parentNode) {
      document.body.removeChild(e);
    }
  });
};

describe('Multiple documents and events listeners inside', () => {
  let container;
  const appContainers = [];

  const createIframe = () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    const iframeDocument = iframe.contentDocument;
    const iframeAppContainer = iframeDocument.createElement('div');
    iframeDocument.body.appendChild(iframeAppContainer);

    appContainers.push(iframeAppContainer);
  };

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
    appContainers.push(container);

    Object.keys(clicksCount).forEach((key) => {
      clicksCount[key] = 0;
    });
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
    removeIframes();
    appContainers.length = 0;
  });

  it('events should be fired in default document when there is no any other documents', () => {
    render(<Com id={0} />, appContainers[0]);
    appContainers[0].querySelector('button').click();
    expect(clicksCount[0]).toBe(1);
  });

  it('events should be fired in proper document scope', () => {
    createIframe();
    createIframe();

    render(<Com id={0} />, appContainers[0]);
    appContainers[0].querySelector('button').click();
    expect(clicksCount[0]).toBe(1);

    render(<Com id={1} />, appContainers[1]);
    appContainers[1].querySelector('button').click();
    expect(clicksCount[1]).toBe(1);

    render(<Com id={2} />, appContainers[2]);
    appContainers[2].querySelector('button').click();
    expect(clicksCount[2]).toBe(1);
  });

  it('events should be fired only in one exact document scope', () => {
    createIframe();
    createIframe();

    render(<Com id={0} />, appContainers[0]);
    render(<Com id={1} />, appContainers[1]);
    render(<Com id={2} />, appContainers[2]);

    appContainers[2].querySelector('button').click();
    expect(clicksCount[0]).toBe(0);
    expect(clicksCount[1]).toBe(0);
    expect(clicksCount[2]).toBe(1);
  });

  it('events should be fired only in main document scope', () => {
    createIframe();
    createIframe();

    render(<Com id={0} />, appContainers[0]);
    render(<Com id={1} />, appContainers[1]);
    render(<Com id={2} />, appContainers[2]);

    appContainers[0].querySelector('button').click();
    expect(clicksCount[0]).toBe(1);
    expect(clicksCount[1]).toBe(0);
    expect(clicksCount[2]).toBe(0);
  });
});
