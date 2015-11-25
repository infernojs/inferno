export default function checkMask(value, bitmask) {
  return bitmask != null && ((value & bitmask) === bitmask);
}
