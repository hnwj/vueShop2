<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色列表 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddRoles">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-pre>
              <el-row :class="['bdbottom', i1 == 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                <!-- 一级权限 -->
                <el-col :span="5">
                  <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 二级和三级权限 -->
                <el-col :span="19">
                  <el-row :class="[i2 == 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                    <el-col :span="6">
                      <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag type="warning" closable @close="removeRightById(scope.row, item3.id)" v-for="(item3, i3) in item2.children" :key="item3.id">
                        {{ item3.authName }}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </el-pre>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.id)" round>编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeRole(scope.row.id)" round>删除</el-button>
            <el-button type="warning" size="mini" icon="el-icon-setting" round @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" @closed="addFormClosed" :visible.sync="addDialogVisible" width="50%">
      <el-form :model="addRolesForm" :rules="addRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog @closed="editDialogClosed" title="修改角色" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editRolesForm" :rules="editRolesRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightdialogVisible" width="50%" @close="setRightdialogVisibleClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightList" ref="treeRef" :props="treeProps" node-key="id" :default-checked-keys="defKeys" default-expand-all show-checkbox></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表数据
      roleList: [],
      // 添加对话框状态
      addDialogVisible: false,
      // 添加对话框数据绑定
      addRolesForm: {
        roleName: '',
        roleDesc: '',
      },
      // 添加对话框的添加规则
      addRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' },
        ],
      },
      // 修改对话框状态
      editDialogVisible: false,
      // 修改对话框数据
      editRolesForm: [],
      // 修改对话框规则
      editRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' },
        ],
      },
      // 权限分配的显示与隐藏
      setRightdialogVisible: false,
      // 权限数据列表
      rightList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      // 默认的选中节点id数组
      defKeys: [],
      // 即将分配权限的id
      roleId: '',
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表数据
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('角色列表数据获取失败')
      this.roleList = res.data
      console.log(res.data)
    },
    // 展示添加对话框
    showAddRoles() {
      this.addDialogVisible = true
    },
    // 添加对话框
    async addRoles() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRolesForm)
        console.log('res', res)
        if (res.meta.status !== 201) {
          this.$message.error('角色添加失败')
        }
        this.getRoleList()
        this.addDialogVisible = false
        this.$message.success('角色添加成功')
      })
    },
    // 清空表单元素内容
    addFormClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 展示修改对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('角色信息获取失败')
      }
      this.editRolesForm = res.data
      this.editDialogVisible = true
    },
    // 修改角色功能实现
    editRoles() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editRolesForm.roleId, {
          roleName: this.editRolesForm.roleName,
          roleDesc: this.editRolesForm.roleDesc,
        })
        if (res.meta.status !== 200) {
          this.$message.error('角色信息修改失败')
        }
        this.$message.success('角色信息修改成功')
        this.getRoleList()
        this.editDialogVisible = false
      })
    },
    // 重置修改对话框信息
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 角色删除功能实现
    async removeRole(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('角色信息删除失败')
      }
      this.$message.success('角色删除成功')
      this.getRoleList()
    },
    //根据id删除对应的权限
    async removeRightById(role, rid) {
      // 弹框提示用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rid}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      // this.getRoleList()
      role.children = res.data
    },
    // 展示分配权限
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限接口
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('权限数据获取失败')
      }
      this.rightList = res.data
      this.getLeafKeys(role, this.defKeys)
      this.setRightdialogVisible = true
    },
    // 通过递归的形式，获取角色下的三级权限id，并保存到defkeys中
    getLeafKeys(node, arr) {
      // 如果当前的node节点，不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    // 关闭时，清空数组
    setRightdialogVisibleClosed() {
      this.defKeys = []
    },
    // 分配权限功能实现
    async allotRight() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('权限分配成功')
      this.getRoleList()
      this.setRightdialogVisible=false
    },
  },
}
</script>

<style scope lang="less">
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>