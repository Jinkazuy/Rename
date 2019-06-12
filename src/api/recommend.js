// 引入自己写的用于发送jsonp请求的文件；
import jsonp from '../common/js/jsonp'

// 设置请求体，get请求的？参数，好处就是不用给每个请求写请求头了；
import {commonParams, options} from './config'

// 载入axios，用于发送ajax请求的第三方包，用之前记得安装
import axios from 'axios'

// 获取轮播图数据
export function getRecommend() {
  // 设置url路径
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

  // 处理get请求体，也就是？参数；
  // Object.assign()是ES6的语法，用于复制对象、合并对象；
  // 在Object.assign()第2个以之后对象，会复制且合并到第1个参数中；
  const data = Object.assign({}, commonParams, {
    // 下边这些参数是qq音乐后台要求传入了，真是开发中还是得根据后台要求制定这些参数；
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  })

  // 调用写好的jsonp文件中返回的函数，将url地址、请求体参数、配置项传入其中；
  // 并且将这个方法返回；
  return jsonp(url, data, options)
}

// 获取歌单列表数据
// 前端用jsonp请求失败，转而使用node.js发送ajax请求，并且修改请求头，在build/dev-server.js中发请求；
// 因为前端无法修改请求头，所以用node.js发送；
// 流程就是，在这里发送给dev-server.js一个ajax请求，并且带有请求体，
// 然后由dev.server.js修改请求头，然后向某个指定的地址发送get请求，并且把请求体发送过去；
export function getDiscList() {
  // 向dev.server.js（模拟的后端）；
  const url = '/api/getDiscList'
  // 设置请求体，发送给后端，后端拿到了之后再发送给qq的服务器；
  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    // 这里注意，设置响应体内容是json格式，而不是jsonp了；
    format: 'json'
  })

  // 这里向本地的dev-server.js发请求；
  // 这里发送的也不是jsonp请求了，而是ajax请求；
  return axios.get(url, {
    // 将请求体传过去；
    params: data
  }).then((res) => {
    // 前端拿到dev.server.js返回的内容，然后return，那么最终调用getDiscList()方法就能拿到响应体；
    return Promise.resolve(res.data)
  })
}

// 获取歌单详情页的歌曲列表
export function getSongList(disstid) {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'

  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0
  })

  return jsonp(url, data, options)
}
