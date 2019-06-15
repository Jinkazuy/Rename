<template>
  <transition name="list-fade">
    <!--// 背景遮罩层，这个组件整个是在遮罩层之上的，-->
    <!--// 所以点击背景层的空白处，也隐藏这个组件；-->
    <div class="playlist" @click="hide" v-show="showFlag">
      <!--// 这个list-wrapper才是主要内容-->
      <!--// 为了防止点击这个主要内容 误触发了 遮罩层的 click 事件，导致隐藏这个组件；-->
      <!--// 所以给这个元素一个click.stop防止冒泡即可，-->
      <!--// 这样点击这个元素不会触发任何函数，而且防止冒泡就不会穿透了；-->
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <!--播放模式，点击切换-->
            <!--因为这个播放模式和全屏播放器组件重复了，所以将控制播放模式的函数封装到mixin.js中-->
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <!--// 清空所有，小垃圾桶icon-->
            <!--// 点击调用弹窗组件-->
            <span class="clear" @click="showConfirm"><i class="icon-clear"></i></span>
          </h1>
        </div>
        <!--// 歌曲列表-->
        <!--// 长度可能会超出组件，所以用到自己封装的滚动组件-->
        <scroll ref="listContent" :data="sequenceList" class="list-content" :refreshDelay="refreshDelay">
          <!--// 因为是v-for渲染出来的DOM，所以用<transiton-group> 标签实现动画-->
          <!--// 这个动画是当删除的时候，移除某个DOM用的动画-->
          <transition-group name="list" tag="ul">
            <!--这里没有使用歌曲列表组件song-list.vue，是因为这里的结构与歌曲列表组件差异较大且通用性不高，所以直接写在这里-->
            <!--// 遍历顺序列表 sequenceList 在mixin.js混入了...mapGetters，映射了vuex中的 sequenceList-->
            <!--// v-for记得要绑定 :key，否则当DOM发生变化的时候，再出发DOM元素的事件会出现bug-->
            <!--// 给每个歌曲添加点击事件，将当前歌曲和歌曲索引传入-->
            <li :key="item.id" ref="listItem" class="item" v-for="(item,index) in sequenceList"
                @click="selectItem(item,index)">
              <!--// 当前播放歌曲-->
              <!--// 判断是否是当前播放的歌曲，如果是，就渲染icon-play类名-->
              <!--// 也就是播放的小icon-->
              <i class="current" :class="getCurrentIcon(item)"></i>
              <!--// 歌曲名-->
              <span class="text">{{item.name}}</span>
              <!--// 收藏按钮-->
              <!--// @click，调用mixin.js中切换收藏歌曲的方法toggleFavorite；-->
              <span @click.stop="toggleFavorite(item)" class="like">
                <!--// :class，调用mixin.js中的getFavoriteIcon，查找当前歌曲是否在收藏列表中，从而渲染icon样式-->
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <!--点击删除某个歌曲-->
              <!--点击某个歌曲的x icon，将当前歌曲数据传入-->
              <!--同样需要防止事件冒泡，因为在删除按钮下，还有这个li的点击事件-->
              <span @click.stop="deleteOne(item)" class="delete">
                <!--删除icon-->
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <!--添加歌曲到队列按钮-->
        <div class="list-operate">
          <div @click="addSong" class="add">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <!--// 关闭按钮-->
        <div @click="hide" class="list-close">
          <span>关闭</span>
        </div>
      </div>
      <!--// 弹窗组件-->
      <!--点击弹窗的确认清除按钮，执行父级传入的@confirm，也就是confirmClear-->
      <confirm ref="confirm" @confirm="confirmClear" text="是否清空播放列表" confirmBtnText="清空"></confirm>
      <!--添加歌曲到队列组件-->
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  // 拿到vuex中的actions
  import {mapActions} from 'vuex'
  // 播放模式 0 1 2
  import {playMode} from 'common/js/config'
  // 引入自己写的scroll组件
  import Scroll from 'base/scroll/scroll'
  // 引入弹窗组件
  import Confirm from 'base/confirm/confirm'
  // 添加歌曲到队列组件
  import AddSong from 'components/add-song/add-song'
  // 拿到混入文件，混入mixin.js 中 playerMixin 的代码；
  import {playerMixin} from 'common/js/mixin'

  export default {
    // 挂载混入
    mixins: [playerMixin],
    data() {
      return {
        // 是否显示这个playlist.vue组件
        showFlag: false,
        refreshDelay: 120
      }
    },
    computed: {
      // 监听计算属性
      // 返回播放模式对应的文案
      modeText() {
        return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.random ? '随机播放' : '单曲循环'
      }
    },
    methods: {
      // 显示本组件
      show() {
        // 设置标识符为true，显示本组件
        this.showFlag = true
        setTimeout(() => {
          // 因为组件v-show=true的时候，这个组件的DOM才重新接收数据，
          // 但是scroll组件在这个组件初始化的时候已经计算了高度，所以不能滚动
          // 所以这里手动调用 scroll组件的 重新计算函数
          this.$refs.listContent.refresh()
          // 调用 将scroll滚动位置设置到当前播放的歌曲的位置 的函数
          // 这样，当前播放的歌曲，始终在这个播放列表组件的顶部位置；
          this.scrollToCurrent(this.currentSong)
        }, 20)
      },
      // 隐藏本组件
      hide() {
        // 设置标识符为false，隐藏本组件
        this.showFlag = false
      },
      // 显示弹窗
      // 清除所有歌曲
      showConfirm() {
        // 显示弹窗
        this.$refs.confirm.show()
      },
      // 清除所有歌曲
      confirmClear() {
        // 调用vuex的actions.js中的方法
        this.deleteSongList()
        // 因为清除所有，所以隐藏这个歌曲列表组件
        this.hide()
      },
      // 设置 当前播放歌曲 样式
      getCurrentIcon(item) {
        // 因为每个歌曲都会执行在这个函数，所以传入的索引和当前播放歌曲的索引相等
        // 那就这个DOM是当前播放的歌曲
        // currentSong是vuex getters 拿到的 state中的当前歌曲
        if (this.currentSong.id === item.id) {
          // 找到了就返回 一个类名，从而在这个DOM左边渲染小播放三角样式
          return 'icon-play'
        }
        // 如果没找到，就返回一个空的类名
        // 这个情况不太可能，但还是要设置，预防边界情况；
        return ''
      },
      // 歌曲列表点击触发
      // 点击歌曲列表的某个歌曲时，将歌曲和歌曲索引传入
      selectItem(item, index) {
        // 判断当前播放状态 是否 是随机播放
        if (this.mode === playMode.random) {
          // 如果是随机播放
          // 那么找到这首歌曲，在随机播放列表中的位置，
          // 如果找到了，说明随机播放列表中存在这首点击的歌曲，
          // 返回这首歌曲在 随机播放列表中的索引；
          index = this.playlist.findIndex((song) => {
            return song.id === item.id
          })
        }
        // 设置当前播放歌曲
        // 情况1：如果当前播放是随机播放的话，
        // 那么此时已经找到了这首歌在随机播放列表中的索引

        // 情况2：如果不是随机，则就是顺序列表（单曲循环模式跟操作播放列表无关）
        // 如果是顺序列表，那么传入的index参数就是当前这首歌曲的索引，
        // 那么也找到了被点击的这首歌曲的索引；

        // 找到了当前歌曲在播放列表中的位置，就播放当前这首歌曲
        // 调用vuex下mutations的方法，设置state中的当前播放歌曲索引，
        // 那么也就是播放被点击的歌曲；
        this.setCurrentIndex(index)
        // 将播放状态设置为：播放；
        this.setPlayingState(true)
      },
      // 将scroll滚动位置设置到当前播放的歌曲的位置
      // 在组件的show()时，也就是该组件显示时
      // 或者
      // watch到 当前歌曲改变时触发这个函数；
      scrollToCurrent(current) {
        // 找到当前播放歌曲在播放列表中的索引
        const index = this.sequenceList.findIndex((song) => {
          return current.id === song.id
        })
        // 然后通过索引，找到当前播放歌曲的DOM 元素，
        // 因为这个歌曲列表，也就是顺序列表；
        // 这样，当前播放的歌曲，始终在这个播放列表组件的顶部位置；
        this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
      },
      // 删除某一首歌曲
      deleteOne(item) {
        // 拿到当前歌曲的数据
        // 调用actions.js 下的 deleteSong函数；
        // 这个deleteSong函数会删除 顺序列表 和 播放列表中的这首歌曲；
        this.deleteSong(item)
        // 当执行完删除某一首歌曲之后
        // 如果当前播放列表为0的话，说明播放顺序列表中也没有歌曲了；
        // 那就隐藏这个组件
        if (!this.playlist.length) {
          this.hide()
        }
      },
      // 显示 添加歌曲到队列 组件
      addSong() {
        this.$refs.addSong.show()
      },
      ...mapActions([
        'deleteSong',
        'deleteSongList'
      ])
    },
    watch: {
      // 点击某个歌曲时，将滚动组件滚动到该歌曲的位置
      // 监听当前播放的歌曲
      currentSong(newSong, oldSong) {
        // 如果当前这个组件不显示
        // 或者
        // 如果新值==旧值的话，那么就等于 用于点击的就是最上边的那首歌曲，不用管
        if (!this.showFlag || newSong.id === oldSong.id) {
          return
        }
        // 如果用户点击的不是当前已经播放的歌曲，
        // 那么就调用 让scroll滚动到 被点击的歌曲的位置的方法；
        this.scrollToCurrent(newSong)
      }
    },
    components: {
      Scroll,
      Confirm,
      AddSong
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>
