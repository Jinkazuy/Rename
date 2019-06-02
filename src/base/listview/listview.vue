<template>
  <!--调用封装好的用于滚动的组件-->
  <!--data，用于滚动组件监听数据变化时，执行重新计算高度的函数-->
  <!--并且将listen-scroll传入，让滚动组件监听滚动事件-->
  <scroll @scroll="scroll"
          :listen-scroll="listenScroll"
          :probe-type="probeType"
          :data="data"
          class="listview"
          ref="listview">
    <!--歌手列表，通过a-z索引区分-->
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <!--索引字母-->
        <h2 class="list-group-title">{{group.title}}</h2>
        <!--歌手列表-->
        <uL>
          <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
            <!--图片懒加载，用v-lazy代替:src-->
            <img class="avatar" v-lazy="item.avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </uL>
      </li>
    </ul>
    <!--右侧索引a-z列表-->
    <!--绑定touchstart事件，用于点击时将歌手列表滚动组件定位到某个元素的位置-->
    <!--绑定touchmove事件，用于拖动索引列表时，将滚动组件定位到某个位置，并且需要阻止冒泡-->
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <!--遍历每一项-->
        <!--判断currentIndex是否等于本个li的索引值，如果是就添加current类名，实现高亮；-->
        <li v-for="(item, index) in shortcutList" :data-index="index" class="item"
            :class="{'current':currentIndex===index}">{{item}}

        </li>
      </ul>
    </div>
    <!--顶部固定标题-->
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}} </div>
    </div>
    <!--loading组件-->
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  // 载入封装好的用于滚动的vue组件
  import Scroll from 'base/scroll/scroll'

  // 载入封装好的用于显示转圈真在加载的vue组件
  import Loading from 'base/loading/loading'

  // 载入封装好的，用于处理DOM操作的js文件
  import {getData} from 'common/js/dom'

  const TITLE_HEIGHT = 30

  // 记录右侧每个索引的高度，用于在滑动时计算高度；
  const ANCHOR_HEIGHT = 18

  export default {
    props: {
      // 拿到父级传入的，已经经过a-z排序的歌手列表数据
      data: {
        type: Array,
        default: []
      }
    },
    // 计算属性
    computed: {
      // 处理右侧索引列表的数据
      shortcutList() {
        // 使用数组的.map()方法，最终得到一个['热', 'A', 'b', ...]的数组；然后将这个新的数组返回给shortcutList()；
        // .map()支持函数，函数的第一个参数就是被遍历的值，这里也就是 group 这个形参；
        return this.data.map((group) => {
          // 因为热门只显示热这一个字，所以用substr截取1个字符串；
          // 返回的值，就是当前值经过处理后的数组的值；
          return group.title.substr(0, 1)
        })
      },
      // 计算顶部固定标题
      fixedTitle() {
        // 如果当前滚动组件的滚动值不是负数，也就是说没有滚动
        // 就不显示
        if (this.scrollY > 0) {
          return ''
        }
        // 如果小于0也就是负数或0的话，就显示这个顶部的固定标题
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    data() {
      return {
        scrollY: -1, // 滚动组件当前的滚动之
        currentIndex: 0, // 右侧索引列表，当前索引值
        diff: -1 // 顶部固定标题的偏移值；
      }
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
      // 用于记录点击右侧列表时的位置
      this.touch = {}
      this.listHeight = []
    },
    methods: {
      selectItem(item) {
        // 当每个歌手列表被点击的时候，调用父级传入的事件，并且就将该元素传入；
        this.$emit('select', item)
      },
      // 当右侧索引列表触摸开始时，将滚动组件定位到某个位置；
      onShortcutTouchStart(e) {
        // 绑定事件函数的第一个参数就是当前的DOM元素，也就是：e就是当前DOM元素；
        // 调用getData这个封装好的js文件中的某个方法，得到当前DOM元素的某个属性，这里获得就是index索引
        let anchorIndex = getData(e.target, 'index')
        // 一开始点击的时候，记录当前点击的位置；
        let firstTouch = e.touches[0]
        // 记录当前点击右侧列表时的Y轴的值
        this.touch.y1 = firstTouch.pageY
        // 记录在点击时，点击的是第几个索引字母；
        this.touch.anchorIndex = anchorIndex
        // 让组件滚动到某个位置
        this._scrollTo(anchorIndex)
      },
      // 处理滚动右侧索引列表，滑动时，将滚动组件定位到某个位置；
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0]
        // 记录滑动后Y轴的值
        this.touch.y2 = firstTouch.pageY
        // 然后用滑动后的Y轴的值  减去  刚开始触摸时候的值，得到滑动后的偏移值
        // 再除以每个索引元素的高度，然后再向下取整，用 |0 等价于Math.floor;
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        // 然后用开始点击时的索引 加上偏移的值，就能得到滑动后的索引的值
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta
        // 然后用这个索引值传入处理滚动到某个位置的函数，就能实现拖动右侧索引列表，左侧歌手列表同时滚动的效果
        this._scrollTo(anchorIndex)
      },
      refresh() {
        this.$refs.listview.refresh()
      },
      // 传给滚动组件的事件，滚动组件调用这个父级传入的函数，并且将滚动组件的位置传入，
      // 此时父级就能拿到滚动组件的位置了，用于制作与右侧索引a-z列表联动的效果；
      scroll(pos) {
        // 此时滚动组件调用父级传入的scroll函数，传入pos也就是滚动组件滚动的位置
        // 然后再赋值给this.scrollY，就拿到了滚动组件在滚动的实时的Y轴值
        this.scrollY = pos.y
      },
      // 计算左侧歌手列表的每个分组的高度，使用watch监听时，触发这个函数；
      _calculateHeight() {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          this.listHeight.push(height)
        }
      },
      // 处理滚动组件指定滚动到某个元素的位置的函数；
      _scrollTo(index) {
        if (!index && index !== 0) {
          return
        }
        // 因为右侧索引列表上下各有一个空的内容（UI为了美化，所以这里将这两个元素设置一下）
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        // 点击右侧列表的时候并没有触发滚动事件，这时候需要手动调整位置，达到右侧点击时也高亮；
        this.scrollY = -this.listHeight[index]
        // 调用scroll组件中封装好的方法，让滚动组件定位到某个元素的位置，后边的0是缓动时间；
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      }
    },
    watch: {
      data() {
        // 计算左侧歌手列表的每个分组的高度，需要延迟20毫秒执行；
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      // 对比当前滚动组件的位置，然后用每个歌手组的位置进行对比，从而让右侧a-z索引列表实现高亮；
      // 监听属性的第一个参数就是newValue，第二个参数是oldValue，这里是用到了变化后的newValue；
      scrollY(newY) {
        const listHeight = this.listHeight
        // 当滚动到顶部，newY>0
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 在中间部分滚动
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            // 顶部固定标题的处理，达到某个标题滚动到与顶部固定标题贴近的时候，将固定标题顶上去的效果；
            this.diff = height2 + newY
            return
          }
        }
        // 当滚动到底部，且-newY大于最后一个元素的上限
        this.currentIndex = listHeight.length - 2
      },
      // 监听固定标题的偏移值，达到某个标题滚动到与顶部固定标题贴近的时候，将固定标题顶上去的效果
      diff(newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
      }
    },
    components: {
      // 注册滚动组件
      Scroll,
      // 注册加载组件
      Loading
    }
  }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
