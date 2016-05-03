var http = require('http')
var postData = JSON.stringify({
    'query':'烤箱',
    'from':'pc',
    'test':[1,2,3],
    'obj':{
        'name':'liyanfeng'
    }
})
console.log(postData)
console.log(Buffer.byteLength(postData))
var options = {
    hostname:'s.diaox2.com',
    method:'POST',
    path:'/ddsearch/q',
    headers:{
        // 必须注释掉，否则返回乱码
        // 'Accept-Encoding':'gzip, deflate',
        // 若查询参数是汉字会报错。原因是字节长度不等于字符长度
        // 找到了解决方法！！ 可以使用Buffer类的静态方法 byteLength来获取字节长度
        'Content-Length':Buffer.byteLength(postData),
        'Accept':'application/json, text/javascript, */*; q=0.01',
        'Accept-Language':'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
        'Cache-Control':'no-cache',
        'Connection':'keep-alive',
        'Content-Type':'application/json',
        'Host':'s.diaox2.com',
        'Origin':'null',
        'Pragma':'no-cache'
    }
}
var req = http.request(options,res => {
    var json = ''
    res.on('data',chunk => json += chunk)
    res.on('end',()=>console.log(json))
})
req.on('error',e => console.log(e.message))
req.write(postData)
req.end()

