<template>
  <div class="recommend" ref="recommend">
    <!--// 因为这个scroll组件需要监听数据，所以这里:data="discList"传入数据，当数据改变的时候，这个组件会重新计算高度；-->
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="slider-wrapper" ref="sliderWrapper">
          <!--使用轮播图组件-->
          <slider>
            <!--循环recommends中的轮播图数据-->
            <div v-for="item in recommends">
              <a :href="item.linkUrl">
                <!--// 这里给轮播图添加needsclick是为了解决better-scroll和fastclick两个插件的点击不兼容的问题；-->
                <!--// 如果不加这个类名，那么这个图片的click是被拦截的；-->
                <img class="needsclick" @load="loadImage" :src="item.picUrl">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <!--歌单列表-->
          <ul>
            <!--点击某个歌单列表-->
            <li @click="selectItem(item)" v-for="item in discList" class="item">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl">
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!--// loading组件，在歌单列表没有获取的时候显示这个组件-->
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
    <!--歌单详情页，也就是recommend的二级路由-->
    <!--在访问www.xx.xx/recommend/xx(歌单id)的时候展开-->
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  // 引入自己写的轮播图组件
  import Slider from '../../base/slider/slider'
  // 懒加loading组件
  import Loading from '../../base/loading/loading'
  // 载入自己封装好的scroll组件
  import Scroll from '../../base/scroll/scroll'

  // 这里引入发送跨域请求，所以调用了封装好的recommend中的方法，发送jsonp
  // 这个文件recommend中导出的多个方法，所以用{}结合,分割的形式接收；
  import {getRecommend, getDiscList} from '../../api/recommend'
  // 混入文件
  import {playlistMixin} from '../../common/js/mixin'

  // 这里config是为了获取ERR_OK，也就是0，语义化更强；
  // 也就是说，所有需要判断是否===0的时候，就可以用===ERR_OK；
  import {ERR_OK} from '../../api/config'
  // 拿到vuex中的mutations
  import {mapMutations} from 'vuex'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        // 轮播图数
        recommends: [],
        // 歌单列表的数据
        discList: []
      }
    },
    created() {
      // 在初始化这个vue组件的时候，就发送jsonp跨域请求
      // 获取轮播图
      this._getRecommend()
      // 获取歌单列表
      this._getDiscList()
    },
    methods: {
      // 防止底部被迷你播放器盖住
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      // 因为滚动组件只判断了歌单列表的数据变化后重新计算高度，但是，不能保证歌单列表和轮播图的数据谁先谁后，
      // 所以这里还是要进行图片加载完后进行一次重新计算的方法；
      // 在image加载完后，再次调用滚动组件的重新计算的方法，这样就能保证在图片加载完后，
      // 滚动组件会把图片的高度也计算进去；
      loadImage() {
        if (!this.checkloaded) {
          // 设置一个节流阀，目的是只判断第一个图片加载完成，后边的就不判断了，因为一个图片的高度就够了；
          this.checkloaded = true
          this.$refs.scroll.refresh()
        }
      },
      // 点击歌单列表的某个歌单
      selectItem(item) {
        // 改变路由URL，
        // 并且将当前歌单的id传入，
        // 从而实现打开歌单详情页
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
        // 将当前歌单数据传入vuex
        this.setDisc(item)
        // 如此这般，在点击某个歌单列表的时候，将数据传入vuex，
        // 并且打开二级路由；
        // 那么此时，二级路由disc.vue就能通过访问vuex中的state下的disc拿到歌单数据；
        // 然后再通过歌单的id，发送请求拿到歌曲数据；
      },
      _getRecommend() {
        // 这里调用发送jsonp跨域请求的方法，因为common文件下的js/jsonp.js返回是一个promise方法，
        // 然后api下的recommend.js在调用jsonp.js方法后，又将其返回，所以在调用recommend.js中的方法，
        // 其实最后结果还是调用了jsonp.js的promise方法，所以这里能够使用.then();
        getRecommend().then((res) => {
          // 如果res的code===ERR_OK也就是=0的话，就让this.recommends = res.data.slider；
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider
          }
        })
      },
      // 发送jsonp请求，获取歌单列表
      _getDiscList() {
        getDiscList().then((res) => {
          if (res.code === ERR_OK) {
            this.discList = res.data.list
          }
        })
      },
      ...mapMutations({
        setDisc: 'SET_DISC'
      })
    },
    components: {
      // 挂载组件
      Slider,
      Loading,
      Scroll
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
