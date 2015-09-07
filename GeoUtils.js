/*************判断用户鼠标点击的点是否在折线上********************************/
/**
*主要实现算法为计算鼠标点到折线上每相邻两点组成的线段的最短距离，如果最小的最短距离小于误差值，
*则判断点在折线上。
*然后通过该相邻两点取得折线上离鼠标点最近的点。
*/
/**
 * 计算两点之间的距离
 * @param x1 第一个点的经度
 * @param y1 第一个点的纬度
 * @param x2 第二个点的经度
 * @param y1 第二个点的纬度
 * @returns lineLength 两点之间的距离
 */
function lineDis(x1, y1, x2, y2) {
    var lineLength = 0;
    lineLength = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    return lineLength;
}
/**
 * 计算鼠标点到折线上相邻两点组成的线段的最短距离
 * @param point 鼠标点
 * @param curPt 折线点
 * @param nextPt 与curPt相邻的折线点
 * @returns dis 最短距离
 */
function countDisPoToLine(point, curPt, nextPt) {
    var dis = 0; //鼠标点到线段的最短距离
    var xCur = curPt.lng; //折线点的经纬度，将该点记作P1
    var yCur = curPt.lat;
    var xNext = nextPt.lng; //与上一个取点相邻的折线点的经纬度,将该点记作P2
    var yNext = nextPt.lat;
    var xPoint = point.lng; //鼠标点的经纬度，将该点记作P
    var yPoint = point.lat;
    var lengthCurToPo = lineDis(xCur, yCur, xPoint, yPoint); //P1到P的长度，记作b线段
    var lengthNextToPo = lineDis(xNext, yNext, xPoint, yPoint); //P2到P的长度，记作c线段
    var lengthCurToNext = lineDis(xCur, yCur, xNext, yNext); //P1到P2的长度，记作a线段
    
    if (lengthNextToPo + lengthCurToPo == lengthCurToNext) { 
        //当b+c=a时，P在P1和P2组成的线段上
        dis = 0;
        return dis;
    } else if (lengthNextToPo * lengthNextToPo >= lengthCurToNext * lengthCurToNext + lengthCurToPo * lengthCurToPo) { 
        //当c*c>=a*a+b*b时组成直角三角形或钝角三角形，投影在P1延长线上  
        dis = lengthCurToPo;
        return dis;
    } else if (lengthCurToPo * lengthCurToPo >= lengthCurToNext * lengthCurToNext + lengthNextToPo * lengthNextToPo) { 
        //当b*b>c*c+a*a时组成直角三角形或钝角三角形，投影在p2延长线上
        dis = lengthNextToPo;
        return dis;
    } else { 
    	//其他情况组成锐角三角形，则求三角形的高
        var p = (lengthCurToPo + lengthNextToPo + lengthCurToNext) / 2; // 半周长  
        var s = Math.sqrt(p * (p - lengthCurToNext) * (p - lengthCurToPo) * (p - lengthNextToPo)); // 海伦公式求面积  
        dis = 2 * s / lengthCurToNext; // 返回点到线的距离（利用三角形面积公式求高）  
        return dis;
    }
}
/**
 * 判断点是否在矩形内
 * @param point 点对象
 * @param bounds 矩形边界对象
 * @returns 点在矩形内返回true,否则返回false
 */
function isPointInRect(point, bounds) {
    var sw = bounds.getSouthWest(); //西南脚点
    var ne = bounds.getNorthEast(); //东北脚点

    return (point.lng >= sw.lng && point.lng <= ne.lng && point.lat >= sw.lat && point.lat <= ne.lat);

}

/**
 * 判断点是否在折线上，如果需要在折线上生成最近点，则可注释该方法，使用下一个方法
 * @param point 鼠标点
 * @param polygon 区域多边形对象
 * @returns 如果判断点不在折线上则返回false,否则返回true
 */
