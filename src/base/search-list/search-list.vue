<!--搜索历史记录列表组件-->
<template>
  <div class="search-list" v-show="searches.length">
    <!--用transition-group标签,这样就能够实现多个元素的动画效果-->
    <transition-group name="list" tag="ul">
      <!--点击每个列表内容时,同样将内容放到搜索框内容,发送jsonp请求-->
      <li :key="item" class="search-item" @click="selectItem(item)" v-for="item in searches">
        <span class="text">{{item}}</span>
        <!--点击右侧垃圾桶icon,删除这条搜索历史记录-->
        <span class="icon" @click.stop="deleteOne(item)">
          <i class="icon-delete"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      // 拿到父级传入的搜索历史记录数据
      searches: {
        type: Array,
        default: []
      }
    },
    methods: {
      // 发送jsonp请求
      // 点击某个搜索历史记录条目，改变搜索关键词，从而发送jsonp请求
      selectItem(item) {
        // 调用父级传入的方法,将点击时的搜索关键词传给父级
        // 父级组件search.vue 会调用 mixin.js中的 addQuery
        // addQuery 会将传入的 关键词调用 search-box.vue 的 setQuery 函数；
        // 此时search-box.vue拿到搜索关键词，
        // 而父级组件 search.vue并没有赋值给search.vue this.query，
        // 所以suggest.vue 组件不会监听到 query的变化，也就不会发送jsonp请求；
        // search-box.vue 的 setQuery 函数 会将搜索框内的文案替换成 搜索关键词；
        // search-box.vue watch 输入框内容的变化，如果有变化，经过多200毫秒后
        // 调用父级的 queryChange 将搜索关键词传给父级；
        // 父级queryChange函数中  this.query = query ，此时的父级才是真正拿到了搜过关键词；
        // 此时父级拿到了搜索关键词，然后传给 搜索结果列表suggest.vue 组件，搜索结果列表组件 watch 搜索关键词变化，
        // 调用 api/search.js 下的 发送jsonp请求 的函数；
        this.$emit('select', item)
      },
      // 删除某个历史记录关键词
      deleteOne(item) {
        // 点击右侧垃圾桶icon，触发父级组件 search.vue 的 deleteSearchHistory函数；
        // 然后search.vue 会通过mixin.js混入中 拿到映射actios.js 中的 deleteSearchHistory 函数；
        // actios.js 中的 deleteSearchHistory 函数会调用 js/cache.js 中的 deleteSearch函数；
        // deleteSearch函数 会查找当前传入的那1条搜索历史记录，然后拿到localstorage中的全搜索历史记录做对比，
        // 找到那1条搜索历史记录，删除掉1条，再将删除后的数组重新覆盖localstorage中的搜索历史记录，
        // 此时 js/cache.js 中的 deleteSearch函数 会返回 最新的搜索历史记录数组，
        // 然后deleteSearchHistory拿到这个最新的搜索历史记录，赋值给state下的searchHistory；
        // 逻辑就是：先拿到localstorage的历史搜索数据，然后删除一条后，覆盖localstorage的数据，
        // 然后再同步（重新赋值）state下的历史搜索数据；
        this.$emit('delete', item)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .search-list
    .search-item
      display: flex
      align-items: center
      height: 40px
      overflow: hidden
      &.list-enter-active, &.list-leave-active
        transition: all 0.1s
      &.list-enter, &.list-leave-to
        height: 0
      .text
        flex: 1
        color: $color-text-l
      .icon
        extend-click()
        .icon-delete
          font-size: $font-size-small
          color: $color-text-d
</style>
