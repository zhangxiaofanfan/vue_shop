<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加用户按钮 -->
      <el-button type="primary" @click="addRoleDialogVisible = true"
        >添加角色</el-button
      >
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              class="vcenter"
              v-for="item1 in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightsById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二、三级权限 -->
              <el-col :span="19">
                <!-- 二级权限 -->
                <el-row
                  class="second-row vcenter"
                  v-for="item2 in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightsById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightsById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" prop="level" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRoleDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRole(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @closed="closeAddRoleDialog"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addRoleForm"
        :rules="addRoleFormRules"
        ref="addRoleFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="editRoleForm"
        :rules="editRoleFormRules"
        ref="editRoleFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称">
          <el-input v-model="editRoleForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%" @close="setRightDialogClosed"
    >
      <!-- 树型区域 -->
      <el-tree
        :data="rightsList"
        show-checkbox
        node-key="id"
        :props="treeProps"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="theeRef"
      >
      </el-tree>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      addRoleDialogVisible: false,
      addRoleForm: {
      },
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ]
      },
      // 编辑角色对话框显示变量  
      editRoleDialogVisible: false,
      editRoleForm: {
      },
      editRoleFormRules: {
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ]
      },
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      rightsList: [],
      // 属性空间的绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中节点id值驻足
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: ''
    }
  },
  // 当标签被创建时，调用此生命周期函数  
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$axios.get('roles');
      if (res.meta.status !== 200) return this.$message.error('获取列表角色失败！');
      this.rolesList = res.data;
    },
    // 增加用户被点击
    addRole() {
      // 验证表单规则是否生效
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return;

        // 验证通过
        const { data: res } = await this.$axios.post('roles', this.addRoleForm);

        if (res.meta.status !== 201) return this.$message.error('创建角色失败');

        this.$message.success('创建角色成功');
        this.addRoleDialogVisible = false;
        this.getRolesList();
      });
    },
    // 编辑角色按钮被点击
    async showEditRoleDialog(id) {
      // 根据序号id查询数据
      const { data: res } = await this.$axios.get(`roles/${id}`);
      if (res.meta.status !== 200) return this.$message.error('查询数据失败！')
      this.editRoleForm = res.data;
      this.editRoleDialogVisible = true;
    },
    async editRole() {
      const { data: res } = await this.$axios.put(`roles/${this.editRoleForm.roleId}`, this.editRoleForm);
      if (res.meta.status !== 200) return this.$message.error('修改角色失败')

      this.$message.success('修改角色成功');
      this.editRoleDialogVisible = false;
      this.getRolesList();
    },
    // 新增角色关闭时调用的函数
    closeAddRoleDialog() {
      this.$refs.addRoleFormRef.resetFields();
    },
    // 根据序号id删除单条数据
    removeRole(id) {
      // 再次确认用户是否进行数据删除
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$axios.delete(`roles/${id}`);
        if (res.meta.status !== 200) {
          return this.$message.error('删除数据失败');
        }
        this.$message.success('删除成功!');
        this.getRolesList();
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    // 根据用户id删除权限项
    async removeRightsById(role, rightsId) {
      // 再次确认用户是否进行数据删除
      this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$axios.delete(`roles/${role.id}/rights/${rightsId}`);
        if (res.meta.status !== 200) {
          return this.$message.error('删除数据失败');
        }
        this.$message.success('删除成功!');
        // 下面的方法会导致整个table都被渲染，这样不方便交互
        // this.getRolesList();
        role.children = res.data;
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    // 显示分配权限的对话框
    async showSetRightDialog(node) {
      this.roleId = node.id;
      // 获取所有权限的数据
      const { data: res } = await this.$axios.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.rightsList = res.data;
      console.log(this.rightsList);
      this.setRightDialogVisible = true;
      this.getLefeKeys(node, this.defKeys);
    },
    // 通过递归形式，获取角色下所有三级权限的id，并保存到指定的数组中
    getLefeKeys(node, arr) {
      // 如果当前节点不包含children节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLefeKeys(item, arr)
      });
    },
    setRightDialogClosed() {
      this.defKeys = [];
      this.roleId = ''
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.theeRef.getCheckedKeys(),
        ...this.$refs.theeRef.getHalfCheckedKeys(),
      ]
      console.log(keys);
      const idStr = keys.join(',');

      const {data: res} = await this.$axios.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })

      if (res.meta.status !== 200) return this.$message.error('分配权限失败！');

      // 保存数据成功后的操作
      this.$message.success('角色权限保存成功！')
      this.getRolesList();
      this.setRightDialogVisible = false;
    }
  }
}
</script>

<style scoped>
.el-button {
  margin-bottom: 15px;
}
.el-tag {
  margin: 7px;
}

.el-row {
  border-bottom: 1px solid #eee;
}
.el-row:nth-child(1) {
  border-top: 1px solid #eee;
}
.el-row .second-row:nth-child(1) {
  border-top: none;
}
.el-row .second-row:nth-last-child() {
  border-bottom: none;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>