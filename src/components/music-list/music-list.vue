<template>
  <div class="music-list">
    <!--// ================顶部区块================-->
    <!--// 返回按钮-->
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <!--// 使用v-html渲染歌手名-->
    <h1 class="title" v-html="title"></h1>
    <!--// 使用计算属性返回一个bgimg的url地址-->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <!--// 随机播放按钮，在有了歌曲数据之后显示-->
        <div ref="playBtn" v-show="songs.length>0" class="play" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <!--// 这个层就是衬与歌曲列表下方的，在歌曲列表向上滑动时，这个层就会盖住背景图-->
    <div class="bg-layer" ref="layer"></div>
    <!--// ===========歌曲列表=============-->
    <scroll :data="songs" @scroll="scroll"
            :listen-scroll="listenScroll" :probe-type="probeType" class="list" ref="list">
      <!--// 为了控制样式，所以在song-list外层加一个div-->
      <div class="song-list-wrapper">
        <!--// 歌曲列表组件-->
        <!--// 传入select函数，然后在点击歌曲的时候，调用这个函数，将歌曲数据和歌曲索引传进来-->
        <!--// 传过来之后，父级拿到歌曲数据和索引，然后传到vuex中管理-->
        <song-list :songs="songs" :rank="rank" @select="selectItem"></song-list>
      </div>
      <!--// loading组件，在没有歌曲列表的时候显示-->
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  // 载入自己写的滚动组件
  import Scroll from 'base/scroll/scroll'
  // 载入loading组件
  import Loading from 'base/loading/loading'
  // 载入歌曲列表组件
  import SongList from 'base/song-list/song-list'
  // 因为JS修改DOM的style还是需要写兼容性的，比如加web-kit前缀，
  // 所以这里就封装了一个方法，将传入的css属性，如果检测到浏览器有私有前缀，
  // 那么就将浏览器加私有前缀再返回回来；
  import {prefixStyle} from 'common/js/dom'
  import {playlistMixin} from 'common/js/mixin'
  // 拿到vuex中的方法 的actions.js中的方法，
  // actions.js的作用就是当需要对mutations.js总的方法进行多次获复杂操作的时候，
  // 就将一些方法封装到actions.js的函数中，而不是在mutation.js直接写函数；
  import {mapActions} from 'vuex'

  // 定义navigationBar的高度
  const RESERVED_HEIGHT = 40
  // 使用自己封装好的解决浏览器私有前缀的方法；
  const transform = prefixStyle('transform')
  const backdrop = prefixStyle('backdrop-filter')

  export default {
    mixins: [playlistMixin],
    // 拿到父级传进来的数据
    props: {
      // 歌手背景图
      bgImage: {
        type: String,
        default: ''
      },
      // 歌曲（多个）
      songs: {
        type: Array,
        default: []
      },
      // 歌手名
      title: {
        type: String,
        default: ''
      },
      //
      rank: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        scrollY: 0
      }
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      }
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
    },
    // mounted钩子，此时，已经将编译好的模板，挂载到了页面指定的容器中显示，也就是渲染好了DOM；
    mounted() {
      // 这里的是为了在向上滑动滚动列表的时候，让滚动列表高度增加，歌手背景图缩小
      // 在现象滑动时，歌手背景图放大的这样类似原生APP的交互效果,
      // 而且这里并没有对scroll组件做什么操作，而是在这个组件的下方设置了一个背景层（class="bg-layer"的div）
      // 这个背景层层级高于背景图，低于scroll组件，
      // 而且scroll组件没有做over-flow:hidden的限制，
      // 所以向上滚动时，scroll组件中的歌曲列表会盖住背景图，那么在scroll中的歌曲列表滚动时，
      // 实时的获取这个歌曲列表的滚动值，然后赋值给背景层的Y轴值，就能达到盖住背景图的视觉样式；

      // 计算背景图的高度，
      this.imageHeight = this.$refs.bgImage.clientHeight
      // 这个minTransalteY就是背景层最大滚动量，背景图高度-40px的结果，然后转成负数;
      // 目的就是把顶部的navbar露出来；
      this.minTransalteY = -this.imageHeight + RESERVED_HEIGHT
      // 将背景图的高度，赋值给scroll组件top值，让scroll组件不盖住背景图
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        // 调用滚动组件内部的重新计算的方法
        this.$refs.list.refresh()
      },
      // 获取歌曲列表组件的Y轴滚动值，
      // 将这个函数传入scroll组件，
      // 由scroll组件调用，然后将scroll组件实时位置作为参数传入；
      // 此时父级music-list.vue就拿到了scroll实时的Y轴位置
      scroll(pos) {
        // 获取到了scroll组件内部元素的实时滚动位置
        this.scrollY = pos.y
      },
      // 左上角返回按钮，返回上个router，返回上一页，也就是歌手列表页；
      back() {
        this.$router.back()
      },
      // 传给歌曲列表组件，歌曲列表组件调用这个方法时，将歌曲数据和索引传过来
      selectItem(item, index) {
        // 此时拿到歌曲数据和索引，当时不需要单个歌曲，而是整个歌曲列表
        // 使用vuex的actions.js映射的方法，将歌曲列表和点击的歌曲索引传过去；
        this.selectPlay({
          list: this.songs,
          index
        })
      },
      // 随机播放
      random() {
        // 将当前歌曲的列表传给vuex的actions.js中的randomPlay方法；
        this.randomPlay({
          // 因为随机播放不需要歌曲索引，那么只需要传歌曲列表即可
          list: this.songs
        })
      },
      // vuex的语法糖，目的是在点击随机播放按钮的时候，
      // 将当前歌曲列表传到vuex中管理，然后展开播放器的时候，
      // 播放器通过vuex中的歌曲数据，进行播放；
      ...mapActions([
        // 拿到vuex的actions.js中的方法
        // 选择播放；
        'selectPlay',
        // 随机播放
        'randomPlay'
      ])
    },
    watch: {
      // 监听scrollY（滚动组件的实时Y轴位置）属性的值，
      // 然后将新值赋值给class="bg-layer"的div，
      // 从而实现：歌曲列表上滑时，盖住背景图的交互效果；
      scrollY(newVal) {
        // max() 方法可返回两个指定的数中带有较大的值的那个数，
        // 使用这个.max方法，就省去了if-else的判断了；
        // 也就是，当scroll组件内部元素滚动值小于我们设置的最大滚动值（背景图减去navbar的高度）的时候，
        // 就让背景层的Y轴偏移固定在我们预设的最大滚动值的位置，以露出navbar;
        // 如果scroll组件内部元素的Y轴值大于了预设的最大滚动值，就让背景层的Y轴===scroll组件内部元素的实时Y轴值；
        let translateY = Math.max(this.minTransalteY, newVal)

        // 设置一个背景图下拉时的缩放比例
        let scale = 1
        // 设置一个z-index值的变量
        let zIndex = 0
        // 设置背景图模糊的值
        let blur = 0
        // 设置一个比例，用scroll内部元素滚动举例 除以背景图的高度，就得到了一个比例，
        // 这个比例就是用来控制缩放的；
        const percent = Math.abs(newVal / this.imageHeight)

        // 判断，如果scroll内部元素滚动值大于0的时候，也就是意味着歌曲列表是向下拉动的，
        // 这个时候就应该将图片的缩放比例重新计算；
        if (newVal > 0) {
          scale = 1 + percent
          // 这里还要增加背景图的z-index，否则图片放大，也还是会在scroll组件的下方
          zIndex = 10
        } else {
          // 这里也就是在歌曲列表的Y轴滚动<=0的时候，也就是上推的时候，
          // 不重新计算背景图的比例，此时背景的比例就是1，也就是不进行缩放；
          // 进行背景模糊；
          // 这里取模糊度的最小值，也就是说，当缩放比例超过1的时候，还是取20这个数值；
          blur = Math.min(20, percent * 20)
        }

        // 将滚动组件的实时Y轴位置赋值给歌曲列表下的背景层class="bg-layer"的Y轴偏移值；
        this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
        // 设置背景模糊，不是给背景层，而是背景层的倒数第一层加这个backdrop样式；
        this.$refs.filter.style[backdrop] = `blur(${blur}px)`

        // 问题：当scroll内部元素滚动到顶部的时候，背景层固定了，但是scroll的z-index高于背景图，
        // 所以就会出现歌曲列表和背景图的navbar部分重叠的BUG，
        // 那么为了解决这个问题，第一个想到的就是提高背景图的z-index，但是这样就会盖住整个背景层和歌曲列表，
        // 所以还要改变背景图的高度；

        // 判断，scroll内部元素滚动值，是否小于我们预设的最大滚动范围；
        if (newVal < this.minTransalteY) {
          // 如果scroll内部元素滚动值小于我们预设的最大滚动范围的时候，
          // 就应该让背景图的高度变为我们预设的navbar的高度；

          // 那么就设置z-index为10（稍后赋值给背景图）
          zIndex = 10
          // 设置背景图的paddingTop为0；
          // 因为初始的时候，这个背景图的PaddingTop为70%，是为了保持7:10的比例；
          // 所以这个背景图一开始是么有height属性的，这里加了这个属性，就需要把paddingTop去掉；
          this.$refs.bgImage.style.paddingTop = 0
          // 并且设置背景图的高度为navbar的高度；
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
          // 让全部随机播放按钮隐藏
          this.$refs.playBtn.style.display = 'none'
        } else {
          // 如果scroll内部元素滚动值不小于预设最大范围值的时候，就将背景图还原；
          // 设置背景图的paddingTop还原为原来70%，并且设置高度为0；
          this.$refs.bgImage.style.paddingTop = '70%'
          // 背景图的高度为0
          this.$refs.bgImage.style.height = 0
          // 显示全部随机播放按钮，这里=空也就是默认状态；
          this.$refs.playBtn.style.display = ''
          // 那么这里就不用再改变ZIndex变量了，因为进入整个函数的时候，就已经将ZIndex设置为0了；
        }

        // 最终根据计算、判断等结果，赋值给背景图的缩放、z-index；
        this.$refs.bgImage.style[transform] = `scale(${scale})`
        this.$refs.bgImage.style.zIndex = zIndex
      }
    },
    components: {
      Scroll,
      Loading,
      SongList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
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
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
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
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
