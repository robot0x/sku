// 定义directive模块
var skuApp = angular.module("skuApp", []);

skuApp.directive("operaarea", function() {
  return {
    restrict: "E",
    templateUrl: "views/operaArea.html",
    replace: true
  };
});
