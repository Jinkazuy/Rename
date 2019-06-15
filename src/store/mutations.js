// 如果要操作 store 中的 state 的数据，只能通过 调用 mutations 提供的方法
// 引入mutaton-ytpes，目的是管理方法名；
import * as types from './mutation-types'

// matutaions负责修改state中的数据
// 如果是复杂的操作，那么就需要用actions.js来操作 matutaions 中的函数，
// 但是，不能在 actions.js 直接操作 state ，
// 只能由actions操作matutaions，从而操作state中的数据
const matutaions = {
  // 设置歌手
  [types.SET_SINGER](state, singer) {
    state.singer = singer
  },
  // 设置播放状态
  [types.SET_PLAYING_STATE](state, flag) {
    state.playing = flag
  },
  // 是否展开全屏的播放器
  [types.SET_FULL_SCREEN](state, flag) {
    state.fullScreen = flag
  },
  // 设置播放列表（有可能是顺序的，也有可能是随机的）
  [types.SET_PLAYLIST](state, list) {
    state.playlist = list
  },
  // 设置顺序列表
  [types.SET_SEQUENCE_LIST](state, list) {
    state.sequenceList = list
  },
  // 设置播放模式
  [types.SET_PLAY_MODE](state, mode) {
    state.mode = mode
  },
  // 设置当前播放歌曲
  [types.SET_CURRENT_INDEX](state, index) {
    state.currentIndex = index
  },
  // 设置推荐歌单
  [types.SET_DISC](state, disc) {
    state.disc = disc
  },
  [types.SET_TOP_LIST](state, topList) {
    state.topList = topList
  },
  // 设置搜索历史
  [types.SET_SEARCH_HISTORY](state, history) {
    state.searchHistory = history
  },
  // 设置播放历史
  [types.SET_PLAY_HISTORY](state, history) {
    state.playHistory = history
  },
  // 设置收藏列表
  [types.SET_FAVORITE_LIST](state, list) {
    state.favoriteList = list
  }
}

// 将 matutaions 导出，在store/index.js引入
export default matutaions
