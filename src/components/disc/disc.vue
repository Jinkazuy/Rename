<!-- // 歌单详情页，由首页推荐的歌单点进来，是作为xx.vue的二级路由 -->
<template>
  <transition name="slide">
    <!--音乐列表组件，将页标题、背景图、歌曲数据传入-->
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  // 复用组件，musicList
  import MusicList from 'components/music-list/music-list'
  // 调用发送ajax请求的函数，获取歌单详情页的数据
  import {getSongList} from 'api/recommend'
  // ERR_OK===0
  import {ERR_OK} from 'api/config'
  // 访问vuex的getters，拿到由点击某个歌单列表时，传入vuex中的state下的disc，也就是歌单数据；
  import {mapGetters} from 'vuex'
  // 引入当前歌曲的函数，返回一个当前歌曲的对象，对象中包含单个歌曲的数据，包括url等数据；
  import {createSong} from 'common/js/song'

  export default {
    computed: {
      // 监听计算属性，当拿到vuex中的disc的时候计算
      title() {
        return this.disc.dissname
      },
      bgImage() {
        return this.disc.imgurl
      },
      // vuex的语法糖，拿到当前歌单数据；
      ...mapGetters([
        'disc'
      ])
    },
    data() {
      return {
        songs: []
      }
    },
    created() {
      // 在组件初始化的时候调用获取歌曲列表的方法
      this._getSongList()
    },
    methods: {
      // 根据vuex中state下的disc的歌单数据发送ajax请求拿到歌曲列表；
      _getSongList() {
        // 如果当前vuex中的disc下没有dissid，也就是没有歌单的id
        // 那么就返回到推荐页，也就是歌单列表；
        if (!this.disc.dissid) {
          this.$router.push('/recommend')
          return
        }
        // 调用src/api/recommend.js中发送ajax请求的函数，
        // 传入歌单id，拿到歌曲详情页的歌曲列表数据；
        getSongList(this.disc.dissid).then((res) => {
          // 如果没有错误，也就是code===0的时候
          if (res.code === ERR_OK) {
            // 因为此时的歌曲数据格式不是我们想要的
            // 所以将歌曲列表传入，然后调用格式化的方法，将歌曲数据格式化；
            this.songs = this._normalizeSongs(res.cdlist[0].songlist)
            // 此时this.songs就是格式化后的歌曲列表数据，就可以传入 music-list 组件了；
          }
        })
      },
      // 格式化歌曲列表
      // 返回值：歌曲列表；
      _normalizeSongs(list) {
        // 这个ret是暂存歌曲列表的变量
        let ret = []
        // 循环传入的歌曲列表数据
        list.forEach((musicData) => {
          // 判断，每个循环中的数据，也就是每个歌曲id和min存在的话
          if (musicData.songid && musicData.albummid) {
            // 将这个歌曲追加到临时数组中
            // 这个createSong就是格式化的函数，已经封装在common/js/song.js中；
            ret.push(createSong(musicData))
          }
        })
        // 将格式化后的歌曲列表返回
        return ret
      }
    },
    components: {
      // 歌曲列表组件
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
