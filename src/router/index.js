import Vue from 'vue'
import Router from 'vue-router'
import login from '@/components/login'
import index from '@/components/index'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'login',
      component: login,
      meta:{
        title:'登录'
      }
    },
    {
      path: '/index',
      name: 'index',
      component: index,
      meta:{
        title:'查询',
        requireAuth: true,
      }
    }
  ]
})
