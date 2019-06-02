// 因为qq音乐请求体需要传入一些参数，这里就统一写好在recommend.js中引入即可
// 这样的好处就是不用为每个url请求再写一次这些请求体，get请求的？参数了；
export const commonParams = {
  g_tk: 1928093487,
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0,
  format: 'jsonp'
}

export const options = {
  param: 'jsonpCallback'
}

export const ERR_OK = 0
