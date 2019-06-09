<!--迷你进度条组件-->
<template>
  <div class="progress-circle">
    <!--用到了svg标签-->
    <!--使用svg实现 歌曲实时的进度的渲染 -->
    <!--viewBox就类似于canvas的画布直径，那么和下边的circle标签的半径是相对应的，因为要把圆圈占满整个svg画布-->
    <!--viewBox参数：x轴坐标  y轴坐标  宽度   高度 -->
    <!--那么就等于在0,0的位置设置一个w100 h100的画布-->
    <!--这个width和height则就是这个svg标签本身的宽高值-->
    <!--svg标签本身的宽高值，与画布不影响，但是画布比例会按照svg标签的宽高值进行缩放-->
    <!--比如说：画布本身是h100 w100，但是svg标签是w10 h10 那么画布就会根据svg标签的尺寸进行缩放，这也是svg图形不模糊的好处-->
    <!--由于组件的通用性，所以半径值由外部调用这个组件的时候传入-->
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <!--两个circle标签，代表了两个圆圈，一个是底层圆，一个歌曲进度圆-->
      <!--r：代表代表半径-->
      <!--cx代表：圆心x轴坐标； cy：圆心Y轴坐标-->
      <!--背景的圆圈-->
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <!--根据歌曲实时播放进度半分比的圆圈-->
      <!--stroke-dasharray是描边的大小，也可以用来设置描边的是虚线和距离-->
      <!--这里用了一个圆周率*100，代表的就是,描边是一个线段，这个线段的长度正好是圆周率*100，也就是一个整圆；-->
      <!--stroke-dashoffset 代表这是描边的偏移量，如果偏移是0，那么描边就会全部绘制上-->
      <!--这个就有点像AE里路径偏移-->
      <!--如果偏移量是stroke-dasharray值的一半，则描边会只绘制一半-->
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray"
              :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      // 接收父级传进来的圆圈的半径值
      radius: {
        type: Number,
        default: 100
      },
      // 接收父级传进来的歌曲的实时进度的百分比
      percent: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        // 圆周率*100
        // 此时得到的就是314.15926...那么就用这个值，来设置描边的长度；
        dashArray: Math.PI * 100
      }
    },
    computed: {
      dashOffset() {
        // 描边的偏移，
        // stroke-dashoffset 代表这是描边的偏移量，如果偏移是0，那么描边就会全部绘制上
        // 如果偏移量是stroke-dasharray值的一半，则描边会只绘制一半
        // 所以这里用 1减去歌曲实时的百分比，得到就是剩下的为播放的进度；
        // 然后用这个未播放的进度，乘以描边的总长度，得到就是stroke-dashoffset需要偏移的值
        // 这个就有点像AE里路径偏移
        // 那么当stroke-dashoffset 偏移为 0 的时候，就绘制了整个圆，也就代表歌曲进度为100%；
        // 如果偏移量=this.dashArray，也就是一点都没有绘制出来，也代表歌曲进度为0%；
        return (1 - this.percent) * this.dashArray
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-circle
    position: relative
    circle
      //边框宽度
      stroke-width: 8px
      //缩放点：中心
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        /* -90度是为了从指定的位置开始转圈 */
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
</style>
