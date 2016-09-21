// search_sku.html 模板控制器
var skuApp = angular.module('skuApp');
// 懒加载指令
skuApp.directive('limitScroll', function(){
  return {
    restrict: 'A',
    link: function(scope, elem) {
      $(elem).on('wheel',function(event){
        var scrollTop = this.scrollTop;
        var originalEvent = event.originalEvent;
        var scrollHeight = this.scrollHeight;
        var height = this.clientHeight;
        var wheelDelta = originalEvent.wheelDelta;
        var delta = wheelDelta ? wheelDelta : -(originalEvent.detailY || 0);  
        if ((delta > 0 && scrollTop <= delta) || (delta < 0 && scrollHeight - height - scrollTop <= -1 * delta)) {
            // IE浏览器下滚动会跨越边界直接影响父级滚动，因此，临界时候手动边界滚动定位
            this.scrollTop = delta > 0? 0: scrollHeight;
            // 向上滚 || 向下滚
            event.preventDefault();
        }
      })
    }
  }
})
