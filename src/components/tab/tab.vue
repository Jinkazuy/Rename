<template>
  <div class="tab">
    <!--这里的tag就是控制router-link标签最终是什么标签，如果不写的话，默认是a标签-->
    <!--当某个router-link被激活的时候，vue会给这个router-link标签添加一个router-link-active的类名，达到控制激活样式的目的-->
    <!--这个router-link-active是可以在处理router的js文件中改名的-->
    <router-link tag="div" class="tab-item" to="/recommend">
      <span class="tab-link">推荐</span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/singer">
      <span class="tab-link">歌手</span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/rank">
      <span class="tab-link">排行
      </span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/search">
      <span class="tab-link">搜索</span>
    </router-link>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  /*引入variable.styl，这个文件是定义了一些基础的设计规范*/
  @import "~common/stylus/variable"

  .tab
    display: flex
    height: 44px
    line-height: 44px
    /*在variable.styl中定义了$font-size-medium = 14px，所以这里可以使用这个变量*/
    font-size: $font-size-medium
    .tab-item
      flex: 1
      text-align: center
      .tab-link
        padding-bottom: 5px
        /*$color-text-ll = rgba(255, 255, 255, 0.8)*/
        color: $color-text-l
      &.router-link-active
        .tab-link
          /*$color-theme = #ffcd32*/
          color: $color-theme
          border-bottom: 2px solid $color-theme
</style>
