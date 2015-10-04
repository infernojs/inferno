"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _removeFragments = require("./removeFragments");

var _removeFragments2 = _interopRequireDefault(_removeFragments);

var _removeFragment = require("./removeFragment");

var _removeFragment2 = _interopRequireDefault(_removeFragment);

var _attachFragmentList = require("./attachFragmentList");

var _attachFragmentList2 = _interopRequireDefault(_attachFragmentList);

var _attachFragment = require("./attachFragment");

var _attachFragment2 = _interopRequireDefault(_attachFragment);

var _updateFragment = require("./updateFragment");

var _updateFragment2 = _interopRequireDefault(_updateFragment);

var _moveFragment = require("./moveFragment");

var _moveFragment2 = _interopRequireDefault(_moveFragment);

exports["default"] = function (context, oldList, list, parentDom, component, outerNextFragment) {

    var oldListLength = oldList.length;
    var listLength = list.length;

    if (listLength === 0) {

        (0, _removeFragments2["default"])(context, parentDom, oldList, 0, oldListLength);
        return;
    } else if (oldListLength === 0) {

        (0, _attachFragmentList2["default"])(context, list, parentDom, component);
        return;
    }

    var oldEndIndex = oldListLength - 1;
    var endIndex = listLength - 1;
    var oldStartIndex = 0,
        startIndex = 0;
    var successful = true;
    var nextItem;
    var oldItem, item;

    outer: while (successful && oldStartIndex <= oldEndIndex && startIndex <= endIndex) {

        successful = false;
        var oldStartItem, oldEndItem, startItem, endItem, doUpdate;

        oldStartItem = oldList[oldStartIndex];
        startItem = list[startIndex];
        while (oldStartItem.key === startItem.key) {

            (0, _updateFragment2["default"])(context, oldStartItem, startItem, parentDom, component);
            oldStartIndex++;startIndex++;
            if (oldStartIndex > oldEndIndex || startIndex > endIndex) {

                break outer;
            }
            oldStartItem = oldList[oldStartIndex];
            startItem = list[startIndex];
            successful = true;
        }
        oldEndItem = oldList[oldEndIndex];
        endItem = list[endIndex];
        while (oldEndItem.key === endItem.key) {

            (0, _updateFragment2["default"])(context, oldEndItem, endItem, parentDom, component);
            oldEndIndex--;endIndex--;
            if (oldStartIndex > oldEndIndex || startIndex > endIndex) {

                break outer;
            }
            oldEndItem = oldList[oldEndIndex];
            endItem = list[endIndex];
            successful = true;
        }
        while (oldStartItem.key === endItem.key) {

            nextItem = endIndex + 1 < listLength ? list[endIndex + 1] : outerNextFragment;
            (0, _updateFragment2["default"])(context, oldStartItem, endItem, parentDom, component);
            (0, _moveFragment2["default"])(parentDom, endItem, nextItem);
            oldStartIndex++;endIndex--;
            if (oldStartIndex > oldEndIndex || startIndex > endIndex) {

                break outer;
            }
            oldStartItem = oldList[oldStartIndex];
            endItem = list[endIndex];
            successful = true;
        }
        while (oldEndItem.key === startItem.key) {

            nextItem = oldStartIndex < oldListLength ? oldList[oldStartIndex] : outerNextFragment;
            (0, _updateFragment2["default"])(context, oldEndItem, startItem, parentDom, component);
            (0, _moveFragment2["default"])(parentDom, startItem, nextItem);
            oldEndIndex--;startIndex++;
            if (oldStartIndex > oldEndIndex || startIndex > endIndex) {

                break outer;
            }
            oldEndItem = oldList[oldEndIndex];
            startItem = list[startIndex];
            successful = true;
        }
    }
    if (oldStartIndex > oldEndIndex) {

        nextItem = endIndex + 1 < listLength ? list[endIndex + 1] : outerNextFragment;
        for (i = startIndex; i <= endIndex; i++) {

            item = list[i];
            (0, _attachFragment2["default"])(context, item, parentDom, component, nextItem);
        }
    } else if (startIndex > endIndex) {

        (0, _removeFragments2["default"])(context, parentDom, oldList, oldStartIndex, oldEndIndex + 1);
    } else {

        var i,
            oldNextItem = oldEndIndex + 1 >= oldListLength ? null : oldList[oldEndIndex + 1];
        var oldListMap = {};
        for (i = oldEndIndex; i >= oldStartIndex; i--) {

            oldItem = oldList[i];
            oldItem.next = oldNextItem;
            oldListMap[oldItem.key] = oldItem;
            oldNextItem = oldItem;
        }
        nextItem = endIndex + 1 < listLength ? list[endIndex + 1] : outerNextFragment;
        for (i = endIndex; i >= startIndex; i--) {

            item = list[i];
            var key = item.key;
            oldItem = oldListMap[key];
            if (oldItem) {

                oldListMap[key] = null;
                oldNextItem = oldItem.next;
                (0, _updateFragment2["default"])(context, oldItem, item, parentDom, component);
                if (parentDom.nextSibling != (nextItem && nextItem.dom)) {

                    (0, _moveFragment2["default"])(parentDom, item, nextItem);
                }
            } else {

                (0, _attachFragment2["default"])(context, item, parentDom, component, nextItem);
            }
            nextItem = item;
        }
        for (i = oldStartIndex; i <= oldEndIndex; i++) {

            oldItem = oldList[i];
            if (oldListMap[oldItem.key] !== null) {

                (0, _removeFragment2["default"])(context, parentDom, oldItem);
            }
        }
    }
};

module.exports = exports["default"];