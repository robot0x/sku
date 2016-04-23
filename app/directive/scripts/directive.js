var myApp = angular.module('myApp',[]);

myApp.directive("hello",function(){
    return {
        restrict:"AEMC",
        template:"<div>hello everyone!!!</div>",
        replace:true
    }
});

// 缓存模板
myApp.run(function($templateCache){
    $templateCache.put("hello.html","<div>hello everyone!!!!!</div>")
})
myApp.directive("superme",function($templateCache){
    return {
        restrict:"AE",
        // 使用缓存的模板
        template:$templateCache.get("hello.html")
        ,replace:true // 默认值是false
    }
})
// 不使用replace
myApp.directive("world",function(){
    return {
        /*
         这是一个大坑，restrict只能写E，不能写A 
         大漠穷秋老师讲课的时候还可以这样写！！！！！
        */
        restrict:"E",
        transclude:true,
        // scope: { name:'@' },
        template:"<div>hello world!!!<div ng-transclaude></div></div>"
    }
})
// controller与directive交互

myApp.controller("LoaderCtrl",function($scope){
    $scope.loadData = function(){
        console.log('加载数据...');
    }
})
// 一个directive与多个controller交互
myApp.controller("LoaderCtrl2",function($scope){
    $scope.loadData2 = function(){
        console.log('加载数据....222');
    }
})
myApp.directive("loader",function(){
    return {
        restrict:"AE",
        link:function(scope,element,attr){
            element.bind('mouseenter',function(){
                // 调用controller中的方法
                // scope.loadData(); // 第一种方式调用
                // scope.$apply("loadData()"); // 第二种方式调用

                scope.$apply(attr.howtoload);
            })
        }
    }
})

// 多个指令间的交互
myApp.directive("superman",function(){
    return{
        scope:{}, // 独立作用域
        restrict:"AE",
        /*
            此controller跟控制器不是一个controller，
            想要你的指令暴露出一些属性跟方法，就写在directive中的controller中
        */
        controller:function($scope){
            $scope.abilities = [];
            // 往 $scope 上绑定数据要使用this。这是一个坑
            this.addStrength = function(){
                $scope.abilities.push("strength");
            }
            this.addSpeed = function(){
                $scope.abilities.push("speed");
            }
            this.addLight = function(){
                $scope.abilities.push("light");
            }
        },
        // link处理指令内部的事务，比如操作dom，绑定事件
        link:function(scope,element,attr){
            element.css("background-color","red");
            element.bind("mouseenter",function(){
                console.log(scope.abilities);
            })
        }
    }
})

myApp.directive("strength",function(){
    return{
        require:"^superman", // 与要交互的directive发生关联
        // 发生了关联之后，就可以使用第四个参数了
        link:function(scope,element,attr,supermanCtrl){
            supermanCtrl.addStrength();
            // alert(1);
            // console.log(supermanCtrl);
        }
    }
})

myApp.directive("speed",function(){
    return{
        require:"^superman",
        link:function(scope,element,attr,supermanCtrl){
            supermanCtrl.addSpeed();
        }
    }
})

myApp.directive("light",function(){
    return{
        require:"^superman",
        link:function(scope,element,attr,supermanCtrl){
            supermanCtrl.addLight();
        }
    }
})

myApp.directive("notalone",function(){
    return{
        restrict:"E",
        template:'<div><input type="text" ng-model="userName"/>{{userName}}</div>'
    }
})


myApp.directive("alone",function(){
    return{
        scope:{},
        restrict:"E",
        template:'<div><input type="text" ng-model="userName"/>{{userName}}</div>'
    }
})

/*
 @ 把当前属性作为字符串传递，你还可以绑定来自外层scope的值，在属性值中插入{{}}即可

 = 与父scope中的属性进行双向绑定

 & 传递一个来自父scope的函数，稍后调用
*/

myApp.controller("AtCtrl",function($scope){
    $scope.ctrlFlavor = "百威";
})
// @ 的用法 是用来传递字符串的
myApp.directive("dirnk",function(){
    return {
        restrict:"AE",
        scope:{
            flavor:"@"
        },
        template:"<div> {{flavor}} </div>"
        // ,link:function(scope,element,attr){
        //     scope.flavor = attr.flavor;
        // }
    }
})

myApp.controller("AtCtrl2",function($scope){
    $scope.ctrlFlavor = "百威";
})
// = 的用法 是用来进行双向数据绑定的
myApp.directive("dirnk2",function(){
    return {
        restrict:"AE",
        scope:{
            flavor:"="
        },
        template:'<input type="text" ng-model="flavor" />'
        // ,link:function(scope,element,attr){
        //     scope.flavor = attr.flavor;
        // }
    }
})

myApp.controller("AndCtrl",function($scope){
    $scope.sayHello = function(name){
        alert("hello "+name);
    }
})

// & 的用法 使用来传递一个函数的
myApp.directive("greeting",function(){
    return {
        restrict:"AE",
        scope:{
            greet:"&"
        },
        template:'<input type="text" ng-model="userName" /><br/>'+
        '<button ng-click="greet({name:userName})">Greet</button><br/>'
        // ,link:function(scope,element,attr){
        //     scope.flavor = attr.flavor;
        // }
    }
})









