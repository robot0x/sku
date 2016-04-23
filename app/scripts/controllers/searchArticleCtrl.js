// search_article.html 模板控制器
var skuApp = angular.module('skuApp');
// 懒加载指令
skuApp.directive('lazyLoad', function() {
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

skuApp.controller("searchArticleCtrl",
function($scope,
    $rootScope,
    $http){


    var loadCount = 50; // 懒加载的item个数
    var ind = 0; // 开始位置


    var headers = {"Content-Type":"application/json"};
    var aProto = Array.prototype;
    var getalllistUrl = "http://120.27.45.36:3000/v1/getalllist";

    


    function leftZero(num){
        num = +num;
        if(num < 10){
            return "0" + num;
        }else{
            return num + "";
        }
    }


    // var alllist = $scope.$parent.alllist;
    // console.log(alllist);

    // console.log($scope.$parent);
    // console.log($scope.parent);
    // console.log($scope.parentScope);
    // console.log($scope.$parentScope);



    $http({
        url:getalllistUrl,
        method:"GET",
        timeout:20000,
        catch:true,
        headers:headers
    }).then(function(result){
        // console.log(result.data.data);
        return result.data.data;
    }).then(function(alllist){
        // 开发选项，每次拿到100条数据
        // var cids = Object.keys(alllist).slice(0,50);
        var cids = Object.keys(alllist);

        cids.sort(function(c1,c2){
            return c2 - c1;
        })

        cids = cids.slice(0,50);
        
        $scope.alllist = alllist;
        // $rootScope.alllist = alllist;
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
            var meta_infos = result.data.res.specified_meta_data.meta_infos;
            var url = "http://120.27.45.36:3000/v1/getfullsku/";
            // var allSkuList = [];
            var sids = [];
            // console.log(meta_infos);
            meta_infos.forEach(function(item){
                sids.push.apply(sids,alllist[item.cid]);
            })


            /* 
                 TODO:改善性能。
                 1、请求一次getalllist，拿到所有数据，然后分批次拿文章meta，
                 分批次拿sku
                 2、缓存getalllist，供 search_sku.html 页面使用。
            */


            // sids = sids.slice(0,1800);
            // console.log(sids);
            // if(sids.length){
            //     $http({
            //         url:url,
            //         method:"POST",
            //         timeout:20000,
            //         catch:true,
            //         headers:headers,
            //         data:JSON.stringify({
            //             sids:sids
            //         })
            //    }).then(function(sku){
            //         // console.log(sku.data.data);
            //         // item.skuList = sku.data.data;
            //         console.log(sku);
            //    }).catch(function(e){
            //         console.log(e);
            //    })
            // }

            meta_infos.forEach(function(item){
                item.skuList = [];
                alllist[item.cid].forEach(function(sku){
                    $http({
                        url:url+sku,
                        method:"GET",
                        timeout:20000,
                        catch:true,
                        headers:headers
                       }).then(function(sku){
                            // console.log(sku.data.data);
                            item.skuList.push(sku.data.data[0]);
                       }).catch(function(e){
                            console.log(e);
                       })
                })
            })


            // 按照ID从大到到小排列
            meta_infos.sort(function(a1,a2){
                return a2.cid - a1.cid;
            })

            $scope.articles = meta_infos;
            $scope.cachedArticles = $scope.articles.slice(0,loadCount);
            // 取出左侧操作区关联的文章列表，并添加样式
            var revarticles = $rootScope.revarticles;
            if(revarticles){
                addThreeDStyle(revarticles);
            }

        }).catch(function(e){
            console.error(e);
        })
    }).catch(function(e){
        console.error(e);
    })
    $scope.loadMore = function() {
        ind = ind + loadCount
        var r = loadCount
        var articles = $scope.articles;
        if(!articles){
            return;
        }
        var l = articles.length;
        if (ind + loadCount > l) {
          r = l - ind
        }
        $scope.cachedArticles = $scope.cachedArticles.concat($scope.articles.slice(ind, r + ind));
    }
    $rootScope.$on('updateSKU',function(event,sku){
        // console.log(sku);
        var revarticles = sku.revarticles;
        // console.log(revarticles);
        if(revarticles){
            var articles = $scope.cachedArticles;
            revarticles.forEach(function(cid){
                articles.forEach(function(article){
                    // 找到被更新的文章
                    if(article.cid == cid){
                        // console.log('done');
                        // 取出被更新文章的skuList
                        var skuList = article.skuList;
                        if(skuList){
                            // 找到被更新的sku，替换之
                            skuList.forEach(function(each,index){
                                // 如果已经有了，就替换
                                if(each.sid == sku.sid){
                                    skuList.splice(index,1,sku);
                                }else{
                                    // 如果还没有，说明是新增的sku
                                    skuList.push(sku);
                                }
                            })
                        }
                        // console.log(skuList);
                    }
                })
            })
        }
    })
    $rootScope.$on('findThis',function(event,article){
        var articles = $scope.cachedArticles;
        for(var i = 0 ,l = articles.length;i<l;i++){
            var each = articles[i];
            if(each.cid === article.cid){
                console.log(each.cid);
                var card = $("[data-long-id='"+each.cid+"']");
                console.log(card);
                $('html,body').animate({
                    scrollTop: card.offset().top - 50
                });
                break;
            }
        }
    })

    $rootScope.$on('cancelThreeD',function(event,article){
        $scope.cachedArticles.forEach(function(item){
            if(item.cid === article.cid){
                delete item.threeD;
            }
        })
    })


    function addThreeDStyle(meta_infos){

        $scope.cachedArticles.forEach(function(article){
            delete article.threeD;
        })
        
        meta_infos.forEach(function(item){
            $scope.cachedArticles.forEach(function(article){
                if(item.cid === article.cid){
                    article.threeD = article.cid;
                }
            })
        })
    }

    // 给左侧list区被关联文章添加3D效果。事件发射自 operaAreaCtrl.js
    $rootScope.$on('addThreeD',function(event,meta_infos){
        addThreeDStyle(meta_infos);
    });

    function getMetasByTimeRange(start,end,callback){
        $http({
         url:"http://z.diaox2.com/view/app/?m=TR",
         method:"POST",
         timeout:20000,
         catch:true,
         headers:headers,
         data:JSON.stringify({
            start:start, 
            end:end
         })
         
        }).then(function(result){
            if(callback){
                callback(result);
            }
        }).catch(function(e){
            console.log(e);
        })
    }
    $scope.eventHandler = {
        search:function(){
            // var keyword = $scope.dataFetch.keyword;
            var keyword = $scope.query;
            if(keyword){
                var kw = Number(keyword);
                // var loadingContainer = $('.loading-container');
                // loadingContainer.show();
                showLoading();
                if(isNaN(kw)){
                    // 取出上一次的搜索词
                    // var lastKeyword = $scope._lastKeyword_;
                    // console.log(keyword);
                    // 只有当第一次搜索和本次搜索跟上一次搜索词不一样才从后台拿数据
                    // if(!(lastKeyword && lastKeyword.trim() == keyword.trim())){
                         // 把根据keyword查询到的数据，广播到子controller上
                        // $rootScope._lastKeyword_ = keyword;
                        $http({
                         url:"http://z.diaox2.com/view/app/?m=TS",
                         method:"POST",
                         timeout:20000,
                         catch:true,
                         headers:headers,
                         data:encodeURIComponent(keyword)
                        }).then(function(result){
                            var meta_infos = result.data.metas;
                            var articles = [];
                            var alllist = $scope.alllist;
                            var url = "http://120.27.45.36:3000/v1/getfullsku/";  
                             // console.log(alllist);
                             meta_infos.forEach(function(item){
                                // console.log(item);
                                var article = {
                                    cid:item.serverid,
                                    thumb_image_url: item.thumb,
                                    url:"http://c.diaox2.com"+item.oriURL,
                                    title:[item.title],
                                    skuList:[]
                                }
                                var sidList = alllist[article.cid];
                                console.log(sidList);
                                if(sidList){
                                     sidList.forEach(function(sku){
                                     $http({
                                        url:url+sku,
                                        method:"GET",
                                        timeout:20000,
                                        catch:true,
                                        headers:headers
                                       }).then(function(sku){
                                            // console.log(sku.data.data);
                                            // article.skuList = sku.data.data;
                                            article.skuList.push(sku.data.data[0]);
                                            // console.log(article);
                                            articles.push(article);
                                       }).catch(function(e){
                                            console.log(e);
                                       })
                                    })
                                }else{
                                     articles.push(article);
                                }
                            })
                            // 先赋值，此时cachedArticles是没有值的
                            $scope.cachedArticles = articles;
                            // loadingContainer.hide();
                            console.log(meta_infos.length);

                            console.log(articles);

                            if(meta_infos.length === 0){
                                hideLoading("没有符合条件的数据，换个关键词试试？");
                            }else{
                                hideLoading("搜索成功");
                            }

                        }).catch(function(e){
                            console.log(e);
                            // loadingContainer.hide();
                            hideLoading("搜索失败，请重试");
                        })
                    // }
                }else{
                    console.log(kw);
                    var longCid = toLongCid(kw);
                    // $rootScope._lastKeyword_ = longCid;
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
                             'cids':[longCid]
                          }
                        }
                       }),
                       headers:headers
                    }).then(function(result){
                        var meta_infos = result.data.res.specified_meta_data.meta_infos;
                        console.log("v4/meta搜索到的meta_infos为：",meta_infos);
                        if(meta_infos != null && meta_infos.length > 0 ){
                            var url = "http://120.27.45.36:3000/v1/getfullsku/";  
                            var item = meta_infos[0];
                            var alllist = $scope.alllist;
                            var skuArray = alllist[item.cid];
                            item.skuList = [];
                            if(skuArray){
                                skuArray.forEach(function(each){
                                    console.log(each);
                                    $http({
                                        url:url+each,
                                        method:"GET",
                                        timeout:20000,
                                        catch:true,
                                        headers:headers
                                   }).then(function(sku){
                                        // console.log(sku);
                                        // console.log(sku.data.data);
                                        item.skuList.push(sku.data.data[0]);
                                        // item.skuList.concat.apply(item.skuList,sku.data.data);
                                   }).catch(function(e){
                                        console.log(e);
                                   })
                                })
                            }
                            
                            $scope.articles = meta_infos;
                            $scope.cachedArticles = $scope.articles.slice(0,loadCount);
                            // loadingContainer.hide();
                            if(meta_infos.length === 0){
                                hideLoading("没有符合条件的数据，换个关键词试试？");
                            }else{
                                hideLoading("搜索成功");
                            }
                        }else{
                            // 如果meta_info是空的，说明搜索的是未发布的文章
                            // 使用http://z.diaox2.com/view/app/?m=meta再次搜索一次
                            $http({
                                url:"http://z.diaox2.com/view/app/?m=meta",
                                method:"POST",
                                timeout:20000,
                                catch:true,
                                data:[+kw],
                                headers:headers
                            }).then(function(result){

                                console.log(result);
                                var meta_infos = result.data.metas;
                                var articles = [];
                                var alllist = $scope.alllist;
                                var url = "http://120.27.45.36:3000/v1/getfullsku/";  
                                 // console.log(alllist);
                                 console.log("m=meta搜索到的meta_infos为：",meta_infos);
                                 meta_infos.forEach(function(item){
                                    // console.log(item);
                                    var article = {
                                        cid:item.serverid,
                                        thumb_image_url: item.thumb,
                                        url:"http://c.diaox2.com"+item.oriURL,
                                        title:[item.title],
                                        skuList:[]
                                    }
                                    // articles.push(article);

                                    console.log(article);
                                    var sidList = alllist[article.cid];
                                    if(sidList){
                                         sidList.forEach(function(sku){
                                         $http({
                                            url:url+sku,
                                            method:"GET",
                                            timeout:20000,
                                            catch:true,
                                            headers:headers
                                           }).then(function(sku){
                                                // console.log(sku.data.data);
                                                // article.skuList = sku.data.data;
                                                article.skuList.push(sku.data.data[0]);
                                                articles.push(article);
                                                // console.log(article);
                                           }).catch(function(e){
                                                console.log(e);
                                           })
                                        })
                                    }else{
                                        articles.push(article);
                                    }
                                })

                                // $scope.cachedArticles = articles;
                                $scope.cachedArticles = articles;
                                // loadingContainer.hide();
                                console.log(meta_infos.length);

                                console.log(articles);
                                console.log($scope.cachedArticles);

                                if(meta_infos.length === 0){
                                    hideLoading("没有符合条件的数据，换个关键词试试？");
                                }else{
                                    hideLoading("搜索成功");
                                }

                            }).catch(function(e){
                                console.error("m=meta接口拿meta失败：",e);
                                hideLoading("搜索失败，请重试");
                            })
                        }
                        
                        }).catch(function(e){
                            console.error("v4/meta接口拿meta失败：",e);
                            // loadingContainer.hide();
                            hideLoading("搜索失败，请重试");
                        })
                }
            }else{

                location.reload();

            }

        },
        day:function(go){
            showLoading();
            var date = new Date();
            var year = date.getFullYear();
            var month = leftZero(date.getMonth() + 1);
            var day = leftZero(date.getDate() + go);
            var timeStr = year + month + day;
            var start = timeStr,end = timeStr;
            console.log("timeStr:",timeStr);
            var title = "";
            if(go > 0){
                title = "\"明天\"";
            }else if(go < 0){
                title = "\"昨天\"";
            }else{
                title = "\"今天\"";
            }
            getMetasByTimeRange(start,end,function(result){
                var meta_infos = result.data.metas;
                var articles = [];
                var alllist = $scope.alllist;
                var url = "http://120.27.45.36:3000/v1/getfullsku/";  
                 meta_infos.forEach(function(item){
                    var article = {
                        cid:item.serverid,
                        thumb_image_url: item.thumb,
                        url:"http://c.diaox2.com"+item.oriUrl,
                        // 去掉title中的<br/>
                        title:[item.title.replace(/<br\s*\/>/ig,"")],
                        skuList:[]
                    }
                    console.log(item);
                    articles.push(article);
                    var sidList = alllist[article.cid];
                    if(sidList){
                         sidList.forEach(function(sku){
                         $http({
                                url:url+sku,
                                method:"GET",
                                timeout:20000,
                                catch:true,
                                headers:headers
                               }).then(function(sku){
                                    // console.log(sku.data.data);
                                    article.skuList.push(sku.data.data[0]);
                                    hideLoading(title+"的数据获取成功");
                               }).catch(function(e){
                                    console.log(e);
                                    hideLoading('未能取到'+title+"的数据，请重试");
                               })
                        })
                    }
                })
                // console.log(articles);
                $scope.cachedArticles = articles;
                var revarticles = $rootScope.revarticles;
                if(revarticles){
                    addThreeDStyle(revarticles);
                }
            })
        },
        yesterday:function(){
            this.day(-1);            
        },
        today:function(){
            this.day(0); 
        },
        tomorrow:function(){
            this.day(1); 
        },
        knockEnterKey:function($event){
            var keycode = $event.keyCode;
            if(keycode === 13){
                this.search();
            }
        },
        view:function(sku,article){
            // 发射viewSKU事件。在operaAreaCtrl.js中接收
            $rootScope.$emit('viewSKU',sku);
        }
    }


});