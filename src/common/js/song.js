import {getLyric} from 'api/song'
import {ERR_OK} from 'api/config'
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

  getLyric() {
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }

    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
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

