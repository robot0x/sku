var skuApp = angular.module('skuApp');
// alert(2);
// 生成SKU指令
skuApp.directive('close', function() {
  return {
    restrict: 'A',
    replace: true,
    link: function(scope, elem) {
      // alert('generatesku');
      $(elem).on('click', function() {
        // console.log(scope);
        $('.generatesku-mask,.new-buylink-mask,.url-normalization-mask').css('display', "none");
      })
    }
  }
})

skuApp.controller("wrapperCtrl", function($scope, $rootScope, $location, $timeout) {
  $scope.isActive = function(route) {
    var path = $location.path()
    if (route === "/search_article" && path === "/") {
      return true;
    }
    return route === path;
  }

  $scope.resetOperaAreaData = function($event) {
    $scope.$broadcast('resetOperaAreaData');
  }

  // 数组去重
  function dupRemove(arr) {
    var recode = {};
    var ret = [];
    if (arr && Array.isArray(arr) && arr.length > 1) {
      arr.forEach(function(v, i) {
        if (!recode[v]) {
          ret.push(v);
          recode[v] = true;
        }
      })
    } else {
      return arr;
    }
    return ret;
  }

  function showNormalizationUrlMask() {
    $('.url-normalization-mask').css('display', 'block');
    // var btn = glyphiconOk.parent();
    $('.opera-replace').removeClass('btn-primary').addClass('btn-danger');
    $('.opera-use').removeClass('btn-success').addClass('btn-default');
    $('.glyphicon-ok').remove();
  }
  $scope.$on('normalizationURL', function(event, data) {

    console.log("data:", data);

    var parsed = data.parsed;

    console.log("parsed:", parsed);

    var ret = {
      sku_link:[],
      cps_link:[],
      original_link:[]
    };


    // 解析data对象，填充list
    parsed.forEach(function(each) {

      for (var a in each) {
        // debugger;
        // a 就是原始链接
        if (!ret.original_link.length) {
          ret.original_link.push(a);
        }

        var v = each[a];

        for (var a2 in v) {
          var v2 = v[a2];
          var retA2 = ret[a2];
          if (Array.isArray(v2)) {
              retA2.push.apply(retA2,v2);          
          }
        }
      }
    })
    // debugger;
    showNormalizationUrlMask();
    $scope.normalizationurl = normalizationurlEvent;
    $scope.normalizationurl.linkObj = ret;
    console.dir($scope.normalizationurl);
    console.dir($scope.normalizationurl.linkObj);
  })

  /*$scope.$on('normalizationURL',function(event,data){
    
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

  })*/

 


  function toggleBtn($dom, attr, val) {
    var dom = $dom[0];
    if (dom.tagName === "SPAN") {
      $dom = $(dom.parentNode);
    }
    var toOperaAreaDate = $scope.generatesku.toOperaAreaDate;
    if ($dom.hasClass('btn-primary')) {
      $dom.removeClass("btn-primary").addClass('btn-danger');
      $dom.find('.glyphicon').remove();
      delete toOperaAreaDate[attr];
    } else {
      $dom.removeClass("btn-danger").addClass('btn-primary');
      $('<span class="glyphicon glyphicon-ok"></span>').appendTo($dom);
      toOperaAreaDate[attr] = val;
    }
  }
  /**
   * [getMartNameByLink 可枚举5种链接]
   * 1. 京东
   * 2. 天猫
   * 3. 亚马逊
   * 4. 淘宝
   * 5. 考拉
   * @param  {[String]} link [链接]
   * @return {[String]} martName [商城名字]
   */
  function getMartNameByLink(link){
    var martName = "";
    if(!link){
      return martName;
    }

    if(link.indexOf("jd.") !== -1){
      martName = "京东";
    }else if(link.indexOf("tmall.") !== -1){
       martName = "天猫";
    }else if(link.indexOf("amazon.") !== -1){
      martName = "亚马逊";
    }else if(link.indexOf("kaola.") !== -1){
      martName = "考拉";
    }else if(link.indexOf("taobao.") !== -1){
      martName = "淘宝";
    }

    return martName;
  }
  var normalizationurlEvent = {
    replaceOriginaLink: function(index) {
      var links = $scope.normalizationurl.linkObj.original_link;
      var link = links[index];
      var originUrl = $scope.normalizationurl.linkObj.original_link[0];
      $scope.normalizationurl = {};
      $('.url-normalization-mask').css('display', "none");
      $scope.$broadcast('alreadynormalizationurl', {
        originUrl: originUrl,
        link: link
      });
    },
    replaceSKULink: function(index) {
      var links = $scope.normalizationurl.linkObj.sku_link;
      var link = links[index];
      var originUrl = $scope.normalizationurl.linkObj.original_link[0];
      $scope.normalizationurl = {};
      $('.url-normalization-mask').css('display', "none");
      $scope.$broadcast('alreadynormalizationurl', {
        originUrl: originUrl,
        link: link
      });
    },
    replaceCPSLink: function(index) {
      var links = $scope.normalizationurl.linkObj.cps_link;
      var link = links[index];
      var originUrl = $scope.normalizationurl.linkObj.original_link[0];
      $scope.normalizationurl = {};
      $('.url-normalization-mask').css('display', "none");
      $scope.$broadcast('alreadynormalizationurl', {
        originUrl: originUrl,
        link: link
      });
    }
  }
  // http://item.jd.com/10009249720.html
  $scope.$on('generateSKU', function(event, sku) {

    console.log('接收到了generateSKU事件。数据为：', sku);
    var link = sku.link;
    $scope.generatesku = generateskuEvent;
    $scope.generatesku.link = link;
    // 商品名
    $scope.generatesku.name = sku.name;
    // 品牌
    $scope.generatesku.brand = sku.brand;
    // 价格
    $scope.generatesku.price_str = sku.price_str;
    // alert(sku.price);
    $scope.generatesku.price = sku.price;
    $scope.generatesku.imgs = sku.imgs;
    $scope.generatesku.sales = [{
      mart:getMartNameByLink(link),
      link_m_cps:link,
      price:sku.price
    }];
    // $scope.generatesku = sku;
    $scope.generatesku.toOperaAreaDate = {};
  });
  var generateskuEvent = {
     confirm: function() {
      var name = ($scope.generatesku.name || "").trim();
      var price_str = ($scope.generatesku.price_str || "").trim();
      var price = $scope.generatesku.price || 0;
      var brand = ($scope.generatesku.brand || "").trim();
      var sales = $scope.generatesku.sales || [];
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

      $('.generatesku-mask').css('display', "none");
      var toOperaAreaDate = $scope.generatesku.toOperaAreaDate;
      // 因为toOperaAreaDate是根据界面选择赋值的，所以，需要在发送toOperaAreaDate事件之前
      // 显示地把SKU本身形成的链接挂到toOperaAreaDate对象上。供operAreaCtrl.js中使用
      toOperaAreaDate.sales = sales;
      console.log("toOperaAreaDate:", toOperaAreaDate);
      $scope.$broadcast('toOperaAreaDate', toOperaAreaDate);
      $scope.generatesku = {};
    },
    useImage: function($event, img) {
      var dom = $event.target;
      if (dom.tagName === "SPAN") {
        dom = dom.parentNode;
      }
      var $dom = $(dom);
      var imgs = $scope.generatesku.toOperaAreaDate.imgs;
      if (!imgs) {
        imgs = [];
      }
      if ($dom.hasClass('btn-success')) {
        $dom.removeClass("btn-success").addClass('btn-default');
        $dom.find('.glyphicon').remove();
        imgs.splice(imgs.indexOf(img), 1);
      } else {
        $dom.removeClass("btn-default").addClass('btn-success');
        $('<span class="glyphicon glyphicon-ok"></span>').appendTo($dom);
        imgs.push(img);
      }
      $scope.generatesku.toOperaAreaDate.imgs = imgs;
    },
    // http://item.jd.com/10009249720.html
    replaceName: function($event, name) {
      toggleBtn($($event.target), "name", name);
    },
    replacePrice: function($event, price) {
      toggleBtn($($event.target), "price", price);
    },
    replacePriceStr: function($event, price_str) {
      toggleBtn($($event.target), "price_str", price_str);
    },
    replaceBrand: function($event, brand) {
      toggleBtn($($event.target), "brand", brand);
    },
   
    selectAll: function() {
      $timeout(function() {
        $('.opera-replace,.opera-use').trigger('click');
      }, 100);
    }
  }

  $scope.generatesku = generateskuEvent;

  $scope.newBuylink = {
    // 李园宁要求：介绍字段变为非必填
    confirm: function() {
      var mart = ($scope.mart || "").trim();
      var link_pc_cps = ($scope.link_pc_cps || "").trim();
      var link_m_cps = ($scope.link_m_cps || "").trim();
      var price = ($scope.price || "").trim();
      var intro = ($scope.intro || "").trim();

      if (!mart) {
        $scope.warning = "商城不能为空";
        return;
      }
      if (!link_pc_cps && !link_m_cps) {
        $scope.warning = "链接不能为空，请至少填写1个链接";
        return;
      }

      if (!price) {
        $scope.warning = "价格不能为空";
        return;
      }

      // if (!intro) {
      //   $scope.warning = "说明不能为空";
      //   return;
      // }
      // alert('confirm');
      // 在operaArea.js中
      $scope.$broadcast('newBuylink', {
        mart: $scope.mart,
        link_pc_cps: $scope.link_pc_cps,
        link_m_cps: $scope.link_m_cps || null,
        link_pc_raw: null,
        link_m_raw: null,
        price: $scope.price,
        intro: $scope.intro
      })
      $('.new-buylink-mask').css('display', "none");
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