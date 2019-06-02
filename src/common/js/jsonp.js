// 引入第三方包，前提是已经安装了
// npm install jsonp -S
import originJsonp from 'jsonp'

// 导出一个方法，在调用的时候传入的参数就是(url, get请求的？参数，其他配置项)
// 第1个参数是：url地址
// 第2个参数是：用于混入url地址的一些参数，这样的话，url地址就可以是一个单纯的url地址了；
// 第3个参数是：一些配置项；
export default function jsonp(url, data, option) {
  // 如果检查到url地址中有？那么就拼接一个&，如果没有？就给添加一个？，
  // 然后再调用param这个用于处理data数据的方法，最终形成一个有？参数的url地址；
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)

  // 返回一个promise
  return new Promise((resolve, reject) => {
    // 这里就可以使用 jsonp 这个插件了 ，第一个参数传入错误，第二个参数传入参数；
    originJsonp(url, option, (err, data) => {
      // 这里进行判断，如果err没有的话，就进入data，否则就进入err分支
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

// 这里设置一个方法，用于处理data的数据，
// 最终返回一个？参数，形式：key=val&key2=val2的形式，第一个key前不能有&符号；
// 用于拼接url地址
export function param(data) {
  let url = ''
  for (var k in data) {
    // 如果data没有传入数据的情况下，因为不能给后端传undefined，所以没有传入data就等于一个空字符串；
    let value = data[k] !== undefined ? data[k] : ''
    // 然后用url这个变量拼接data中的数据，最终形成一个&key=val的形式；
    url += '&' + k + '=' + encodeURIComponent(value)
  }
  // 循环完之后，检查url是否已经有数据了，因为是拼接在？后边的，所以这里检查，
  // 如果有数据的话，那么就应该把第一个&删掉，
  // 否则就会出现 www.baidu.com?&key=val 了，正确应该是www.baidu.com?key=val&key2=val2&…
  return url ? url.substring(1) : ''
}
