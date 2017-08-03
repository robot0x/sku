// search_article.html 模板控制器

// 引入angularFileUpload 就报错，是咋回事？
// var skuApp = angular.module('skuApp',['angularFileUpload']);
var skuApp = angular.module("skuApp");
// 这种写法与上面的区别是：此写法会创建一个新的模块
// var skuApp = angular.module('skuApp',[]);
skuApp.controller("operaAreaCtrl", function(
  $scope,
  $rootScope,
  $http,
  $location,
  $q
) {
  // skuApp.controller("operaAreaCtrl",function($scope,$rootScope,$http){
  $scope.articles = [];
  function local_multi(result) {
    // alert(1);
    // console.log("result：",result);
    // 整个ajax过程成功
    var failArray = [];
    var successArray = [];
    console.log("上传本地图成功：", result);
    if (result.state === "SUCCESS") {
      var fileArray = result.data;
      if (fileArray.length) {
        fileArray.forEach(function(file) {
          if (file.state === "SUCCESS") {
            successArray.push({
              url: file.url
            });
          } else {
            failArray.push(file.name);
          }
        });
      }
    } else {
      hideLoading("文件上传失败，请重试");
    }
    // console.log("failArray:",failArray);
    // console.log("successArray:",successArray);
    if (failArray.length) {
      hideLoading("文件：\n" + failArray.join("\n") + "上传失败，请重试");
    }
    if (successArray.length) {
      // $scope.operaArea.dataFetch.images = successArray;
      var dataFetch = $scope.operaArea.dataFetch;
      if (dataFetch) {
        var images = dataFetch.images;

        if (images != null && images.length > 0) {
          $scope.operaArea.dataFetch.images = images.concat(successArray);
        } else {
          $scope.operaArea.dataFetch.images = successArray;
        }
      } else {
        $scope.operaArea.dataFetch = {
          images: successArray
        };
      }
      if (!failArray.length) {
        hideLoading("文件全部上传成功");
      }
    }
  }

  function getArticles(cids, callback) {
    if (!cids || !cids.length) {
      return;
    }
    var headers = { "Content-Type": "application/json" };
    $http({
      url: "//api.diaox2.com/v4/meta",
      method: "POST",
      timeout: 20000,
      catch: true,
      data: JSON.stringify({
        is_grey: false,
        request_methods: ["specified_meta_data"],
        request_data: {
          specified_meta_data: {
            cids: cids
          }
        }
      }),
      headers: headers
    })
      .then(function(result) {
        var meta_infos = result.data.res.specified_meta_data.meta_infos;

        // 如果使用v4/meta拿不到数据或者数据拿到的不全的话，就使用 m=meta 再次拿一次
        // 李园宁提出来的BUG，其实我已经写了
        // 但是判断不严，原先是 一个数据也拿不到才调用m=meta接口再拿一次
        // 正常应该是，拿到的数据长度不等于cid的长度，就从新拿一次
        if (!meta_infos || meta_infos.length !== cids.length) {
          $http({
            // url:"//z.diaox2.com/view/app/?m=meta",
            url: "//z.diaox2.com:3001/?m=meta",
            method: "POST",
            timeout: 20000,
            catch: true,
            data: cids,
            headers: headers
          })
            .then(function(result) {
              var meta_infos = result.data.metas;
              var articles = [];
              console.log(meta_infos);
              if (meta_infos) {
                meta_infos.forEach(function(item) {
                  articles.push({
                    cid: item.serverid,
                    thumb_image_url: item.thumb,
                    // bug fix
                    url: "//c.diaox2.com" + item.oriUrl,
                    title: [item.title],
                    thumb_image_url: item.cover
                  });
                });
              }
              console.log(meta_infos);
              if (callback) {
                callback(articles);
              }
            })
            .catch(function(e) {
              console.log("m=meta接口关联失败");
              tip("关联失败，请重试");
            });
        } else if (callback) {
          callback(meta_infos);
        }
      })
      .catch(function(e) {
        console.log("v4/meta接口关联失败");
        tip("关联失败，请重试");
      });
  }

  function showArticles(meta_infos, concat) {
    if (!meta_infos || !meta_infos.length) {
      return;
    }
    if (typeof concat !== "boolean") {
      concat = false;
    }
    $(".revarticles").css("display", "block");
    var articles = $scope.articles;
    if (concat) {
      articles = articles.concat(meta_infos);
    } else {
      articles = meta_infos;
    }
    // 数组去重算法
    articles = (function(arr) {
      var n = {}, r = [], i = 0, l = arr.length, item, cid; //n为hash表，r为临时数组
      for (; i < l; i++) {
        //遍历当前数组
        item = arr[i];
        cid = item.cid;
        if (!n[cid]) {
          //如果hash表中没有当前项
          n[cid] = true; //存入hash表
          r.push(item); //把当前数组的当前项push到临时数组里面
        }
      }
      return r;
    })(articles);
    $scope.articles = articles;
    // 记录操作区关联的文章列表，供searchArticleCtrl.js 使用
    $rootScope.revarticles = articles;
  }
  // 监听dataFetch属性是否发生改变
  $scope.$watch(
    "operaArea.dataFetch",
    function() {
      // console.log("changed");
      // console.log($scope.operaArea.dataFetch);
      if ($scope.operaArea.dataFetch == null) {
        // console.log('false')
        $rootScope.isChanged = false;
      } else {
        // console.log('true')
        $rootScope.isChanged = true;
      }
    },
    true
  );

  // 触发viewSKU事件。发自searchArticleCtrl.js | searchSKUCtrl.js
  $rootScope.$on("viewSKU", function(event, sid) {
    // var isChanged = $rootScope.isChanged;
    // if(isChanged != null && isChanged){
    //    console.log(isChanged);
    //    if(!confirm('内容已经修改但并未保存，是否强制跳转？')){
    //      return;
    //    }
    // }else{
    //   $rootScope.isChanged = false;
    // }
    $http({
      url: "//s5.a.dx2rd.com:3000/v1/getfullsku/" + sid,
      method: "GET",
      timeout: 20000,
      headers: { "Content-Type": "application/json" }
    })
      .then(function(result) {
        // console.log(result);
        var upperData = result.data;
        var data;
        var sku;
        if (upperData.state === "SUCCESS") {
          data = upperData.data;
          if (data && data.length) {
            sku = data[0];
          } else {
            tip("没有SKU，请重试");
            return;
          }
          console.log();
          if (sku) {
            $scope.operaArea.dataFetch = sku;
          }
        } else {
          var message = upperData.message;
          var info = "SKU获取失败，请重试。";
          if (message) {
            info += "信息：" + message;
          }
          tip(info);
          return;
        }

        // $scope.operaArea.dataFetch = {
        //     price:sku.price,
        //     price_str:sku.price_str,
        //     title:sku.title,
        //     images:sku.images,
        //     sid:sku.sid,
        //     template:sku.template,
        //     sales:sku.sales,
        //     brand:sku.brand,
        //     intro:sku.intro,
        //     extra:sku.extra,
        //     specs:sku.specs,
        //     type:sku.type,
        //     tags:sku.tags,
        //     status:sku.status
        // }
        // console.log(sku.sales);
        console.log("查看的SKU：", sku);

        var netImg = filterNetImg(sku.images);

        $scope.operaArea.cid = null;

        if (netImg.length > 0) {
          $scope.operaArea.dataFetch.uploadAllFlag = true;
        } else {
          $scope.operaArea.dataFetch.uploadAllFlag = false;
        }
        // console.log(sku.revarticles.map(function(item){ return item & 0xffffff }));

        // 根据sku的关联文章id拿到文章meta
        getArticles(sku.revarticles, function(meta_infos) {
          // 显示在右侧操作区
          showArticles(meta_infos);
          // 给关联文章添加3D效果。在searchArticleCtrl.js中接收
          $rootScope.$emit("addThreeD", $scope.articles);
          // $rootScope.$emit('addThreeD',result.data.res.specified_meta_data.meta_infos);
        });
      })
      .catch(function(e) {
        console.error(e);
      });
  });

  $scope.$on("alreadynormalizationurl", function(event, data) {
    var sales = $scope.operaArea.dataFetch.sales,
      l = sales.length,
      i = 0,
      originUrl = data.originUrl,
      index,
      attr,
      value,
      foundSale,
      foundAttr,
      sale,
      splitArr;
    /*
          循环sales数组，根据原始链接（originUrl）找到相应的sale
          和sale中value等于originUrl的key
        */
    console.log(originUrl);
    console.log(sales);

    loop: for (; i < l; i++) {
      sale = sales[i];
      for (attr in sale) {
        value = sale[attr];
        splitArr = originUrl.split(value);
        if (
          value === originUrl || (splitArr.length === 2 && splitArr[1] === "")
        ) {
          // 找到第一个即可，直接跳出外层循环
          index = i;
          foundAttr = attr;
          break loop;
        }
      }
    }

    if (index != void 0) {
      var foundSale = sales[index];
      foundSale[foundAttr] = data.link;
      sales.splice(index, 1, foundSale);
      tip("url规范化成功", 1000);
    }
  });

  $scope.$on("toOperaAreaDate", function(event, data) {
    // console.log(data);
    var images = data.imgs;

    if (images) {
      images = images.map(function(img) {
        return { url: img };
      });
    }

    if ($scope.operaArea.dataFetch) {
      if (data.price) {
        $scope.operaArea.dataFetch.price = data.price;
      }
      if (data.price_str) {
        $scope.operaArea.dataFetch.price_str = data.price_str;
      }
      if (data.name) {
        $scope.operaArea.dataFetch.title = data.name;
      }
      if (images && images.length) {
        $scope.operaArea.dataFetch.images = images;
      }
      if (data.brand) {
        $scope.operaArea.dataFetch.brand = data.brand;
      }
      $scope.operaArea.dataFetch.extra = data.extra;
      $scope.operaArea.dataFetch.specs = data.specs;
      $scope.operaArea.dataFetch.type = data.type;
      $scope.operaArea.dataFetch.tags = data.tags;
      $scope.operaArea.dataFetch.status = data.status;
      console.log(data.sales);
      var sales = $scope.operaArea.dataFetch.sales;
      // 李园宁的新需求：把生成的SKU链接本身也当作一条购买链接
      if (data.sales && data.sales.length) {
        if (sales && sales.length) {
          $scope.operaArea.dataFetch.sales.push(data.sales[0]);
        } else {
          $scope.operaArea.dataFetch.sales = data.sales;
        }
      } else {
        $scope.operaArea.dataFetch.sales = $scope.operaArea.dataFetch.sales;
      }
    } else {
      $scope.operaArea.dataFetch = {
        price: data.price,
        price_str: data.price_str,
        title: data.name,
        images: images,
        brand: data.brand,
        intro: data.intro,
        extra: data.extra,
        specs: data.specs,
        type: data.type,
        tags: data.tags,
        status: data.status
        // 防止冲掉”一键获取已有购买链接“生成的sales
        // sales:sales
      };
    }
  });
  $scope.$on("newBuylink", function(event, data) {
    if (!$scope.operaArea.dataFetch) {
      $scope.operaArea.dataFetch = {};
    }
    var sales = $scope.operaArea.dataFetch.sales;
    if (sales && sales.length) {
      sales.push({
        link_pc_cps: data.link_pc_cps || null,
        link_m_cps: data.link_m_cps,
        link_pc_raw: data.link_pc_raw,
        link_m_raw: data.link_m_raw,
        mart: data.mart,
        price: data.price,
        price_str: data.price_str,
        intro: data.intro
      });
    } else {
      sales = [
        {
          link_pc_cps: data.link_pc_cps || null,
          link_m_cps: data.link_m_cps,
          link_pc_raw: data.link_pc_raw,
          link_m_raw: data.link_m_raw,
          mart: data.mart,
          price: data.price,
          price_str: data.price_str,
          intro: data.intro
        }
      ];
    }
    $scope.operaArea.dataFetch.sales = sales;
  });

  /*
        过滤网图，返回过滤出来的网图
     */
  function filterNetImg(images) {
    var netImg = [];
    // //content.image.alimmdn.com/sku/1461574365352938_jpg.jpeg
    // fix bug 去掉 g ，详见 //my.oschina.net/ffwcn/blog/276949?fromerr=tCyOJ0zn
    // var rnetImg = /^\s*(https?:\/\/)?content\.image\.alimmdn\.com\/sku\//ig
    var rnetImg = /^\s*(https?:\/\/)?content\.image\.alimmdn\.com\/sku\//i;
    images = images || $scope.operaArea.dataFetch.images;
    images.forEach(function(item) {
      if (!rnetImg.test(item.url)) {
        netImg.push(item.url);
      }
    });
    return netImg;
  }

  function isEmptyObject(obj) {
    if (obj == null) {
      return true;
    }
    var name;
    for (name in obj) {
      return false;
    }
    return true;
  }
  function parse(link, callback) {
    $http({
      /*
            阿里云这个域名需要备案，如果在web上直接请求，会跳转到阿里云提示备案页
            不使用域名，使用ip地址，可以解决这个问题。。
            在server端可以调用这个带域名的接口
            需要server端跟进
            现已解决这个问题
            server端包了一层，我请求//s5.a.dx2rd.com:3001/v1/url这个地址
            然后在server端，请求//s4.a.dx2rd.com/blsvr/parse这个接口，把
            取到的数据用//s5.a.dx2rd.com:3001/v1/url返回过来
          */
      // url:"//s4.a.dx2rd.com/blsvr/parse",
      // url:"//121.42.141.74/blsvr/parse",
      url: "//s5.a.dx2rd.com:3001/v1/url",
      method: "POST",
      timeout: 20000,
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        url: link
      })
    }).then(function(result) {
      if (callback) {
        callback(result);
      }
    });
  }
  $scope.operaArea = {
    eventHandler: {
      m_cps: function(m_cps_link) {
        showLoading();
        parse(m_cps_link, function(result) {
          console.log(result);

          var data = result.data;

          if (data.state && data.state !== "SUCCESS") {
            hideLoading("url规范化失败。信息：" + data.message);
          } else {
            // 发送 url规范化事件 在wrapperCtrl.js中接收
            $scope.$emit("normalizationURL", data);
            hideLoading();
          }
        });
      },
      pc_cps: function(pc_cps_link) {
        showLoading();
        parse(pc_cps_link, function(result) {
          console.log(result);

          var data = result.data;

          if (data.state && data.state !== "SUCCESS") {
            hideLoading("url规范化失败。信息：" + data.message);
          } else {
            // 发送 url规范化事件 在wrapperCtrl.js中接收
            $scope.$emit("normalizationURL", data);
            hideLoading();
          }
        });
      },
      getAllBuyLink: function(cid) {
        cid = toLongCid(cid);
        showLoading();
        $http({
          url: "//s5.a.dx2rd.com:3000/v1/getoldbuyinfo/" + cid,
          method: "GET",
          timeout: 20000,
          headers: { "Content-Type": "application/json" }
        })
          .then(function(result) {
            console.log(result);
            var upperData = result.data;

            if (upperData.state === "SUCCESS") {
              var data = upperData.data;

              var buylinks = data[cid];

              if (!buylinks || !buylinks.length) {
                hideLoading("该篇文章没有购买链接", 800);
              } else {
                buylinks.forEach(function(buylink) {
                  buylink.link_pc_cps = buylink.link_pc;
                  buylink.link_m_cps = buylink.link;

                  (buylink.link_pc_raw = null), (buylink.link_m_raw = null), delete buylink.link_pc;
                  delete buylink.link;
                });

                var dataFetch = $scope.operaArea.dataFetch;

                if (dataFetch) {
                  // var sales = dataFetch.sales;
                  // if(sales){
                  //   $scope.operaArea.dataFetch.sales = $scope.operaArea.dataFetch.sales.concat(buylinks);
                  // }else{
                  //   $scope.operaArea.dataFetch.sales = buylinks;
                  // }
                  $scope.operaArea.dataFetch.sales = buylinks;
                } else {
                  $scope.operaArea.dataFetch = {
                    sales: buylinks
                  };
                }
                hideLoading();
              }
              console.log(buylinks);
            } else {
              hideLoading("一键获取已有购买链接失败，请重试");
            }
          })
          .catch(function(e) {
            hideLoading("一键获取已有购买链接失败，请重试");
          });
      },
      knockEnterKey: function($event, articleID, flag) {
        var keycode = $event.keyCode;

        if (typeof flag !== "boolean") {
          flag = false;
        }

        if (keycode === 13) {
          // this.search();
          if (flag) {
            this.getAllBuyLink(articleID);
          } else {
            this.addRelate(articleID);
          }
        }
      },
      save: function() {
        var dataFetch = $scope.operaArea.dataFetch;
        if (dataFetch) {
          // 必填项
          var title = (dataFetch.title || "").trim(); // 商品名 必填

          var images_ori = dataFetch.images;
          var sales_ori = dataFetch.sales;
          var price = dataFetch.price; // 商品价格
          var price_str = dataFetch.price_str || ""; // 商品价格串

          var images = [];
          var sales = [];

          if (!title) {
            tip("商品名必须填写");
            document.getElementById("title").focus();
            return;
          }

          if (images_ori != null && images_ori.length > 0) {
            images = JSON.parse(JSON.stringify(images_ori)); // 商品图片 必填
          } else {
            tip("必须有商品图片");
            return;
          }
          /**
                    * 2017-07-28 李园宁要求，不填写链接也可以保存
                    */
          if (sales_ori != null && sales_ori.length > 0) {
            sales = JSON.parse(JSON.stringify(sales_ori)); // 商品图片 必填
            sales.forEach(function(sale) {
              sale.intro = sale.intro || " ";
            });
          } else {
            sales = [];
            // tip('必须有购买链接');
            // return;
          }
        } else {
          tip("请再填写必要的信息后保存");
          return;
        }

        if (price_str) {
          // 可以填写全角或半角￥符
          if (price_str.indexOf("￥") === -1 && price_str.indexOf("¥") === -1) {
            tip("请在价格前填写人民币符号￥");
            var price_strDOM = document.getElementById("price_str");
            price_strDOM.focus();
            if (price_strDOM.setSelectionRange) {
              price_strDOM.setSelectionRange(0, 0);
            }
            return;
          }
        }
        if (price) {
          // ng-pattern 慎用！！如果不符合的话，就不会更新model
          if (!/^\d+\.?\d*$/.test(price)) {
            tip("价格(数字)只能填写数字或小数，请重新输入");
            document.getElementById("price").focus();
            return;
          }
        }

        sales.forEach(function(item) {
          delete item["$$hashKey"];
        });
        images.forEach(function(item) {
          delete item["$$hashKey"];
        });

        console.log(sales);
        // return;
        var netImg = filterNetImg(images);

        if (netImg.length) {
          if (!confirm("商品图片还没有上传，真的要保存么？")) {
            document.getElementById("uploadAll").focus();
            return;
          }
        }

        var modifiedByInput = document.getElementById("modifiedBy");
        var modifiedBy = document.getElementById("modifiedBy").value;
        var rmodifiedBy = /^[a-zA-z0-9]{2,9}$/g;
        if (!modifiedBy || !rmodifiedBy.test(modifiedBy)) {
          tip("请填写修改人，格式为英文名或拼音缩写，不能超过8位，否则无法保存。");
          modifiedByInput.focus();
          return;
        } else {
          // 存入本地缓存
          window.localStorage.setItem("modifiedBy", modifiedBy);
          modifiedByInput.disabled = true;
        }

        var brand = (dataFetch.brand || "").trim(); // 品牌

        // 换行
        var brandReg = /\n\r/;

        if (brand.length > 32) {
          tip("品牌不能超过32个字哦~");
          return;
        } else if (/\n|\r/.test(brand)) {
          tip("品牌中不能包含换行且不能超过32个字哦~");
        }

        showLoading();

        var sid = dataFetch.sid; // SKU id
        var articles = $scope.articles; // 关联文章列表
        var isOnline = false; // 是否上线

        var isOnlineDOM = document.getElementById("isOnline");

        if (isOnlineDOM.checked) {
          isOnline = true;
        }
        // var isOnline_ori = dataFetch.isOnline; // 是否上线
        // 是否是更新已有数据
        var isUpdate = sid == null ? false : true;

        var status = 0;

        if (isOnline) {
          status = 1;
        }

        // console.log(isUpdate);

        // console.log(sid,articles,isOnline,title,price,brand,images,sales);
        // TODO sku的保存与更新
        var url = "//s5.a.dx2rd.com:3000/v1/updatesku";
        // update
        var intro = dataFetch.intro || "";
        var extra = dataFetch.extra || "";
        var specs = dataFetch.specs || "";
        var type = dataFetch.type || 0;
        var tags = dataFetch.tags || [];

        var revarticles = articles.map(function(item) {
          return item.cid;
        });

        var data = {
          sid: sid,
          status: status,
          type: type,
          title: title,
          price: price,
          price_str: price_str,
          brand: brand,
          brandori: "",
          images: images,
          intro: intro,
          specs: specs,
          sales: sales || [],
          revarticles: revarticles,
          extra: extra,
          person: modifiedBy
        };
        // console.log(revarticles);
        // console.log(price_str);
        // console.log(price);
        if (isUpdate) {
          $http({
            url: url,
            method: "POST",
            timeout: 20000,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify(data)
          })
            .then(function(result) {
              var ret = result.data;
              console.log(result);
              if (ret.state === "SUCCESS" && ret.data && ret.data.length) {
                // 保存成功之后，需要同时更新右侧列表区的sku
                console.log(data);
                // alert(1);
                $scope.$emit("updateSKU", data);
                // console.log("添加关联");//添加关联
              } else {
                console.log("取消关联");
              }

              hideLoading("保存成功");
            })
            .catch(function(e) {
              console.error(e);
              hideLoading("保存不成功，请重试");
            });
        } else {
          // insert

          url = "//s5.a.dx2rd.com:3000/v1/insertsku";

          $http({
            url: url,
            method: "POST",
            timeout: 20000,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify(data)
          })
            .then(function(result) {
              // var data = result.data.data;
              // data.link = link;
              // $scope.$emit('generateSKU',data);

              var upperData = result.data;
              var sucDate = upperData.data;
              var insertId = sucDate.insertId;

              if (upperData.state === "SUCCESS" && insertId && +insertId > 0) {
                $scope.operaArea.dataFetch.sid = insertId;
              }

              // $scope.$emit('generateSKU');

              /*
                        每次新建SKU之后，
                        如果有关联文章的话，需要通知关联文章，添加相应的sku
                        如果没有关联文章，直接提示即可
                      */

              if (data.revarticles.length) {
                // 有关联文章。需要同时listview页，更新视图
                $rootScope.$emit("addNewSKU", data);
              }
              hideLoading("新建SKU成功");
            })
            .catch(function(e) {
              console.log(e);
              hideLoading("新建SKU失败，请重试");
            });
        }

        // console.log(sid);
      },
      refreshCDN: function(event) {
        var dataFetch = $scope.operaArea.dataFetch;
        if (dataFetch) {
          var sid = dataFetch.sid;
          if (sid) {
            // $scope.operaArea.dataFetch.toRefreshCDN = "//c.diaox2.com/view/app/?m=sku&sid="+sid;
            document.getElementById("cdn").value =
              "//c.diaox2.com/view/app/?m=sku&id=" + sid;
          } else {
            event.preventDefault();
            tip("没有选择要刷新的SKU");
          }
        } else {
          tip("没有选择要刷新的SKU");
          event.preventDefault();
        }
      },
      create: function() {
        // alert('create');
        if (
          !isEmptyObject($scope.operaArea.dataFetch) ||
          !isEmptyObject($scope.articles)
        ) {
          var flag = confirm("清除数据，新建？");
          if (flag) {
            // $scope.operaArea.dataFetch = null;
            // $scope.articles.length = 0;
            // $(".revarticles").css('display',"none");
            this.clear();
          }
        }
      },
      clear: function() {
        // 清空数据
        $scope.operaArea.dataFetch = $scope.operaArea.cid = $scope.operaArea.articleID = null;

        $scope.articles.length = 0;
        $(".revarticles").css("display", "none");
      },
      findThis: function(article) {
        var path = $location.path();
        if (path != "/search_article" && path != "/") {
          return;
        }
        $rootScope.$emit("findThis", article);
      },
      cancelRelate: function(article) {
        // 删除取消关联的文章
        $scope.articles.splice($scope.articles.indexOf(article), 1);
        if ($scope.articles.length === 0) {
          $(".revarticles").css("display", "none");
        }
        $rootScope.$emit("cancelThreeD", article);
        $rootScope.$emit("cancelThreeD", article);
      },
      addRelate: function(articleID) {
        var rarticle = /^[\d\, ，]+\d*$/;
        var rword = /[^, ，]+/g; // 以空格、中文逗号、英文逗号分割，使用replace进行foreach
        var CONT = 4294967297; // Math.pow(2,32) + 1
        var cids = [];

        if (articleID && articleID.trim() && rarticle.test(articleID)) {
          articleID.replace(rword, function(eachID) {
            // 如果小于等于 2的32次方 + 1 说明是短ID，转换成长ID
            if (eachID <= CONT) {
              cids.push(eachID * CONT);
            } else {
              cids.push(eachID);
            }
          });
          getArticles(cids, function(meta_infos) {
            showArticles(meta_infos, true);
            // 给关联文章添加3D效果。在searchArticleCtrl.js中接收
            // $rootScope.$emit('addThreeD',meta_infos);
            $rootScope.$emit("addThreeD", $scope.articles);
            // $scope.operaArea.dataFetch.articleID = null;
            $scope.operaArea.articleID = null;
          });
        }
      },
      toThisLink: function(link) {
        // var rurl = /^((https?|ftp):\/\/)?([a-z0-9]+[_\-]?[a-z0-9]+\.)*[a-z0-9]+\-?[a-z0-9]+\.?[a-z]{2,}(:\d+)?(\/.*)*\/?(#\w*)?$/ig;
        if (link) {
          if (link.indexOf("http") === -1) {
            link = "//" + link;
          }
          window.open(link);
        }
      },
      showGenerateSKUMask: function() {
        $(".generatesku-mask").css("display", "block");
        // var btn = glyphiconOk.parent();
        $(".opera-replace").removeClass("btn-primary").addClass("btn-danger");
        $(".opera-use").removeClass("btn-success").addClass("btn-default");
        $(".glyphicon-ok").remove();
      },
      // //item.jd.com/10009249720.html
      /*
               返回值：有name优先用name，否则用title
               tag不一定有值
               desc 对应 intro
               descs 对应 descs
            */
      generateSKU: function(link) {
        link = (link || "").trim();

        if (link) {
          var self = this;

          showLoading();

          $http({
            url: "//s5.a.dx2rd.com:3001/v1/extract",
            method: "POST",
            timeout: 20000,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
              url: link
            })
          })
            .then(function(result) {
              var data = result.data.data;
              if (data) {
                data.link = link;
                var brand = data.brand;
                console.log(brand);
                // 如果品牌是空的就不要拿了
                // 以这个链接为例
                // https://item.taobao.com/item.htm?id=535048688592
                if (brand && brand.trim()) {
                  $http({
                    url: "//s5.a.dx2rd.com:3000/v1/searchsku",
                    method: "POST",
                    timeout: 20000,
                    headers: { "Content-Type": "application/json" },
                    data: JSON.stringify({ area: "brand", value: brand })
                  })
                    .then(function(result) {
                      console.log(result);
                      var firstData = result.data;
                      if (firstData.state !== "SUCCESS") {
                        data.brand_info = "根据品牌获取相应的SKU失败。" + firstData.message;
                      } else {
                        // var secData = firstData.data;
                        data.brandRelSkuList = firstData.data;
                      }
                      $scope.$emit("generateSKU", data);
                      console.log("抓取的SKU数据：", data);

                      hideLoading();
                      // 只有抓取成功才显示数据
                      self.showGenerateSKUMask();
                    })
                    .catch(function(e) {
                      console.log(e);
                      data.brand_info = "根据品牌获取相应的SKU失败。" + e.data;
                      $scope.$emit("generateSKU", data);
                      console.log("抓取的SKU数据：", data);
                      hideLoading();
                      // 只有抓取成功才显示数据
                      self.showGenerateSKUMask();
                    });
                } else {
                  var firstData = result.data;
                  $scope.$emit("generateSKU", data);
                  hideLoading();
                  // 只有抓取成功才显示数据
                  self.showGenerateSKUMask();
                }

                // $scope.$emit('generateSKU',data);
                // console.log("抓取的SKU数据：",data);

                // hideLoading();
                // // 只有抓取成功才显示数据
                // self.showGenerateSKUMask();
              } else {
                hideLoading("抓取失败，请重试");
              }
            })
            .catch(function(e) {
              hideLoading("抓取失败，请重试");
            });
        }
      },
      left: function(image) {
        var images = $scope.operaArea.dataFetch.images,
          index = images.indexOf(image),
          tmp = null;
        if (index > 0 && index - 1 >= 0) {
          tmp = images[index];
          images[index] = images[index - 1];
          images[index - 1] = tmp;
        }
      },
      right: function(image) {
        var images = $scope.operaArea.dataFetch.images,
          index = images.indexOf(image),
          tmp = null,
          l = images.length;
        if (index + 1 < l) {
          tmp = images[index];
          images[index] = images[index + 1];
          images[index + 1] = tmp;
        }
      },
      openThisImage: function(url) {
        window.open(url);
      },
      delete: function(iamge) {
        $scope.operaArea.dataFetch.images.splice(
          $scope.operaArea.dataFetch.images.indexOf(iamge),
          1
        );
      },
      up: function(sale) {
        var sales = $scope.operaArea.dataFetch.sales,
          index = sales.indexOf(sale),
          tmp = null;
        if (index > 0 && index - 1 >= 0) {
          tmp = sales[index];
          sales[index] = sales[index - 1];
          sales[index - 1] = tmp;
        }
      },
      down: function(sale) {
        var sales = $scope.operaArea.dataFetch.sales,
          index = sales.indexOf(sale),
          tmp = null,
          l = sales.length;
        if (index + 1 < l) {
          tmp = sales[index];
          sales[index] = sales[index + 1];
          sales[index + 1] = tmp;
        }
      },
      delete2: function(sale) {
        $scope.operaArea.dataFetch.sales.splice(
          $scope.operaArea.dataFetch.sales.indexOf(sale),
          1
        );
      },
      newBuylink: function() {
        $(".new-buylink-mask").css("display", "block");
      },
      uploadAll: function(images) {
        var netImg = filterNetImg(images);
        showLoading();
        if (netImg.length) {
          $http({
            url: "//s5.a.dx2rd.com/upremote.php",
            method: "POST",
            timeout: 100000,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
              url: netImg,
              retry: 2
            })
          })
            .then(function(result) {
              console.log("网图上传到阿里云图:", result);
              var images = $scope.operaArea.dataFetch.images;
              var data = result.data;
              var successImages = data.data;
              var state = data.state;
              var message = data.message;
              if (state !== "SUCCESS") {
                var title = "上传失败，请重试";
                if (message && message.trim()) {
                  title += "。报错信息：" + message;
                  console.log(title);
                }
                hideLoading(title);
                return;
              }
              if (images) {
                // 循环DOM上的图片
                images.forEach(function(image) {
                  // 取出DOM图片的地址
                  var curUrl = image.url;
                  // 循环服务器过来的images
                  successImages.forEach(function(successImage) {
                    // 取出阿里云地址
                    var successImageUrl = successImage.url;
                    // 取出原始地址
                    var successImageOrgUri = successImage.orgUri;
                    // 如果DOM图片的地址跟原始图片的地址一样的话
                    if (curUrl == successImageOrgUri) {
                      image.url = successImageUrl;
                      if (images.length === successImages.length) {
                        // 隐藏上传所有图片按钮
                        $scope.operaArea.dataFetch.uploadAllFlag = false;
                      }
                    }
                  });
                });
              }
              // $scope.operaArea.dataFetch.images = images;
              hideLoading("上传成功。信息：" + message);
            })
            .catch(function(e) {
              console.error(e);
              hideLoading("上传失败，请重试");
            });
        } else {
          hideLoading("全部图片已经上传");
        }
      },
      isNetImg: function(url) {
        return !/^\s*(https?:\/\/)?content\.image\.alimmdn\.com\/sku\//ig.test(
          url
        );
      },
      isAllNetImg: function(images) {
        if (!images || images.length === 0) {
          return true;
        }
        return images.every(function(item) {
          return /^\s*(https?:\/\/)?content\.image\.alimmdn\.com\/sku\//ig.test(
            item.url
          );
        });
      },
      upload: function(event) {
        var fileup = $("#fileup");
        var file = fileup.val();
        // 已经有被选择的文件了
        if (file && file.trim()) {
          // 开启遮罩
          showLoading();
          /* 
                  把直接写在controller下的promise写在“上传”按钮的回调里，
                  这样每次点击按钮，都会创建一个新的promise对象。如果不这样做的话，
                  在controller执行时，promise只会new一次，然后上传成功之后，
                  只能resolve一次 
                 */
          window.angular_defer = $q.defer();

          angular_defer.promise
            .then(
              function(value) {
                local_multi(value);
              },
              function(value) {
                hideLoading("文件上传失败，请重试");
              }
            )
            .catch(function(e) {
              hideLoading("文件上传失败，请重试");
            });
        } else {
          // 阻止提交
          event.preventDefault();
        }
        // showLoading();
      }
    }
  };
});
