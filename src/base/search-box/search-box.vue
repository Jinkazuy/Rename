<!--搜索框组件-->
<template>
  <div class="search-box">
    <!--icon-->
    <i class="icon-search"></i>
    <!--输入框-->
    <!--使用v-model双向绑定-->
    <input ref="query" v-model="query" class="box" :placeholder="placeholder"/>
    <!--清空按钮-->
    <!--v-show监听this.query-->
    <i @click="clear" v-show="query" class="icon-dismiss"></i>
  </div>
</template>

<script type="text/ecmascript-6">
  import {debounce} from 'common/js/util'

  export default {
    props: {
      // 默认提示字符
      // 监听父级传入,默认有内容,如果父级么有传入,那么调用默认值;
      placeholder: {
        type: String,
        default: '搜索歌曲、歌手'
      }
    },
    data() {
      return {
        // 搜索的字符串
        query: ''
      }
    },
    methods: {
      // 清空输入框内容
      clear() {
        this.query = ''
      },
      // 设置搜索关键词
      // 向外派发用
      setQuery(query) {
        // 调用此函数后,搜索框内容双向绑定,就会改变搜索框中的内容
        this.query = query
      },
      // 让搜索框失去焦点
      // 因为在移动端，input元素在获取焦点的时候，是会弹出键盘的，
      // 所以在不需要键盘的时候，调用inputDOM.blur()失去焦点
      blur() {
        this.$refs.query.blur()
      }
    },
    created() {
      // $watch和watch:{ 'query':function(newVal, oldVal) }效果一样
      // 使用$watch,监听query；
      // 这样，才this.query发生改变的时候，就会执行这个debounce函数；
      // 调用 common/js/util 下的 debounce函数，
      // 目的是延迟200毫秒在发送jsonp请求，起到节流的作用；
      // 否则每次 query，也就是搜索关键词改变的时候都会频繁的发送jsonp请求
      // 那么设置200毫秒后发送，就是为了等待输入结束；
      this.$watch('query', debounce((newQuery) => {
        // 这个newQuery并不是给debounce的，而是给this.$emit('queryChange', newQuery)；
        // 这个的newQuery只是queryChange的形参，形参，形参；
        // 因为debounce会返回一个function，
        // 这个function 会用...args 这种剩余函数的方法，也就是接收到query的newVal 和 oldVal；
        // 然后个返回的function中，会调用 (newQuery) => {this.$emit('queryChange', newQuery)} 函数；
        // 并且设置延迟，然后还会将接收到的newVal 和 oldVal传给 queryChange 的 newQuery
        // 调用父级传入的query函数，将新的搜索关键词newQuery 传给父级，也就是search.vue；
        // 这里唯一让JK懵的就是一个隐藏的返回的函数，这个函数会代替 debounce 拿到 query的newVal 和 oldVal；
        this.$emit('queryChange', newQuery)
      }, 200))
    }

    // // JKJKJKJKJKJKJKJKJKJKJKJKJK 注意！
    // // 实现方法2
    // // 另外，如果不想在created中使用watch；
    // watch: {
    //   // 这里就不能用箭头函数了，因为会改变this指向
    //   'query': debounce(function(newQuery) {
    //     console.log(this)
    //     this.$emit('queryChange', newQuery)
    //   }, 200)
    // }
    //
    // // JKJKJKJKJKJKJKJKJKJKJKJKJK 注意！
    // // 实现方法3
    // // 另外一种方法，就是直接在这个组件中写；
    // // 所以就不用引入的 src/common/js/util.js 中的函数了；
    // // 实现效果和把处理放在 util.js一样，但这样不太高级不装逼；
    // created() {
    //   this.$watch('query', (newQuery) => {
    //     let timer
    //     let thet = this
    //     if (timer) {
    //       clearTimeout(timer)
    //     }
    //     timer = setTimeout(() => {
    //       thet.$emit('queryChange', newQuery)
    //     }, 200)
    //   })
    // }
    // // JKJKJKJKJKJKJKJKJKJKJKJKJK 注意！
    // // 实现方法4
    // // 同样的，如果不想在created中实现，也可以写在watch中，但不能用箭头语法，否则会改变箭头语法；
    // // 所以就不用引入的 src/common/js/util.js 中的函数了；
    // watch: {
    //   'query': function(newQuery) {
    //     let timer
    //     let thet = this
    //     if (timer) {
    //       clearTimeout(timer)
    //     }
    //     timer = setTimeout(() => {
    //       thet.$emit('queryChange', newQuery)
    //     }, 200)
    //   }
    // }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>
