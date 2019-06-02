<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" :class="{active: currentPageIndex === index }" v-for="(item, index) in dots"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  // 载入这个js文件，用于处理DOM元素，其中就有一个用于给某个DOM添加类名的函数；
  import {addClass} from '../../common/js/dom'

  // 用到了better-scuoll插件，超出区域可以滑动（确保已经安装了，npm i better-scroll）
  import BScroll from 'better-scroll'

  export default {
    name: 'slider',
    // 使用props来控制这个组件的轮播；
    props: {
      loop: { // 是否轮播；
        type: Boolean,
        default: true
      },
      autoPlay: { // 是否自动轮播；
        type: Boolean,
        default: true
      },
      interval: { // 自动轮播间隔；
        type: Number,
        default: 4000
      }
    },
    data() {
      return {
        // 定义一个空数组，存放轮播点；
        dots: [],
        // 设置当前轮播点的序列，默认是0也就是第一个
        currentPageIndex: 0
      }
    },
    // mounted()钩子时，已经将编译好的模板，挂载到了页面指定的容器中显示
    // 因为某些插件、函数需要在DOM元素渲染之后执行，所以放在mounted中执行；
    mounted() {
      setTimeout(() => {
        // 先计算轮播图的宽度尺寸
        this._setSliderWidth()

        // 初始化轮播点
        this._initDots()

        // 在mounted钩子函数中，初始化better-scroll插件；
        // 并且使用延迟20ms的方式，这样能够保证better-scroll插件在元素已经计算好尺寸之后进行初始化；
        this._initSlider()

        // 控制是否自动轮播；
        if (this.autoPlay) {
          this._play()
        }
      }, 20)

      // 监听窗口的缩放事件，如果缩放了，那么就重新执行设置轮播图宽度的函数
      window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        this._setSliderWidth(true)
        // 重新计算，也是better-scroll的API
        this.slider.refresh()
      })
    },
    destroyed() { // Vue 实例销毁后调用
      // 清除定时器
      clearTimeout(this.timer)
    },
    methods: {
      // 设置轮播图、轮播图容器的宽度
      _setSliderWidth(isResize) {
        // 获取轮播图的子元素，也就是每个轮播图
        this.children = this.$refs.sliderGroup.children

        let width = 0
        // 拿到轮播图最外成容器的宽度，是用clientWidth就能获取；
        let sliderWidth = this.$refs.slider.clientWidth

        // 循环每个子元素
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]

          // 调用自己写的 addClass函数 给每个元素添加类名，达到控制样式的目的；
          // 这个方法就是判断是否有这个类名，如果有就不做操作，如果没有就push这个类名；
          addClass(child, 'slider-item')

          // 设置每个子元素的宽度，等于最外层容器的宽度
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        // 如果需要循环播放，那么就需要设置轮播图容器（不是最外层的那个容器） 左右各有一个空的轮播图，保证循环不出错；
        // 那么让window重新缩放时调用这个_setSliderWidth()的时候，isResize就是true，也就是说，不会重新添加左右两个宽度；
        if (this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        // 设置轮播图容器的宽度
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      // 初始化better-scroll插件
      _initSlider() {
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true, // 横向滑动
          scrollY: false, // 纵向滑动
          momentum: false, // 惯性
          snap: true, // 是否按整页滚动，这个是翻页的关键；
          snapLoop: this.loop, // 循环滚动；
          snapThreshold: 0.3, // 循环时间
          snapSpeed: 400 // 滚动时间
        })

        // 当每张轮播图滚动结束后，让pageIndex++，用于控制轮播点的样式
        this.slider.on('scrollEnd', () => {
          let pageIndex = this.slider.getCurrentPage().pageX
          if (this.loop) {
            pageIndex -= 1
          }
          this.currentPageIndex = pageIndex

          // 这里还要判断，如果是自动播放的话，先要清除setTimeout，然后再次调用自动轮播；
          // 这样就能达到，手动拖拽或者轮播图结束后，继续这个自动轮播的功能
          if (this.autoPlay) {
            clearTimeout(this.timer)
            this._play()
          }
        })
      },
      // 初始化轮播点的个数；
      _initDots() {
        this.dots = new Array(this.children.length)
      },
      // 自动轮播
      _play() {
        let pageIndex = this.currentPageIndex + 1
        if (this.loop) {
          pageIndex += 1
        }
        // 自动轮播用setTimeout控制；
        this.timer = setTimeout(() => {
          // 使用better-scroll的API控制切换
          this.slider.goToPage(pageIndex, 0, 400)
          // 间隔时间，用设置好的变量控制；
        }, this.interval)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
