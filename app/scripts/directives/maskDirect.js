var skuApp = angular.module('skuApp');
// 生成SKU指令
skuApp.directive('generatesku', function() {
  return {
    restrict: 'AE',
    template:'<div>Hi there</div>',
    replace: true,
    link: function(scope, elem) {
      // alert('generatesku');
      
    }
  }
})
skuApp.directive('newbuylink', function() {
  return {
    restrict: 'AE',
    template:'<div>Hi there</div>',
    replace: true,
    link: function(scope, elem) {
      
    }
  }
})