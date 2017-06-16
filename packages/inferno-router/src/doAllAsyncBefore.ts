export default function doAllAsyncBefore(renderProps) {
  const promises: Object[] = [];

  const getAsyncBefore = function(root) {
    if (root) {
      if (root.props && root.props.children) {
        getAsyncBefore(root.props.children);
      }

      if (root.type.name === "Route" && root.props.asyncBefore) {
        // Resolve asyncBefore
        promises.push(
          root.type.prototype.doAsyncBefore.call(root, root.props.params)
        );
      }
    }
  };

  getAsyncBefore(renderProps.matched);
  return Promise.all(promises).then(() => Promise.resolve(true));
}
