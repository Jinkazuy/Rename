<!--// 个人中心组件，一级路由组件-->
<!--// 由m-header.vue组件的class="mine" 的元素点击显示这个组件-->
<!--// 因为这个m-header.vue组件是引入到app.vue的，-->
<!--// 所以这个user-center.vue组件 是挂载到app.vue的router-link下的，也就是一级路由组件-->
<template>
  <transition name="slide">
    <div class="user-center">
      <!--返回按钮，点击返回上一个路由-->
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches @switch="switchItem" :switches="switches" :currentIndex="currentIndex"></switches>
      </div>
      <!--// 随机播放按钮-->
      <!--随机播放按钮，实际上播放的就是当前的这个收藏列表 或者 历史播放列表 中的数据；-->
      <div ref="playBtn" class="play-btn" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <!--// 收藏列表-->
        <!--// 当分页选项卡的索引是0 的时候，显示这个收藏列表-->
        <scroll ref="favoriteList" class="list-scroll" v-if="currentIndex===0" :data="favoriteList">
          <div class="list-inner">
            <!--歌曲列表组件-->
            <!--将最近收藏列表数据传入-->
            <song-list :songs="favoriteList" @select="selectSong"></song-list>
          </div>
        </scroll>
        <!--// 最近播放列表-->
        <!--// 当分页选项卡的索引是1 的时候，显示这个最近播放列表-->
        <scroll ref="playList" class="list-scroll" v-if="currentIndex===1" :data="playHistory">
          <div class="list-inner">
            <!--// 歌曲列表组件-->
            <!--将最近播放列表数据传入-->
            <song-list :songs="playHistory" @select="selectSong"></song-list>
          </div>
        </scroll>
      </div>
      <!--// 无结果组件，空状态，无数据-->
      <div class="no-result-wrapper" v-show="noResult">
        <!--// noResultDesc，根据当前分页选项卡的索引，判断显示的是 收藏列表 还是最近播放列表-->
        <!--// 从而控制 返回空状态的字段-->
        <no-result :title="noResultDesc"></no-result>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  // 分也选项卡组件
  import Switches from 'base/switches/switches'
  // 自己封装的滚动组件
  import Scroll from 'base/scroll/scroll'
  // 歌曲列表组件
  import SongList from 'base/song-list/song-list'
  // 无结果组件
  import NoResult from 'base/no-result/no-result'
  // 格式化歌曲的函数
  import Song from 'common/js/song'
  // vuex映射
  import {mapGetters, mapActions} from 'vuex'
  // 混入函数
  import {playlistMixin} from 'common/js/mixin'

  export default {
    // 混入mixin.js中的代码段
    mixins: [playlistMixin],
    data() {
      return {
        // 当前分页选项卡的索引，0 或者 1
        currentIndex: 0,
        // 分页选项卡的按钮字段
        switches: [
          {
            name: '我喜欢的'
          },
          {
            name: '最近听的'
          }
        ]
      }
    },
    // 计算属性
    computed: {
      // 空状态
      noResult() {
        if (this.currentIndex === 0) {
          // 如果当前分页选项卡索引为0 ，显示的就是收藏列表
          // 那么就将收藏列表的长度 取反之后 返回
          // 如果为0，那么取反之后就是 true ，那么就显示空状态组件；
          return !this.favoriteList.length
        } else {
          // 最近播放列表；
          return !this.playHistory.length
        }
      },
      // 返回空状态的字段
      noResultDesc() {
        if (this.currentIndex === 0) {
          return '暂无收藏歌曲'
        } else {
          return '你还没有听过歌曲'
        }
      },
      // 映射vuex中的getters
      ...mapGetters([
        // 收藏列表 数据
        'favoriteList',
        // 最近播放历史 数据
        'playHistory'
      ])
    },
    methods: {
      // 处理底部迷你播放器挡住滚动列表的问题
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.listWrapper.style.bottom = bottom
        // 因为这两个滚动组件不会同时存在，
        // 所以这里判断一下，哪个滚动组件存在 就执行 哪个滚动组件的重新计算方法
        // 当然这里可以用 if(currentIndex===0){}else{}来判断，但下面的 && 更加高级；
        this.$refs.favoriteList && this.$refs.favoriteList.refresh()
        this.$refs.playList && this.$refs.playList.refresh()
      },
      // 点击分页选项卡的某个按钮时，将其索引 0 或者 1传过来
      switchItem(index) {
        this.currentIndex = index
      },
      selectSong(song) {
        this.insertSong(new Song(song))
      },
      // 点击返回按钮
      // 返回上一级路由
      back() {
        // 因为router已经挂载到了main.js中，
        // 所以这里可以直接this.$router调用router的方法；
        this.$router.back()
      },
      // 随机播放按钮点击时
      random() {
        // 判断当前页面是 收藏列表 还是 历史播放列表
        let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
        // 如果列表中的歌曲为0，那么播放个毛线。。。
        // 直接返回，不做任何操作；
        if (list.length === 0) {
          return
        }
        // 将歌曲列表（有可能是 收藏列表 或者是 历史播放列表 ）
        // 进行
        // Array.map() 方法返回一个新数组，数组中的元素为原始数组元素调用函数处理后的值。
        // return 是什么，新数组中的每个元素就是什么
        list = list.map((song) => {
          return new Song(song)
        })
        // 映射actions.js中的 randomPlay 函数；
        // 传入播放列表数据，进行随机洗牌函数，
        // 然后替换当前播放列表，进行随机播放
        this.randomPlay({
          list
        })
      },
      ...mapActions([
        'insertSong',
        'randomPlay'
      ])
    },
    components: {
      Switches,
      Scroll,
      SongList,
      NoResult
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
      border-radius: 100px
      font-size: 0
      .icon-play
        display: inline-block
        vertical-align: middle
        margin-right: 6px
        font-size: $font-size-medium-x
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
