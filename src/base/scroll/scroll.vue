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
      // 拿到父级传入的，用于上推刷新的变量标识符
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
        // 上推刷新
        // 如果父级传入了pullup===true的话，
        // 说明调用滚动组件的父级组件，需要上推刷新的操作；
        // 然后给scroll这个组件注册 scrollEnd事件；
        if (this.pullup) {
          // 注册scrollEnd事件，这是better-scroll第三方包提供的事件；
          // 其实这个scrollEnd事件,是松手的时候,而不是真的滚动结束时候;
          this.scroll.on('scrollEnd', () => {
            // 判断，如果当前的scroll的y轴值 小于了 这个scroll组件的最大Y轴值+50,
            // 使用小于号判断，是因为向上滑动的话 ，移动的是y轴，也就是 负数；
            // 那么说明用户此时已经上推scroll了超过50px;
            if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
              // 调用父级传入的方法 scrollToEnd 方法；
              // 也就是触发 suggest.vue中的 searchMore 函数；
              // 实现更多数据的请求；
              this.$emit('scrollToEnd')
            }
          })
        }
        // 下拉刷新
        // 那么其实这里并没有做下拉刷新的操作，不过JK想实现的话，其实就更改判断条件即可，
        // 将判断条件改为，scroll组件滚动结束时，Y轴的滚动值是否大于50，说明用户是下拉的；

        // 滚动监听
        // 这是为了让输入框失去焦点，隐藏键盘；
        if (this.beforeScroll) {
          // 如果父级传入了beforeScroll的函数，那么说明这个父级是需要隐藏键盘的
          // 那么就注册 给scroll组件注册 beforeScrollStart （better-scroll提供的事件）
          // 也就是在手指刚刚触摸，在滚动之前触发这个事件的处理函数
          this.scroll.on('beforeScrollStart', () => {
            // 调用父级的beforeScroll函数
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
