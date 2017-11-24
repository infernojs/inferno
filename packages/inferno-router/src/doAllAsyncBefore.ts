export default function doAllAsyncBefore(renderProps) {
  const promises: Object[] = [];

  const getAsyncBefore = function(root) {
    if (root && root.props) {
      if (root.props.children) {
          getAsyncBefore(root.props.children);
      }
      if (typeof root.props.asyncBefore === 'function' && root.type.prototype.doAsyncBefore) {
          // Resolve asyncBefore
          promises.push(root.type.prototype.doAsyncBefore.call(root, root.props.params));
      }
    }
  };

  getAsyncBefore(renderProps.matched);
  return Promise.all(promises).then(() => Promise.resolve(true));
}
