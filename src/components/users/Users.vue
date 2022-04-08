<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showaddDialogVisible">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" round @click="showchangeDialogVisible(scope.row.id)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" round @click="removeUserById(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :entertable="false">
              <el-button type="warning" size="mini" icon="el-icon-setting" round @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 底部页码 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 3, 5, 8]" :page-size="queryInfo.pagenum" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加" @close="addFormClosed" :visible.sync="addDialogVisible" width="50%">
      <!-- 主体区域 -->
      <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="80px">
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话号码" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 页脚区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog @close="editDialogClosed" title="修改" :visible.sync="changeDialogVisible" width="50%">
      <!-- 主体区域 -->
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="用户名称">
          <el-input disabled v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 页脚区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="角色分配" :visible.sync="setRoledialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户: {{ userInfo.username }}</p>
        <p>当前的角色: {{ userInfo.role_name }}</p>
        <p>
          分配新的角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoledialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱规则
    let checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }
    // 验证手机号码规则
    var checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户数据列表对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        pagesize: 2,
      },
      //用户列表数据
      userlist: [],
      // 控制用户添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户数据绑定
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      // 添加用户数据的验证规则
      addFormrules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入电子邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      // 控制修改用户对话框的状态
      changeDialogVisible: false,
      // 修改用户数据
      editForm: [],
      // 修改用户数据验证规则
      editRules: {
        email: [
          { required: true, message: '请输入电子邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      // 分配角色的显示与隐藏
      setRoledialogVisible: false,
      //需要分配角色的用户信息
      userInfo: {},
      // 所有的角色数据列表
      roleList: [],
      // 已选中的角色id值
      selectedRoleId: '',
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 获取数据列表
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取列表数据失败')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 监听pageSize改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听用户状态Switch
    async userStateChanged(userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败!')
      }
      this.$message.success('更新用户状态成功!')
    },
    // 添加对话框的显示
    showaddDialogVisible() {
      this.addDialogVisible = true
    },
    // 清空添加用户表单内容
    addFormClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 用户添加功能实现并预校验
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        console.log('res', res)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.getUserList()
        this.addDialogVisible = false
        this.$message.success('添加用户成功')
      })
    },
    // 用户修改对话框状态切换
    async showchangeDialogVisible(id) {
      const { data: res } = await this.$http.get('users/' + id)
      console.log('res', res)
      if (res.meta.status !== 200) {
        this.$message.error('查询用户信息失败!')
      }
      this.editForm = res.data
      this.changeDialogVisible = true
    },
    // 监听修改对话框，重置修改
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile,
        })
        if (res.meta.status !== 200) return this.$message.error('用户信息修改失败!')
        this.changeDialogVisible = false
        this.$message.success('用户信息修改成功')
        this.getUserList()
      })
    },
    // 通过id删除用户
    async removeUserById(id) {
      // 判断用户是否需要真的删除
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败!')
      }
      this.$message.success('删除用户成功')
      this.getUserList()
    },
    // 控制角色对话框的显示
    async setRole(userInfo) {
      this.userInfo = userInfo
      // 在展示对话框，获取所有的权限列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      this.setRoledialogVisible = true
      console.log(userInfo)
    },
    // 分配角色功能实现
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      this.getUserList()
      this.setRoledialogVisible = false
    },
    // 监听对话框的关闭重置
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    },
  },
}
</script>

<style lang="less" scoped></style>
