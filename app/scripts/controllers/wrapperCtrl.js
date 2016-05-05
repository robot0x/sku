var skuApp = angular.module('skuApp');
// alert(2);
// 生成SKU指令
skuApp.directive('close', function() {
    return {
      restrict: 'A',
      replace: true,
      link: function(scope, elem) {
        // alert('generatesku');
        $(elem).on('click',function(){
          // console.log(scope);
          $('.generatesku-mask,.new-buylink-mask,.url-normalization-mask').css('display',"none");
        })        
      }
    }
  })

  skuApp.controller("wrapperCtrl",function($scope,$rootScope,$location,$http,$timeout){
     $scope.isActive = function(route) {
            var path = $location.path()
            if(route === "/search_article" && path === "/"){
                return true;
            }
            return route ===  path;
    }

    $scope.resetOperaAreaData = function($event){
         $scope.$broadcast('resetOperaAreaData');
    }

    // 数组去重
    function dupRemove(arr){
      var recode = {};
      var ret = [];
      if(arr && Array.isArray(arr) && arr.length > 1){
        arr.forEach(function(v,i){
          if(!recode[v]){
            ret.push(v);
            recode[v] = true;
          }
        })
      }else{
        return arr;
      }
      return ret;
    }

    function showNormalizationUrlMask(){
          $('.url-normalization-mask').css('display','block');
          // var btn = glyphiconOk.parent();
          $('.opera-replace').removeClass('btn-primary').addClass('btn-danger');
          $('.opera-use').removeClass('btn-success').addClass('btn-default');
          $('.glyphicon-ok').remove();
      }

    $scope.$on('normalizationURL',function(event,data){
      
      console.log("data:",data);

      var parsed = data.parsed;

      console.log("parsed:",parsed);

      var list = [];

      // 原始url
      var originUrl;

      // 解析data对象，填充list
      parsed.forEach(function(each){
        for(var a in each){
          var v = each[a];
          if(!originUrl){
            originUrl = a;
          }
          for(var a2 in v){
            var v2 = v[a2];
            if(Array.isArray(v2)){
              list = list.concat(v2);
            }else{
              list.push(a);
              break;
            }
          }
        }
      })


      console.log(list);
      console.log(originUrl);

      // 去重
      list = dupRemove(list);

      // 去掉原始url
      list.splice(list.indexOf(originUrl),1)

      console.log(list);

      // 如果去重及去掉原始url之后，list长度为0，说明已经是规范化的链接了
      if(list.length === 0){
        tip('已经是规范化的链接了');
      }else{

        showNormalizationUrlMask();
        $scope.normalizationurl = normalizationurlEvent;
        $scope.normalizationurl.originUrl = originUrl;
        $scope.normalizationurl.links = list;
      }



    })

    // http://item.jd.com/10009249720.html
    $scope.$on('generateSKU',function(event,sku){

        console.log('接收到了generateSKU事件。数据为：',sku);
        $scope.generatesku =  generateskuEvent;
        $scope.generatesku.link = sku.link;
        // 商品名
        $scope.generatesku.name = sku.name;
        // 品牌
        $scope.generatesku.brand = sku.brand;
        // 价格
        $scope.generatesku.price_str = sku.price_str;
        // alert(sku.price);
        $scope.generatesku.price = sku.price;
        $scope.generatesku.imgs = sku.imgs;
        // $scope.generatesku = sku;
        $scope.generatesku.toOperaAreaDate = {};
    });

    function toggleBtn($dom,attr,val){
      var dom = $dom[0];
      if(dom.tagName === "SPAN"){
        $dom = $(dom.parentNode);
      }
      var toOperaAreaDate = $scope.generatesku.toOperaAreaDate;
      if($dom.hasClass('btn-primary')){
          $dom.removeClass("btn-primary").addClass('btn-danger');
          $dom.find('.glyphicon').remove();
          delete toOperaAreaDate[attr];
        }else{
          $dom.removeClass("btn-danger").addClass('btn-primary');
          $('<span class="glyphicon glyphicon-ok"></span>').appendTo($dom);
          toOperaAreaDate[attr] = val;
        }
    }

    var normalizationurlEvent = {
      replace:function(index){
        var links = $scope.normalizationurl.links;
        var link = links[index];
        var originUrl = $scope.normalizationurl.originUrl;
        $scope.normalizationurl = {};
        $('.url-normalization-mask').css('display',"none");
        $scope.$broadcast('alreadynormalizationurl',{
          originUrl:originUrl,
          link:link
        });
      }
    }

    var generateskuEvent = {
      useImage:function($event,img){
        var dom = $event.target;
        if(dom.tagName === "SPAN"){
          dom = dom.parentNode;
        }
        var $dom = $(dom);
        var imgs = $scope.generatesku.toOperaAreaDate.imgs;
        if(!imgs){
          imgs = [];
        }
        if($dom.hasClass('btn-success')){
          $dom.removeClass("btn-success").addClass('btn-default');
          $dom.find('.glyphicon').remove();
          imgs.splice(imgs.indexOf(img),1);
        }else{
          $dom.removeClass("btn-default").addClass('btn-success');
          $('<span class="glyphicon glyphicon-ok"></span>').appendTo($dom);
          imgs.push(img);
        }
        $scope.generatesku.toOperaAreaDate.imgs = imgs;
      },
      // http://item.jd.com/10009249720.html
      replaceName:function($event,name){
        toggleBtn($($event.target),"name",name);
      },
      replacePrice:function($event,price){
        toggleBtn($($event.target),"price",price);
      },
      replacePriceStr:function($event,price_str){
        toggleBtn($($event.target),"price_str",price_str);
      },
      replaceBrand:function($event,brand){
        toggleBtn($($event.target),"brand",brand);
      },
      confirm:function(){
        var name = ($scope.generatesku.name || "").trim();
        var price_str = ($scope.generatesku.price_str || "").trim();
        var price = $scope.generatesku.price || 0;
        var brand = ($scope.generatesku.brand || "").trim();
        // console.log(price_str);
        // 取消验证
        // if(!name){
        //   $scope.generatesku.warning = "商品名不能为空";
        //   return;
        // }
        // if(!price_str){
        //   $scope.generatesku.warning = "价格不能为空";
        //   return;
        // }
        // if(!price){
        //   $scope.generatesku.warning = "价格(数字)不能为空";
        //   return;
        // }else if(!/^\d+\.?\d*$/g.test(price)){
        //     $scope.generatesku.warning = "价格2只能填写数字，请重新输入";
        //     return;
        // }
        // if(!brand){
        //   $scope.generatesku.warning = "品牌不能为空";
        //   return;
        // }

        $('.generatesku-mask').css('display',"none");
        var toOperaAreaDate = $scope.generatesku.toOperaAreaDate;
        console.log("toOperaAreaDate:",toOperaAreaDate);
        $scope.$broadcast('toOperaAreaDate',toOperaAreaDate);
        $scope.generatesku = {};
      },
      selectAll:function(){
        $timeout(function() {
            $('.opera-replace,.opera-use').trigger('click');
        }, 100);
      }
    }

    $scope.generatesku =  generateskuEvent;

    $scope.newBuylink = {

      confirm:function(){
        var mart = ($scope.mart || "").trim();
        var link_pc_cps = ($scope.link_pc_cps || "").trim();
        var link_m_cps = ($scope.link_m_cps || "").trim();
        var price = ($scope.price || "").trim();
        var intro = ($scope.intro || "").trim();

        if(!mart){
          $scope.warning = "商城不能为空";
          return;
        }
        if(!link_pc_cps && !link_m_cps){
          $scope.warning = "链接不能为空，请至少填写1个链接";
          return;
        }

        if(!price){
          $scope.warning = "价格不能为空";
          return;
        }
        
        if(!intro){
          $scope.warning = "说明不能为空";
          return;
        }
        // alert('confirm');
        // 在operaArea.js中
        $scope.$broadcast('newBuylink',{
          mart:$scope.mart,
          link_pc_cps:$scope.link_pc_cps,
          link_m_cps:$scope.link_m_cps || null,
          link_pc_raw:null,
          link_m_raw:null,
          price:$scope.price,
          intro:$scope.intro
        })
        $('.new-buylink-mask').css('display',"none");
        // 最后，清空所有数据，保证下一次打开没有任何数据
        $scope.mart = 
        $scope.link_pc_cps = 
        $scope.link_m_cps = 
        $scope.price =  
        $scope.intro = 
        $scope.warning = "";
      }
    }
})