function isPointOnPloylineTest(point, polygon) {
    // 首先判断点是否在线的外包矩形内，如果在，则进一步判断，否则返回false
    var lineBounds = polygon.getBounds();
    if (!isPointInRect(point, lineBounds)) {
        return false;
    }
    var disArray = new Array(); //存储最短距离
    var pts = polygon.getPath();
    var curPt = null; //折线的两个相邻点
    var nextPt = null;
    for (var i = 0; i < pts.length - 1; i++) {
        curPt = pts[i];
        nextPt = pts[i + 1];
        //计算鼠标点到该两个相邻点组成的线段的最短距离
        var dis = countDisPoToLine(point, curPt, nextPt);
        //先将存储最短距离的数组排序
        disArray.push(dis);
        disArray.sort();
       
    }
    var disMin = disArray[0]; //取得数组中最小的最短距离
    if (disMin < 2e-4 && disMin > -2e-4) { //当最短距离小于误差值时，判断鼠标点在折线上（误差值可根据需要更改）
        return true;
    }
    return false;
}
/**
 * 判断点是否在折线上，如果判断为真则在折线上生成离该点最近的点
 * @param point 鼠标点
 * @param polygon 区域多边形对象
 * @returns 如果判断点不在折线上则返回该点（point），如果判断点在折线上则返回计算出的折线最近点（
 因为鼠标点选很难精确点在折线上，要允许一定误差，故需生成一个折线上的最近点），
 返回该最近点（pointPoly）。
 
function isPointOnPloylineTest(point, polygon) {
    // 首先判断点是否在线的外包矩形内，如果在，则进一步判断，否则返回false
    var lineBounds = polygon.getBounds();
    if (!isPointInRect(point, lineBounds)) {
        return point;
    }
    var disArray = new Array(); //存储最短距离
    var pointArray = new Array(); //存储折线相邻点
    var pts = polygon.getPath();
    var curPt = null; //折线的两个相邻点
    var nextPt = null;
    for (var i = 0; i < pts.length - 1; i++) {
        curPt = pts[i];
        nextPt = pts[i + 1];
        //计算鼠标点到该两个相邻点组成的线段的最短距离
        var dis = countDisPoToLine(point, curPt, nextPt);
        //先将存储最短距离的数组排序，如果该两个相邻点与鼠标点计算出的最短距离与数组中最小距离相等，则存储该两点
        disArray.push(dis);
        disArray.sort();
        if (dis == disArray[0]) { 
            pointArray.push(curPt);
            pointArray.push(nextPt);

        }
    }

    curPt = pointArray[pointArray.length - 2]; //取得数组最后两项，即为当最短距离最小时鼠标点两侧的折线点
    nextPt = pointArray[pointArray.length - 1];
    var disMin = disArray[0]; //取得数组中最小的最短距离


    if (disMin < 2e-4 && disMin > -2e-4) { //当最短距离小于误差值时，判断鼠标点在折线上（误差值可根据需要更改）
        var pointPoly = getPointOnPolyline(point, curPt, nextPt); //通过鼠标点和两侧相邻点，在折线上生成一个距离鼠标点最近的点
        return pointPoly;
    }
    return point;
}

/**
 * 如果点离折线上某两点组成的线段最近，则在折线上生成与鼠标点最近的折线点
 * @param point 鼠标点
 * @param curPt，nextPt 折线上相邻两点
 * @returns pointPoly 生成点
 
function getPointOnPolyline(point, curPt, nextPt) {
    var pointLng; // 取得点的经度
    var pointLat; // 取得点的纬度
    var precisionLng = curPt.lng - nextPt.lng;
    var precisionLat = curPt.lat - nextPt.lat;
    
    if (precisionLng < 2e-6 && precisionLng > -2e-6) {
    	// 当折线上两点经度几乎相同时（存在一定误差）
        pointLng = curPt.lng;
        pointLat = point.lat;
        //创建生成点对象
        var pointPoly = new AMap.LngLat(curPt.lng, pointLat); 
    } else if (precisionLat < 2e-6 && precisionLat > -2e-6) { 
    	//当折线上两点纬度相同时（存在一定误差）
        pointLat = curPt.lat;
        pointLng = point.lng;
        var pointPoly = new AMap.LngLat(pointLng, curPt.lat);
    } else { 
    	//其他情况，求得点到折线的垂足坐标		
        var k = (nextPt.lat - curPt.lat) / (nextPt.lng - curPt.lng); //折线上两点组成线段的斜率
        //求得该点到线段的垂足坐标
        //设线段的两端点为pt1和pt2，斜率为：k = ( pt2.y - pt1. y ) / (pt2.x - pt1.x );
        //该直线方程为：y = k* ( x - pt1.x) + pt1.y。其垂线的斜率为 - 1 / k，
        //垂线方程为：y = (-1/k) * (x - point.x) + point.y
        var pointLng_02 = (k * k * curPt.lng + k * (point.lat - curPt.lat) + point.lng) / (k * k + 1);
        var pointLat_02 = k * (pointLng_02 - curPt.lng) + curPt.lat;
        var pointPoly = new AMap.LngLat(pointLng_02, pointLat_02);
    }
    return pointPoly;
}*/
/****************************************************************************/
