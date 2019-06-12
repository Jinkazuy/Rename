// 这里的 getters， 只负责 将state中的数据，对外提供展示数据，

// 导出歌手数据
export const singer = state => state.singer

// 播放器是否播放，
export const playing = state => state.playing

// 播放器是否展开；
export const fullScreen = state => state.fullScreen

// 播放列表
export const playlist = state => state.playlist

// 顺序列表
export const sequenceList = state => state.sequenceList

// 播放模式，默认是顺序播放；
export const mode = state => state.mode

// 当前播放的索引，通过修改这个currentIndex来控制歌曲的前进后退；
export const currentIndex = state => state.currentIndex

// 当前播放的歌曲，返回当前播列表中的当前播放的歌曲索引，即当前播放的歌曲；
export const currentSong = (state) => {
  return state.playlist[state.currentIndex] || {}
}

// 当前推荐页点击的歌单数据
export const disc = state => state.disc

// 当前被点击的排行榜
export const topList = state => state.topList

export const searchHistory = state => state.searchHistory

export const playHistory = state => state.playHistory

export const favoriteList = state => state.favoriteList
