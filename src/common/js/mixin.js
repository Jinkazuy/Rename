import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

export const playerMixin = {
  computed: {
    // 播放模式icon
    iconMode() {
      // 根据当前vuex中的mode的值，返回不同的类名，从而渲染不同播放模式的icon
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      // 顺序播放列表
      'sequenceList',
      // 当前播放列表
      'playlist',
      // 当前播放歌曲
      'currentSong',
      // 当前播放模式
      'mode',
      'favoriteList'
    ])
  },
  methods: {
    // 播放模式按钮click事件触发
    changeMode() {
      // 使用当前的播放模式+1再余3，得到的就是下一个数字
      // 比如: (1+1)%3 = 2;    (2+1)%3 = 0;    (3+1)%3 = 1;  120120120120循环；
      // 其实JK的思路是if(this.mode===1){this.mode=2} else if(this.mode===2){this.mode=0}
      // 但显然用if else if这种太傻了，而且效率不高；
      const mode = (this.mode + 1) % 3
      // 调用vuex映射来的方法，将当前播放模式传入其中
      this.setPlayMode(mode)
      // 修改当前的播放模式，其实就是修改了播放列表中的内容；
      let list = null
      // 如果 当前设置的播放模式为随机，也就是2的时候
      if (mode === playMode.random) {
        // 那么将顺序播放列表sequenceList传入 我们封装好的，洗牌的函数中；
        // 返回的就是打乱顺序后的播放列表；
        // 此时拿到的就是随机播放列表；
        list = shuffle(this.sequenceList)
      } else {
        // 如果当前播放模式不是随机播放的话，就是顺序播放 或 单曲循环
        // 那么就拿到顺序播放列表
        list = this.sequenceList
      }
      // 那么因为修改了播列表，而当前播放歌曲是通过 当前播放列表和当前播放索引 取到的，
      // 因为不想在改变播放模式的时候影响当前歌曲的播放，
      // 所以封装一个，找到当前播放的歌曲，然后在新的播放列表中遍历，找到这个歌曲，
      // 然后拿到这个歌曲在新的播放列表的索引值，再设置当前播放歌曲的索引；
      this.resetCurrentIndex(list)
      // 将顺序 或者 随机播放列表传入，
      // 利用vuex映射来的方法，设置vuex中state下的播放列表 playlist
      this.setPlaylist(list)
    },
    // 当播放模式改变时，设置当前歌曲不会受到播放列表影响；
    resetCurrentIndex(list) {
      // 拿到新的播放列表
      // findIndex() 找到某个元素在数组中的索引值；
      // 找到当前播放的歌曲，在新的播放列表中的索引值
      let index = list.findIndex((item) => {
        // 通过音乐数据中的id判断即可，因为id是唯一的
        return item.id === this.currentSong.id
      })
      // 将当前播放歌曲，在新的播放列表中的索引的值，重新设置当前播放歌曲；
      // 如此这般，在切换播放列表的时候，当前播放的歌曲就不会受到影响了；
      this.setCurrentIndex(index)
    },
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song)
      } else {
        this.saveFavoriteList(song)
      }
    },
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      }
      return 'icon-not-favorite'
    },
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      return index > -1
    },
    ...mapMutations({
      // 设置state中的mode的值
      setPlayMode: 'SET_PLAY_MODE',
      // 设置当前歌曲列表，即state中的playlist；
      setPlaylist: 'SET_PLAYLIST',
      // 设置当前播放歌曲索引
      setCurrentIndex: 'SET_CURRENT_INDEX',
      // 设置播放状态
      setPlayingState: 'SET_PLAYING_STATE'
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
}

export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 120
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    onQueryChange(query) {
      this.query = query
    },
    blurInput() {
      this.$refs.searchBox.blur()
    },
    addQuery(query) {
      this.$refs.searchBox.setQuery(query)
    },
    saveSearch() {
      this.saveSearchHistory(this.query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}
