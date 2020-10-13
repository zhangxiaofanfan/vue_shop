<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 格栅布局，将一行格栅成两个，gutter表示两个栅之间的距离 -->
      <!-- 所有与添加用户区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <!-- 增加索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 父子组件与作用域插槽的使用 -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <!-- 父子组件与作用域插槽的使用 -->
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="角色分配"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域，layout表示此插件显示布局的功能列表 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 用户添加的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证手机号的规则，role表示验证规则，value表示验证的值，callback为回调函数
    let checkMobile = (role, value, callback) => {
      // 定义验证手机号的正则表达式
      const regMobile = /^((13[0-9])|(17[0-1,6-8])|(15[^4,\\D])|(18[0-9]))\d{8}$/;

      if (regMobile.test(value)) {
        // 验证规则通过
        return callback();
      }
      return callback(new Error('请输入合法手机号'));
    }

    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '用户名的长度在6~15个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          // 将自定义放在role中，进行生效
          { validator: checkMobile, trigger: 'blur' }
        ],
      },
      // 用于修改用户对话框的显示与隐藏
      editDialogVisible: false,
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          // 将自定义放在role中，进行生效
          { validator: checkMobile, trigger: 'blur' }
        ],
      }
    }
  },
  // 生命周期函数
  created() {
    this.getUserList();
  },
  // 处理事件的方法
  methods: {
    async getUserList() {
      // const {data: res}为解构，将对象的data属性取出来，然后重命名为res
      const { data: res } = await this.$axios.get('users', {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) this.$message.error(res.meta.msg);
      this.userList = res.data.users;
      this.total = res.data.total;
      console.log(res);
    },
    // 监听 pageSize 变化时触发的函数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听 pagenum 变化时触发的函数
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听 switch 开关状态的改变
    async userStateChanged(userInfo) {
      const { data: res } = await this.$axios.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error(res.meta.msg);
      }
      this.$message.success("更新数据成功");
    },

    // 监听添加用户对话框关闭时触发的函数
    addDialogClosed() {
      // 重置表单数据
      this.$refs.addFormRef.resetFields();
    },
    // 点击确认按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        // 验证没有通过
        if (!valid) return;
        // 验证通过后，将数据进行存储
        const { data: res } = await this.$axios.post('users', this.addForm);
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败');
        }
        this.$message.success('添加用户成功')
        this.addDialogVisible = false;
        this.getUserList();
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$axios.get(`users/${id}`);

      if (res.meta.status !== 200) {
        return this.$message.error('查询用户数据失败');
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        console.log(valid);
        if (!valid) return;
        // 发起修改用用户信息的数据请求
        const { data: res } = await this.$axios.put(`users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        });

        if (res.meta.status !== 200) {
          return this.$message.error('更新信息失败')
        }

        // 关闭对话框
        this.editDialogVisible = false;
        // 提示用户修改成功
        this.$message.success('更新信息成功')
        // 刷新数据
        this.getUserList();
      })
    },
    // 根据用户id删除用户
    removeUserById(id) {
      // 弹框询问是否删除数据
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {data: res} = await this.$axios.delete(`users/${id}`);
        if (res.meta.status !== 200) {
          return this.$message.error('删除数据失败');
        }
        this.$message.success('删除成功!');
        this.getUserList();
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    }
  }
}
</script>

<style>
</style>