<template>
  <!--缓动动画效果，使用transition标签包裹-->
  <transition name="slide">
    <!--歌曲列表组件-->
    <!--将歌手的名字、歌手的背景图、歌手的歌曲传入-->
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  // 歌曲列表组件
  import MusicList from 'components/music-list/music-list'
  // 发送jsonp请求的js文件，获取歌手详情页的数据；
  import {getSingerDetail} from 'api/singer'
  // ERR_OK===0
  import {ERR_OK} from 'api/config'
  // 格式化歌手每一条歌曲的文件
  import {createSong} from 'common/js/song'
  // 载入vuex的getters
  import {mapGetters} from 'vuex'

  export default {
    // 监听计算属性
    computed: {
      title() {
        // 歌手名
        return this.singer.name
      },
      bgImage() {
        // 背景图数据
        return this.singer.avatar
      },
      // 调用vuex的store/getters.js下的singer就等于调用了store/state.js中的singer存储的数据；
      // 那么也就是拿到了当前需要的歌手的ID等数据；此时就可以通过this.singer访问当vuex的state中管理的singer的数据；
      // 这个singer的数据中也包括了歌手名和背景图
      ...mapGetters([
        'singer'
      ])
    },
    data() {
      return {
        // 用于存储经过我们格式化后的歌手详情页数据（不包括歌手名和背景图，只是歌手的歌曲）；
        songs: []
      }
    },
    created() {
      // 在组件初始化完成后调用获取歌手详情的数据的方法
      this._getDetail()
    },
    methods: {
      // 如果没有这个id的话，就跳转回歌手列表页
      _getDetail() {
        // 这里的singer.id就是通过vuex获取到的，由点击歌手列表的某个歌手时，传入的歌手信息；
        // 那么这个singer.id就是歌手信息，然后再通过这个id发送jsonp请求，拿到这个歌手的歌曲列表信息；
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        // 有歌手id的话，那么就调用封装好的发送jsonp请求的函数；
        // 并且将该歌手的id传入；
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            // 获取数据成功，但此时的数据并不是我们想要的结果，
            // 那么，调用格式化数据的方法，将歌手详情页数数据进行格式化；
            // 然后赋值给vue组件本身的变量this.songs，此时就能用这个变量进行DOM渲染了；
            this.songs = this._normalizeSongs(res.data.list)
          }
        })
      },
      // 格式化数据，将数据格式化成我们想要的数据格式；
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          // 遍历每一首歌曲
          let {musicData} = item
          // 判断，每一首歌曲是否有songid和albumminid，如果有的话，就追加到定义好的空数组中；
          if (musicData.songid && musicData.albummid) {
            // 如果没问题的话，就调用common/js/song这个文件的createSong函数，格式化数据；
            // 这个createSong.js有些复杂，目的就是将获取到的歌手的数据，进行我们想要的数据格式的格式化；
            ret.push(createSong(musicData))
          }
        })
        // 将格式化后的数据返回，用于赋值给this.songs；
        return ret
      }
    },
    components: {
      // 注册歌曲列表组件
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
