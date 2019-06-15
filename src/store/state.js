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
  // 当前推荐页点击的歌单数据
  disc: {},
  // 当前被点击的排行榜
  topList: {},
  // 搜索历史数据
  // 这里没有设置为[]空数组的目的就是，初始vue组件的时候，就要先拿到1次本地的数据，
  // 否则关闭浏览器、或刷新页面的话，同步会出问题；
  // 这个 loadSearch()是在common/js/cache.js中拿到的，
  // 然后赋值给state下的searchHistory，也就是达到初始化时拿到本地存储的数据；
  searchHistory: loadSearch(),
  // 播放历史，还是在初始化vue的时候，先拿到1次本地存储 localStorage中的播放历史数据；
  // 同样是调用了 common/js/cache.js中提供的函数；
  playHistory: loadPlay(),
  // 收藏歌曲的数据
  // 在初始化的时候先拿到1次本地存储中的数据；
  // 同样是调用了 common/js/cache.js中提供的函数；
  favoriteList: loadFavorite()
}

export default state
