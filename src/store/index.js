import Vue from 'vue'
// 载入Vuex，记得安装；
import Vuex from 'vuex'

import * as actions from './actions'

// 对外提供数据
import * as getters from './getters'

// 定义数据
import state from './state'

// 修改state中的数据，只能通过mutations中的函数修改
import mutations from './mutations'

// 修改日志，记录了每次修改state中数据的记录
import createLogger from 'vuex/dist/logger'

// 挂载
Vue.use(Vuex)

// 用于报错的设置；会占用内容，在生产环境时候将其注释掉
// 开发模式下可以打开，用于检查bug
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  // 将引入的文件都挂载
  actions,
  getters,
  state,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
