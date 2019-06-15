// 操作本地存储的第三方库
import storage from 'good-storage'

// 这是为了定义内部的key，防止与外部冲突
const SEARCH_KEY = '__search__'
// 设置最多的搜索历史记录的条数
const SEARCH_MAX_LEN = 15

// 播放历史
const PLAY_KEY = '__play__'
// 最多纪录200个播放历史记录
const PLAY_MAX_LEN = 200

// 收藏列表
const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LEN = 200

// 将某个元素插入到数组的最前边；
// 参数1：原始的数组
// 参数2：要插入的新值
// 参数3：判断条件函数
// 参数4：数组限制的最大值
function insertArray(arr, val, compare, maxLen) {
  // 判断是否有重复的关键词；
  // 查找原来的数组中是否有要插入的值，
  // 如果不存在重复的关键词，就不用操作；
  const index = arr.findIndex(compare)
  if (index === 0) {
    return
  }
  // 如果>0说明有重复的关键词，所以删除
  if (index > 0) {
    arr.splice(index, 1)
  }
  // 将新的搜索关键词插入到原来的数组中 最前边
  arr.unshift(val)
  // 判断，如果当前这个数组的长达超过了预设的最大值，就从后边删除一个
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

// 删除localstorage中的某1条搜索历史记录数据
function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  // 大于 -1 说明找到了该条数据
  if (index > -1) {
    // 删除一条
    arr.splice(index, 1)
  }
}

// 将搜索关键词存到本地存储中
export function saveSearch(query) {
  // 拿到本地存储中 SEARCH_KEY （其实是__search__）字段对应的内容
  let searches = storage.get(SEARCH_KEY, [])
  // 然后插入这个关键词
  // 将最搜索关键词插入到数组的最前边；
  // 调用自己封装的函数
  // 这里是为了判断原来数组中是否已经有了这个关键词，如果有了就删除原来的重复的关键词；
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LEN)
  // 然后将插入后的新值，设置给本地存储 localStorage中的 SEARCH_KEY(__search__) 字段
  // 覆盖localstorage中 __search__ 字段 原有的内容
  storage.set(SEARCH_KEY, searches)
  // 将最新的搜索历史返回
  return searches
}

// 删除某条搜索记录
export function deleteSearch(query) {
  // 拿到localstorage中的搜索历史记录数据
  let searches = storage.get(SEARCH_KEY, [])
  // 查找该条数据，如果找到就删除
  deleteFromArray(searches, (item) => {
    return item === query
  })
  // 此时的searches变量是删除某1条数据的后的数组
  // 覆盖当前的localstorage中的搜索历史数据
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 清空全部搜索记录
export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

// 读取搜索历史
// 由 state下的 searchHistory 调用
// 以返回值的方式：返回 获取本地存储中的搜索关键词内容
// 赋值给state下的 searchHistory
// 目的是初始vue组件的时候，state下的 searchHistory 就拿到了本地存储的数据；
export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

// 设置播放历史
export function savePlay(song) {
  // 拿到本地的播放历史数据
  let songs = storage.get(PLAY_KEY, [])
  // 将当前的歌曲插入到播放历史中
  // 调用自己封装的insertArray函数
  // insertArray函数 是将某个元素插入到数组的最前边；
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, PLAY_MAX_LEN)
  // 覆盖本地存储 中的 播放历史
  storage.set(PLAY_KEY, songs)
  // 返回一个最新的 播放历史记录 的数据
  return songs
}

// 读取播放历史
// 初始化时，state下的 播放历史记录变量，拿到localstorage中的播放历史记录
export function loadPlay() {
  return storage.get(PLAY_KEY, [])
}

// 插入收藏列表
export function saveFavorite(song) {
  // 获取本地的 收藏列表
  let songs = storage.get(FAVORITE_KEY, [])
  // 将当前的歌曲插入到收藏列表
  // 调用自己封装的insertArray函数
  // insertArray函数 是将某个元素插入到数组的最前边；
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LEN)
  // 覆盖本地的 收藏列表数据
  storage.set(FAVORITE_KEY, songs)
  // 返回最新的收藏列表，用于设置state中的 收藏列表
  return songs
}

// 删除收藏列表 的某一个歌曲
export function deleteFavorite(song) {
  // 获取本地的 收藏列表
  let songs = storage.get(FAVORITE_KEY, [])
  // 调用自己封装的 删除数组中某一条 数据的函数
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  // 覆盖本地的 收藏列表数据
  storage.set(FAVORITE_KEY, songs)
  // 返回最新的收藏列表，用于设置state中的 收藏列表
  return songs
}

// 获取本地的 收藏列表
export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}

