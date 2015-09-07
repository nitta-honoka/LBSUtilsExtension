# GeoUtilExtension
A extension open source library about LBS JavaScript API（LBS JavaScript API扩展库，主要关于几何算法部分）

###开发原因
最近使用高德地图JavaScript API开发地图应用时，发现部分需要使用的方法并未提供，或者在实际使用场景中存在缺陷，于是自造了一些轮子。决定将其集成在一个工具类中，方便后续开发直接使用，并在GitHub做版本维护。

方法的实现逻辑可参考[个人博客](http://www.honoka.me)中的相关文章。

###开发进度
 - 20150907-增加“判断点在折线上”的方法（高德地图未提供此方法，而百度地图开源库使用后发现当折线几乎处于同一经度或纬度时，则无法判断，故自己写了一个判断方法应用在项目中，并向百度地图提交修改建议。）[详细说明](http://www.honoka.me/%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BEapi%E5%BC%80%E5%8F%91%E4%BA%8C%E4%B8%89%E4%BA%8B%EF%BC%88%E4%BA%8C%EF%BC%89%E5%A6%82%E4%BD%95%E5%88%A4%E6%96%AD%E7%82%B9%E6%98%AF%E5%90%A6%E5%9C%A8%E6%8A%98/)
