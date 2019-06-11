// 调用api/song.js下的，向后台node.js发送AJAX请求的方法
// 然后由后台的node.js修改请求头后，向qq服务器发送请求拿到歌词；
import {getLyric} from 'api/song'
// ERR_OK就等于0，只是为了增强语义化
import {ERR_OK} from 'api/config'
// 解码base64，用到的第三方包
import {Base64} from 'js-base64'

// 说明：这个文件中的函数的目的：就是为了将每个歌曲的数据进行格式化，达到我们想要的数据的格式；
// 也就是说，以后在每次需要格式化每条歌曲数据的时候，调用这个文件的中的函数createSong()就行了；

// 初始化一些歌曲的必要参数，用于工厂方法new这个函数；
export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id // 歌曲id
    this.mid = mid
    this.singer = singer
    this.name = name // 歌曲名称
    this.album = album
    this.duration = duration // 歌曲长度
    this.image = image // 歌曲封面图片
    this.url = url // 歌曲文件的请求路径
  }

  // 获取歌词
  getLyric() {
    // 如果当前歌词已经缓存了，就直接返回promise对象的resolve函数（也就是成功的回调函数）即可；
    // 返回Promise.resolve等价于new一个promise对象后，返回resolve回调函数，也就是说，也可以.then；
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }

    // 如果没有歌词，那么就返回一个 promise对象；
    return new Promise((resolve, reject) => {
      // 调用api/song.js下的发送AJAX的请求，传入歌曲id；
      getLyric(this.mid).then((res) => {
        // 判断错误码===0，代表数据获取没问题
        if (res.retcode === ERR_OK) {
          // 让当前歌词，等于数据的歌曲（因为获取的是base64的字符串，所这里编译一下）
          // 解码base64，用到了一个第三方库：js-base64 ；
          this.lyric = Base64.decode(res.lyric)
          // 将结果传入第一个参数，也就是成功的回调函数中
          // 那么在调用这个函数的时候，.tnen就能拿到当前歌曲的歌词了
          resolve(this.lyric)
        } else {
          reject('no lyric')
        }
      })
    })
  }
}

// 抽象出一个工厂发方法，那么传入每个歌曲的数据的时候，就new了一个实例对象
export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`
  })
}

// 歌手可能有多个，所以这里进行处理，使用join方法将歌手用‘/’分割
function filterSinger(singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}
