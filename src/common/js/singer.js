// 创建一个构造函数，当需要创建歌手信息对象的时候，只需要new这个函数，然后把数据传入，
// 就能得到一个实例对象了，这样的好处就是省去每次都创建一个对象；
// 最终导出一个class为Singer，这样，在调用的时候new这个Singer并且传入对应的数据就能得到一个实例对象；
export default class Singer {
  constructor({id, name}) {
    // 歌手id
    this.id = id
    // 歌手名
    this.name = name
    // 歌手头像
    this.avatar = `https://y.gtimg.cn/music/photo_new/T001R300x300M000${id}.jpg?max_age=2592000`
  }
}
