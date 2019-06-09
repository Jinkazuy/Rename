// 这个actions.js文件作用，是在多次操作mutation中的函数时用到；
import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import {saveSearch, clearSearch, deleteSearch, savePlay, saveFavorite, deleteFavorite} from 'common/js/cache'

// 找到当前播放歌曲在随机播放列表中的索引
function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

// 选择播放
// 参数1对象中的 第1个变量，接收的是
// 参数1对象中的 第2个变量，接收的是state中的数据，因为最终都有store/index.js引入所有文件
// 所以这个action.js中的变量也能够直接拿到state.js、mutations.js等文件中的函数、数据等；

// 参数2对象中的 第1个变量，接收的是调用这个方法时传进来的歌曲列表
// 参数3对象中的 第2个变量，接收的是嗲用这个方法时传进来的歌曲索引
export const selectPlay = function ({commit, state}, {list, index}) {
  // 因为最终都汇总到了store/index.js中，所以actions.js和mutations.js是可以相互访问的，
  // 所以这个commit就是调用mutations.js中的方法，第一个参数是方法名，
  // 就类似于在其他.vue文件中使用this.$store.commit.xxx(fnName, xx)
  // 方法名还是用mutation-types中的字符串来命名，得到统一性，
  // 第二个参数就是mutations.js中某个方法的形参，具体还得看mutations.js中该方法需要传入的是什么；

  // 调用mutations.js中的SET_SEQUENCE_LIST方法，将歌曲列表传入；
  commit(types.SET_SEQUENCE_LIST, list)
  // 判断播放模式，如果当前播放模式等于随机播放，也就是2 的时候；
  if (state.mode === playMode.random) {
    // 那么调用洗牌函数，得到随机播放列表；
    let randomList = shuffle(list)
    // 并且将随机播放列表设置为当前播放列表
    commit(types.SET_PLAYLIST, randomList)
    // 然后调用 找到在随机播放列中，当前歌曲的索引 的函数；
    index = findIndex(randomList, list[index])
  } else {
    // 顺序播放
    commit(types.SET_PLAYLIST, list)
  }
  // 设置当前歌曲索引
  commit(types.SET_CURRENT_INDEX, index)
  // 打开播放器：打开
  commit(types.SET_FULL_SCREEN, true)
  // 播放器状态：播放
  commit(types.SET_PLAYING_STATE, true)
}

// 随机播放，当点击歌手详情页的全部随机播放按钮时触发；
export const randomPlay = function ({commit}, {list}) {
  // 设置播放模式为随机播放，也就是2
  commit(types.SET_PLAY_MODE, playMode.random)
  // 设置顺序播放列表为当前的播放列表；
  commit(types.SET_SEQUENCE_LIST, list)
  // 调用自己写的洗牌函数，将顺序播放列表打乱 得到 随机播放列表；
  let randomList = shuffle(list)
  // 将当前播放列表传入随机播放列表
  commit(types.SET_PLAYLIST, randomList)
  // 将当前播放歌曲索引设置为0
  commit(types.SET_CURRENT_INDEX, 0)
  // 是否展开播放器设置为：true；
  commit(types.SET_FULL_SCREEN, true)
  // 播放播放状态设置为：true
  commit(types.SET_PLAYING_STATE, true)
}

export const insertSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playlist[currentIndex]
  // 查找当前列表中是否有待插入的歌曲并返回其索引
  let fpIndex = findIndex(playlist, song)
  // 因为是插入歌曲，所以索引+1
  currentIndex++
  // 插入这首歌到当前索引位置
  playlist.splice(currentIndex, 0, song)
  // 如果已经包含了这首歌
  if (fpIndex > -1) {
    // 如果当前插入的序号大于列表中的序号
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      playlist.splice(fpIndex + 1, 1)
    }
  }

  let currentSIndex = findIndex(sequenceList, currentSong) + 1

  let fsIndex = findIndex(sequenceList, song)

  sequenceList.splice(currentSIndex, 0, song)

  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const deleteSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let pIndex = findIndex(playlist, song)
  playlist.splice(pIndex, 1)
  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)

  if (!playlist.length) {
    commit(types.SET_PLAYING_STATE, false)
  } else {
    commit(types.SET_PLAYING_STATE, true)
  }
}

export const deleteSongList = function ({commit}) {
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_PLAYING_STATE, false)
}

export const savePlayHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const saveFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
