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

// 将某一首歌曲，插入到当前播放歌曲的后边；
export const insertSong = function ({commit, state}, song) {
  // 使用slice方法，复制一个播放列表
  // 因为，如果不是复制的话，那么就会指向同一个 堆 地址，
  // 那么就会改变原有的播放列表的数组，而且vue不提倡在mutations之外的地方修改state中的数据
  let playlist = state.playlist.slice()
  // 同样也复制一个
  let sequenceList = state.sequenceList.slice()
  // 拿到当前正在播放的歌曲的索引
  // 这里就不需要复制了，因为值类型指向的是 栈 ，所以不会修改原来 栈中的内容
  let currentIndex = state.currentIndex
  // 记录当前歌曲的数据
  let currentSong = playlist[currentIndex]
  // 调用自己封装的函数findIndex，不是js原生的arr.findIndex
  // 查找当前列表中是否已经存在 想要插入的歌曲，并返回其索引
  // 这个查找是否已经存的逻辑，必须要在插入歌曲前执行，否则就会永远>-1了
  let fpIndex = findIndex(playlist, song)
  // 因为是插入歌曲，所以索引+1
  // 那么此时的 currentIndex 就是新插入歌曲的索引了；
  currentIndex++
  // 插入这首歌到当前索引位置
  playlist.splice(currentIndex, 0, song)
  // 此时，歌曲已经插入到播放列表中了
  // 然后判断这个插入的歌曲是否已经存在于播放列表中，
  // 如果存在的话就将播放列表中原来就存在的这首歌删除掉；
  // 如果播放列表中已经包含了这首歌
  if (fpIndex > -1) {
    // 这里还要判断，新插入的歌曲 在数组中的位置 与 原来重名的歌曲的位置 是怎样的关系

    // 如果当前插入的序号大于列表中的序号
    // 那么说明新插入的歌曲，是在歌曲列表数组中 重名的歌曲的 后边；
    if (currentIndex > fpIndex) {
      // 那么就将这个原来的重名歌曲在原有位置删除
      playlist.splice(fpIndex, 1)
      // 因为此时播放列表数组中，新歌曲前边删除了一个歌曲，
      // 所以当前的新插入的歌曲的索引发生了变化，
      // 所以需要让当前索引-1，此时这个currentIndex对应的还是新插入歌曲的索引；
      currentIndex--
    } else {
      // 如果重名歌曲不是在新插入歌曲的前边，
      // 也就是在新插入歌曲的后边的话，
      // 那么说明此时数组中，这个原来存在的重名的歌曲的索引已经被向后推了一位了，
      // 所以这里用FPIndex+1，找到的就是原来重名的歌曲的位置，然后删除它；
      playlist.splice(fpIndex + 1, 1)
    }
  }

  // 那么，上边是改变了当前播放列表，但是还需要处理顺序列表中的内容
  // 因为这个顺序列表 是 当前播放列表 和随机播放列表的 源数据；
  // 这里找到顺序列表中，当前正在播放的歌曲的索引，并且加1
  // 那么此时，这个 currentSIndex 就是新歌要在 顺序列表 中插入的位置；
  let currentSIndex = findIndex(sequenceList, currentSong) + 1

  // 并且检查，当前想要插入的新歌曲，在顺序列表中是否已经存在，如果存在则返回在顺序列表中的索引
  let fsIndex = findIndex(sequenceList, song)

  // 首先，先将新歌插入到顺序列表中
  sequenceList.splice(currentSIndex, 0, song)

  // 然后判断，顺序列表中是否已经存在了这首新歌
  // 如果存在的话，就删除原来的重名歌曲
  if (fsIndex > -1) {
    // 判断，如果当前插入新歌的位置大于了原来重名歌曲的位置
    // 那么说明，新歌在数组中的位置 大于 原来重名歌曲的位置，
    // 也就是新歌在老歌的后边，那么删除这个老歌即可；
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      // 如果新歌不是在老歌后边，那就说明老歌曲在新插入歌曲的后边
      // 那么此时已经插入了新歌曲，老歌曲前边多了一个数组的元素，
      // 那么此时老歌曲的索引发生了改变，所以需要+1，就能拿到老歌曲的索引
      // 删除原来已经存在的重名歌曲；
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  // 因为上边的播放列表 和 顺序列表都是 arrayObject.slice()方法复制过来的，
  // 所以仅仅是内存中的一个临时变量，
  // 所以这里还需要将临时变量重新赋值给vuex中的数据；
  // 设置vuex中的 当前播放列表
  commit(types.SET_PLAYLIST, playlist)
  // 设置vuex中的 顺序播放列表
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  // 设置vuex中的 当前播放歌曲的索引，
  // 注意，此时的currentIndex，是vuex中原来的当前播放歌曲+1后的结果，
  // 所以这个 currentIndex 变量，此时代表的是新插入的歌曲的索引；
  commit(types.SET_CURRENT_INDEX, currentIndex)
  // 设置vuex中的 播放器是否展开全屏播放器 为 ：打开全屏的播放器；
  commit(types.SET_FULL_SCREEN, true)
  // 设置vuex中的 歌曲播放状态为 ： 播放；
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
