// search_sku.html 模板控制器
var skuApp = angular.module('skuApp');
// 懒加载指令
skuApp.directive('lazyLoad', function(){
  return {
    restrict: 'A',
    link: function(scope, elem) {
      var scroller = elem[0];
      $(window).bind('scroll',function(){
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        var clientHeight = document.documentElement.clientHeight;
        var offsetTop = scroller.offsetTop;
        var offsetHeight = scroller.offsetHeight;
        // 计算 loadMore 调用所需要的条件
        if(((scrollTop + clientHeight) - offsetTop) >= offsetHeight ){
            scope.$apply('loadMore()');
        }
      })
    }
  }
})


skuApp.controller('searchSKUCtrl',function($scope,$rootScope,$http){
    
    var loadCount = 30; // 懒加载的item个数
    var ind = 0; // 开始位置
    var defaultLoadCount = 100;
    // 发送 CORS 请求必须的header
    var headers = {"Content-Type":"application/json"};
    
    $http({
        url:"//s5.a.dx2rd.com:3000/v1/getalllist",
        method:"GET",
        timeout:20000,
        catch:true,
        headers:headers
    }).then(function(result){
        return result.data.data;
    }).then(function(alllist){
        var allSKUList = [];
        var sids = Object.keys(alllist);
        sids.sort(function(s1,s2){
            return s2 - s1;
        })
        sids.slice(0,defaultLoadCount).forEach(function(cid){
            allSKUList.push.apply(allSKUList,alllist[cid]);
            // allSKUList.push(alllist[cid][0]); // 不管有多少，只push第一个，加快速度
        })
        $http({
          url:"//s5.a.dx2rd.com:3000/v1/getfullsku",
          method:"POST",
          timeout:20000,
          catch:true,
          headers:headers,
          data:JSON.stringify({
            sids:allSKUList
          })
       }).then(function(skuList){
            $scope.skuList = skuList.data.data;
            $scope.cachedSkuList = $scope.skuList.slice(0,loadCount);
            $scope.cachedSkuList.sort(function(s1,s2){
              return s2.sid - s1.sid;
            })
       }).catch(function(e){
            console.error(e);
       })
    }).catch(function(e){
        console.error(e);
    })
    $scope.loadMore = function() {
        console.log('loading...');
        ind = ind + loadCount
        var r = loadCount
        var skuList = $scope.skuList;
        if(!skuList){
            return;
        }
        var l = skuList.length;
        if (ind + loadCount > l) {
          r = l - ind
        }
        $scope.cachedSkuList = $scope.cachedSkuList.concat($scope.skuList.slice(ind, r + ind));
    }


    $scope.eventHandler = {
        search:function(){
            // var keyword = $scope.dataFetch.keyword;
            var keyword = $scope.query;
            var url = "//s5.a.dx2rd.com:3000/v1/getfullsku/";
            if(keyword){

                var kw = Number(keyword);
                // var loadingContainer = $('.loading-container');
                // loadingContainer.show();
                showLoading();

                if(isNaN(kw)){
                    // 取出上一次的搜索词
                var lastKeyword = $scope._lastKeyword_;
                // 只有当第一次搜索和本次搜索跟上一次搜索词不一样才从后台拿数据
                    if(!(lastKeyword && lastKeyword.trim() == keyword.trim())){
                         // 把根据keyword查询到的数据，广播到子controller上
                        $rootScope._lastKeyword_ = keyword;
                        $http({
                         url:"//s5.a.dx2rd.com:3000/v1/search/"+keyword,
                         method:"GET",
                         timeout:20000,
                         catch:true,
                         headers:headers
                         // ,data:encodeURIComponent(keyword)
                        }).then(function(result){
                            console.log(result);
                            var data = result.data.data;
                            if(data.length === 0){
                                hideLoading("没有符合条件的数据，换个关键词试试？");
                            }else{
                                hideLoading("搜索成功");
                            }
                            $scope.cachedSkuList = data;
                        }).catch(function(e){
                            console.log(e);
                            hideLoading("失败搜索失败，请重试");
                        })
                        console.log(keyword);
                    }
                }else{

                    $http({
                        url:url+kw,
                        method:"GET",
                        timeout:20000,
                        catch:true,
                        headers:headers
                   }).then(function(result){
                        // console.log(sku.data.data);
                        // item.skuList = sku.data.data;
                        var skuList = result.data.data;
                         $scope.cachedSkuList = skuList;
                         if(skuList.length === 0){
                            hideLoading("没有符合条件的数据，换个关键词试试？");
                         }else{
                            hideLoading("搜索成功");
                         }
                   }).catch(function(e){
                        console.log(e);
                        hideLoading("搜索失败，请重试");
                   })
                }
            }
        },
        knockEnterKey:function($event){
            var keycode = $event.keyCode;
            if(keycode === 13){
                this.search();
            }
        },
        view:function(sid){
            // 发射viewSKU事件。在operaAreaCtrl.js中接收
            $rootScope.$emit('viewSKU',sid);
            console.log(sid);
        }
    }

})
