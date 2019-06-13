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
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span @click="showConfirm" class="clear">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list @delete="deleteSearchHistory" @select="addQuery" :searches="searchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <!--搜索结果列表组件-->
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest @listScroll="blurInput" @select="saveSearch" ref="suggest" :query="query"></suggest>
    </div>
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
  import SearchList from 'base/search-list/search-list'
  // 引入自己封装的滚动组件
  import Scroll from 'base/scroll/scroll'
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
    computed: {
      shortcut() {
        return this.hotKey.concat(this.searchHistory)
      }
    },
    created() {
      // 初始化组件的时候，就获取热搜关键词
      this._getHotKey()
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''

        this.$refs.searchResult.style.bottom = bottom
        this.$refs.suggest.refresh()

        this.$refs.shortcutWrapper.style.bottom = bottom
        this.$refs.shortcut.refresh()
      },
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
      query(newQuery) {
        if (!newQuery) {
          setTimeout(() => {
            this.$refs.shortcut.refresh()
          }, 20)
        }
      }
    },
    components: {
      SearchBox,
      SearchList,
      Scroll,
      Confirm,
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
