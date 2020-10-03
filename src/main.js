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


// 配置axios请求相关设置
axios.defaults.baseURL = 'http://localhost:8090/';
// 将axios挂载到Vue原型上，并设置$http为原型调用
Vue.prototype.$axios = axios;
Vue.prototype.$qs = qs;
// Vue.use(axios);

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')