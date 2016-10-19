"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPoToPoDis = getPoToPoDis;
exports.getPoToLineDis = getPoToLineDis;

/**
 * 两点之间的距离
 * @param x1 第一个点的经度
 * @param y1 第一个点的纬度
 * @param x2 第二个点的经度
 * @param y2 第二个点的纬度
 * @returns distance 两点之间的距离
 */
function getPoToPoDis(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

/**
 * 点到折线上相邻两点组成的线段的最短距离
 * @param point 点坐标
 * @param curPt 折线点坐标
 * @param nextPt 与 curPt 相邻的折线点坐标
 * @returns distance 距离
 */
function getPoToLineDis(point, curPt, nextPt) {
  var xCur = curPt.lng;
  var yCur = curPt.lat; // 折线点经纬度，将此点记作 P1

  var xNext = nextPt.lng;
  var yNext = nextPt.lat; // 相邻折线点经纬度，将此点记作 P2

  var xPoint = point.lng;
  var yPoint = point.lat; // 外点经纬度，将此点记作 P

  var lengthCurToNext = getPoToPoDis(xCur, yCur, xNext, yNext); // P1 到 P2 的长度，记作 a 线段
  var lengthCurToPo = getPoToPoDis(xCur, yCur, xPoint, yPoint); // P1 到 P 的长度，记作 b 线段
  var lengthNextToPo = getPoToPoDis(xNext, yNext, xPoint, yPoint); // P2 到 P 的长度，记作 c 线段

  var distance = 0;
  if (lengthNextToPo + lengthCurToPo === lengthCurToNext) {
    // 当 b + c = a 时，P 在 P1 和 P2 组成的线段上
    distance = 0;
  } else if (lengthNextToPo * lengthNextToPo >= lengthCurToNext * lengthCurToNext + lengthCurToPo * lengthCurToPo) {
    // 当 c * c >= a * a + b * b 时组成直角三角形或钝角三角形，投影在 P1 延长线上
    distance = lengthCurToPo;
  } else if (lengthCurToPo * lengthCurToPo >= lengthCurToNext * lengthCurToNext + lengthNextToPo * lengthNextToPo) {
    // 当 b * b > c * c + a * a 时组成直角三角形或钝角三角形，投影在 p2 延长线上
    distance = lengthNextToPo;
  } else {
    // 其他情况组成锐角三角形，则求三角形的高
    var p = (lengthCurToPo + lengthNextToPo + lengthCurToNext) / 2; // 半周长
    var s = Math.sqrt(p * (p - lengthCurToNext) * (p - lengthCurToPo) * (p - lengthNextToPo)); // 海伦公式求面积
    distance = 2 * s / lengthCurToNext; // 点到线的距离（利用三角形面积公式求高)
  }

  return distance;
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPoToPoDis = exports.isPointInRect = exports.getPoToLineDis = exports.isPointOnPloyline = exports.genPointOnPolyline = undefined;

var _geoUtils = require('./geo-utils');

exports.genPointOnPolyline = _geoUtils.genPointOnPolyline;
exports.isPointOnPloyline = _geoUtils.isPointOnPloyline;
exports.getPoToLineDis = _geoUtils.getPoToLineDis;
exports.isPointInRect = _geoUtils.isPointInRect;
exports.getPoToPoDis = _geoUtils.getPoToPoDis;