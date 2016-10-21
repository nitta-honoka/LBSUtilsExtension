"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPoToPoDis = getPoToPoDis;
exports.getPoToLineDis = getPoToLineDis;
exports.isPointInRect = isPointInRect;
exports.genPointOnPolyline = genPointOnPolyline;
exports.isPointOnPloyline = isPointOnPloyline;
exports.genMinDisPoint = genMinDisPoint;

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

/**
 * 判断点是否在矩形内
 * @param point 点对象
 * @param bounds 矩形边界对象
 * @returns 点在矩形内返回 true,否则返回 false
 */
function isPointInRect(point, bounds) {
  var sw = bounds.getSouthWest(); // 西南脚点
  var ne = bounds.getNorthEast(); // 东北脚点

  return point.lng >= sw.lng && point.lng <= ne.lng && point.lat >= sw.lat && point.lat <= ne.lat;
}

/**
 * 得到离鼠标点最近的折线点坐标
 * @param point 鼠标点
 * @param curPt，nextPt 折线上相邻两点
 * @param precision 误差，默认 2e-4
 * @returns { polyLng, polyLat } 折线点经纬度
 */
function genPointOnPolyline(point, curPt, nextPt) {
  var precision = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2e-4;

  var pointLng = void 0,
      pointLat = void 0;
  var precisionLng = curPt.lng - nextPt.lng;
  var precisionLat = curPt.lat - nextPt.lat;

  if (precisionLng < precision && precisionLng > -precision) {
    // 当折线上两点经度几乎相同时（存在一定误差）
    pointLng = curPt.lng;
    pointLat = point.lat;
    // 创建生成点对象
    return { pointLng: pointLng, pointLat: pointLat };
  } else if (precisionLat < 2e-6 && precisionLat > -2e-6) {
    // 当折线上两点纬度相同时（存在一定误差）
    pointLat = curPt.lat;
    pointLng = point.lng;
    return { pointLng: pointLng, pointLat: pointLat };
  }

  // 其他情况，求得点到折线的垂足坐标
  var k = (nextPt.lat - curPt.lat) / (nextPt.lng - curPt.lng);
  // 求得该点到线段的垂足坐标
  // 设线段的两端点为 pt1 和 pt2，斜率为：k = (pt2.y - pt1.y) / (pt2.x - pt1.x);
  // 该直线方程为：y = k * (x - pt1.x) + pt1.y。其垂线的斜率为 - 1 / k，
  // 垂线方程为：y = (-1 / k) * (x - point.x) + point.y
  var pointLng2 = (k * k * curPt.lng + k * (point.lat - curPt.lat) + point.lng) / (k * k + 1);
  var pointLat2 = k * (pointLng2 - curPt.lng) + curPt.lat;
  return { pointLng2: pointLng2, pointLat2: pointLat2 };
}

/**
 * 判断点在一定误差范围内是否在折线上
 * @param point 鼠标点
 * @param polygon 区域多边形对象
 * @param precision 误差范围, 默认 2e-4
 * @returns 如果判断点不在折线上则返回false,否则返回true
 */
function isPointOnPloyline(point, polygon) {
  var precision = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2e-4;

  // 首先判断点是否在线的外包矩形内，如果在，则进一步判断，否则返回false
  if (!isPointInRect(point, polygon.getBounds())) {
    return false;
  }

  var distances = []; // 点到折线每相邻两点的最短距离
  var pts = polygon.getPath(); // 折线路径点数组
  pts.forEach(function (p, i) {
    distances.push(getPoToLineDis(point, pts[i], pts[i + 1]));
    distances.sort();
  });

  var minDistance = distances[0];
  if (minDistance < precision && minDistance > -precision) {
    // 当最短距离小于误差值时，判断鼠标点在折线上
    return true;
  }

  return false;
}

/**
 * 如果点到折线最短距离在误差范围内，则得到离该点最近的折线点坐标，否则返回鼠标点坐标
 * @param point 鼠标点
 * @param polygon 区域多边形对象
 * @param precision 误差，默认 2e-4
 * @returns 如果判断点不在折线上则返回该点（point），如果判断点在折线上则返回计算出的折线最近点（
 * 因为鼠标点选很难精确点在折线上，要允许一定误差，故需得到一个折线上的最近点）
 */
function genMinDisPoint(point, polygon, precision) {
  if (!isPointInRect(point, polygon.getBounds())) {
    return false;
  }

  var curPt = void 0,
      nextPt = void 0;
  var distances = []; // 点到折线每相邻两点的最短距离
  var points = []; // 折线相邻点
  var pts = polygon.getPath(); // 折线路径点数组
  pts.forEach(function (p, i) {
    curPt = pts[i];
    nextPt = pts[i + 1];
    var distance = getPoToLineDis(point, curPt, nextPt);
    // 先将存储最短距离的数组排序，如果该两个相邻点与鼠标点计算出的最短距离与数组中最小距离相等，则存储该两点
    distances.push(distance);
    distances.sort();
    if (distance === distances[0]) {
      points.concat([curPt, nextPt]);
    }
  });

  // 取得 points 最后两项，即最短距离最小时鼠标点两侧的折线点
  curPt = points[points.length - 2];
  nextPt = points[points.length - 1];
  var minDistance = distances[0];
  if (minDistance < precision && minDistance > -precision) {
    // 当最短距离小于误差值时，判断鼠标点在折线上，通过鼠标点和两侧相邻点，得到折线上的最近点
    return genPointOnPolyline(point, curPt, nextPt);
  }

  return point;
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPoToPoDis = exports.isPointInRect = exports.genMinDisPoint = exports.getPoToLineDis = exports.isPointOnPloyline = exports.genPointOnPolyline = undefined;

var _geoUtils = require('./geo-utils');

exports.genPointOnPolyline = _geoUtils.genPointOnPolyline;
exports.isPointOnPloyline = _geoUtils.isPointOnPloyline;
exports.getPoToLineDis = _geoUtils.getPoToLineDis;
exports.genMinDisPoint = _geoUtils.genMinDisPoint;
exports.isPointInRect = _geoUtils.isPointInRect;
exports.getPoToPoDis = _geoUtils.getPoToPoDis;