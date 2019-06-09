<!--进度条组件-->
<template>
  <!--进度条外框-->
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <!--进度条播放时间-->
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <!--小圆圈按钮-->
      <!--分别绑定了-->
      <!--开始触摸touchstart事件，prevent阻止浏览器的默认行为，这样就不会触发浏览器的拖动事件-->
      <!--触摸移动touchmove事件，-->
      <!--触摸结束touchend事件-->
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  // 拿到解决浏览器css兼容的函数；
  import {prefixStyle} from 'common/js/dom'

  // 进度条圆圈按钮尺寸
  const progressBtnWidth = 16
  // 调用解决浏览器兼容的方法
  const transform = prefixStyle('transform')

  export default {
    props: {
      // 播放时间百分比
      // 拿到这个百分比之后，就能将进度条的width和圆圈按钮x轴的偏移计算出来；
      percent: {
        type: Number,
        default: 0
      }
    },
    created() {
      // 在这个钩子中添加一个空对象的目的
      // 是为了共享在不同的touch事件共享一些数据；
      this.touch = {}
    },
    methods: {
      // 开始触摸touchstart事件触发时
      progressTouchStart(e) {
        // 标识符，用于判断是触发了touchStart事件
        this.touch.initiated = true
        // 获取当前触摸开始的位置；
        this.touch.startX = e.touches[0].pageX
        // 记录当前圆圈的x轴偏移的位置
        this.touch.left = this.$refs.progress.clientWidth
      },
      // 触摸移动事件touchmove触发时
      progressTouchMove(e) {
        // 如果没有经过触摸开始的touchStart事件的话，就禁止触摸移动事件的函数
        if (!this.touch.initiated) {
          return
        }
        // 拖动时的偏移量，用拖动的实时位置 减去 触摸开始时的位置，得到的就是实时的拖动的偏移量
        const deltaX = e.touches[0].pageX - this.touch.startX
        // 取两个值的最小值：

        // Math.max(0, this.touch.left + deltaX) 是 圆圈按钮的偏移量 + 实时拖动的偏移量；
        // 比如，圆圈按钮的此时的位置是x:100 ，实时拖动的偏移量是-10（向左拖动），那么得到的就是90，也就是圆圈按钮此时应该移动到的位置；
        // 并且这个位置不能<0，所以用Math.max，也就是取最大值；

        // this.$refs.progressBar.clientWidth - progressBtnWidth 是确保小球拖动的位置不会超过进度条外框的位置；

        // 然后使用Math.min取这两个值的最小值，就保证了，在拖动圆圈小球的左右都不会超过进度条外框的边缘；
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
        // 然后将这个计算后的位置，调用设置进度条宽度、小球位置的函数传进去；
        this._offset(offsetWidth)
      },
      // 触摸结束事件touchend触发时
      progressTouchEnd() {
        // 拖动季结束后，让标识符等于fasle
        this.touch.initiated = false
        // 拖动结束后，需要让歌曲的播放进度与拖动的位置的百分比一直，所以派发一个事件
        this._triggerPercent()
      },
      // 点击进度条的某个位置时，将进度设置到点击的位置
      progressClick(e) {
        // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
        // this._offset(e.offsetX)
        // 所以使用Element.getBoundingClientRect()方法返回元素的大小及其相对于视口的位置
        const rect = this.$refs.progressBar.getBoundingClientRect()
        // 用当前点击的屏幕x轴位置 减去 进度条最外框距离屏幕左侧的距离；
        // 得到的就是进度条进度的宽度，也就是圆圈按钮需要偏移的x轴的位置；
        const offsetWidth = e.pageX - rect.left
        // 设置进度条宽度、圆圈按钮位置
        this._offset(offsetWidth)
        // 设置歌曲进度
        this._triggerPercent()
      },
      // 设置歌曲进度
      // 让歌曲播放进度与拖动结束后的位置的百分比一直
      _triggerPercent() {
        // 计算进度条最大宽度，等于进度条最外层框 减去 圆圈按钮宽度
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        // 计算拖动后的进度条的百分比
        const percent = this.$refs.progress.clientWidth / barWidth
        // 调用父级传进来的方法，将百分比传入，由父级拿到拖动的百分后，设置歌曲的进度，
        // 这样，在拖动时设置进度条的实时位置，在拖动结束后，设置歌曲的进度，也就完成了进度条的交互；
        this.$emit('percentChange', percent)
      },
      // 设置进度条宽度、小球位置的函数
      _offset(offsetWidth) {
        // 拿到进度条的DOM元素，设置宽度
        this.$refs.progress.style.width = `${offsetWidth}px`
        // 拿到圆圈按钮的DOM元素，设置x轴偏移
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      }
    },
    watch: {
      // 监听父级传进来的播放时间百分比
      percent(newPercent) {
        // 当播放时间百分比发生变化时，将新的值拿到
        // 如果不设置!this.touch.initiated的话，就会发生，在拖动圆圈的时候，会来回跳动，
        // 是因为拖动的时候，这个实时进度的函数依然执行，所以这里进行节流，
        // 当拖动圆圈按钮的时候，就不让这个实时进度函数工作；
        // 判断百分比大于等于0并且 在没有拖动的时候，
        // 就可以设置当前播放歌曲的实时进度了；
        if (newPercent >= 0 && !this.touch.initiated) {
          // 计算播放进度的宽度，
          // 用进度条最外层的框的宽度 减去 圆圈按钮的快读，得到的就是播放进度条的最大的宽度值
          // 这样做的目的是预留圆圈按钮的宽度，否则就会出现进度条超过圆圈按钮的位置的情况；
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
          // 进度条宽度，用百分比乘以进度条最大宽度，得到的就是当前进度条的宽度；
          const offsetWidth = newPercent * barWidth
          // 然后调用设置进度条宽度的函数
          this._offset(offsetWidth)
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
