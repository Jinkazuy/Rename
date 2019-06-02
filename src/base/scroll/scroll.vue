<template>
  <div ref="wrapper">
    <!-- // 这个slot是插入模块，也就是在调用的时候，可以在这里插入HTML代码-->
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'

  export default {
    props: {
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      // 监听滚动，默认是不监听；
      listenScroll: {
        type: Boolean,
        default: false
      },
      data: {
        // 默认数据，一开始的时候是没有数据，
        // 那么在获取到数据后，需要使用refresh()这个better-scroll提供的API；
        type: Array,
        default: null
      },
      pullup: {
        type: Boolean,
        default: false
      },
      beforeScroll: {
        type: Boolean,
        default: false
      },
      refreshDelay: {
        type: Number,
        default: 20
      }
    },
    mounted() {
      // 在渲染好DOM后初始化better-scroll组件
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    methods: {

      // 初始化better-scroll组件
      _initScroll() {
        // 如果没有这个wrapper的时候，就不需要调用better-scroll组件了，所以这里进行判断；
        if (!this.$refs.wrapper) {
          return
        }
        // 初始化
        this.scroll = new BScroll(this.$refs.wrapper, {
          // 这里的配置项，就可以用外部调用的时候，监听父级 props 传入的参数来控制了；
          probeType: this.probeType,
          click: this.click
        })
        // 监听滚动
        // 如果父级调用这个滚动组件时，传入了监听为true，那么就监听这个组件的滚动；
        // 目的是歌手列表与右侧a-z索引列表联动的效果；
        if (this.listenScroll) {
          // 因为better-scroll会改变this指向，所以这里用me保存这个vue组件的this；
          let me = this
          // 监听滚动事件，第二个参数传入pos参数（就是当前滚动的位置），然后用父级传入的函数；
          this.scroll.on('scroll', (pos) => {
            me.$emit('scroll', pos)
          })
        }

        if (this.pullup) {
          this.scroll.on('scrollEnd', () => {
            if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
              this.$emit('scrollToEnd')
            }
          })
        }

        if (this.beforeScroll) {
          this.scroll.on('beforeScrollStart', () => {
            this.$emit('beforeScroll')
          })
        }
      },
      // 代理的函数，那么就可以通过父级调用这些函数，从而执行函数中的操作；
      disable() {
        // 如果 this.scroll 存在，就可以调用 && 后边的函数；
        this.scroll && this.scroll.disable()
      },
      enable() {
        this.scroll && this.scroll.enable()
      },
      refresh() { // 重新计算
        this.scroll && this.scroll.refresh()
      },
      scrollTo() {  // 调用better-scroll的.scrollTo方法，目的是让当前组件滚动到某个指定位置；
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      scrollToElement() { // 调用better-scroll的.scrollTo方法，目的是让当前组件滚动到某个指定的元素的位置；
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      }
    },
    watch: {
      // 监听data如果，data中数据发生变化，就调用重新计算的函数；
      data() {
        setTimeout(() => {
          this.refresh()
        }, this.refreshDelay)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
