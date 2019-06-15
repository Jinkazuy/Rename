import 'babel-polyfill'
import Vue from 'vue'
// 挂载App.vue这个最大的组件
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

// // 因为eslint 会检查到没有被引用的 import 的文件、第三方包；
// // 因为这个第三包是不需要调用的，所以不让eslint不检查这个import
// // 这里是微信的第三方包，用于移动端打印信息，如果不需要就注释即可；
// /* eslint-disable no-unused-vars */
// import VConsole from 'vconsole'
// var vConsole = new VConsole()
//
// console.log('打印移动端测试，用到了微信的vConsole 第三方包')

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
