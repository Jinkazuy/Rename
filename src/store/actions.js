// 这个actions.js文件作用，是在多次操作mutation中的函数时用到；
import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
// 拿到一些封装好的函数 cache.js 中都是与 操作 本地存储 相关的函数；
import {saveSearch, clearSearch, deleteSearch, savePlay, saveFavorite, deleteFavorite} from 'common/js/cache'

// 找到当前播放歌曲在 播放列表中的索引
function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

// 播放模式
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

// 全部随机播放，
// 当点击歌手详情页 或者 个人中心 的全部随机播放按钮时触发；
export const randomPlay = function ({commit}, {list}) {
  // 设置播放模式为随机播放，也就是2
  commit(types.SET_PLAY_MODE, playMode.random)
  // 设置顺序播放列表 为当前传入与的歌曲列表；
  commit(types.SET_SEQUENCE_LIST, list)
  // 调用自己写的洗牌函数，将顺序播放列表打乱 得到 随机播放列表；
  let randomList = shuffle(list)
  // 将打乱顺序的列表，也就是随机列表，设置为当前播放列表；
  commit(types.SET_PLAYLIST, randomList)
  // 将当前播放歌曲索引设置为0
  commit(types.SET_CURRENT_INDEX, 0)
  // 是否展开播放器设置为：true；
  commit(types.SET_FULL_SCREEN, true)
  // 播放播放状态设置为：true
  commit(types.SET_PLAYING_STATE, true)
}

// 插入歌曲、添加歌曲；
// 将某一首歌曲，插入、添加到当前播放歌曲的后边；
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

// 搜索历史存储
// 调用 封装在comomn/js/cache中的 saveSearch 函数；
export const saveSearchHistory = function ({commit}, query) {
  // 这里操作的是mutations中的 SET_SEARCH_HISTORY
  // 而这个 SET_SEARCH_HISTORY 操作的的是 state 下的 searchHistory
  // 而且这个 saveSearch 返回值是最新的搜索结果；
  // 也就是说，这里是将最新的搜索结果 先添加到本地存储，然后这个方法还会返回最新的搜索历史
  // 那么拿到返回的最新搜索历史数据，在放到state下的 searchHistory 中
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

// 删除某条历史记录
// 调用 封装在comomn/js/cache中的 deleteSearch 函数；
// deleteSearch函数在删除localstorage中的某1条数据后，返回删除后的最新的数组
export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

// 清空搜索历史记录
// 调用 封装在comomn/js/cache中的 clearSearch 函数；
// clearSearch在清空localstorage中的数据，返回一个空数组；
export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

// 删除歌曲
// 删除顺序列表 & 播放列表 中的某一个首歌曲
export const deleteSong = function ({commit, state}, song) {
  // 复制一份播放列表
  let playlist = state.playlist.slice()
  // 复制一份顺序列表
  let sequenceList = state.sequenceList.slice()
  // 拿到当前播放歌曲的索引
  let currentIndex = state.currentIndex
  // 找到要删除的这个首歌曲，在播放列表中的索引
  let pIndex = findIndex(playlist, song)
  // 首先，先删除在这首歌曲
  playlist.splice(pIndex, 1)
  // 找到要删除的这首歌曲，在顺序列表中的索引
  let sIndex = findIndex(sequenceList, song)
  // 删除这首歌曲
  // 当然，到了这一步，操作 播放列表 和顺序列表 的都是复制的临时变量
  sequenceList.splice(sIndex, 1)
  // 判断，如果当前播歌曲的索引 大于了 要删除的歌曲的索引，
  // 说明当前播放歌曲的前边少了1个元素，当前播放歌曲的索引需要-1；
  // 或者，
  // 当前播放歌曲 等于了 播放列表列表的长度，说明当前播放歌曲已经排列在数组之外了，
  // 因为数组的索引是 [0, 1, 2, 3] ，length就=4
  // 如果当前播放歌曲索引=4的话，就已经被排列在数组之外了
  // 所以 当前播放歌曲的索引需要-1；
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }
  // 如果以上条件不符合的话，说明删除的歌曲的索引，是在当前播放歌曲的后边的，不影响当前播放歌曲的索引；

  // 经过一顿折腾，数据都准备好了，再操作mutations下的函数，从而操作state的数据
  // 将当前播放列表重新赋值；
  commit(types.SET_PLAYLIST, playlist)
  // 将顺序播放列表，重新赋值
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  // 将当前播放歌曲，重新赋值
  commit(types.SET_CURRENT_INDEX, currentIndex)

  // 这里还要判断，如果播放列表=0，说明用户删除的是最后一首歌
  if (!playlist.length) {
    // 那么就将当前播放状态设置为false
    commit(types.SET_PLAYING_STATE, false)
  } else {
    // 否则就播放
    commit(types.SET_PLAYING_STATE, true)
  }
}

// 清除歌曲列表组件中的所有歌曲
export const deleteSongList = function ({commit}) {
  // 设置当前播放歌曲索引为-1，这样就不会播放歌曲了
  commit(types.SET_CURRENT_INDEX, -1)
  // 设置播放列表为空
  commit(types.SET_PLAYLIST, [])
  // 设置顺序列表为空
  commit(types.SET_SEQUENCE_LIST, [])
  // 设置播放状态为false，也就是不播放
  commit(types.SET_PLAYING_STATE, false)
}

// 设置最近播放列表 添加一首歌曲
export const savePlayHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

// 设置收藏列表 添加一首歌曲
export const saveFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

// 删除播放列表的某一个歌曲
export const deleteFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
