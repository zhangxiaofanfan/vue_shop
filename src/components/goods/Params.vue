<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关属性"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            @change="cateChanged"
            :props="cateProps"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 标签 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            @click="addDialogVisable = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <!-- 循环渲染tag标签 -->
              <template slot-scope="scope">
                <el-tag
                  closable
                  class="params-tag"
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="handleClose(index, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 自定义增加标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeEditDialog(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            @click="addDialogVisable = true"
            >添加属性</el-button
          >
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <!-- 循环渲染tag标签 -->
              <template slot-scope="scope">
                <el-tag
                  closable
                  class="params-tag"
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="handleClose(index, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 自定义增加标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="属性名称" prop="attr_name">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeEditDialog(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'增加' + titleText"
      :visible.sync="addDialogVisable"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 增加表单区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'编辑' + titleText"
      :visible.sync="editDialogVisable"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 修改表单区域 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  // 数据区域
  data() {
    return {
      // 分类列表
      cateList: [],
      // 指定级联选择器的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 被激活的页签名称
      activeName: 'many',
      // 动态参数的数据   
      manyTableData: [],
      // 静态参数的数据   
      onlyTableData: [],
      // 增加动态参数和静态属性对话框的显示与隐藏
      addDialogVisable: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加参数的表单验证规则对象
      addFormRules: {
        attr_name: [{
          required: true, message: '请输入参数名称', trigger: 'blur'
        }]
      },
      // 修改动态参数和静态属性对话框的显示与隐藏
      editDialogVisable: false,
      // 修改参数的表单数据对象
      editForm: {
        attr_name: ''
      },
      // 修改参数的表单验证规则对象
      editFormRules: {
        attr_name: [{
          required: true, message: '请输入参数名称', trigger: 'blur'
        }]
      },
    }
  },
  // 声明周期函数
  created() {
    this.getCateList()
  },
  // 事件处理函数
  methods: {
    // 获取所有商品的分类
    async getCateList() {
      const { data: res } = await this.$axios.get('categories');
      if (res.meta.status !== 200) {
        return this.$message.error('获取列表失败！')
      }
      this.cateList = res.data;
      console.log(this.cateList);
    },
    // 级联选择框选中项变化，会触发这个函数
    cateChanged() {
      this.getParamsData();
    },
    // tab标签被点击事件处理函数
    handleTabClick() {
      console.log(this.activeName);
      this.getParamsData();
    },
    // 获取参数的数据列表
    async getParamsData() {
      // 判断用户是否选中三级标签
      if (this.selectedCateKeys.length < 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message.warning('请选择三级分类')
      }
      // 是三级分类，根据所选择的id，和当前所处的面板，获取对应的参数
      const { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败');
      }

      // 将 attr_vals 中的字符串按照空格进行分割，拆分成数组
      res.data.forEach(item => {
        item.inputVisible = false
        item.inputValue = ''
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
      });

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
      console.log(res.data);
    },
    // 监听 添加dialog对话框 关闭的事件处理函数
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加 params属性 事件函数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        // 表单验证没有通过
        if (!valid) return;
        // 表单验证通过
        const { data: res } = await this.$axios.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName

        });
        if (res.meta.status !== 201) return this.$message.error('保存参数失败')

        this.$message.success('保存成功')
        this.getParamsData()
        this.addDialogVisable = false
      });
    },
    // 监听 修改dialog对话框 关闭的事件处理函数
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 监听 编辑按钮 事件触发函数
    async showEditDialog(id) {
      const { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes/${id}`, {
        params: { attr_sel: this.activeName }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      this.editForm = res.data
      this.editDialogVisable = true
    },
    // 修改 params属性 事件函数
    editParams() {
      // 表单预校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$axios.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        });
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        this.$message.success('参数修改成功')
        this.getParamsData();
        this.editDialogVisable = false
      })
    },
    // 根据id删除对应的参数
    removeEditDialog(id) {
      // 再次确认用户是否进行数据删除
      this.$confirm('此操作将永久删除此参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$axios.delete(`categories/${this.cateId}/attributes/${id}`);
        if (res.meta.status !== 200) {
          return this.$message.error('删除参数失败');
        }
        this.$message.success('删除成功!');
        this.getParamsData();
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    // 监听 文本框失去焦点 的事件处理函数
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        this.$message.warning('输入参数不合法')
        return
      }
      // 输入值有效
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 发起网络请求，将数据进行保存
      this.saveAttrVals(row)
    },
    // 保存参数修改项
    async saveAttrVals(row) {
      const {data: res} = await this.$axios.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    },
    // 点击按钮，展示文本输入框
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick方法的作用：就是当页面上元元素被重新渲染后，才会指定回调函数的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 删除对应的参数可选项
    handleClose(index, row){
        row.attr_vals.splice(index, 1)
        this.saveAttrVals(row)
    }
  },
  // 计算属性区域
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false，控制按钮的使能
    isBtnDisable() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null;
    },
    // 动态计算标题的文本
    titleText() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  }
}
</script>

<style scoped>
.cat_opt {
  margin: 15px 0;
}
.params-tag {
  margin: 0 10px;
}
.input-new-tag {
  width: 120px;
}
</style>