<template>
  <div id="app" @touchmove.prevent>
    <m-header></m-header>
    <!--tab组件控制router-link，从而控制router-view显示的内容-->
    <!--也就是说，将处理router-link抽象成一个组件，方便维护-->
    <!--也就是在这里的router-link统一管理到tab.vue中-->
    <tab></tab>
    <!--keep-alive标签保存DOM状态， 在router切换时，不重新加载DOM-->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <!--播放器组件-->
    <player></player>
  </div>
</template>

<script type="text/ecmascript-6">
  // 引入顶部栏组件
  import MHeader from 'components/m-header/m-header'
  // 引入播放器组件，因为播放器不输入任何router控制，是属于全局的组件，所以直接在APP中引入；
  import Player from 'components/player/player'
  // 引入tab栏组件
  import Tab from 'components/tab/tab'

  export default {
    components: {
      // 将引入的组件挂载
      MHeader,
      Tab,
      // 播放器组件
      Player
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
</style>
