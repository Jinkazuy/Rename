<!--搜索结果列表-->
<template>
  <!--滚动组件-->
  <scroll ref="suggest"
          class="suggest"
          :data="result"
          :pullup="pullup"
          :beforeScroll="beforeScroll"
          @scrollToEnd="searchMore"
          @beforeScroll="listScroll"
  >
    <ul class="suggest-list">
      <!--点击某个搜索结果，打开歌手详情页，或者播放器-->
      <li @click="selectItem(item)" class="suggest-item" v-for="item in result">
        <!--icon，为了就是判断搜索结果数据的第一条是否有歌手信息，如果有，就将这条数据的左边变成小人头像的icon-->
        <!--如果不是歌手数据的话，就是歌曲数据，那么就在左侧渲染音符的icon-->
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <!--歌曲名、歌手名-->
        <div class="name">
          <!--这里的函数是为了判断当前循环的条目是歌手信息还是歌曲信息-->
          <!--从而渲染不同的的样式-->
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <!--上推刷新时，这个loading组件显示-->
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <!--暂无搜索结果组件-->
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <!--这里的title并没有用: 也就是没有用v-bind绑定，因为是死数据，不用修改，也就不用绑定了-->
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  // 自己封装的滚动组件
  import Scroll from 'base/scroll/scroll'
  // loading动画组件
  import Loading from 'base/loading/loading'
  // 暂无搜索结果组件
  import NoResult from 'base/no-result/no-result'
  // 发送jsonp请求的文件
  import {search} from 'api/search'
  // ERR_OK===0
  import {ERR_OK} from 'api/config'
  // 格式化歌曲的方法
  import {createSong} from 'common/js/song'
  // 拿到vuex下的mutations和actions
  import {mapMutations, mapActions} from 'vuex'
  // 格式化歌手信息的方法
  import Singer from 'common/js/singer'

  const TYPE_SINGER = 'singer'
  // 每页返回的最大条目数值
  const perpage = 20

  export default {
    props: {
      showSinger: {
        type: Boolean,
        default: true
      },
      // 搜索关键词
      query: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        // 记录当前请求页数
        page: 1,
        // 传入scroll组件的，用于监听是否加载更多数据
        pullup: true,
        beforeScroll: true,
        // 是否加载更多
        hasMore: true,
        // 搜索的结果
        result: []
      }
    },
    methods: {
      // 给父级用的方法，重新计算本组件的scroll组件的高度；
      refresh() {
        this.$refs.suggest.refresh()
      },
      // 发送jsonp请求
      // 获取搜索结果数据
      search() {
        this.page = 1
        // 将加载更多的节流阀打开
        // 这样的话,只能是在第一次请求数据后,才能执行发送请求更多的函数;
        this.hasMore = true
        // 将滚动组件的位置设置为x0 y0，调用自己封装的滚动组件的方法，
        // 目的是，当每次搜索关键词改变的时候，会调用search这个方法，也就需要重置搜索结果组件的位置；
        this.$refs.suggest.scrollTo(0, 0)
        // 调用api/search.js下的方法，发送jsonp请求，获取搜索结果
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          // code===0，获取成功
          if (res.code === ERR_OK) {
            // 此时的数据还不能直接用，所以调用 格式化搜索结果数据的函数
            // 拿到的就是格式化后的搜索结果列表数据；
            this.result = this._genResult(res.data)
            // 这里是用来判断,是否有更多数据
            this._checkMore(res.data)
          }
        })
      },
      // 上推加载 显示更多搜索结果
      searchMore() {
        // 如果标识符为false，说明没有更多数据了；
        if (!this.hasMore) {
          return
        }
        // 让page+1
        this.page++
        // 调用api/search.js下的方法，发送jsonp请求，获取搜索结果
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          // code====0，拿到数据
          if (res.code === ERR_OK) {
            // 因为是更多的搜索，所以拿到搜索结果，使用concat方法，将搜索更多结果 与之前的搜索结果 的数组合并；
            this.result = this.result.concat(this._genResult(res.data))
            // 每次拿到结果，就判断一下是否有更多数据，从而控制this.hasMore 是true 还是false
            this._checkMore(res.data)
          }
        })
      },
      // 当滚动组件滚动时
      // 调用父级传入的listScroll
      // 从而实现输入框失去焦点，让键盘隐藏；
      // 这个listScroll函数由scroll的beforeScrollStart事件触发；
      // 也就是说，给scroll组件绑定了beforeScroll函数，事件处理函数是listScroll；
      // 那么当scroll监听附件如果传入listScroll的话，那么就会给scroll组件注册beforeScrollStart
      // 也就是在开始触摸&滑动之前执行 这个listScroll函数；
      listScroll() {
        // 这个函数中，又调用了它的父级传入的listScroll函数
        this.$emit('listScroll')
        // 那么这个函数的最终目的就是 调用 input.blur() 这个是input原生的函数，让输入框失去焦点，隐藏键盘；
      },
      // 点击搜索结果的某个条目
      selectItem(item) {
        // 判断点击条目的type属性
        if (item.type === TYPE_SINGER) {
          // 如果type===TYPE_SINGER，
          // 说明当前点击的条目是歌手信息，而不是歌曲信息
          // 调用格式化歌手信息的方法
          const singer = new Singer({
            id: item.singermid,
            name: item.singername
          })
          // 跳转路由，打开歌手详情页二级路由；
          this.$router.push({
            path: `/search/${singer.id}`
          })
          // 拿到vuex映射的方法，设置当前歌手
          this.setSinger(singer)
        } else {
          // 如果点击时，没有歌手属性的话，说明点击的是一条歌曲条目，
          // 那么就设置vuex中的歌曲，
          // 当播放器组件监听到vuex中歌曲的变化时，就会展开了，
          // 因为播放器组件是在app.vue下的二级路由，
          // 所以这里只需要把歌曲传给vuex即可实现打开播放器组件

          // 但是，这里的逻辑有些复杂，是因为这里点击的是单独的一首歌曲，而不是一个列表中的一首歌曲
          // 因为逻辑复杂，所以就不能封装在store/mutations.js文件下了；
          // 所以这里在store/actions.js中封装了一个方法；
          // 用于将当前点击的单个的一个歌曲，将某一首歌曲，插入到当前播放歌曲的后边；
          this.insertSong(item)
          // 那么在当前播放列表的数据改变后，
          // 播放器组件监听到vuex中的数据变化 播放器组件也会展开并播放歌曲
        }
        // 这个方法，向父级search.vue派发事件，将当前点击的关键词传入，也就是搜索关键词；
        // search.vue 利用mixin.js混入 调用的是 commone/js/cache.js 文件中的函数
        // 目的是：点击的元素时 将当前的搜索关键词 放到搜索历史中，也就是本地存储；
        // 之所以不在这里设置历史搜索记录，是因为在这个组件的父级组件中，已经引入了mixin.js的函数，
        // 所以这里就不需要再次引入mixin.js的函数，也就是将相关操作都给到父级执行即可；
        this.$emit('select', item)
      },
      // 获取歌曲名称
      getDisplayName(item) {
        // 这里判断type的目的还是 因为 如果匹配到某个歌手，那么就渲染不同的样式
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          // 如果不是歌手，那么就渲染歌曲名-歌手名
          return `${item.name}-${item.singer}`
        }
      },
      // 设置搜索结果的icon
      getIconCls(item) {
        // 判断传入的type，目的是判断循环的时候是否是歌手信息，
        // 因为根据搜索关键词，如果匹配到了某个歌手，那么第一条数据就会展示歌手信息
        // 如果是歌手信息，那么渲染的就是歌手的icon；
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      // 格式化搜索结果数据的函数
      _genResult(data) {
        // 临时数组
        let ret = []
        // 如果请求结果中，包含这个zhida字段，
        // 说明搜索关键词匹配到了某个歌手，那么就将歌手的数据展示到第一条数据中；
        // 那么就将整条数据插入到 临时数组中；
        if (data.zhida && data.zhida.singerid) {
          // 这个...是扩展运算符，目的是把这些属性添加到同一个对象上，类似合并对象；
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        // 如果data中song字段，也就是歌曲数据
        if (data.song) {
          // 那么就调用格式化歌曲的方法，
          // 最终得到歌曲列表的数组；
          // concat() 方法用于连接两个或多个数组。
          // 该方法不会改变现有的数组，而仅仅会返回被连接数组的一个副本。
          ret = ret.concat(this._normalizeSongs(data.song.list))
        }
        return ret
      },
      // 默认歌曲列表
      _normalizeSongs(list) {
        let ret = []
        list.forEach((musicData) => {
          if (musicData.songid && musicData.albummid) {
            // 格式化歌曲的方法
            ret.push(createSong(musicData))
          }
        })
        return ret
      },
      // 判断是否有更多的数据
      _checkMore(data) {
        const song = data.song
        // 判断,
        // 如果当前请求的结果数量数量为0
        // 或者
        // 当前歌曲的数量 + 当前的页数 * 每一页返回最大的条目数（20）
        // 已经大于了 totalnum（返回项中的某个值，代表 关键词对应搜索结果总数）
        // 说明这个关键词的结果已经全部请求完了，不能执行更多搜索了；
        if (!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum) {
          // 那么就将搜索更多的节流阀设置为false，在上推刷新的时候，就不能执行 searchMore 这个函数了；
          this.hasMore = false
        }
      },
      // vuex提供的语法糖，映射vuex中的函数
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    },
    watch: {
      // 监听query
      // 也就是父级传进来的搜索关键词，
      // 当搜索关机键词发生改变时
      // 发送jsonp请求，获取搜索结果数据；
      query(newQuery) {
        this.search(newQuery)
      }
    },
    components: {
      Scroll,
      Loading,
      NoResult
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
