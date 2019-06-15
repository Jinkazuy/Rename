<!--// 分页选项卡组件-->
<template>
  <ul class="switches">
    <!--循环父级传进来的数据，也就是按钮的名称字段-->
    <!--点击时，将当前索引传给父级-->
    <li class="switch-item" v-for="(item,index) in switches" :class="{'active':currentIndex === index}"
        @click="switchItem(index)">
      <span>{{item.name}} </span>
    </li>
  </ul>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      switches: {
        // 接收父级传进来的 名称字段
        type: Array,
        default: []
      },
      // 当前被激活的索引
      currentIndex: {
        type: Number,
        default: 0
      }
    },
    methods: {
      // 在点击某个按钮的时候，将该按钮索引值传给父级
      // 然后父级拿到这个索引，再将索引传入，
      // 然后这个组纪检props监听父级传入的索引，从而控制高亮类名；
      switchItem(index) {
        this.$emit('switch', index)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .switches
    display: flex
    align-items: center
    width: 240px
    margin: 0 auto
    border: 1px solid $color-highlight-background
    border-radius: 5px
    .switch-item
      flex: 1
      padding: 8px
      text-align: center
      font-size: $font-size-medium
      color: $color-text-d
      &.active
        background: $color-highlight-background
        color: $color-text
</style>
