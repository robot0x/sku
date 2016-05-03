var http = require('http')
var postData = JSON.stringify({
    'url':'http://s.click.taobao.com/t?e=m%3D2%26s%3D6t3Zj%2FakZq8cQipKwQzePOeEDrYVVa64K7Vc7tFgwiHjf2vlNIV67jtHK5w1mkApJhSgLssdd1ahQEN7xn4%2BHIbEG36ONKbK%2B2T3haSPTyQsVV%2BLa9Ofh1sfG3rjrZYeOrAlBopqaFkeJoKC48nLtcYMXU3NNCg%2F&pvid=10_125.34.11.187_1033_1461815765671'
})
console.log(postData)
console.log(Buffer.byteLength(postData))
var hostname = "http://s4.a.dx2rd.com";
var options = {
    hostname:hostname,
    method:'POST',
    path:'/blsvr/parse',
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
        'Host':hostname,
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

