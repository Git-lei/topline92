import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '@/views/login'
import Home from '@/views/home'

// 引入nprogress
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.use(VueRouter)

const routes = [
  // 路由
  { path: '/login', component: () => import('@/views/login') },
  // { path: '/login', name: 'login', component: Login },

  //  1.import xxx from ('/xxx) 模块化导入  //全部导入
  //  2. import(@/xxx)  函数调用   //按需导入   (@ 代表src目录下的 绝对路径)
  {
    path: '/home',
    name: 'home',
    component: Home,
    // 重定向
    redirect: '/welcome',
    // 配置子路由
    children: [
      // 首页欢迎
      { path: '/welcome', name: 'welcome', component: () => import('@/views/welcome') },
      // 文章列表
      { path: '/article', name: 'articleList', component: () => import('@/views/article') },
      // 添加文章
      {
        path: '/articleadd',
        name: 'ArticleAdd',
        component: () => import('@/views/articleadd')
      },
      // 编辑文章
      {
        path: '/articleedit/:aid',
        name: 'articleedit',
        component: () => import('@/views/articleedit')
      },
      // 账户管理
      {
        path: '/account',
        name: 'account',
        component: () => import('@/views/account')
      },
      // 素材管理
      {
        path: '/material',
        name: 'material',
        component: () => import('@/views/material')
      },
      // 粉丝管理
      {
        path: '/fans',
        name: 'fans',
        component: () => import('@/views/fans')
      }
    ]
  }

]

const router = new VueRouter({
  routes
})

// 配置全局 前置路由守卫
router.beforeEach((to, from, next) => {
  // 配置 进度条
  NProgress.inc()
  // 获得 用户登录状态
  let userinfo = window.sessionStorage.getItem('userinfo')
  if (!userinfo && to.path !== '/login') {
    return next('/login')
  }
  next()
})

// 配置全局 后置路由守卫
router.afterEach((to, from) => {
  NProgress.done()
})

export default router
