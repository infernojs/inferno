function checkMask(value, bitmask) {
  return (value & bitmask) === bitmask;
}

export default checkMask;