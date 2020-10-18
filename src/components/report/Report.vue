<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 2. 为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 600px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
// 1. 导入echarts组件
import echarts from 'echarts'

export default {
  data() {
    return {
      reportData: {}
    }
  },
  created() {

  },
  // 此时，页面上的元素已经被渲染完毕
  async mounted() {
    // 3. 基于准备好的dom，初始化echarts实例
    let myChart = echarts.init(document.getElementById('main'));

    // 4. 准备数据和配置项: 通过请求方式获取数据
    const { data: res } = await this.$axios.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取数据失败')
    }

    // 5. 展示数据：使用刚指定的配置项和数据显示图表。
    myChart.setOption(res.data);
  },
  computed: {

  },
  methods: {

  }
}
</script>

<style>
</style>