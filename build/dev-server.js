require('./check-versions')()

var config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')

// 引入axios，用于发送ajax请求，引入前记得安装；
var axios = require('axios')

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

// 注册express
var app = express()

// 注册路由
var apiRoutes = express.Router()

// 因为向qq服务器请求500，也就是不允许前端请求头，那么就在这里使用node.js发送请求
// 目的就是修改请求头；
apiRoutes.get('/getDiscList', function (req, res) {
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'

  // 这里使用到 axios第三方包 发送ajax请求的库；
  axios.get(url, {
    // 重点在这里，修改请求头，达到欺骗qq服务器目的；
    headers: {
      // 那么在这里，是node.js后端发起的请求，也就可以修改请求头了；
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    // 设置请求体
    // 这里将recommend.js下的getDiscList()的data拿到，也就是这里的req.query；
    params: req.query
  }).then((response) => {
    // 获取成功的结果
    // 直接输出给前端
    res.json(response.data)
  }).catch((e) => {
    // 获取失败
    console.log(e)
  })
})

// 获取歌词=======================
// 同样因为qq服务器对获取数据做了保护，所以获取歌词也要修改请求头
apiRoutes.get('/lyric', function (req, res) {
  // 需要请求的url；
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

  // 由node.js向qq服务器发送请求；
  axios.get(url, {
    // 修改请求头，达到欺骗的目的
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    // 请求体，请求体就是api/song.js发过来的请求体，
    params: req.query
  }).then((response) => {
    // 拿到请求的结果，axios发送的请求的返回值，一般都在data属性下；
    var ret = response.data
    // 这个进行一个判断，如果拿到的数据是字符串类型的话，格式是这样：jsonCallback({\"retcode"\:0,\"code\":0,})
    // 那么我们需要的只是{}里的内容，所以这里用正常匹配；
    // 就需要转成json对象；
    if (typeof ret === 'string') {
      // 第一个^是开始，而[]中的那个^取非的意思
      // 这个正则的意思大概是：
      // 以任意字母(多个)开始， 并且以()结束，因为使用了转移符\；
      // 匹配到的小括号里使用[]分组，每个分组中，不能是()这个符号，那么匹配到的就是"retcode":0,"code":0,...
      var reg = /^\w+\(({[^()]+})\)$/
      // 用正则表达式.match方法，匹配返回的结果的值；
      var matches = ret.match(reg)
      // 如果能够匹配到，说明此时的matches就等于一个json格式的字符串了；
      if (matches) {
        // 那么就将这个结果转成json对象；
        ret = JSON.parse(matches[1])
      }
    }
    // node.js发送请求完了之后，拿到结果；

    // 然后再将结果返回给前台js；
    // 这里将结果直接返回，设置res，也就是处理router的fn的第二个参数；
    // 那么在api/song.js中想这个node.js发的请求，axios.get(...).then(就能拿到)
    // res.json是返回json格式的数据
    res.json(ret)
  }).catch((e) => {
    console.log(e)
  })
})
// 获取歌词结束=======================


// 将/api这个url用apiRoutes处理；
app.use('/api', apiRoutes)

var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

var uri = 'http://localhost:' + port

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})

var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
