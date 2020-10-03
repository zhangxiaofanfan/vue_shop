<template>
  <div>
      <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
    methods: {
      logout(){
        this.$message.error('退出按钮被点击!');
        sessionStorage.clear('token');
        this.$router.push('/login')
      }
    }
}
</script>

<style scoped>

</style>