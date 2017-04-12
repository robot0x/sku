var skuAppFilters = angular.module('skuAppFilters',[]);
// img url 格式化
skuAppFilters.filter('imgUrlFilter',function(){
    return function(item){
        if(item.indexOf('//') === -1){
            return "//a.diaox2.com/cms/sites/default/files/" + item;
        }
        return item;
    }
});

skuAppFilters.filter('shortID',function(){
    return function(item){
        // console.log(item & 0xffff);
        return item & 0xffff;
    }
});
// 把title数组转成字符串
skuAppFilters.filter('handleTitle',function(){
    return function(item){
        var ret = "";
        // console.log(item);
        // 如果直接是字符串直接返回
        var i = 0,l = item.length;
        if(l === i){
            ret = item[i];
        }else{
            while( i < l ){
                ret += item[i++];
            }
        }
        return ret;
    }
});
skuAppFilters.filter('sidToUrl',function(){
    return function(sid){
        return "http://z.diaox2.com/view/app/?m=sku&id="+sid;
    }
});

skuAppFilters.filter('idToCMSUrl',function(){
    return function(cid){
        return "http://s2.a.dx2rd.com/node/"+ cid;
    }
});

skuAppFilters.filter('cidTorefrshCDNUrl',function(){
    return function(cid,sid){
        return "http://c.diaox2.com/view/app/sku/"+cid+"/"+sid+".html";
    }
});

skuAppFilters.filter('cidTorefrshCDNUrl2',function(){
    return function(cid){
        return "http://c.diaox2.com/view/app/sku/"+cid+".html";
    }
});
