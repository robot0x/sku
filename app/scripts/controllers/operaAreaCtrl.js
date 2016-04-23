// search_article.html 模板控制器

// 引入angularFileUpload 就报错，是咋回事？
// var skuApp = angular.module('skuApp',['angularFileUpload']);
var skuApp = angular.module('skuApp');
// 这种写法与上面的区别是：此写法会创建一个新的模块 
// var skuApp = angular.module('skuApp',[]);
skuApp.controller("operaAreaCtrl",function($scope,$rootScope,$http,$location,$q){
// skuApp.controller("operaAreaCtrl",function($scope,$rootScope,$http){
     $scope.articles = [];
    function local_multi(result){
      // alert(1);
      // console.log("result：",result);
      // 整个ajax过程成功
      var failArray = [];
      var successArray = [];
      console.log("上传本地图成功：",result);
      if(result.state === "SUCCESS"){
        var fileArray = result.data;
        if(fileArray.length){
          fileArray.forEach(function(file){
            if(file.state === "SUCCESS"){ 
              successArray.push({
                url:file.url
              })
            }else{
              failArray.push(file.name);
            }
          })
        }
      }else{
         hideLoading("文件上传失败，请重试");
      }
      // console.log("failArray:",failArray);
      // console.log("successArray:",successArray);
      if(failArray.length){
        hideLoading("文件：\n"+failArray.join('\n')+"上传失败，请重试");
      }
      if(successArray.length){
        // $scope.operaArea.dataFetch.images = successArray;
        var dataFetch = $scope.operaArea.dataFetch;
        if(dataFetch){
          var images = dataFetch.images;

          if(images != null && images.length>0){
            $scope.operaArea.dataFetch.images = images.concat(successArray);
          }else{
            $scope.operaArea.dataFetch.images = successArray;
          }
        }else{
          $scope.operaArea.dataFetch = {
            images:successArray
          }
        }
        if(!failArray.length){
           hideLoading("文件全部上传成功");
        }
      }
    }
    

    function getArticles(cids,callback){
      if(!cids || !cids.length){
        return;
      }
       var headers = {"Content-Type":"application/json"};
       $http({
            url:"http://api.diaox2.com/v4/meta",
            method:"POST",
            timeout:20000,
            catch:true,
            data:JSON.stringify({
              'is_grey':false,
              'request_methods':['specified_meta_data'],
              'request_data':{
              'specified_meta_data': {
                 'cids':cids
              }
            }
           }),
           headers:headers
        }).then(function(result){

            console.log(result);
            console.log(JSON.stringify(result.data.res.specified_meta_data.meta_infos))

            var meta_infos = result.data.res.specified_meta_data.meta_infos;

            console.log(meta_infos);

            // 如果使用v4/meta拿不到数据的话，就使用 m=meta 再次拿一次
            if( !meta_infos || meta_infos.length === 0){


              $http({
                  url:"http://z.diaox2.com/view/app/?m=meta",
                  method:"POST",
                  timeout:20000,
                  catch:true,
                  data:cids,
                  headers:headers
              }).then(function(result){
                    var meta_infos = result.data.metas;
                    var articles = [];
                    console.log(meta_infos);
                    if(meta_infos){
                      meta_infos.forEach(function(item){
                          articles.push({
                            cid:item.serverid,
                            thumb_image_url: item.thumb,
                            url:"http://c.diaox2.com"+item.oriURL,
                            title:[item.title],
                            thumb_image_url:item.cover
                         })
                      })
                    }
                    console.log(meta_infos);
                    if(callback){
                      callback(articles);
                    }
              }).catch(function(e){
                 console.log('m=meta接口关联失败')
                 tip('关联失败，请重试');
              })
            }else if(callback){
                callback(meta_infos);
            }
        }).catch(function(e){
           console.log('v4/meta接口关联失败')
           tip('关联失败，请重试');
        })
    }


    function showArticles(meta_infos,concat){
      if(!meta_infos || !meta_infos.length){
        return;
      }
      if(typeof concat !== "boolean"){
         concat = false;
      }
      $('.revarticles').css('display',"block");
      var articles = $scope.articles;
      if(concat){
        articles = articles.concat(meta_infos);
      }else{
        articles = meta_infos;
      }
      // 数组去重算法
      articles = (function(arr){
        var n = {},r=[],i = 0,l = arr.length,item,cid; //n为hash表，r为临时数组
        for(;i < l;i++) {//遍历当前数组
          item = arr[i];
          cid = item.cid;  
          if (!n[cid]){ //如果hash表中没有当前项
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

    // 触发viewSKU事件。发自searchArticleCtrl.js | searchSKUCtrl.js
     $rootScope.$on('viewSKU',function(event,sku){
        $scope.operaArea.dataFetch = {
            price:sku.price,
            price_str:sku.price_str,
            title:sku.title,
            images:sku.images,
            sid:sku.sid,
            template:sku.template,
            sales:sku.sales,
            brand:sku.brand,
            intro:sku.intro,
            extra:sku.extra,
            specs:sku.specs,
            type:sku.type,
            tags:sku.tags,
            status:sku.status
        }

        console.log(sku.sales);

        var netImg = filterNetImg(sku.images);

        $scope.operaArea.cid = null;

        if(netImg.length > 0){
          $scope.operaArea.dataFetch.uploadAllFlag = true;
        }else{
          $scope.operaArea.dataFetch.uploadAllFlag = false;
        }

        console.log("查看的SKU：",sku);
       // 根据sku的关联文章id拿到文章meta
       getArticles(sku.revarticles,function(meta_infos){
          // 显示在右侧操作区
          showArticles(meta_infos);
          // 给关联文章添加3D效果。在searchArticleCtrl.js中接收
          $rootScope.$emit('addThreeD',$scope.articles);
          // $rootScope.$emit('addThreeD',result.data.res.specified_meta_data.meta_infos);
       })
     })
     $scope.$on('toOperaAreaDate',function(event,data){
          // console.log(data);
          var images = data.imgs;
          
          if(images){
            images = images.map(function(img){
                return { url:img }
            });
          }
          console.log(data);

          if($scope.operaArea.dataFetch){
              if(data.price){
                $scope.operaArea.dataFetch.price = data.price;
              }
              if(data.price_str){
               $scope.operaArea.dataFetch.price_str = data.price_str;
              }
              if(data.name){
                $scope.operaArea.dataFetch.title = data.name;
              }
              if(data.images && data.images.length){
                $scope.operaArea.dataFetch.images = images;
              }
              if(data.brand){
                $scope.operaArea.dataFetch.brand = data.brand;
              }
            
              $scope.operaArea.dataFetch.extra = data.extra;
              $scope.operaArea.dataFetch.specs = data.specs;
              $scope.operaArea.dataFetch.type = data.type;
              $scope.operaArea.dataFetch.tags = data.tags;
              $scope.operaArea.dataFetch.status = data.status;
              $scope.operaArea.dataFetch.sales = $scope.operaArea.dataFetch.sales;
              
            //   $scope.operaArea.dataFetch = {
            //     price:data.price,
            //     price_str:data.price_str,
            //     title:data.name,
            //     images:images,
            //     brand:data.brand,
            //     intro:data.intro,
            //     extra:data.extra,
            //     specs:data.specs,
            //     type:data.type,
            //     tags:data.tags,
            //     status:data.status,
            //     // 防止冲掉”一键获取已有购买链接“生成的sales
            //     sales:sales
            // }
          }else{
             $scope.operaArea.dataFetch = {
                price:data.price,
                price_str:data.price_str,
                title:data.name,
                images:images,
                brand:data.brand,
                intro:data.intro,
                extra:data.extra,
                specs:data.specs,
                type:data.type,
                tags:data.tags,
                status:data.status
                // 防止冲掉”一键获取已有购买链接“生成的sales
                // sales:sales
            }
          }
     })
     $scope.$on('newBuylink',function(event,data){
      // Object {mall: "2", link: "3", price: "4", price_str: "4", desc: "5"}
      // console.log(data);
      // var dataFetch = $scope.operaArea.dataFetch;

      if(!$scope.operaArea.dataFetch){
        $scope.operaArea.dataFetch = {};
      }
      
      console.log($scope.operaArea.dataFetch);

      var sales = $scope.operaArea.dataFetch.sales;
      
      if(sales && sales.length){
        sales.push({
           link_pc_cps:data.link_pc_cps || null,
           link_m_cps:data.link_m_cps,
           link_pc_raw:data.link_pc_raw,
           link_m_raw:data.link_m_raw,
           mart:data.mart,
           price:data.price,
           price_str:data.price_str,
           intro:data.intro
        })
      }else{
        sales = [{
            link_pc_cps:data.link_pc_cps || null,
            link_m_cps:data.link_m_cps,
            link_pc_raw:data.link_pc_raw,
            link_m_raw:data.link_m_raw,
            mart:data.mart,
            price:data.price,
            price_str:data.price_str,
            intro:data.intro
        }]
      }
      $scope.operaArea.dataFetch.sales = sales;
     })

     /*
        过滤网图，返回过滤出来的网图
     */
     function filterNetImg(images){
        var netImg = [];
        var rnetImg = /^\s*(https?:\/\/)?content\.image\.alimmdn\.com\/sku\//ig
        images = images || $scope.operaArea.dataFetch.images;

        images.forEach(function(item){
             // console.log(item);
             // console.log(!rnetImg.test(item.url));
             if(!rnetImg.test(item.url)){
               netImg.push(item.url);
               // console.log('push net img');
             }
          })
        return netImg;
     }

     function isEmptyObject(obj){
      if(obj == null){
        return true;
      }
      var name;
      for(name in obj){
        return false;
      }
      return true;
    }
    $scope.operaArea = {
        eventHandler:{
            getAllBuyLink:function(cid){
                cid = toLongCid(cid);
                showLoading();
                $http({
                    url:"http://120.27.45.36:3000/v1/getoldbuyinfo/"+cid,
                    method:"GET",
                    timeout:20000,
                    headers:{"Content-Type":"application/json"}
                }).then(function(result){
                  console.log(result);
                  var upperData = result.data;

                  if(upperData.state === "SUCCESS"){

                    var data = upperData.data;

                    var buylinks = data[cid];

                    if(!buylinks || !buylinks.length ){

                       hideLoading('该篇文章没有购买链接',800);

                    }else{

                       buylinks.forEach(function(buylink){
                          buylink.link_pc_cps = buylink.link_pc;
                          buylink.link_m_cps = buylink.link; 
                          
                          buylink.link_pc_raw = null,
                          buylink.link_m_raw = null, 

                          delete buylink.link_pc;
                          delete buylink.link;
                       })

                       var dataFetch = $scope.operaArea.dataFetch;

                       if(dataFetch){
                         var sales = dataFetch.sales;
                         if(sales){
                           $scope.operaArea.dataFetch.sales = $scope.operaArea.dataFetch.sales.concat(buylinks);
                         }else{
                           $scope.operaArea.dataFetch.sales = buylinks;
                         }
                       }else{
                          $scope.operaArea.dataFetch = {
                             sales:buylinks
                          }
                       }
                       hideLoading();
                    }
                    console.log(buylinks);

                  }else{
                    hideLoading('一键获取已有购买链接失败，请重试');
                  }

                }).catch(function(e){
                  hideLoading('一键获取已有购买链接失败，请重试');
                })
            },
            knockEnterKey:function($event,articleID,flag){

                var keycode = $event.keyCode;

                if(typeof flag !== "boolean"){
                  flag = false;
                }

                if(keycode === 13){
                    // this.search();
                    if(flag){
                      this.getAllBuyLink(articleID);
                    }else{
                      this.addRelate(articleID);
                    }
                }

            },
            save:function(){
               var dataFetch = $scope.operaArea.dataFetch;
               if(dataFetch){
                    // 必填项
                   var title = (dataFetch.title || "").trim(); // 商品名 必填
                   
                   var images_ori = dataFetch.images;
                   var sales_ori = dataFetch.sales;
                   var price = dataFetch.price; // 商品价格 
                   var price_str = dataFetch.price_str || ""; // 商品价格串

                   var images = [];
                   var sales = [];

                   if(!title){
                    tip('商品名必须填写');
                    return;
                   }

                    if(images_ori!=null && images_ori.length > 0){
                      images  = JSON.parse(JSON.stringify(images_ori)); // 商品图片 必填
                    }else{
                      tip('必须有商品图片');
                      return;
                    }

                   if(sales_ori!=null && sales_ori.length > 0){
                      sales  = JSON.parse(JSON.stringify(sales_ori)); // 商品图片 必填
                      sales.forEach(function(sale){
                        sale.intro = sale.intro || " ";
                      })
                   }else{
                      tip('必须有购买链接');
                      return;
                   }

                 }else{
                   tip('请再填写必要的信息后保存');
                   return;
                 }

                if(!/^\d+\.?\d*$/g.test(price)){
                  tip('价格2只能填写数字，请重新输入');
                  return;
                }

               showLoading();



               var sid = dataFetch.sid; // SKU id
               var articles = $scope.articles; // 关联文章列表 
               var isOnline = dataFetch.isOnline == null ? false : dataFetch.isOnline; // 是否上线
               var isOnline_ori = dataFetch.isOnline; // 是否上线
              
               var brand = dataFetch.brand; // 品牌

               // 是否是更新已有数据
               var isUpdate = sid == null ? false : true;

               var status = isOnline ? 1 : 0;


              

               // console.log(isUpdate);

               // console.log(sid,articles,isOnline,title,price,brand,images,sales);
               // TODO sku的保存与更新
               var url = "http://120.27.45.36:3000/v1/updatesku";
               // update
               var intro = dataFetch.intro || "";
               var extra = dataFetch.extra || "";
               var specs = dataFetch.specs || "";
               var type = dataFetch.type || 0;
               var tags = dataFetch.tags || [];

               var revarticles = articles.map(function(item){
                 return item.cid;
               });

               sales.forEach(function(item){  delete item["$$hashKey"] })

               images.forEach(function(item){ delete item["$$hashKey"] })

               var data = {
                 sid:sid,
                 status:status,
                 type:type,
                 title:title,
                 price:price,
                 price_str:price_str,
                 brand:brand,
                 brandori:"",
                 images:images,
                 intro:intro,
                 specs:specs,
                 sales:sales,
                 revarticles:revarticles,
                 extra:extra,
                 person:"LYN"
               }
               console.log(revarticles);
               // console.log(price_str);
               // console.log(price);
               if(isUpdate){
                $http({
                      url:url,
                      method:"POST",
                      timeout:20000,
                      headers:{"Content-Type":"application/json"},
                      data:JSON.stringify(data)
                  }).then(function(result){
                      var ret = result.data;
                      console.log(result);
                      if(ret.state === "SUCCESS" && ret.data && ret.data.length){
                        // 保存成功之后，需要同时更新右侧列表区的sku
                        console.log(data);
                        // alert(1);
                        $scope.$emit('updateSKU',data);
                        console.log("添加关联");//添加关联
                      }else{
                        console.log("取消关联");
                      }
                      hideLoading("保存成功");
                  }).catch(function(e){
                    console.error(e);
                    hideLoading("保存不成功，请重试");
                  })

               }else{ // insert

                url = "http://120.27.45.36:3000/v1/insertsku";

                $http({
                      url:url,
                      method:"POST",
                      timeout:20000,
                      headers:{"Content-Type":"application/json"},
                      data:JSON.stringify(data)

                  }).then(function(result){
                      // var data = result.data.data;
                      // data.link = link;
                      // $scope.$emit('generateSKU',data);
                      var data = result.data.data;
                      var insertId = data.insertId;
                                            
                      
                      if(result.data.state === "SUCCESS" && insertId && +insertId > 0){
                        $scope.operaArea.dataFetch.sid = insertId;
                      }

                      hideLoading("新建SKU成功");
                  }).catch(function(e){
                    console.error(e);
                    hideLoading("新建SKU失败，请重试");
                  })

               }
               // console.log(sid);
            },
            refreshCDN:function(event){
                var dataFetch = $scope.operaArea.dataFetch;
                if(dataFetch){
                    var sid = dataFetch.sid;
                    if( sid ){
                      // $scope.operaArea.dataFetch.toRefreshCDN = "http://c.diaox2.com/view/app/?m=sku&sid="+sid;
                      document.getElementById('cdn').value = "http://c.diaox2.com/view/app/?m=sku&sid="+sid;
                    }else{
                       event.preventDefault();
                       tip('没有选择要刷新的SKU')
                    }
                }else{
                   tip('没有选择要刷新的SKU')
                   event.preventDefault();
                }
            },
            create:function(){
               // alert('create');
               if( !isEmptyObject($scope.operaArea.dataFetch) || !isEmptyObject($scope.articles)){
                  var flag = confirm("清除数据，新建？");
                  if(flag){
                    // $scope.operaArea.dataFetch = null;
                    // $scope.articles.length = 0;
                    // $(".revarticles").css('display',"none");
                    this.clear();
                  }
               }
            },
            clear:function(){
              // 清空数据
              $scope.operaArea.dataFetch = 
              $scope.operaArea.cid =
              $scope.operaArea.articleID =null;

              $scope.articles.length = 0;
              $(".revarticles").css('display',"none");
            },
            findThis:function(article){
               var path = $location.path()
               if(path != "/search_article" && path != "/"){
                  return;
               }
               $rootScope.$emit('findThis',article);
            },
            cancelRelate:function(article){
              // 删除取消关联的文章
              $scope.articles.splice($scope.articles.indexOf(article),1);
              if($scope.articles.length === 0){
                $('.revarticles').css('display','none');
              }
              $rootScope.$emit('cancelThreeD',article);
              $rootScope.$emit('cancelThreeD',article);
            },
            addRelate:function(articleID){

              var rarticle = /^[\d\, ，]+\d*$/;
              var rword = /[^, ，]+/g;// 以空格、中文逗号、英文逗号分割，使用replace进行foreach
              var CONT = 4294967297; // Math.pow(2,32) + 1
              var cids = [];

              if(articleID && articleID.trim() && rarticle.test(articleID)){
                  articleID.replace(rword,function(eachID){
                      // 如果小于等于 2的32次方 + 1 说明是短ID，转换成长ID
                      if(eachID <= CONT){
                        cids.push(eachID * CONT);
                      }else{
                        cids.push(eachID);
                      }
                  })
                  getArticles(cids,function(meta_infos){
                      showArticles(meta_infos,true);
                      // 给关联文章添加3D效果。在searchArticleCtrl.js中接收
                      // $rootScope.$emit('addThreeD',meta_infos);
                      $rootScope.$emit('addThreeD',$scope.articles);
                      // $scope.operaArea.dataFetch.articleID = null;
                      $scope.operaArea.articleID = null;
                  })
              }
            },
            toThisLink:function(link){
                // var rurl = /^((https?|ftp):\/\/)?([a-z0-9]+[_\-]?[a-z0-9]+\.)*[a-z0-9]+\-?[a-z0-9]+\.?[a-z]{2,}(:\d+)?(\/.*)*\/?(#\w*)?$/ig;
                if(link){
                    if(link.indexOf('http')=== -1){
                      link = "http://" + link;
                    }
                    window.open(link);
                }
            },
            showGenerateSKUMask:function(){
                $('.generatesku-mask').css('display','block');
                // var btn = glyphiconOk.parent();
                $('.opera-replace').removeClass('btn-primary').addClass('btn-danger');
                $('.opera-use').removeClass('btn-success').addClass('btn-default');
                $('.glyphicon-ok').remove();
            },
            // http://item.jd.com/10009249720.html
            /*
               返回值：有name优先用name，否则用title
               tag不一定有值
               desc 对应 intro
               descs 对应 descs
            */
            generateSKU:function(link){

                link = (link || "").trim();


                if(link){

                  var self = this;

                  showLoading();
                  
                  $http({
                      url:"http://120.27.45.36:3001/v1/extract",
                      method:"POST",
                      timeout:20000,
                      headers:{"Content-Type":"application/json"},
                      data:JSON.stringify({
                        url:link
                     })
                  }).then(function(result){
                      var data = result.data.data;
                      if(data){
                         data.link = link;
                         $scope.$emit('generateSKU',data);
                         console.log("抓取的SKU数据：",data);
                         hideLoading();
                         // 只有抓取成功才显示数据
                         self.showGenerateSKUMask();
                      }else{
                         hideLoading('抓取失败，请重试');
                      }
                  }).catch(function(e){
                    hideLoading('抓取失败，请重试');
                  })
                }
            },
            left:function(image){
                var images = $scope.operaArea.dataFetch.images,
                    index = images.indexOf(image),
                    tmp = null;
                if(index > 0 && index - 1 >= 0){
                    tmp = images[index];
                    images[index] = images[index-1];
                    images[index-1] = tmp;
                }
            },
            right:function(image){
                var images = $scope.operaArea.dataFetch.images,
                    index = images.indexOf(image),
                    tmp = null,
                    l = images.length;
                if( index + 1 < l ){
                    tmp = images[index];
                    images[index] = images[index+1];
                    images[index+1] = tmp;
                }
            },
            openThisImage:function(url){
               window.open(url);
            },
            delete:function(iamge){
                $scope.operaArea.dataFetch.images.splice($scope.operaArea.dataFetch.images.indexOf(iamge),1);
            },
            up:function(sale){
              var sales = $scope.operaArea.dataFetch.sales,
                    index = sales.indexOf(sale),
                    tmp = null;
                if(index > 0 && index - 1 >= 0){
                    tmp = sales[index];
                    sales[index] = sales[index-1];
                    sales[index-1] = tmp;
                }
            },
            down:function(sale){
                var sales = $scope.operaArea.dataFetch.sales,
                    index = sales.indexOf(sale),
                    tmp = null,
                    l = sales.length;
                if( index + 1 < l ){
                    tmp = sales[index];
                    sales[index] = sales[index+1];
                    sales[index+1] = tmp;
                }
            },
            delete2:function(sale){
                $scope.operaArea.dataFetch.sales.splice($scope.operaArea.dataFetch.sales.indexOf(sale),1);
            },
            newBuylink:function(){
              $('.new-buylink-mask').css('display','block');
            }
            ,uploadAll:function(images){
              var netImg = filterNetImg(images);
              showLoading();
              if(netImg.length){
                  $http({
                    url:"http://120.27.45.36/upremote.php",
                    method:"POST",
                    timeout:100000,
                    headers:{"Content-Type":"application/json"},
                    data:JSON.stringify({
                      url:netImg,
                      retry:2
                    })
                 }).then(function(result){
                    console.log("网图上传到阿里云图:",result);
                    var images = $scope.operaArea.dataFetch.images;
                    var data = result.data;
                    var successImages = data.data;
                    var state = data.state;
                    var message = data.message;
                    if(state!=='SUCCESS'){
                      var title = "上传失败，请重试";
                      if(message && message.trim()){
                        title += "。报错信息："+message;
                        console.log(title);
                      }
                      hideLoading(title);
                      return;
                    }
                    if(images){
                      // 循环DOM上的图片
                      images.forEach(function(image){
                        // 取出DOM图片的地址
                        var curUrl = image.url;
                        // 循环服务器过来的images
                        successImages.forEach(function(successImage){
                          // 取出阿里云地址
                          var successImageUrl = successImage.url;
                          // 取出原始地址
                          var successImageOrgUri = successImage.orgUri;
                          // 如果DOM图片的地址跟原始图片的地址一样的话
                          if(curUrl == successImageOrgUri){
                            image.url = successImageUrl;
                            if(images.length === successImages.length){
                              // 隐藏上传所有图片按钮
                              $scope.operaArea.dataFetch.uploadAllFlag = false;
                            }
                          }
                        })
                      })
                    }
                    // $scope.operaArea.dataFetch.images = images;
                     hideLoading('上传成功。信息：'+message);
                 }).catch(function(e){
                  console.error(e);
                  hideLoading('上传失败，请重试');
                 })

               }else{
                 hideLoading('全部图片已经上传');
               }
             }
            ,isNetImg:function(url){
              return !/^\s*(https?:\/\/)?content\.image\.alimmdn\.com\/sku\//ig.test(url);
            },
            isAllNetImg:function(images){
              if(!images || images.length === 0){
                return true;
              }
              return images.every(function(item){ return /^\s*(https?:\/\/)?content\.image\.alimmdn\.com\/sku\//ig.test(item.url); })
            },
            upload:function(event){
              var fileup = $('#fileup');
              var file = fileup.val();
              // 已经有被选择的文件了
              if(file && file.trim()){
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
                 .then(function(value){
                    local_multi(value);
                 },function(value){
                    hideLoading('文件上传失败，请重试');
                 })
                 .catch(function(e){
                    hideLoading('文件上传失败，请重试');
                 })
              }else{
                // 阻止提交
                event.preventDefault();
              }
              // showLoading();
            }
        },
    }
});