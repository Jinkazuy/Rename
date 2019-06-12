<!--排行榜列表页-->
<template>
  <div class="rank" ref="rank">
    <!--还是用到了自己封装的scroll组件，将data传入，scroll组件监听到data数据有变化就会调用重新计算尺寸的方法-->
    <scroll :data="topList" class="toplist" ref="toplist">
      <ul>
        <!--循环数据输出每个榜单-->
        <!--点击事件，点击时，改变路由，并且将当前榜单数据传给vuex管理-->
        <li @click="selectItem(item)" class="item" v-for="item in topList">
          <div class="icon">
            <!--这里的图片用了懒加载的功能，懒加载插件在main.js中已经加载了，所以这类直接用-->
            <img width="100" height="100" v-lazy="item.picUrl"/>
          </div>
          <ul class="songlist">
            <li class="song" v-for="(song,index) in item.songList">
              <!--因为index是从0开始的，所以+1-->
              <span>{{index + 1}}</span>
              <!--歌曲名-歌手名-->
              <span>{{song.songname}}-{{song.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <!--loading动画组件-->
      <div class="loading-container" v-show="!topList.length">
        <loading></loading>
      </div>
    </scroll>
    <!--排行榜详情页-->
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  // 自己封装的滚动组件
  import Scroll from 'base/scroll/scroll'
  // 加载动画组件
  import Loading from 'base/loading/loading'
  // 发送ajax请求，获取排行榜列表数据
  import {getTopList} from 'api/rank'
  // ERR_OK===0
  import {ERR_OK} from 'api/config'
  // 播放列表相关混入
  import {playlistMixin} from 'common/js/mixin'
  // 拿到vuex下的mutations
  import {mapMutations} from 'vuex'

  export default {
    // 将混入文件置入，
    // 目的是将mixin.js下的所有代码混入到本组件中；
    mixins: [playlistMixin],
    created() {
      // 在组件初始化后，获取排行榜列表数据
      this._getTopList()
    },
    data() {
      return {
        topList: []
      }
    },
    methods: {
      // 解决底部迷你播放器挡住scroll组件最下边一块的问题
      // 这里的handlePlaylist会覆盖mixin.js中的handlePlaylist函数；
      // 那么这里定义的函数是形参，会在 mixin.js 中调用这个函数，并且传入实参；
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.rank.style.bottom = bottom
        this.$refs.toplist.refresh()
      },
      // 点击某个榜单
      selectItem(item) {
        // 拿到该榜单数据
        // 修改路由
        this.$router.push({
          path: `/rank/${item.id}`
        })
        // 同时将当前排行榜存储到vuex中（当前排行榜数据，不是排行榜列表数据）
        // 然后在排行榜详情页中，就可以通过vuex拿到当前点击的排行榜的数据，
        this.setTopList(item)
      },
      // 获取排行榜列表数据
      _getTopList() {
        // 调用api/rank.js中发送ajax请求获取排行榜数据的函数
        getTopList().then((res) => {
          // 拿到结果，如果code===0说明没问题
          if (res.code === ERR_OK) {
            // 赋值给this
            this.topList = res.data.topList
          }
        })
      },
      ...mapMutations({
        // 设置当前vuex中的当前排行榜数据；
        setTopList: 'SET_TOP_LIST'
      })
    },
    watch: {
      topList() {
        setTimeout(() => {
          this.$Lazyload.lazyLoadHandler()
        }, 20)
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .rank
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .toplist
      height: 100%
      overflow: hidden
      .item
        display: flex
        margin: 0 20px
        padding-top: 20px
        height: 100px
        &:last-child
          padding-bottom: 20px
        .icon
          flex: 0 0 100px
          width: 100px
          height: 100px
        .songlist
          flex: 1
          display: flex
          flex-direction: column
          justify-content: center
          padding: 0 20px
          height: 100px
          overflow: hidden
          background: $color-highlight-background
          color: $color-text-d
          font-size: $font-size-small
          .song
            no-wrap()
            line-height: 26px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
