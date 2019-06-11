// 定义了一些发送AJAX请求的基础且公用的参数
import {commonParams} from './config'

// 因为需要发送AJAX请求，所以使用axios第三方包；
import axios from 'axios'

// 获取歌词的AJAX请求
export function getLyric(mid) {
  // 请求我们自己代理的地址，也就是node.js代理的地址
  const url = '/api/lyric'

  // 使用boj.assign合并对象，将config.js中的公用的一些配置和这里的配置合并到一起；
  const data = Object.assign({}, commonParams, {
    // 歌曲id
    songmid: mid,
    platform: 'yqq',
    // 其他的参数都是qq音乐后台要求的
    hostUin: 0,
    needNewCode: 0,
    categoryId: 10000000,
    pcachetime: +new Date(),
    // 希望是一个json请求
    format: 'json'
  })

  // 返回AJAX请求的函数，那么也就是，谁调用这个文件的getLyric()方法，
  // 就等于在谁那里发送了axios.get的请求;
  // 那么axios发送的请求的返回的数据，一般都在data中；
  return axios.get(url, {
    params: data
  }).then((res) => {
    // 那么这里的res就是node.js再次发送AJAX请求后，拿到的qq服务器返回的数据；
    // 返回Promise.resolve等价于new一个promise对象后，返回resolve回调函数，也就是说，也可以.then；
    // 而这里不需要new 一个promise对象，只需要再调用getLyric方法后能够.then，所以直接返回Promise.resolve()即可实现；
    // 那么这就达到了，谁调用getLyric这个函数，
    // 在调用之后，谁就有了.then(fn)方法，fn(res)中就能拿到res.data了；
    // 这个getLyric方法，在src/common/js/song.js中被调用；
    return Promise.resolve(res.data)
  })
}
