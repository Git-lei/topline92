// 独立文件,axios

import Vue from 'vue'

import router from '@/router'

// 导入axios模块
import axios from 'axios'

// 引入 数据转换器 处理服务器返回的数据
import JSONbig from 'json-bigint'
// 配置公共地址
axios.defaults.baseURL = 'http://ttapi.research.itcast.cn/'
// 配置数据转换器
axios.defaults.transformResponse = [
  function (data) {
    if (data) {
      // 服务器端返回给客户端的data数据主要就两种类型
      // 1) 字符串对象  '{xx:xx...}'
      // 2) 空字符串   ''
      // 在此处要利用JSONbig对返回的信息加以处理，如果不处理，系统默认是通过JSON.parse()给处理的
      // 这样大数字就错误了
      return JSONbig.parse(data)
    }
    return data
  }]

// 配置为Vue的继承成员
Vue.prototype.$http = axios

// 配置请求拦截器
// Add a request interceptor
axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  let userinfo = window.sessionStorage.getItem('userinfo')
  if (userinfo) {
    let token = JSON.parse(userinfo).token
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})
// 配置响应拦截器
// Add a response interceptor
axios.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  // 错误401 时 的处理程序
  if (error.response.status === 401) {
    router.push('/login')
  }
})
