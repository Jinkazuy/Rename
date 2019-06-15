<!--// 提示状态组件，在添加歌曲add-song.vue播放记录中被引用-->
<!--// 点击某个播放记录的歌曲时，提示已经添加到歌曲队列中-->
<template>
  <transition name="drop">
    <div class="top-tip" v-show="showFlag" @click.stop="hide">
      <slot></slot>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      // 拿到父级传入的动画持续时间
      // 如果父级不传入默认是2000
      delay: {
        type: Number,
        default: 2000
      }
    },
    data() {
      return {
        // 显示与隐藏本组件，默认不显示
        showFlag: false
      }
    },
    methods: {
      // 显示本组件
      show() {
        // 设置标识符为true
        this.showFlag = true
        // 经过xxx毫秒隐藏本组件
        // 清除定时器
        clearTimeout(this.timer)
        // 设置定时器
        this.timer = setTimeout(() => {
          // 通过父级传入，或默认的动画持续时间，控制本组件的隐藏
          this.hide()
        }, this.delay)
      },
      // 隐藏本组件
      hide() {
        this.showFlag = false
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .top-tip
    position: fixed
    top: 0
    width: 100%
    z-index: 500
    background: $color-dialog-background
    &.drop-enter-active, &.drop-leave-active
      transition: all 0.3s
    &.drop-enter, &.drop-leave-to
      transform: translate3d(0, -100%, 0)
</style>
