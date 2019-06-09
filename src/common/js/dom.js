
// 判断是否有某个类名，返回Boolean值；
export function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

// 添加类名，如果有该类名就不做操作，如果没有就追加；
export function addClass(el, className) {
  if (hasClass(el, className)) {
    return
  }

  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

export function getData(el, name, val) {
  const prefix = 'data-'
  if (val) {
    return el.setAttribute(prefix + name, val)
  }
  return el.getAttribute(prefix + name)
}

// ------------------这里进行一个JS控制DOM元素的style的兼容性---------------
// 创建一个DIV的style的属性例子，用于判断；
let elementStyle = document.createElement('div').style

// 设置一个立即执行的函数
let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }

  // 循环vendor中设置好的浏览器兼容前缀；
  for (let key in transformNames) {
    // 如果匹配到浏览器私有前缀，说明是该浏览器，那么将这个浏览器前缀返回；
    if (elementStyle[transformNames[key]] !== undefined) {
      // 注意：这里是循环的key不是transformNames[key]；
      // 返回的也就是webkit、Moz这些键；
      return key
    }
  }

  // 如果遍历完后没有找到任何前缀，说明……浏览器可能比较小众。。。
  return false
})()

// 最后执行完上边vendor中的代码；
// 最终导出这个prefixStyle()，引用的时候传入css的样式即可做兼容性的判断，
// 返回的是标准的style 或者 加了浏览器私有前缀+style 的字符串；
export function prefixStyle(style) {
  // 如果vendor返回的false说明没有找到匹配该浏览器的前缀，返回false；
  if (vendor === false) {
    return false
  }

  // 如果vendor返回的是standard，说明是一个标准的样式，就不需要浏览器私有前缀；
  // 也就是说，调用这个prefixStyle传入的是什么，返回的就是什么
  if (vendor === 'standard') {
    return style
  }

  // 如果即不是false，也不是标准，那说明匹配到了设置好的浏览器私有前缀的某一个
  // 那么返回这个私有前缀+样式名的字符串；
  // 如：'webkit'+'T'+'ransform'
  // 那么再转成css的时候，由于JS中驼峰命名，js转css时会将大写的字母转成小写并且前边加上-
  // 所以最终在DOM的css时候就是webkit-Transform
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)

  //  .charAt() 方法可返回指定位置的字符。
  //  .toUpperCase() 方法用于把字符串转换为大写。
  //  .substr() 方法用于从指定位置截取字符串，
  //  所以这三个方法等于将传入的style名的第一个字母转成大写，
}
