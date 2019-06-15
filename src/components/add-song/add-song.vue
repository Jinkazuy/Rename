<!--// 添加歌曲到队列组件，作为playlist.vue的子组件-->
<template>
  <transition name="slide">
    <!--因为是子组件，所以要添加一个防止冒泡的方法，-->
    <!--也就是@click.stop点击事件，但这个点击事件没有处理函数，只为了防止点击这个子组件冒泡-->
    <div class="add-song" v-show="showFlag" @click.stop>
      <!--头部部分-->
      <div class="header">
        <!--标题-->
        <h1 class="title">添加歌曲到列表</h1>
        <!--关闭按钮，隐藏组件-->
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <!--搜索框-->
      <div class="search-box-wrapper">
        <!--搜索框组件-->
        <!--并且传入封装在mixin.js onQueryChange -->
        <!--也就是当搜索框中的内容发生改变时，将搜索关键词传给父级-->
        <!--此时父级，也就是添加歌曲组件 能够拿到搜索关键词-->
        <!--然后搜索结果列表监听父级的query，监听到变化后，发送jsonp（跨域ajax）请求获取搜索结果-->
        <search-box ref="searchBox" @query="onQueryChange" placeholder="搜索歌曲"></search-box>
      </div>
      <!--最近播放 和 搜索历史 部分-->
      <!--显示与隐藏 根据 是否有搜索关键词-->
      <!--如果有 搜索关键词 -->
      <!--那么就展示 搜索结果列表组件，-->
      <!--隐藏这个shortcut 也就是 最接近播放 和搜索历史 的DOM-->
      <div class="shortcut" v-show="!query">
        <!--分页选项卡按钮 组件-->
        <!--这个分页选项卡的目的，是为了切换最近播放 或者 搜索历史-->
        <!--@switch 点击某个按钮时，将其索引传给父级-->
        <!--初始化组件的时候 currentIndex 为0，那么子组件的第1个按钮高亮，-->
        <!--然后在点击按钮的时候，分页选项卡组件调用@switch ，此时父级拿到了被点击的按钮索引，再传给选项卡组件，实现切换高亮状态-->
        <!--父级要拿到索引值，从而判断 是显示最近播放列表 还是 历史搜索列表，所以要当前点击的按钮的索引要这么迂回一下-->
        <switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></switches>
        <!--最近播放-->
        <div class="list-wrapper">
          <!--显示 与 隐藏，根据分页选项卡传给过来的索引 如果是0 显示的就是 最近播放列表-->
          <!--因为初始化这个add-song.vue组件的时候，currentIndex===0，所以默认就显示这个最近播放列表-->
          <scroll ref="songList" v-if="currentIndex===0" class="list-scroll" :data="playHistory">
            <div class="list-inner">
              <!--歌曲列表组件-->
              <!--songs 通过vuex的映射 getters 拿到搜索历史记录 传给歌曲列表进行循环渲染-->
              <!--@select 点击某个历史记录的 歌曲时  将该歌曲数据和索引传过来，实现插入歌曲到vuex中的播放播发列表和顺序列表的逻辑-->
              <song-list :songs="playHistory" @select="selectSong">
              </song-list>
            </div>
          </scroll>
          <!--搜索历史-->
          <!--显示 与 隐藏，根据分页选项卡传给过来的索引 如果是1 显示的就是 搜索历史列表-->
          <!--refreshDelay是延迟时间,因为这个父级的元素中用到了动画,所以要控制scroll组件重新计算的延迟时间-->
          <!--也就是说,scroll组件监听到的父级data有变化,当动画完成后,DOM的高度才是正确的,这时再调用scroll组件的重新计算方法;-->
          <scroll :refreshDelay="refreshDelay" ref="searchList" v-if="currentIndex===1" class="list-scroll"
                  :data="searchHistory">
            <div class="list-inner">
              <!--搜索历史列表组件-->
              <!--@delete 调用actions.js中 deleteSearchHistory 删除某条 历史记录的方法;-->
              <!--@select 点击搜索的关键词,将搜索关键词置入 搜索框组件search-box ,然后实现搜索相关的逻辑-->
              <!--searches 将 vuex中的搜索历史记录传入-->
              <search-list @delete="deleteSearchHistory" @select="addQuery" :searches="searchHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <!--搜索结果列表组件 ，根据当前是否有搜索关键词显示或隐藏-->
      <div class="search-result" v-show="query">
        <!--query 搜索关键词，并且这个search-result监听搜索关键词的变化，从而发送jsonp请求拿到搜索结果数据-->
        <!--showSinger 是否搜索歌手，不搜索-->
        <!--@select 在点击某个搜索结果的时候，将当前的搜索关键词 放到搜索历史中，也就是本地存储；-->
        <!--@listScroll 当搜索结果列表 滚动时，触发搜索框的 .blue 事件，目的是 隐藏键盘-->
        <suggest :query="query" :showSinger="showSinger" @select="selectSuggest" @listScroll="blurInput"></suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放列表</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  // 搜索框组件
  import SearchBox from 'base/search-box/search-box'
  // 歌曲列表组件
  import SongList from 'base/song-list/song-list'
  // 搜索历史列表组件
  import SearchList from 'base/search-list/search-list'
  // 自己封装的滚动组件
  import Scroll from 'base/scroll/scroll'
  // 分页选项卡组件
  import Switches from 'base/switches/switches'
  // 顶部状态提醒小组件
  // 点击添加某个歌曲的时候，展示该组件，提示歌曲已经添加到播放列表
  import TopTip from 'base/top-tip/top-tip'
  // 搜索结果列表组件
  import Suggest from 'components/suggest/suggest'
  // 混入文件
  import {searchMixin} from 'common/js/mixin'
  // 拿到vuex中的函数
  import {mapGetters, mapActions} from 'vuex'
  // 格式化歌曲的方法
  import Song from 'common/js/song'

  export default {
    mixins: [searchMixin],
    data() {
      return {
        // 标识符，本组件显示或隐藏
        showFlag: false,
        // 搜索结果列表组件 是否搜索歌手，这里不需要，就填入false；
        showSinger: false,
        // 当前被激活的 分页选项卡 的索引；
        currentIndex: 0,
        // 当前播放歌曲 数据
        songs: [],
        // 分页选项卡 switches 组件 的字段
        switches: [
          {
            name: '最近播放'
          },
          {
            name: '搜索历史'
          }
        ]
      }
    },
    computed: {
      ...mapGetters([
        'playHistory'
      ])
    },
    methods: {
      // 显示本组件
      show() {
        // 将显示的标识设置为true
        this.showFlag = true
        // 重新计算滚动组件高度
        // 因为在组件显示的时候，并不是组件初始化的时候
        // 那么在组件初始化的时候，是没有显示的，其中的滚动组件的高度计算也是有问题的
        // 那么就需要，在显示这个组件的时候，重新计算滚动组件的高度
        setTimeout(() => {
          // 那么判断，当前分页选项卡的索引是0还是1，
          // 是0的话，说明当前显示的是 历史播放的DOM
          // 那么就只重新及计历史播放列表的滚动组件的高度
          if (this.currentIndex === 0) {
            this.$refs.songList.refresh()
          } else {
            // 如果不=0，那么就是=1，当前显示的是 搜索历史的DOM
            // 那么就调用对应的滚动组件的 重新计算高度的方法
            this.$refs.searchList.refresh()
          }
        }, 20)
      },
      // 隐藏本组件
      hide() {
        this.showFlag = false
      },
      // 点击某个历史记录的 歌曲时  将该歌曲数据和索引传过来
      selectSong(song, index) {
        // 如果索引页不等于0的话，说明点击的不是当前正在播放的歌曲
        // 因为历史播放记录中的，index为0的那个歌曲，就是当前正在播放的歌曲，
        // 所以不用插入，也不用做任何操作；
        if (index !== 0) {
          // 调用格式化歌曲的方法；
          // 将格式化后的歌曲，调用 映射 actions.js下的插入歌曲insertSong的方法；
          // 将点击的歌曲插入到播放列表 和 顺序列表中，并播放歌曲 & 展开全屏的播放器；
          this.insertSong(new Song(song))
          this.$refs.topTip.show()
        }
      },
      // 在点击某个搜索结果的时候，
      // 设置搜索记录；
      // 将当前的搜索关键词 放到搜索历史中，也就是本地存储
      // suggest.vue 组件内部会处理播放被点击的搜索结果，这里就不用管了；
      selectSuggest() {
        // 显示 提示已添加到播放列表的 下拉框
        this.$refs.topTip.show()
        // 调用 mixin.js 中的 设置搜索历史记录的方法
        // 将当前搜索关键词 记录到搜索历史记录中；
        this.saveSearch()
      },
      // 获取 分页选项卡，目的被激活的 按钮 的索引
      switchItem(index) {
        this.currentIndex = index
      },
      // 映射vuex中的action下的方法
      ...mapActions([
        // 插入歌曲方法
        'insertSong'
      ])
    },
    components: {
      SearchBox,
      SongList,
      SearchList,
      Scroll,
      Switches,
      TopTip,
      Suggest
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>
