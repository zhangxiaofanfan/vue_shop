import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../components/login'
import home from '../components/Home'
import welcome from '../components/Welcome'
import users from '../components/user/Users.vue'
import rights from '../components/power/Rights.vue'
import roles from '../components/power/Roles.vue'
import categories from '../components/goods/Categories.vue'

Vue.use(VueRouter)

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: login },
    {
        path: '/home',
        component: home,
        redirect: '/welcome',
        children: [
            { path: '/welcome', component: welcome },
            { path: '/users', component: users },
            { path: '/rights', component: rights },
            { path: '/roles', component: roles },
            { path: '/categories', component: categories },
        ]
    },
]

const router = new VueRouter({
    mode: 'history',
    routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // to 将要访问的路径
    // from 源路径
    // next 是一个函数，表示是否放行
    //      next() 放行跳转     next('route') 强制跳转到指定路径
    if (to.path === '/login') {
        next();
    }

    // 获取token，如果存在token，默认已经登录过，可以进行跳转
    const tokenStr = sessionStorage.getItem('token');
    if (!tokenStr) {
        next('/login')
    }
    next();
})

export default router