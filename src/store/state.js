import {playMode} from 'common/js/config'
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache'

const state = {
  // 定义歌手数据
  singer: {},
  // 播放器是否播放，因为歌曲播放是全局的状态，所以用VUEX管理；
  playing: false,
  // 播放器是否展开；
  fullScreen: false,
  // 播放列表，有可能是顺序播放，也有可能是随机播放；
  playlist: [],
  // 顺序列表，
  // 这个顺序列表和播放列表的区别：因为播放模式不同，比如循环、随机等模式，
  // 所以顺序列表是有序的，而且不能修改；
  // 如果播放时加载播放列表，则读取的手playlist中的值，而不是操作sequenceList的值；
  sequenceList: [],
  // 播放模式，默认是顺序播放；
  // 这里使用common/js/config.js配置了几个项，
  // 目的其实是为了语义化更强，因为sequence比0这个数字语义化更强；
  mode: playMode.sequence,
  // 当前播放的索引，通过修改这个currentIndex来控制歌曲的前进后退；
  currentIndex: -1,
  disc: {},
  topList: {},
  searchHistory: loadSearch(),
  playHistory: loadPlay(),
  favoriteList: loadFavorite()
}

export default state
