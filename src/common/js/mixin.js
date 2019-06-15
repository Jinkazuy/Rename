import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

// 这个mixin.js文件，主要是解决很多重复的js逻辑，那么在vue需要某个js代码段的时候，
// 也就是说，这个mixin.js 中函数、方法，是多个组件中，重复出现的代码段；
// 就将mixin.js的某个导出的函数混入，与data、methods同级，mixins: [playerMixin],
// 那么这个代码段就混入了vue组件的js代码中，也就相当于直接写在vue组件中了；
// 与import{func} from 'xx' 一样；
// 但不同的是，通过 mixins: [playerMixin], 混入的函数，可以在组件中直接调用；
// 也就是说，不用将 import{func} from 'xx'  的func 取出来挂载到vue组件；
// 因为混入的内容，直接可以调用，可以作为vue组件的 this.xx 的变量、函数使用；
// 因为 mixins: [playerMixin] 已经将mixin.js的playerMixin下的所有内容已经挂载到了vue组件中；

// 解决迷你播放器盖住其他页面滚动列表最底部的问题
export const playlistMixin = {
  computed: {
    // 拿到歌曲列表
    ...mapGetters([
      'playlist'
    ])
  },
  mounted() {
    // 那么调用了这个mixin.js的vue组件的handlePlaylist(形参)
    // 就会将这个mounted和activated下的 this.handlePlaylist(this.playlist) 自动引入
    // 也就说，vue组件中的methods中的定义的 handlePlaylist(形参) 中的参数是形参，
    // ↓↓↓ 下边的才是实参；
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
      // 这里抛出异常的目的是：因为这个playlistMixin的组件，必须有这个handlePlaylist()方法，
      // 然后就会覆盖这个mixin.js中的handlePlaylist()方法；
      // 也就是说，边的mounted、activeted、watch里的handlePlaylist()其实是用到调用这个playlistMixin函数的vue组件中的
      // 已经存在的playlist()方法，
      // 所以，如果组件没有这个方法的话，就调用这个methods中的方法，抛出异常；
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

// 歌曲列表组件的混入函数
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
      // 收藏列表
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
    // 收藏或移除收藏当前歌曲，在收藏列表中
    toggleFavorite(song) {
      // 调用自己封装的，判断是当前歌曲是否在 收藏歌曲列表中
      if (this.isFavorite(song)) {
        // 如果当前歌曲已经在收藏列表中存在，那么移除
        // 调用actions.js中的 deleteFavoriteList 函数
        this.deleteFavoriteList(song)
      } else {
        // 如果不存在，那么就将当前歌曲加入到 收藏列表当中
        // 调用actions.js中的 saveFavoriteList 函数
        this.saveFavoriteList(song)
      }
    },
    // 收藏 icon 样式 class
    getFavoriteIcon(song) {
      // 判断是当前歌曲是否在 收藏歌曲列表中
      // 调用isFavorite，返回Boolean值
      if (this.isFavorite(song)) {
        // 如果是
        return 'icon-favorite'
      }
      return 'icon-not-favorite'
    },
    // 判断是当前歌曲是否在 收藏歌曲列表中
    // 将当前歌曲传入
    isFavorite(song) {
      // 在收藏列表数据中，使用js原生的Array&Obj.findIndex,
      // 如果找到了，说明此时的index 大于 -1 ，返回的就是true；
      // 如果没找到返回就是false；
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
    // 映射actions中的方法
    ...mapActions([
      // 设置 收藏列表 的某一个歌曲
      'saveFavoriteList',
      // 删除  收藏列表 的某一个歌曲
      'deleteFavoriteList'
    ])
  }
}

// 搜索相关的函数混入
export const searchMixin = {
  data() {
    return {
      query: '',
      // 用于控制scroll重新计算的延迟时间
      // 因为某些引用scroll组件的元素有动画,
      // 所以要控制scroll组件的重新计算函数执行的延迟时间
      // 也就是说,当动画完成后,DOM的高度才是正确的,这是再调用scroll组件的重新计算方法;
      refreshDelay: 120
    }
  },
  computed: {
    ...mapGetters([
      // 拿到vuex管理的搜索历史记录
      'searchHistory'
    ])
  },
  methods: {
    // search.vue 传给 search-box.vue的方法，
    // 目的是 实时获取 搜索框组件的搜索关键词；
    onQueryChange(query) {
      this.query = query
    },
    // 失去焦点
    blurInput() {
      this.$refs.searchBox.blur()
    },
    // 点击热搜关键词，
    // 调用引入的search-box的向外派发的setQuery方法
    // 从而设置搜索关键词
    addQuery(query) {
      this.$refs.searchBox.setQuery(query)
    },
    // 设置搜索历史记录
    saveSearch() {
      this.saveSearchHistory(this.query)
    },
    // 映射actions.js下函数
    // 因为是同名，所以直接写字符串即可
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}
