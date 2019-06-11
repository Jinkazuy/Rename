<template>
  <!--整个播放器的显示与隐藏，有播放列表的长度控制，如果播放列表长度大于0，则显示-->
  <!--那么也就是说，实际上当用户操作，造成播放列表有内容时，就显示播放器组件-->
  <div class="player" v-show="playlist.length>0">
    <!--正常尺寸播放器-->
    <!--使用transition包裹起来实现动画-->
    <!--而且这个transition标签还用到了vue提供的动画钩子函数-->
    <!--调用钩子的目的就是为了实现CD唱片缩放到左下角&从左下角扩大到中心-->
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <!--// 正常尺寸播放器，显示隐藏由vuex中state下的fullScreen控制-->
      <div class="normal-player" v-show="fullScreen">
        <!--歌曲背景图-->
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <!--收起按钮，点击该按钮收起正常尺寸播放器，展示迷你播放器-->
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <!--歌曲名-->
          <h1 class="title" v-html="currentSong.name"></h1>
          <!--歌手名-->
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <!--// cd唱片和歌词的容器-->
        <!--// 这个容器的宽度就是屏幕的宽度，并不是屏幕的两倍-->
        <!--// 之所以JK会误会成两个屏幕的宽度，是因为cd唱片和歌词用了inline-block这个css属性-->
        <!--// 这个inline-block会让两个元素并排显示，所以歌词部分会被挤到右边，并且这个父级元素overflow：hidden了，就看不到歌词部分了-->
        <!--// 给这个容器添加touch事件来控制左右滑动切换歌词和cd唱片-->
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd"
        >
          <!--// 唱片-->
          <div class="middle-l" ref="middleL">
            <!--// 正常尺寸的cd唱片，动画钩子函数中控制的就是这个元素 -->
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <!--// 歌曲图片-->
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <!--当前播放的歌词，在cd唱片下面显示-->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <!--// 歌词-->
          <!--// 使用scroll这个自己写的滚动组件，将歌词包裹起来-->
          <!--// 这个data的目的，就是为了当歌词不为null的时候，将歌词传入-->
          <!--// 当scroll组件监听到data发生改变是，scroll组件调用重新计算尺寸的方法-->
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <!--// 因为歌词数据是数组，每个元素是一行一行的歌词，所以这里用v-for循环-->
                <!--// 歌词高亮：currentLineNum是当前播放的歌词的行-->
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentLineNum ===index}"
                   v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <!--// 进度条-->
          <div class="progress-wrapper">
            <!--// 当前播放时间-->
            <!--// 因为 audio标签的这个target.currentTime的currentTime返回的是一个时间戳-->
            <!--// 所以不能直接进使用，所以这里用一个过滤器将时间戳转换成想要的时间格式-->
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <!--// 进度条组件，将播放时间百分比传入-->
              <!--将设置歌曲进度的函数传入，由进度条组件引用，然后将进度条拖动后的百分比传入，从而控制歌曲的进度-->
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <!--// 总播放时间，同样将时间戳格式化-->
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <!--播放模式按钮-->
            <!--绑定点击事件，changeMode在mixin.js文件中；-->
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <!--上一首按钮-->
            <!--监听this.songReady节流阀，如果this.songReady=false的时候，就返回disable这个类名-->
            <!--从而禁用这些按钮-->
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <!--播放按钮-->
              <!--添加点击事件，控制播放与暂停-->
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <!--下一首按钮-->
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i @click="toggleFavorite(currentSong)" class="icon" :class="getFavoriteIcon(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!--迷你播放器-->
    <!--// 收起后，固定在底部的迷你播放器，显示与隐藏由!fullScreen控制，也就是和正常尺寸相反-->
    <!--同样也使用transition包裹起来实现动画-->
    <transition name="mini">
      <!--点击迷你播放器时，显示正常尺寸播放器，隐藏迷你播放器-->
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <!--歌曲背景图-->
          <img :class="cdCls" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <!--歌曲名-->
          <h2 class="name" v-html="currentSong.name"></h2>
          <!--歌手名-->
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <!--迷你进度条组件-->
          <!--传入圆圈半径值 radius-->
          <!--传入当前播放音乐的实时百分比 percent-->
          <progress-circle :radius="radius" :percent="percent">
            <!--迷你尺寸的播放按钮-->
            <!--点击触发歌曲暂停/播放的函数，并且阻止冒泡-->
            <!--因为progress-circle.vue中使用<slot></slot>标签占位，所以这里可以写内容；-->
            <!--这个按钮的作用和大的播放按钮的功能是一样的，就是切换歌曲的播放与暂停-->
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <!--播放功能-->
    <!--play事件，在媒体文件开始播放时触发；-->
    <!--绑定play事件，watch监听currentSong的改变，发生变化时就调用这个audio的play事件，从而触发ready函数，让this.songReady=true-->
    <!--canplay事件，audio标签，当音乐 可以 播放，也就是准备就绪的时候，会派发一个canplay事件，但这里没有用到-->
    <!--error事件，当音乐发生错误的时候，audio标签会派发一个error事件-->
    <!--timeupdate事件，当音乐、视频的播放进度发生改变时，会触发这个事件-->
    <!--ended事件，媒体文件播放结束时-->
    <audio ref="audio" :src="currentSong.url" @play="ready" @error="error" @timeupdate="updateTime"
           @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  // 载入vuex，然后提取vuex提供的语法糖，比如mapGetters，就能拿到vuex中getter下的相关内容；
  // 然后就能使用 ...mapGetters() 来映射vuex下的getters中的内容了，mutations和actions映射的方法同理
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  // 如果使用js方式创建css3的animation，
  // 用到了第三方插件create-keyframe-animation；
  import animations from 'create-keyframe-animation'
  // 引入自己封装的，解决浏览器兼容性的方法；
  import {prefixStyle} from 'common/js/dom'
  // 进度条组件
  import ProgressBar from 'base/progress-bar/progress-bar'
  // 迷你进度条（圆圈）组件
  import ProgressCircle from 'base/progress-circle/progress-circle'
  // 得到播放模式，其实就是更加语义化 返回的就是{sequence: 0, loop: 1, random: 2}这样一个对象；
  import {playMode} from '../../common/js/config'
  // 这个lyric-parser第三方包是黄奕专门用来处理这个项目的封装的一个插件；
  // 因为逻辑复杂，所以封装成一个插件，而且不解释其中的作用，只是用到了几个方法；
  import Lyric from 'lyric-parser'
  // 滚动组件
  import Scroll from 'base/scroll/scroll'
  // 因为一些方法与其他页面重复性较高，在别的vue组件中也能够用到方法，所以将这些方法封装到另一个文件
  import {playerMixin} from 'common/js/mixin'
  // 播放列表组件
  import Playlist from 'components/playlist/playlist'

  // 调用自己封装的解决浏览器css兼容性的方法，返回的就是根据当前浏览器加过私有前缀的css属性名
  // 比如：如果是chrome的话，就会返回webkitTransform;
  // 那么在加载到css时就会自动将大写字母转成小写并且加上-，也就是webkit-transform
  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    mixins: [playerMixin],
    data() {
      return {
        // 当前歌曲已经可以开始播放
        // 这个节流阀的目的之一：防止快速点击切换上、下一首歌曲报错；
        songReady: false,
        // 当前播放时间
        currentTime: 0,
        // 迷你进度条元素的宽高值；
        radius: 32,
        // 当前歌词对象，这个对象赋值的时候，是通过new 一个黄奕自己封装的第三方包
        // 这个第三方包是专门用来处理这个项目的封装的一个插件；
        // 因为逻辑复杂，所以封装成一个插件，而且不解释其中的作用，只是用到了几个方法；
        currentLyric: null,
        // 当前歌词的行数
        currentLineNum: 0,
        // 当前显示的是cd唱片，还是歌词屏幕
        currentShow: 'cd',
        // 当前播放的那一行的歌词；
        playingLyric: ''
      }
    },
    // 监听计算属性；
    computed: {
      // cd唱片，监听playing的值，从而达到控制无限旋转动画的暂停与旋转；
      // css3提供了：使用animation-play-state: paused控制当前动画暂停
      cdCls() {
        return this.playing ? 'play' : 'play pause'
      },
      // 正常尺寸播放/暂停按钮，监听playing的值，从而达到控制icon的样式；
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      // 迷你尺寸播放/暂停按钮，监听playing的值，从而达到控制icon的样式；
      miniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      // 不能播放的，监听this.songReady这个节流阀，
      // 如果为this.songReady=false的时候，就返回disable这个类名
      disableCls() {
        return this.songReady ? '' : 'disable'
      },
      // 计算播放进度的百分比；
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      // 在监听计算属性中，映射vuex提供的语法糖，那么就能够直接使用相应的方法了；
      ...mapGetters([ // getters只是展示数据；
        // 当前播放的索引，
        'currentIndex',
        // 播放器是否展开；
        'fullScreen',
        // 播放器是否播放
        'playing'
      ])
    },
    created() {
      this.touch = {}
    },
    methods: {
      // 收起按钮，收起正常尺寸播放器，显示迷你播放器；
      back() {
        // 这个setFullScreen是通过映射vuex中mutation下的SET_FULL_SCREEN()方法来的；
        // 那么这个SET_FULL_SCREEN方法控制的是vuex的state中的fullScreen变量；
        // 当state下的fullScreen=true的时候，显示正常尺寸播放器，且隐藏迷你播放器；
        this.setFullScreen(false)
      },
      // 显示正常尺寸播放器；
      open() {
        this.setFullScreen(true)
      },
      // 动画：CD唱片缩放到左下角&从左下角扩大到中心
      // 动画钩子：入场开始时；
      enter(el, done) {
        // 拿到计算后的，正常cd需要移动的x、y轴位置和缩放比例；
        const {x, y, scale} = this._getPosAndScale()

        // 这个动画是：从底部 放大 到中心；
        // 使用第三方插件，创建css3的animation属性；
        // 将计算后的结果传入
        let animation = {
          0: {
            // 一开始，将正常cd放到左下角的位置；
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            // 60%的时候，将正常cd放到中心点，但是缩放是1.1，这样就达到了弹性抖动一下的效果；
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            // 在100%的时候，将缩放设置为1
            transform: `translate3d(0,0,0) scale(1)`
          }
        }

        // 调用第三方插件，设置动画参数
        animations.registerAnimation({
          name: 'move', // 相当于animation-name
          animation, // 相当于@keyframes
          presets: {
            duration: 400, // 持续时间 相当于animation-duration
            easing: 'linear' // 缓动曲线 相当于 animation-timing-function；
          }
        })

        // 调用第三方插件，运行动画；
        // 参数1：想要施加动画的DOM元素
        // 参数2：设置的动画名称
        // 参数3：调用done，进入下一个动画钩子
        // 这个第三方包提供的.runAnimation的原理就是将给这个DOM元素加一个类名；
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      // 动画钩子，入场结束后
      // 动画完成之后，会调用 afterEnter
      // 此时就需要注销第三方包的动画&移除DOM元素的动画；
      afterEnter() {
        // 动画钩子函数（动画生命周期钩子函数）的第一个参数：el，表示 要执行动画的那个DOM元素，是个原生的 JS DOM对象
        // 调用第三方插件create-keyframe-animation 提供的方法
        // 注销这个动画，原理也就是移除这个类名；
        animations.unregisterAnimation('move')
        // 动画完成之后，清空正常cd的动画属性
        this.$refs.cdWrapper.style.animation = ''
      },
      // 动画钩子：离场开始时
      // 第二个参数 done 是回到函数，其实就是手动触发下一个动画钩子；
      leave(el, done) {
        // 这个动画是从正常尺寸，向左下角缩放；
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        // 拿到计算后的，正常cd需要移动的x、y轴位置和缩放比例；
        const {x, y, scale} = this._getPosAndScale()
        // 将正常cd直接缩放到左下角，因为没有动画过度，所以不用第三方插件；
        // 这里的transform也用到了自己封装的用于解决css浏览器兼容性的方法；
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        // 动画离场开始时添加一个监听事件，监听这个动画结束后，调用下一个动画钩子；
        // 如果不使用transitionend监听动画结束，而是直接在这里写done(),那么就会造成动画立即进入afterLeave钩子
        // 也就是不会看到过度效果了，所以切结监听动画结束的事件，调用done；
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      // 动画钩子：离场后
      afterLeave() {
        // 清空正常cd的缓动；
        this.$refs.cdWrapper.style.transition = ''
        // 清空正常cd的动画；
        this.$refs.cdWrapper.style[transform] = ''
      },
      // 音乐的播放与暂停
      togglePlaying() {
        // 如果this.songReady===false的话，就直接结束函数不执行后续；
        if (!this.songReady) {
          return
        }
        // 利用vuex的mutations的方法，改变vuex中的playing状态（true或false），
        // 这个setPlayingState的函数是通过引入mixin.js中的mutations映射的方法，
        // 而没有在本vue组件中映射这个方法；
        // 设置播放状态为取反
        this.setPlayingState(!this.playing)
        // 如果当前歌曲有歌词，也让歌词进行取反状态，也就是切换播放或者暂停
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      // 当前歌曲播放结束时
      end() {
        // 判断，如果当前播放模式等于loop的时候，就调用循环播放的函数；
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          // 如果当前播放模式不是循环，那么就调用切换播放下一首的函数；
          this.next()
        }
      },
      // 循环播放
      // 这个循环播放，只是针对于，在歌曲自动播放结束时，判断当前播放模式===loop，也就是===1的时候，才触发loop()函数；
      loop() {
        // 将当前音频文件的播放时间设置为0 ， currentTime是audio标签自带可读写的DOM属性；
        this.$refs.audio.currentTime = 0
        // 然后调用触发audio的play事件，从而触发封住好的 ready()函数；
        this.$refs.audio.play()
        // 设置歌曲播放状态位true
        this.setPlayingState(true)
        // 判断当前歌曲有歌词的时候，调用黄奕的第三方包的方法
        if (this.currentLyric) {
          // 这个.seek是黄奕的第三方包，也就是专门处理歌词的包的方法
          // 传入秒数，目的是保持当前歌词与歌曲进度一致，因为循环播放了，歌曲就是从头开始了，
          // 所以传入0
          this.currentLyric.seek(0)
        }
      },
      // 切换歌曲，下一首
      next() {
        // 如果当前歌曲未准备就绪，也就是不能播放的或者未播放的时候，不能切换写一首，
        // 这样做的目的就是为了防止用户非常快速的点击切换到下一首，会出现报错
        if (!this.songReady) {
          return
        }
        // 判断，如果当前歌曲列表长度为1，那么就循环播放
        if (this.playlist.length === 1) {
          this.loop()
          // 并且结束之后的代码运行
          return
        } else {
          // 如果歌曲列表长度不为1，那么就让currentIndex+1
          let index = this.currentIndex + 1
          // 判断，如果歌曲索引等于了歌曲列表的长度，那么就切换到第1首歌曲
          if (index === this.playlist.length) {
            index = 0
          }
          // 调用vuex的方法，将歌曲索引传入，此时vuex的currentSong就会发生变化
          // 因为引入了mixin.js，所以也能监听到vuex的currentSong，
          // 那么当前vue文件就能监听currentSong的数据，从而调用各种函数；
          this.setCurrentIndex(index)
          // 那么切换到下一首之后，歌曲是自动播放的，但是控制播放的变量没有变化
          // 这就导致了cd唱片没有转，播放按钮没有切换到暂停icon状态，
          // 所以这里要判断，playing是否为false，如果是的话，就切换到true；
          // 如此这般，cd唱片转起来，播放icon也变成了暂停icon；
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        // 让歌曲是否能够播放的节流阀设置为false
        // 这样的话，在用户快速频繁点击切换下一首的时候，如果当前歌曲没有准备好，就不能切换；
        this.songReady = false
      },
      // 切换歌曲，上一首；
      // 逻辑与切换下一首歌曲差不多
      prev() {
        if (!this.songReady) {
          return
        }
        if (this.playlist.length === 1) {
          this.loop()
          return
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            index = this.playlist.length - 1
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      // 播放器play事件触发时
      ready() {
        // 点击播放时，让songReady为true
        this.songReady = true
        // 调用vuex中的xxx
        this.savePlayHistory(this.currentSong)
      },
      error() {
        // 当audio派发error的时候，说明当前音频文件不能播放，那么也就让歌曲节流阀打开，
        // 从而能够让用户切换别的歌曲
        this.songReady = true
      },
      // 播放进度
      // 当前媒体文件发生改变时派发timeupdate事件，
      // 在audio派发timeupdate事件时触发updateTime函数
      updateTime(e) {
        // 这个e就是audio标签的DOM元素
        // 将当前音乐播放时间 = audio元素的播放时间
        // audio的DOM元素有target属性，其中就有currentTime属性，记录的当前媒体文件的播放进度；
        // 那么此时，我们就拿到了当前媒体文件的播放进度；
        // 这个e.target.currentTime的currentTime是一个可读/写的属性；
        this.currentTime = e.target.currentTime
      },
      // 当前播放时间过滤器
      // 将当前媒体文件的播放进度的时间戳转换成想要的时间格式
      format(interval) {
        // 以为媒体文件不一定全部都是正常没有错误的
        // 使用 | 0 是向下取整；相当于使用了Math.floor(interval)
        interval = interval | 0
        // 分钟数
        // 不用补0，因为分钟基本很少有超过10分钟的，如果要确保无误，也可以加上；
        const minute = interval / 60 | 0
        // 秒数，用取整后的时间戳余60，余后的就是秒数了；
        // 调用加0的函数，当秒数小于2位的时候就在前面补上一个0
        const second = this._pad(interval % 60)
        // 最后，将分：秒的字符串返回
        return `${minute}:${second}`
      },
      // 设置歌曲进度,根据进度条的位置的百分；
      onProgressBarChange(percent) {
        // 此时由进度条调用这个方法，传进来的percent就是进度条位置的百分比；
        // 用当前歌曲的总时长 乘以 百分比，拿到的就是当前进度的时间戳
        const currentTime = this.currentSong.duration * percent
        // 使用audio标签的currentTime属性赋值
        this.$refs.audio.currentTime = currentTime
        // 并且判断，如果当前歌曲不在播放的时候，让其播放
        if (!this.playing) {
          this.togglePlaying()
        }
        // 如果当前歌词有歌词
        if (this.currentLyric) {
          // 这个seek方法也是黄奕第三方包专门处理歌词的插件提供的
          // 传入秒数*1000，目的与当前拖放歌曲的进度保持一致
          // 这个*1000不用管，这个方法也不用管，因为是黄奕自己封装的，有兴趣可以去看他这个插件的文档
          this.currentLyric.seek(currentTime * 1000)
        }
      },
      // 歌词
      // 这个.getLyric()不是common/js/song.js的，
      // 而是这个player.vue的this.getLyric()
      getLyric() {
        // 这个currentSong.getLyric()调用的才是common/js/song.js中的方法，
        // 因为这个currentSong是new 的common/js/song.js的song Class得来的，所以.getLyric()方法；
        this.currentSong.getLyric().then((lyric) => {
          // 判断，这是因为歌词可能缓存，可能会出现冲突的情况，所以进行判断，
          // 是否是通过当前歌曲id发送AJAX请求拿到的歌曲；
          if (this.currentSong.lyric !== lyric) {
            return
          }
          // 因为拿到的歌词是一个很长的字符串，
          // [ti:可惜没如果]
          // [ar:林俊杰]
          // [al:新地球]
          // [by:]
          // [offset:0]
          // [00:00.00]可惜没如果 (If Only…) (《杜鹃之巢》韩剧中文主题曲|《对我而言，可爱的她》韩剧中文片尾曲) - 林俊杰 (JJ Lin)
          // [00:08.27]词：林夕
          // [00:16.54]曲：林俊杰
          // [00:24.81]假如把犯得起的错

          // 所以调用黄奕自己写的专门处理歌词的第三方包的方法,这个方法提供了很多API
          // 而且还会根据当前歌曲的进度的比例，去计算当前播放歌词的行数；
          // 第一个参数将歌词数据传入，这个方法下有一个lines属性，就是这个第三方包将歌词格式化，形成一个数组，然后就能用于循环输出了；
          // 第二个参数可以传一个回调函数
          // 那么这个new 出来的对象的currentLyric.lines就是一行一行歌词的数组，循环用p标签循环这个数组的.txt，就能拿到每行的歌词；
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          // 判断，如果当前的歌曲是播放状态，
          // 那么就让歌词也调用play()这个函数，这个函数是new的黄奕写的第三方提供的方法；
          // 也就是进行滚动播放
          if (this.playing) {
            // 因为前边new了黄奕的第三方包，所以由play()这个控制歌词播放的方法
            this.currentLyric.play()
          }
        }).catch(() => {
          // 当然会有出错的情况
          // 那么就设置当前歌词对象为NULL
          this.currentLyric = null
          // 设置歌词正在播放的 那一行的 歌词内容为空
          this.playingLyric = ''
          // 当前歌词播放行数为0
          this.currentLineNum = 0
        })
      },
      // 调用黄奕处理歌词的方法第第二个参数的回调函数
      // 这个回调函数的两个次数，由这个new Lyric方法自动传入；
      // 而且黄奕的这个第三方包，也会根据当前播放歌曲的进度比例计算当前歌词的行数；
      handleLyric({lineNum, txt}) {
        // 把前播放歌词的行数 赋值给 this.currentLineNum;
        this.currentLineNum = lineNum
        // 判断，如果当前歌词行数大于5行的时候，
        if (lineNum > 5) {
          // 就拿到歌词的p标签元素-5的结果，达到歌词居中的目的；
          // 比如：当前播放行数是100，那么-5就是95，此时就拿到了这个95行的P标签的DOM元素；
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          // 然后调用自己写好的scroll的方法，滚动到指定DOM元素的位置，经过1秒的时间
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          // 如果当前播放歌词行数小于5，让滚动组件到顶部
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        // 设置播放歌词数据为 是当前播放的歌词的行数的 那一行 的字符串；
        this.playingLyric = txt
      },
      showPlaylist() {
        this.$refs.playlist.show()
      },
      // 切换唱片 & 歌词
      // cd唱片 和 歌词父容器的touch事件 - 触摸开始
      middleTouchStart(e) {
        // 标识符，标识开始触摸了
        this.touch.initiated = true
        // 拿到一些DOM坐标属性
        const touch = e.touches[0]
        // 记录触摸开始时的X、Y轴坐标
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      // cd唱片 和 歌词父容器的touch事件 - 移动
      middleTouchMove(e) {
        // 如果不是经过开始触摸后进入的这个移动事件，就返回，什么也不做
        if (!this.touch.initiated) {
          return
        }
        // 拿到一些DOM坐标属性
        const touch = e.touches[0]
        // 获取X轴实时偏移量：用实时坐标减去触摸开始时的坐标
        const deltaX = touch.pageX - this.touch.startX
        // 获取Y轴实时偏移量
        const deltaY = touch.pageY - this.touch.startY
        // 因为歌词时候Y轴移动的，所以当Y轴移动大于X轴移动的时候，就代表时候滚动歌词，
        // 所以就不应该移动X轴的位置，所以返回，什么都不做
        // 取绝对值，因为会有负数的移动，但不管是否是负数，只看移动的偏移量的绝对值
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        // 进入到了这里，说明用户是左右滑动的
        // 判断，如果当前的屏幕是cd唱片的话，就移动到0，也就是不移动
        // x轴距离最大限制：
        // 如果当前标识符是cd唱片的话，就设置当前left偏移为0；
        // 如果当前不是cd唱片的话，也就是代表歌词页是当前屏幕，那么就将left偏移设置为负一屏幕；
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        // 最大偏移量限制：取0 或者 取 （-375 或者 0到-375） 的值；
        // 这样就做到了，想左偏移不会超过1屏幕，那么显示的就是歌词；
        // 向右偏移不会超过0px，那么显示的就是cd唱片；
        // Math.max(-window.innerWidth, left + deltaX)的目的是：↓
        // 设置一个最小数为-375（一个屏幕的尺寸）
        // 设置一个偏移数，如果当前屏幕是cd的时候，那么就是取0~当前偏移的值；
        // 那么这个偏移值就可能是负数，也可能是正数；
        // 所以 Math.max()得到的结果 -375~正无穷的 数；
        // 再用Math.min取 0 或者 Math.max()的 的最小值；
        // 所以，最终offsetWidth这个变量拿到的就是0~-375的数；
        // 就保证了在触摸移动的时候，歌词页的DOM元素，X轴只能移动-375~0的数；
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        // 用this.touch做一个临时储存变量；
        // 在这个临时变量下的percent来记录X轴偏移量除以屏幕宽度的比例；
        // 得到这个比例的目的是：当向左滑动超过0.1个屏幕的时候再松手，就滚动到歌词，不超过0.1个屏幕就回到cd唱片；
        // 0.1个屏幕的目的就是轻轻向左滑动；
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        // 这里是根据手指滑动的偏移量，实时的让歌词 跟随手指移动；
        // 这里就是个障眼法，其实触摸滑动的是cd唱片和歌词的父级容器；
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        // 过度动效为0，确保没有延迟，同样用到了自己写的兼容css3浏览器私有前缀的函数来处理浏览器前缀的兼容性问题；
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        // 然后让cd唱片的不透明度根据滑动的比例进行透明；
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        // 过度动效时间为0，确保没有延迟；
        this.$refs.middleL.style[transitionDuration] = 0
      },
      // cd唱片 和 歌词父容器的touch事件 - 触摸结束
      middleTouchEnd() {
        let offsetWidth
        let opacity
        // 触摸结束时进行判断
        // 这里判断，如果当前的屏幕标识是cd唱片，
        if (this.currentShow === 'cd') {
          // 那么再判断，如果当前滚动的比例大于了0.1，
          // 说明向左稍稍滑动了，稍稍滑动就让屏幕切换；
          if (this.touch.percent > 0.1) {
            // 那么设置偏移量为一整个屏幕（歌词容器设置的就是1整个屏幕的宽度）
            offsetWidth = -window.innerWidth
            // 设置cd唱片不透明度
            opacity = 0
            // 让当前屏幕标识变为歌词页
            this.currentShow = 'lyric'
          } else {
            // 如果向左滑动没有超过预设值
            // 那么设置最终偏移为0，也就是让歌词回到自己的位置，超出屏幕，从而看到不
            offsetWidth = 0
            // 设置cd唱片的不透明度为1
            opacity = 1
          }
        } else {
          // 如果当前屏幕不是cd，那就是标识当前屏幕是歌词页
          if (this.touch.percent < 0.9) {
            // 那就判断滑动距离，因为此时歌词页的位置是负数的一个屏幕的位置
            // 所以这里用1-0.1的结果来计算滑动比例；
            // 设置歌词的最终偏移位置为0，也就是回到正常的屏幕之外的位置
            offsetWidth = 0
            // 设置当前屏幕标识为cd唱片
            this.currentShow = 'cd'
            // 设置cd唱片容器不透明度为1
            opacity = 1
          } else {
            // 否则，说明向右滑动没有超过预设值，那么就让歌词回到屏幕显示
            offsetWidth = -window.innerWidth
            // 继续让cd唱片不透明度为0；
            opacity = 0
          }
        }
        // 这里的time是当基础结束后，让cd唱片透明变化 和 歌词X轴移动的变化有个缓动效果
        const time = 300
        // 经过前边的大量的判断，这里最终将计算后的结果应用到DOM元素上
        // 设置歌词的X轴最终位置（是位置，不是偏移量）
        // 这里还是用到了自己服装的，为了解决浏览器私有前缀的兼容性的函数；
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        // 设置歌词移动的动效时间
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        // 设置cd唱片的透明度
        this.$refs.middleL.style.opacity = opacity
        // 设置cd唱片透明度变化的动效时间
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
        // 将开始触摸的标识符设置为false
        this.touch.initiated = false
        // 至此，切换cd唱片和歌词的事件处理完成；
      },
      // 处理秒的格式，当秒小于2位的时候，在前面加上一个0
      _pad(num, n = 2) {
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      // 配合实现动画，cd唱片的中心点和缩放比例；
      _getPosAndScale() {
        // 迷你cd的尺寸
        const targetWidth = 40
        // 迷你cd中心距离左侧的偏移
        const paddingLeft = 40
        // 迷你cd中心距离底部的偏移
        const paddingBottom = 30
        // 正常cd元素距离顶部的偏移
        const paddingTop = 80
        // 正常cd的宽度，这里使用屏幕宽度*0.8，是因为这个正常cd的容器设置的就是80%的宽度；
        const width = window.innerWidth * 0.8
        // 初始的缩放比例，用迷你cd/正常cd的宽度就能得到缩放比例；
        const scale = targetWidth / width
        // 正常cd中心点的x轴坐标，要移动的为距离，因为是向左侧移动，所以是负数；
        // 屏幕的一半，再减去paddingLeft；
        const x = -(window.innerWidth / 2 - paddingLeft)
        // 正常cd中心点的Y轴坐标，要移动的举例；
        // 用屏幕高度减去paddingTop，再减去正常cd宽度的一半，再减去迷你cd距离底部的距离；
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        // 此时得到计算后的结果；
        // 将正常cd的中心点，要移动的距离和缩放比例返回；
        return {
          x,
          y,
          scale
        }
      },
      ...mapMutations({
        // 是否展开正常尺寸播放器
        setFullScreen: 'SET_FULL_SCREEN'
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    watch: {
      // 监听当前歌曲数据变化
      // 这个currentSong是通过引入mixin.js中的getters中的数据，
      // 获取到了vuex的中的currentSong数据；
      currentSong(newSong, oldSong) {
        // 如果没有歌曲id直接结束
        if (!newSong.id) {
          return
        }
        // 如果新的歌曲的id===当前歌曲的id，也直接返回，不做操作
        // 这个判断是因为，切换播放模式的时候，currentSong在数组中的索引会变化，但是歌曲本身并没有变化
        // 所以这里判断，如果歌曲id没有变，那么歌曲也就是没有变，也就是判断出了，当前的操作时切换播放模式；
        // 那么切换播放模式的话，就没有必要触发后续的函数了；
        if (newSong.id === oldSong.id) {
          return
        }
        // 当前歌曲发生变化时，如果currentLyric，也就是当前歌曲的歌词如果存在的话
        // 那么就要清空当前的歌词，否则就会出现bug
        // 出现bug的原因就是，这个currentLyric是new出来的对象，这个对象是黄奕的第三方处理歌词的插件；
        // 如果在切换歌曲的时候不清空这个对象中的数据，
        // 在接收新的new 出来的对象的时候就会出现问题；
        if (this.currentLyric) {
          // 停止当前歌词的播放（黄奕的第三方包的方法）
          this.currentLyric.stop()
          // 设置当前时间为0
          this.currentTime = 0
          // 清空当前 那一行 歌词的内容；
          this.playingLyric = ''
          // 设置当前歌词所在行数为0
          this.currentLineNum = 0
        }
        // 先清除定时器
        clearTimeout(this.timer)
        // 延迟触发audio标签的play事件，否则会出现与scr请求发生冲突的bug;
        // 调用audio的play事件，也就是触发ready()这个函数；
        this.timer = setTimeout(() => {
          this.$refs.audio.play()
          this.getLyric()
        }, 1000)
      },
      // 监听是否播放歌曲，
      // watch的变量，参数1就是newValue,参数2就oldValue，这里不需要旧的值；
      playing(newPlaying) {
        // 拿到audio元素，缓存起来；
        const audio = this.$refs.audio
        // 使用当前改变后的playing的值判断
        this.$nextTick(() => {
          // 如果当前的playing的值是true则播放音乐，false就是暂停音乐；
          // .play和.pause都是audio元素DOM本身就有的方法；
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    components: {
      // 进度条组件
      ProgressBar,
      // 迷你进度条组件
      ProgressCircle,
      // 滚动组件
      Scroll,
      // 播放列表组件
      Playlist
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          /*cd唱片*/
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              /*无限旋转*/
              &.play
                animation: rotate 20s linear infinite
              //暂停旋转
              &.pause
                /*使用animation-play-state: paused控制当前动画暂停*/
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      /*正常尺寸cd唱片的动画*/
      &.normal-enter-active, &.normal-leave-active
        // enter-active：入场后，leave-active：离场前
        // 因为入场后的位置已经写好了，那么在入场后和离场前，元素就会回到这个元素已经写好的css样式
        // 所以只需要在入场前和离场后设置动画位置即可
        transition: all 0.4s
        /*transition标签，直接作用于标签下的第一个DOM元素*/
        /*但是，还可以增加子集嵌套的css来控制更深层级的子元素*/
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        /*enter:入场前，leave-to：离场后*/
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      /*迷你cd唱片的动画*/
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          /*无限旋转*/
          &.play
            animation: rotate 10s linear infinite
          /*暂停旋转  */
          &.pause
            /*使用animation-play-state: paused控制当前动画暂停*/
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0
  /*cd唱片旋转动画*/
  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
