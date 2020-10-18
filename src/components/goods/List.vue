<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="clearQuery"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="searchGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table 表格区域 -->
      <el-table :data="listData" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="600px">
        </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量">
        </el-table-column>
        <el-table-column label="创建时间" width="150">
          <!-- 增加时间过滤器 -->
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormet }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
            ></el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeGoods(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页导航栏 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  // 数据区域
  data() {
    return {
      // 查询条件对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表总数量
      total: 0,
      // 商品列表展示的数据
      listData: [],
    }
  },
  // 声明周期函数
  created() {
    this.getListData()
  },
  // 行为区域，定义事件处理函数
  methods: {
    // 获取商品列表数据
    async getListData() {
      const { data: res } = await this.$axios.get('goods', {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.$message.success('获取商品列表成功')
      this.total = res.data.total
      this.listData = res.data.goods
    },
    // 监听 分页导航栏size 变化时的事件处理函数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getListData()
    },
    // 监听 分页导航栏当前页面 变化时的事件处理函数
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getListData()
    },
    // 监听 搜索商品 按钮被点击的事件处理函数
    searchGoodsList() {
      this.getListData()
    },
    // 监听 清空查询条件 事件处理函数
    clearQuery() {
      this.getListData()
    },
    // 根据商品id删除对应的商品条目
    removeGoods(goods_id) {
      // 弹框询问是否删除数据
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$axios.delete(`goods/${goods_id}`);
        if (res.meta.status !== 200) {
          return this.$message.error('删除数据失败');
        }
        this.$message.success('删除成功!');
        this.getListData();
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    // 监听 添加商品 按钮，点击跳转到 添加商品 页面
    goAddPage() {
      this.$router.push('/goods/add');
    }
  },
  // 计算属性
  computed: {

  }
}
</script>

<style>
</style>