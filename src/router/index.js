import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Users from '../components/users/Users'
import Roles from '../components/roles/Roles'
import Rights from '../components/rights/Rights'
import Categories from '../components/goods/Categories'
import Params from '../components/goods/Params'
import Goods from '../components/goods/Goods'
import Add from '../components/goods/Add'
import Order from '../components/order/Order'
import Report from '../components/report/Report'


Vue.use(VueRouter)

const routes = [
  // 重定向路由规则
  {
    path: '/',
    redirect: '/login',
  },
  {
    name: 'login',
    path: '/login',
    component: Login,
  },
  {
    name: 'home',
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        name: 'welcome',
        path: '/welcome',
        component: Welcome,
      },
      {
        name: 'users',
        path: '/users',
        component: Users,
      },
      {
        name: 'roles',
        path: '/roles',
        component: Roles,
      },
      {
        name: 'rights',
        path: '/rights',
        component: Rights,
      },
      {
        name: 'categories',
        path: '/categories',
        component: Categories,
      },
      {
        name: 'params',
        path: '/params',
        component: Params,
      },
      {
        name: 'goods',
        path: '/goods',
        component: Goods,
      },
      {
        name: 'add',
        path: '/goods/add',
        component: Add,
      },
      {
        name: 'order',
        path: '/orders',
        component: Order,
      },
      {
        name: 'report',
        path: '/reports',
        component: Report,
      },
    ],
  },
]

const router = new VueRouter({
  routes,
})

// 挂载路由守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 从哪个路径跳转而来
  // next 下一步跳到哪里去
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

export default router
