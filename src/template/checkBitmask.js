function checkMask(value, bitmask) {

  return bitmask != null && ((value & bitmask) === bitmask);
}

export default checkMask;