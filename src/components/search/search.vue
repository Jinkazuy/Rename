<template>
  <div class="search">
    <!--搜索框组件-->
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @queryChange="onQueryChange"></search-box>
    </div>
    <!--热搜关键词、搜索历史 -->
    <!--因为搜索框中有内容的话，就会直接发送jsonp请求，获取搜索结果列表了-->
    <!--当搜索框中的内容没有的时候展示这部分DOM，否则就会和搜索结果列表重合了-->
    <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
      <!--滚动组件-->
      <!--将搜索历史记录数据传入，让scroll组件调用重新计算高度的方法-->
      <!--refreshDelay是延迟时间,因为这个父级的元素中用到了动画,所以要控制scroll组件重新计算的延迟时间-->
      <!--也就是说,scroll组件监听到的父级data有变化,当动画完成后,DOM的高度才是正确的,这时再调用scroll组件的重新计算方法;-->
      <scroll :refreshDelay="refreshDelay" ref="shortcut" class="shortcut" :data="shortcut">
        <div>
          <!--热搜关键词-->
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <!--循环 通过发送jsonp请求，获取的热搜关键词-->
              <!--点击关键词，调用searchBox组件的setQuery方法，将热搜关键词传给搜索框-->
              <!--这addQuery方法写在了mixin.js文件中-->
              <li @click="addQuery(item.k)" class="item" v-for="item in hotKey">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <!--搜索历史记录-->
          <!--循环的searchHistory 是从store/getters.js 中映射过来的-->
          <!--也就是state.js下的 searchHistory 搜索历史记录,最多15条-->
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <!--全部清空-->
              <!--点击垃圾桶icon，弹出清空所有的提醒弹框 confirm 组件-->
              <span @click="showConfirm" class="clear">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <!--搜索历史记录列表-->
            <search-list @delete="deleteSearchHistory" @select="addQuery" :searches="searchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <!--搜索结果列表组件-->
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest @listScroll="blurInput" @select="saveSearch" ref="suggest" :query="query"></suggest>
    </div>
    <!--提醒弹框组件-->
    <!--// 这个clearSearchHistory是actions.js中映射的，因为映射vuex中的方法、属性，其实已经挂载到了vuex组件中，-->
    <!--// 所以这里可以直接调用映射的方法，而不需要再包裹一个函数 调用 vuex中的映射了；-->
    <!--// 就是直接清空localstorage中的搜索历史记录，和清空state下的搜索历史记录；-->
    <confirm ref="confirm" @confirm="clearSearchHistory" text="是否清空所有搜索历史" confirmBtnText="清空"></confirm>
    <!--这个router是给搜索结果点击出现的歌手详情页准备的-->
    <!--如果点击的是某个歌曲的话，那么就将这个歌曲传递给vuex，那么 播放器组件通过监听vuex中的歌曲变化-->
    <!--就会展开，因为 播放器 组件是放在 app.vue下的，所以这里的router值给歌手详情页准备-->
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  // 引入搜索框组件
  import SearchBox from 'base/search-box/search-box'
  // 搜索历史列表
  import SearchList from 'base/search-list/search-list'
  // 引入自己封装的滚动组件
  import Scroll from 'base/scroll/scroll'
  // 清空提醒弹窗
  import Confirm from 'base/confirm/confirm'
  // 引入搜索结果列表组件
  import Suggest from 'components/suggest/suggest'
  // 拿到发送jsonp请求的函数，获取热搜关键词
  import {getHotKey} from 'api/search'
  // ERR_OK===0
  import {ERR_OK} from 'api/config'
  // 引入混入文件
  import {playlistMixin, searchMixin} from 'common/js/mixin'
  // 拿到vuex中的actions
  import {mapActions} from 'vuex'

  export default {
    // 拿到混入函数的内容
    mixins: [playlistMixin, searchMixin],
    data() {
      return {
        // 热搜关键词
        hotKey: []
      }
    },
    // 监听计算属性
    computed: {
      // scroll组件重新计算高度；
      // 传入scroll组件
      // 因为scroll组件下的div包裹着两块内容：热搜关键词&搜索历史记录
      // 所以如果传入某1个数据，让scroll组件 调用重新计算高度都不适合，
      // 所以这里将两个都监听，并且返回，
      // 所以当个内容的任意一个发生改变时，scroll组件都会调用重新计算高度的函数；
      // 返回热搜关键词+搜索历史记录，并且 合并到当前组件的历史搜索记录 数据中；
      // concat() 方法用于连接两个或多个数组。
      // 该方法不会改变现有的数组，而仅仅会返回被连接数组的一个副本。
      shortcut() {
        // 因为vuex中的searchHistory设置的最大数量为15条；
        // 所以最终返回的可能是一个超过15个元素的数组
        // 但是，当页面刷新后，拿到的就只是vuex中的最新的15条数据
        // 因为mixin.js的混入，所以 this.searchHistory
        // 实际上拿到的是  mixin.js下的 computed: {...mapGetters(['searchHistory'])
        // 也就是拿到vuex中的数据 searchHistory
        return this.hotKey.concat(this.searchHistory)
      }
    },
    created() {
      // 初始化组件的时候，就获取热搜关键词
      this._getHotKey()
    },
    methods: {
      // 这个方法是，当迷你播放器展开时，会挡住滚动组件，
      // 会挡住搜索结果列表组件的滚动组件，
      // 也会挡住搜索历史记录的滚动组组件，
      // 这个handlePlaylist()是通过mixin.js拿到的函数，
      // 所以这里的playlist是形参；
      // mixin.js中会在 mounted 中调用 handlePlaylist()并传入实参，this.playlist
      // mounted钩子：已经将编译好的模板，挂载到了页面指定的容器中显示，也就是渲染好了DOM；
      // 那么因为是在 上边 mixins: [playlistMixin, searchMixin],混入了playlistMixin
      // 所以这个minxin.js 的 mounted 钩子会直接作用于search.vue
      // 那么也就相对于，在methods中定义handlePlaylist(playlist)方法，
      // 在 mounted 中调用这个handlePlaylist()方法，并自动传入实参：this.playlist；
      handlePlaylist(playlist) {
        // 这里判断当前播放列表长度是否>0,若果大于0的话，证明当前播放器是显示的；
        const bottom = playlist.length > 0 ? '60px' : ''

        // 这里设置 搜索及结果列表组件滚动组件 的父级的bottom即可
        this.$refs.searchResult.style.bottom = bottom
        // 搜索结果列表的滚动组件
        this.$refs.suggest.refresh()

        // 这里也是设置 搜索历史记录滚动组件 的父级的bottom即可
        this.$refs.shortcutWrapper.style.bottom = bottom
        // 滚动组件 重新计算高度
        this.$refs.shortcut.refresh()
      },
      // 显示清空提醒弹窗
      showConfirm() {
        this.$refs.confirm.show()
      },
      // 获取热搜关键词
      _getHotKey() {
        // 调用api/search.js中发送jsonp请求的函数
        getHotKey().then((res) => {
          if (res.code === ERR_OK) {
            // conde===0,获取数据成功
            // 热搜关键词很多，这里只截取数组的前10个
            this.hotKey = res.data.hotkey.slice(0, 10)
          }
        })
      },
      // vuex语法糖，拿得到vuex下的actions中的函数
      ...mapActions([
        'clearSearchHistory'
      ])
    },
    watch: {
      // 监听搜素关键词
      // 目的是为了解决，当输入搜索关键词时，搜索结果列表展开，
      // 但是此时搜索历史记录的滚动组件是没有接收到新的值的；
      // 所以这里就手动的调用scroll组件的refresh，重新计算高度
      query(newQuery) {
        if (!newQuery) {
          setTimeout(() => {
            // 经过20毫秒后，调用shortcut，也就是滚动组件的重新计算方法
            this.$refs.shortcut.refresh()
          }, 20)
        }
      }
    },
    components: {
      // 搜索框组件
      SearchBox,
      // 搜索历史列表
      SearchList,
      // 滚动最贱
      Scroll,
      // 弹窗组件
      Confirm,
      // 搜索结果列表组件
      Suggest
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
