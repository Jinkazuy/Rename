<template>
  <div class="singer" ref="singer">
    <list-view @select="selectSinger" :data="singers" ref="list"></list-view>
    <!--这里的router-view是给二级路由，也就是歌手详情页准备的-->
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">

  // 载入歌手列表组件
  import ListView from 'base/listview/listview'

  // 导入自己写好的发送获取歌手列表数据的发送jsonp请求的文件
  import {getSingerList} from 'api/singer'

  // 为了强化语义ERR_OK===0；
  import {ERR_OK} from 'api/config'

  // 导入，用于创建实例的构造对象，这样就省去了每次添加歌手的时候都需要创建一个新对象；
  // 也就是说，在创建歌手对象的时候，只需要new 这个方法的返回值，然后传入歌手名和id就能得到一个歌手信息的实例对象；
  import Singer from 'common/js/singer'

  // vuex提供的方法，能够使用...mapMutations映射Mutations中的某个方法；
  import {mapMutations} from 'vuex'

  import {playlistMixin} from 'common/js/mixin'

  // 定义热门分类
  const HOT_SINGER_LEN = 10
  const HOT_NAME = '热门'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        // 歌手列表数据，默认是空数组；
        singers: []
      }
    },
    created() {
      // 在初始化vue组件后获取歌手列表数据
      this._getSingerList()
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh()
      },
      selectSinger(singer) {
        // 父级传入listview的函数，listview中，在每个歌手被点击的时候调用这个函数；
        // 并且传入该歌手的数据，然后父级拿到歌手数据，进行router路由的访问；
        // 此时就能够实现点击跳转二级路由的操作，打开歌手详情页；
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        // 这里映射了这个方法，那么在调用setSinger的时候，就等于使用了this.$store.commit('SET_SINGER', value)这个方法；
        // 那么在提交二级路由的时候，同时通过调用store/mutations.js中的SET_SINGER方法，将歌手信息传入；
        // 然后再singer-detail.vue中就可以直接访问store/state.js下的singer这个变量，拿到当前储存的歌手信息了；
        this.setSinger(singer)
      },

      // 获取歌手列表数据
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            // 并且在获取成功后，调用将歌手按照字母分类的方式进行排序的函数；
            // 最终经过排序后，返回排序后的歌手信息数据，再赋值给this.singers；
            this.singers = this._normalizeSinger(res.data.list)
          }
        })
      },
      // 因为获取的数据结构不是按照字母排序的，所以这里要把获取到的数据进行拆分，
      // 然后按照字母排序分类，Findex就是歌手名字的首字母；
      _normalizeSinger(list) {
        let map = {
          // 定义热门分类；
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        // 遍历list，也就是传入的歌手列表数据
        list.forEach((item, index) => {
          // 判断，如果索引值小于规定的长度，那么就将该条歌手数据push到hot分类的items数组下；
          // 这里我们只取前10条定义为热门歌手；
          if (index < HOT_SINGER_LEN) {
            map.hot.items.push(new Singer({
              // 这里只需要歌手名称，当然也可以把全部歌手数据push，但没必要，徒增数据量；
              name: item.Fsinger_name,
              // 这个min就是歌手的头像的id，需要再次发送ajax才能拿到，所以这里先拿到这个min；
              id: item.Fsinger_mid
            }))
          }
          // 这里还要进行Findex（右侧字母索引）的分类；
          // 先拿到每个歌手数据中的Findex
          const key = item.Findex
          // 然后判断，如果当前的map的key(a-z的某个字母)不存在，就创建这个字母key；
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          // 然后将该歌手的数据push到这个字母索引对应的数组中，这样就达到了：按照字母，将歌手分类；
          map[key].items.push(new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid
          }))
        })
        // 遍历list结束，此时map中已经按照字母分类好了歌手列表数据，
        // 但是此时，a-z还不是a-z的顺序，是错乱的；

        // 为了得到有序列表，我们需要处理 map

        // 定义a-z分类
        let ret = []

        // 定义热门分类
        let hot = []

        // 循环map数组
        for (let key in map) {
          let val = map[key]
          // 如果分类是a-z字母的话就push到ret数组
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
            // 如果是热门的话，就push到热门数组下
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
        }
        // 然后这里将ret的结果按照a-z进行排序
        // sort() 方法用于对数组的元素进行按照数字或者字母进行排序。
        // 要实现这一点，就必须使用一个排序函数，sort支持函数；
        // 也就是a减去b大于0，返回true，就添加到数组中；
        // 具体的可以查文档：http://www.w3school.com.cn/js/jsref_sort.asp
        ret.sort((a, b) => {
          // 返回a-z排序的歌手数据
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        // 返回热门+a-z的歌手数据
        // concat()是拼接数组，也就是在热门分类后边拼接a-z，
        // 此时的返回的数组就是[{items:[..], title:'热门'}, {items:[..], title:'A'}, {items:[..], title:'B'}]
        // 最终返回给_normalizeSinger()这个方法；
        return hot.concat(ret)
      },
      // 使用vuex提供的方法，将Mutations中的方法映射给一个变量；
      // 那么这个变量就可以操作Mutations中的某个方法，从而达到修改state中的数据；
      ...mapMutations({
        // 这里映射了这个方法，那么在调用setSinger的时候，就等于使用了this.$store.commit('SET_SINGER', value)这个方法；
        setSinger: 'SET_SINGER'
      })
    },
    components: {
      // 注册歌手列表组件
      ListView
    }
  }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
