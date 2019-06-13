// 返回一个随机数
function getRandomInt(min, max) {
  // 这个方法返回了min和max之间的整数，而且包括了min和max值；
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 对顺序播放列表进行随机化，洗牌函数，
// 这个洗牌函数也是一个比较常见的方法；
// 有点像冒泡排序
export function shuffle(arr) {
  // 拿到顺序播放列表
  // Array.slice() 方法可从已有的数组中返回选定的元素，如果不填入参数则返回完整的数组；
  // 拿到这个数组的目的不破坏原有顺序播放列表；
  let _arr = arr.slice()
  // 遍历这个顺序播放列表的数组
  for (let i = 0; i < _arr.length; i++) {
    // 调用返回随机数的方法
    let j = getRandomInt(0, i)
    // 将当前遍历的歌曲先拿到
    let t = _arr[i]
    // 然后将当前遍历的歌曲的位置与随机数的交换位置
    // 这样就打乱的歌曲列表的顺序了，形成了一个随机播放列表
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  // 将打乱后的播放列表，也就是随机列表返回
  return _arr
}

// 这里是为了解决input框内文字改变时，就立刻发送jsonp请求的函数
// 目的是，经过xx毫秒延迟后，再发送jsonp请求；
export function debounce(func, delay) {
  // 临时变量，用来承载定时器
  let timer

  // 在调用这个debounce会返回一个函数
  // 那么这个返回的函数，才是被 search-box.vue 的$watch到query改变时 执行的函数，
  // 而且会$watch 会将 newVal 和 oldVal 传入这个 return function (...args)
  // 而且这个返回的函数用了剩余语法，也就拿到了 search-box.vue 的$watch 传入的 newVal 和 oldVal ；
  return function (...args) {
    // 这个...args 剩余参数语法；
    // ES6 引入 rest 参数（形式为“...变量名”），
    // 用于获取函数的多余参数，这样就不需要使用arguments对象了。
    // rest 参数搭配的变量是一个数组，该变量将多余的参数放入数组中。（可以拿到除开始参数外的参数）
    // 那么此时...args，就拿到了 search-box.vue 的$watch的query的 newVal 和 oldVal，
    // 形成了数组[new,old]，也就是 search-box.vue 下的 query 的新值和旧值；
    // 其实写成return function (newVal, oldVal) {}是一样的，
    // 只不过用...args这种剩余参数语法跟高级，而且能够拿到形参之外的实参；
    // 当然我们知道这里是两个参数，但如果是3个参数的话 function (newVal, oldVal) 是拿不到第三个参数的，
    // 只能通过arguments对象拿到；（arguments是每个function默认的参数对象，就像是事件处理函数的参数对象 on.('click',fun(e){} ) 的参数e一样 ）
    // 清空定时器
    if (timer) {
      clearTimeout(timer)
    }
    // 设置定时器
    timer = setTimeout(() => {
      // 此时的args是一个数组，也就是剩余参数的实际内容；
      // 在经过参数2值毫秒之后，执行参数1中的函数；
      // 这里的apply方法，是劫持func的对象个参数
      // .apply 参数1：改变函数的this指向，
      // 参数2，数组，将这个数组作为func的参数；

      // 那么其实这类的参数1并没有改变指向，但是必须写，所以写this，其实就是没有改变指向
      // 使用apply的目的，主要是为的是第2个参数，因为apply的第二个参数 要求是数组，
      // 那么正好，上边用的剩余参数...args，拿到的结果也是数组，所以正好吻合；
      // 如果不用apply的话，那么就得写 func(args[0], args[1]) 这样看起来比较傻；
      // 这个func就是 search-box.vue 中debounce的 this.$emit('query', newQuery)
      func.apply(this, args)
      // 如果上边的 return function (newVal, oldVal) {...}
      // 这里也用不到apply方法了；
      // 可以直接写 func(newVal, oldVal)
    }
    , delay)
  }
}
