# GeoUtilExtension
A extension open source library about LBS JavaScript API（LBS JavaScript API扩展库，主要关于几何算法部分）

###开发原因
最近使用高德地图JavaScript API开发地图应用时，发现部分需要使用的方法并未提供，或者在实际使用场景中存在缺陷，于是自造了一些轮子。决定将其集成在一个工具类中，方便后续开发直接使用，并在GitHub做版本维护。

方法的实现逻辑可参考[个人博客](http://www.honoka.me)中的相关文章。

###开发进度
 - 20150907-增加“判断点在折线上”的方法（高德地图未提供此方法，而百度地图开源库使用后发现当折线几乎处于同一经度或纬度时，则无法判断，故自己写了一个判断方法应用在项目中，并向百度地图提交修改建议。）
