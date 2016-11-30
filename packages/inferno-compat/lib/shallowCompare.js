// Credited: https://github.com/tkh44/shallow-compare
function shallowDiffers (a, b) {
  for (let i in a) if (!(i in b)) return true
  for (let i in b) if (a[i] !== b[i]) return true
  return false
}

export default (instance, nextProps, nextState) => {
  return (
    shallowDiffers(instance.props, nextProps) ||
    shallowDiffers(instance.state, nextState)
  )
}
