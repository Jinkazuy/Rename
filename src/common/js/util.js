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

export function debounce(func, delay) {
  let timer

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
