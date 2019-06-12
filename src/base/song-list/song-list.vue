<template>
  <div class="song-list">
    <ul>
      <li @click="selectItem(song, index)" class="item" v-for="(song, index) in songs">
        <!--判断 rank 是否为true，也就是是否是排行榜页面调用的这个组件-->
        <div class="rank" v-show="rank">
          <span :class="getRankCls(index)" v-text="getRankText(index)"></span>
        </div>
        <div class="content">
          <h2 class="name">{{song.name}}</h2>
          <p class="desc">{{getDesc(song)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      // 歌曲数据
      songs: {
        type: Array,
        default: []
      },
      // 调用这个组件是，是否是排行榜页面调用的，
      // 如果是排行榜调用的这个组件，那么就会传入rank=true;
      // 从而 执行渲染奖杯&数字的函数
      rank: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      // 点击歌曲的时候将歌曲数据和索引传进来
      selectItem(item, index) {
        // 调用父级传进来的方法，将歌曲数据和索引传给父级
        // 然后父级拿到数据后，将数据传给vuex进行管理；
        // 这样，打开播放器组件的时候，就能够通过vuex中的数据进行歌曲播放了；
        this.$emit('select', item, index)
      },
      // 在循环每个歌曲数据时，将数据传入，然后返回：歌手名·专辑名
      getDesc(song) {
        return `${song.singer}·${song.album}`
      },
      // 渲染奖杯icon
      // 这里拿到排行数组，如果小于等于2，就返回预设好的对应的css类名，渲染奖杯icon的背景图
      // 如果大于2了，那么就345678....，那么就返回'text'的类名，用于渲染数组；
      getRankCls(index) {
        if (index <= 2) {
          return `icon icon${index}`
        } else {
          return 'text'
        }
      },
      // 渲染排行 数字
      getRankText(index) {
        // 如果索引大于2了，那么就是
        // 那么因为上边的getRankCls 已经给>2的元素设置的类名，
        // 这里就直接返回文案即可，这样就会直接渲染数字345...
        // 如果是小于等于2 的话，那么就什么都不返回，也就什么都不渲染，因为已经被奖杯icon占领了位置了；
        if (index > 2) {
          return index + 1
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .song-list
    .item
      display: flex
      align-items: center
      box-sizing: border-box
      height: 64px
      font-size: $font-size-medium
      .rank
        flex: 0 0 25px
        width: 25px
        margin-right: 30px
        text-align: center
        .icon
          display: inline-block
          width: 25px
          height: 24px
          background-size: 25px 24px
          &.icon0
            bg-image('first')
          &.icon1
            bg-image('second')
          &.icon2
            bg-image('third')
        .text
          color: $color-theme
          font-size: $font-size-large
      .content
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          no-wrap()
          color: $color-text
        .desc
          no-wrap()
          margin-top: 4px
          color: $color-text-d
</style>
