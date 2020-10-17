<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="small" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="small"
            v-else-if="scope.row.cat_level === 1"
            type="success"
            >二级</el-tag
          >
          <el-tag size="small" v-else type="warning">三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button size="small" type="primary">编辑</el-button>
          <el-button size="small" type="danger">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @open="addCateDialogOpened"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="分级分类：">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            @change="parentCateChanged"
            :props="cascaderProps"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 设置查询条件的初始条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 分页使用到的total总数据
      total: 0,
      // 为 table 指定列的定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        // 表示把当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用的模板名称
        template: 'isok'
      }, {
        label: '排序',
        // 表示把当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用的模板名称
        template: 'order'
      }, {
        label: '操作',
        // 表示把当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用的模板名称
        template: 'opt'
      }],
      // 增加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类表单绑定的数据
      addCateForm: {
        // 分类的名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类层级，默认添加的是1级分类
        cat_level: 0
      },
      // 添加分类表单绑定的验证规则
      addCateFormRules: {
        cat_name: [{
          required: true, message: '请输入分类名称', trigger: 'blur'
        }]
      },
      // 父级分类使用的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        checkStrictly: true,
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
    }
  },
  // 声明周期函数
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$axios.get('categories', {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！');
      }

      // 将请求到的数据加载到 cateList and total 对象上
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    // 点击添加分类按钮的函数处理事件
    showAddCateDialog() {
      // 先展示父级分类的数据列表
      this.getParentCateList();
      // 在展示添加对话框
      this.addCateDialogVisible = true
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$axios.get('categories', {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败');
      }
      this.parentCateList = res.data
    },
    // 选择器发生变化触发这个函数
    parentCateChanged() {
      // 如果 selectedKey 数组中的 length 大于0，证明选中了父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        // 为当前类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 关闭分类对话框时调用的函数
    addCateDialogOpened() {
      this.selectedKeys = [];
      this.addCateForm.cat_name = ''
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      // this.$refs.addCateFormRef.resetFields();
    },
    // 添加分类按钮被点击了
    addCate() {
      // 表单数据验证
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return;
        // 表单预验证通过，可以执行写入操作
        const { data: res } = await this.$axios.post('categories', this.addCateForm);
        if (res.meta.status !== 201) {
          return this.$message.error('分类保存失败！')
        }
        this.$message.success('分类保存成功')
        this.getCateList();
        this.addCateDialogVisible = false;
      })
      console.log(this.addCateForm);
      // 
    },
  }
}
</script>

<style scoped>
.treeTable {
  margin-top: 15px;
}
</style>