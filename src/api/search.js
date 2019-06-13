// 载入自己封装的发送jsonp请求的函数
import jsonp from 'common/js/jsonp'
// 拿到一些向qq音乐服务器发请求时通用的配置参数
import {commonParams, options} from './config'

// 获取关键词
export function getHotKey() {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

  // 合并对象，将config中的通用配置和下方的参数合并；
  const data = Object.assign({}, commonParams, {
    uin: 0,
    needNewCode: 1,
    platform: 'h5'
  })

  // 调用自己封装的发送jsonp的函数
  return jsonp(url, data, options)
}

// 获取搜索结果
// 参数1：搜索关键词；
// 参数2：请求页数；
// 参数3：是否是歌手名，对应返回第一个条目是歌手相关信息，而不是歌曲；
export function search(query, page, zhida, perpage) {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'

  const data = Object.assign({}, commonParams, {
    w: query,
    p: page,
    perpage,
    n: perpage,
    catZhida: zhida ? 1 : 0,
    zhidaqu: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    remoteplace: 'txt.mqq.all',
    uin: 0,
    needNewCode: 1,
    platform: 'h5'
  })

  return jsonp(url, data, options)
}
