import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

// 原始的引入组件的方法是：↓↓↓
// import Recommend from 'components/recommend/recommend'

// 这种import().then()的方法的区别，太长了，看文章吧；
// https://blog.csdn.net/ixygj197875/article/details/79263912

// 大概意思就是: import()可以放在函数或者代码块中，而import..from只能用在最外层模块；
// 因为 import..from 执行的优先级会大于其他代码、函数等，也就是会在其他代码之前执行；

// 但import()允许放在函数中的，也就做到了按需加载，而且import()返回的是一个promise对象；
// 这样比如在click一个元素的时候 就可以在这个click的处理函数中，在import()某个文件；

// 那么也称之为：懒路由加载、动态路由加载；
// 这样的好处就是动态的加载路由，打包编译时候的文件不会很大；
// 那么初次请求的时候，请求的数据也不会很大，都是用到相关的路由的时候，再申请对应的路由的页面、组件；

// 一级路由：推荐页
const Recommend = (resolve) => {
  import('components/recommend/recommend').then((module) => {
    resolve(module)
  })
}

// 一级路由：歌手列表页
const Singer = (resolve) => {
  import('components/singer/singer').then((module) => {
    resolve(module)
  })
}

// 一级路由：排行榜页
const Rank = (resolve) => {
  import('components/rank/rank').then((module) => {
    resolve(module)
  })
}

// 一级路由：搜索页
const Search = (resolve) => {
  import('components/search/search').then((module) => {
    resolve(module)
  })
}

// 二级路由：歌手详情页
const SingerDetail = (resolve) => {
  import('components/singer-detail/singer-detail').then((module) => {
    resolve(module)
  })
}

// 二级路由：推荐页-歌单列表页
const Disc = (resolve) => {
  import('components/disc/disc').then((module) => {
    resolve(module)
  })
}

// 二级路由：排行榜详情页
const TopList = (resolve) => {
  import('components/top-list/top-list').then((module) => {
    resolve(module)
  })
}

// 一级：用户中心
const UserCenter = (resolve) => {
  import('components/user-center/user-center').then((module) => {
    resolve(module)
  })
}

export default new Router({
  routes: [
    {
      // 重定向到推荐页路由
      path: '/',
      redirect: '/recommend'
    },
    {
      // 推荐页
      path: '/recommend',
      component: Recommend,
      // 二级路由，歌单详情页
      // 那么在访问/recommend/xx(歌单id)，就能打开歌单详情页了；
      children: [
        {
          path: ':id',
          component: Disc
        }
      ]
    },
    {
      // 歌手列表页路由
      path: '/singer',
      component: Singer,
      // 二级路由，歌手详情页；
      children: [
        {
          // 这里实际的path实际上父级路由path+这个子集路由path，
          // 也就是：/singer/xx；(xx就是歌手id)
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      // 排行榜页
      path: '/rank',
      component: Rank,
      // 排行榜详情页
      children: [
        {
          path: ':id',
          component: TopList
        }
      ]
    },
    {
      // 搜索页
      path: '/search',
      component: Search,
      // 搜索结果详情页
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      // 用户中心页
      path: '/user',
      component: UserCenter
    }
  ]
  // ,
  // linkActiveClass: 'router-link-active'
  // 覆盖默认的路由高亮的类，默认的类叫做 router-link-active
  // 每个路由的 router-link 在被点击激活的时候会有一个临时加的类，这个类原名叫做router-link-active，
  // 当然可以改成别的，比如my-router-link，不过该不该无所谓
})
