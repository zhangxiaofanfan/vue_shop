<template>
    <div class="login_container">
        <div class="div_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <!-- src：路径   alt：规定图像的替代文本 -->
                <img src="../assets/logo.png" alt="头像信息">
            </div>
            <!-- 登录表单区域 -->
            <el-form label-width="0px" class="login_form" :model="loginForm" :rules="loginFromRules" ref="loginFormRef">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" placeholder="请输入密码" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
                </el-form-item>
                <!-- 按钮区域 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 这是登录表单的数据绑定对象
            loginForm: {
                username: 'zhangfan',
                password: 'zhangfan9359'
            },
            // 这是表单的验证规则对象
            loginFromRules: {
                // 验证用户名是否符合要求
                username: [
                    // required: true表示必填项 message: 没有填写时提示的信息 trigger: 'blur'表示失去焦点时，进行规则验证
                    { required: true, message: '请输入登录名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                // 验证密码是否符合要求
                password: [
                     // required: true表示必填项 message: 没有填写时提示的信息 trigger: 'blur'表示失去焦点时，进行规则验证
                    { required: true, message: '请输入登录密码', trigger: 'blur' },
                    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        // 父组件通过refs属性，直接获取子组件，然后进行对应的操作
        resetLoginForm() {
            // this表示的是login.vue
            this.$refs.loginFormRef.resetFields();
        },
        // 对整个表单进行校验的方法，参数为一个回调函数。该回调函数会在校验结束后被调用，并传入两个参数：是否校验成功和未通过校验的字段。若不传入回调函数，则会返回一个 promise
        login() {
            this.$refs.loginFormRef.validate( valid => {
                if (!valid) return;
                this.$axios({
                    method: 'post',
                    url: 'login',
                    data: this.loginForm,
                    headers: {"Content-Type": "application/json;charset=UTF-8"}
                }).then((res) => {
                    console.log(res)
                    const result = res.data;
                    if (result.meta.status !== 200) return this.$message.error('登录失败');
                    this.$message.success('登录成功');
                    // 1. 将登录成功之后的token保存到客户端的sessionStorage中
                    //  1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问；
                    //  1.2 token智能在当前网站打开期间生效，所以将token保存在sessionStorage中；
                    //  1.3 如果想要关闭会话还生效，设置过期时间的话，需要将token保存在localStorage中
                    sessionStorage.setItem('token', result.data.token);
                    // 2. 通过编程式导航，跳转到后台主页，路由地址是/home
                    this.$router.push('/home');
                }).catch((err) => {
                    console.log(err)
                });
            });
        }
    }
}
</script>
// scoped表示只在此文件中起作用
<style scoped>
.login_container{
    background-color: #2b4b6b;
    height: 100%;
}

.div_box {
    height: 300px;
    width: 450px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    /* 在横纵坐标上分别移动自身的50% */
    transform: translate(-50%, -50%);
    /* 与下面两行的效果是相同的，相面的更具有通用性
    margin-left: -225px;
    margin-top: -150px; */
}

.avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    /* 设置阴影 */
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
}

.avatar_box img{
    height: 100%;
    width: 100%;
    border-radius: 50%;
    background-color: #eee;
}

.login_form {
    position: absolute;
    width: 100%;
    bottom: 0;
    padding: 0 20px;
}
.login_form .btns{
    text-align: center;
}
</style>