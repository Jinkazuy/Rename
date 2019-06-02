import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
// 载入router
import router from './router'
// 解决移动端点击延迟的插件
import fastclick from 'fastclick'
// 懒加载插件
import VueLazyload from 'vue-lazyload'
// 载入vuex，这里会自动找到index.js文件；
// 和写'./store/index.js'效果一样；
import store from './store'
// 载入styl样式文件
import 'common/stylus/index.styl'

// 将点击插件应用于body元素下，也就是body下的所有元素点击都不会有300ms延迟；
fastclick.attach(document.body)

// 挂载懒加载插件
Vue.use(VueLazyload, {
  // 这里加载前默认的兜底加载图
  loading: require('common/image/default.png')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  // 挂载router
  router,
  // 挂载vuex
  store,
  render: h => h(App)
})
