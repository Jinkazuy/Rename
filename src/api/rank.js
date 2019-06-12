import jsonp from 'common/js/jsonp'
// config中的内容就是导出一些qq音乐发送ajax请求通用的参数，用于和下边的getMusicList做合并
import {commonParams, options} from './config'

// 获取全部榜单列表数据
export function getTopList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'

  // 将config中的参数合并
  const data = Object.assign({}, commonParams, {
    uin: 0,
    needNewCode: 1,
    platform: 'h5'
  })

  // 掉用发送jsonp请求的函数
  return jsonp(url, data, options)
}

// 获取单个榜单的歌曲列表数据
// 方法同上；
export function getMusicList(topid) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'

  const data = Object.assign({}, commonParams, {
    topid,
    needNewCode: 1,
    uin: 0,
    tpl: 3,
    page: 'detail',
    type: 'top',
    platform: 'h5'
  })

  return jsonp(url, data, options)
}
