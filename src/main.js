import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入全局样式文件
import './assets/css/global.css'
// 引入字体图标
import './assets/fonts/iconfont.css'
// 引入axios包
import axios from 'axios'
// 引入qs包
import qs from 'qs'
import TreeTable from 'vue-table-with-tree-grid'


// 配置axios请求相关设置
axios.defaults.baseURL = 'http://localhost:8888/api/private/v1';
// 设置axios拦截器，每次调用axios前都会调用此方法
axios.interceptors.request.use(config => {
    console.log(config);
    // 在头部信息中添加对应的字段信息
    config.headers.Authorization = sessionStorage.getItem('token');
    // 最后需要返回config对象
    return config;
});
// 将axios挂载到Vue原型上，
Vue.prototype.$axios = axios;
Vue.prototype.$qs = qs;
// Vue.use(axios);

Vue.config.productionTip = false

// 将tree-table加载到component组件上
Vue.component('tree-table', TreeTable)

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')