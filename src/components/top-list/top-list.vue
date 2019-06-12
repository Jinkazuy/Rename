<template>
  <transition name="slide">
    <!--传入rank-->
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  // 歌曲列表组件
  import MusicList from 'components/music-list/music-list'
  // 发送ajax请求，
  import {getMusicList} from 'api/rank'
  // ERR_OK === 0
  import {ERR_OK} from 'api/config'
  // 拿到vuex下的getters
  import {mapGetters} from 'vuex'
  // 格式化歌曲
  import {createSong} from 'common/js/song'

  export default {
    computed: {
      // 监听计算属性
      // 拿到vuex中返回的数据 => 排行榜标题
      title() {
        return this.topList.topTitle
      },
      // 排行榜背景图
      bgImage() {
        if (this.songs.length) {
          return this.songs[0].image
        }
        return ''
      },
      // vuex提供的语法糖，拿到被点击的那个排行榜的数据
      ...mapGetters([
        'topList'
      ])
    },
    data() {
      return {
        // 歌曲列表
        songs: [],
        // 这个rank变量 是用于 base/song-list.vue做判断的，
        // music-list.vue 就将这个变量传入song-list.vue
        // 如果base/song-list.vue 如果这个变量为true的，就执行渲染奖杯&数字的函数
        rank: true
      }
    },
    created() {
      // 在组件被初始化的时候
      this._getMusicList()
    },
    methods: {
      _getMusicList() {
        // 判断，如果vuex中记录的当前被点击的榜单没有 topList.id的属性的话，
        // 就返回绑定列表页
        if (!this.topList.id) {
          this.$router.push('/rank')
          return
        }
        // 拿到当前排行榜数据，调用发送ajax请求的函数，将排行榜id传入
        getMusicList(this.topList.id).then((res) => {
          // 如果code===0的话，就代表没问题
          if (res.code === ERR_OK) {
            // 此时拿到的数据并不能直接使用，所以↓↓↓
            // 调用格式化歌曲的函数，最终拿到的就是经过格式化的歌曲列表数组
            this.songs = this._normalizeSongs(res.songlist)
          }
        })
      },
      // 格式化歌曲
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          const musicData = item.data
          if (musicData.songid && musicData.albummid) {
            // 调用格式化歌曲数据的函数
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      // 音乐列表组件
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
