import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

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

const Disc = (resolve) => {
  import('components/disc/disc').then((module) => {
    resolve(module)
  })
}

const TopList = (resolve) => {
  import('components/top-list/top-list').then((module) => {
    resolve(module)
  })
}

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
