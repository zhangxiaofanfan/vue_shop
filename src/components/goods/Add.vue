<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加商品信息导航栏 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="getActiveIndexInt"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 编辑区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的 item 项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="valsItem"
                  v-for="(valsItem, index) in item.attr_vals"
                  :key="index"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示上传图片的URL地址 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"> </quill-editor>
            <el-button type="primary" class="submitBtn" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisable" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 步骤条 正在编辑 的索引值 
      activeIndex: '0',
      // 添加商品
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 上传的图片临时存放路径
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        // 用来保存静态属性和动态参数的变量
        attrs: []
      },
      // 添加商品对应的规则对象
      addFormRules: {
        goods_name: [{
          required: true, message: '请输入商品名称', trigger: 'blur'
        }],
        goods_price: [{
          required: true, message: '请输入商品价格', trigger: 'blur'
        }],
        goods_weight: [{
          required: true, message: '请输入商品重量', trigger: 'blur'
        }],
        goods_number: [{
          required: true, message: '请输入商品数量', trigger: 'blur'
        }],
        goods_cat: [{
          required: true, message: '请选择商品分类', trigger: 'blur'
        }],
      },
      // 分类列表
      cateList: [],
      // 分类列表的属性配置
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表
      manyTableData: [],
      // 静态参数列表
      onlyTableData: [],
      // 上传图片请求路径
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 设置上传对象的请求头对象
      headerObj: {
        Authorization: sessionStorage.getItem('token')
      },
      // 图片地址
      previewPath: '',
      // 控制预览对话框的显示与隐藏
      previewVisable: false,
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取分类信息
    async getCateList() {
      const { data: res } = await this.$axios.get('categories');
      if (res.meta.status !== 200) {
        this.$message.error('获取分类信息失败')
      }
      this.cateList = res.data
      console.log(this.cateList);
    },
    // 监听 级联选择器 变化时触发的事件处理函数
    handleChange() {
      if (this.addForm.goods_cat.length < 3) {
        this.addForm.goods_cat = []
        this.$message.warning('请选择三级分类')
      }
    },
    // 监听标签页的点击事件
    beforTabLeave(activeName, oldActiveName) {
      if (activeName !== '0' && oldActiveName === '0') {
        if (this.addForm.goods_cat.length < 3) {
          this.$message.error('请选选择商品分类')
          return false
        }
      }
    },
    // 监听 tab标签 被点击的事件
    async tabClick() {
      // 证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        });
        if (res.meta.status !== 200) {
          return this.$message.error('获取分类失败')
        }

        // 将attr_vals字符串进行分割
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        });

        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        // 证明访问的是商品属性页面
        const { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        });
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败')
        }
        console.log(res.data);
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisable = true
    },
    // 点击移除图片处理函数
    handleRemove(file) {
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从pics数组中，找到这个图片对应的索引值
      const index = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3. 调用数组的splice方法，把图片信息对象，从 pics 数组中移除
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm);
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response);
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
      console.log(this.addForm);
    },
    // 监听 添加商品 事件被触发
    add() {
      console.log(this.addForm);
      // 验证表单
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // 执行添加商品的业务逻辑
        this.addForm.goods_cat = this.addForm.goods_cat.join(',')
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        });
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        });
        
        // 发起网络请求
        const {data: res} = await this.$axios.post('goods', this.addForm);
        if (res.meta.status !== 201) {
            return this.$message.error('保存商品失败')
        }
        this.$message.success('保存数据成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    getActiveIndexInt() {
      return this.activeIndex - '0'
    },
    cateId() {
      return this.addForm.goods_cat.length === 3 ? this.addForm.goods_cat[2] : null
    }
  }
}
</script>

<style scoped>
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.submitBtn {
  margin-top: 15px;
}
</style>