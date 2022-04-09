<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert title="注意: 只允许为第三级分类设置相关参数!" show-icon :closable="false" type="warning"></el-alert>
      <!-- 选择商品区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader v-model="selectedKeys" :options="cateList" :props="{ expandTrigger: 'hover', ...cateProps, checkStrictly: true }" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tab标签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">动态参数</el-button>
          <!--动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag closable v-for="(item, index) in scope.row.attr_vals" :key="index" @close="handleClose(index, scope.row)">{{ item }}</el-tag>
                <!-- 输入文本框的切换 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm(scope.row)"> </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParamsById(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">静态属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag closable v-for="(item, index) in scope.row.attr_vals" :key="index" @close="handleClose(index, scope.row)">{{ item }}</el-tag>
                <!-- 输入文本框的切换 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm(scope.row)"> </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParamsById(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogVisibleClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogVisibleClosed">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据
      cateList: [],
      // 级联选择框数据对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      //级联选择框双向绑定到的数组
      selectedKeys: [],
      // 被激活的页签名称
      activeName: 'many',
      // 动态参数列表
      manyTableData: [],
      // 静态参数列表
      onlyTableData: [],
      // 控制添加对话框的显示隐藏
      addDialogVisible: false,
      // 添加参数的表单对象
      addForm: {
        attr_name: '',
      },
      // 添加参数的验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
      },
      // 修改参数对话框的显示
      editDialogVisible: false,
      // 修改参数的数据列表
      editForm: {},
      // 修改参数的数据规则
      editRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
      },
      // 即将修改的参数id
      eidtCateId: '',
      //输入框和按钮的切换
      inputVisible: false,
      // 文本框输入的内容
      inputValue: '',
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取页面数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('分类数据获取失败')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择框发生改变，触发此函数
    async handleChange() {
      this.getParamsData()
    },
    // tab页签点击事件处理函数
    handleTabClick() {
      this.getParamsData()
      console.log(this.activeName)
    },
    // 获取添加参数对应的数据列表
    async getParamsData() {
      // 证明选中的不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      console.log(this.selectedKeys)
      // 选中的是三级分类，发起网络请求
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName },
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取参数列表失败')
      }
      console.log('123res', res.data)
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log('result', res.data)
      // 判断数据的响应，是动态还是静态
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听添加对话框的关闭事件
    addDialogVisibleClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加按钮，添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName,
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 修改对话框展示
    async showEditDialog(id) {
      this.editDialogVisible = true
      this.editCateId = id
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: { attr_sel: this.activeName },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('参数获取失败')
      }
      this.editForm = res.data
    },
    // 修改参数功能实现
    editCate() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName,
        })
        if (res.meta.status !== 200) {
          return this.$message.error('参数修改失败')
        }
        this.$message.success('参数修改成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 修改对话框重置
    editDialogVisibleClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 删除参数功能实现
    async removeParamsById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('你已经取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('参数删除成功')
      this.getParamsData()
    },
    // 按下回车键或松开鼠标,激发此函数
    handleInputConfirm() {},
    // 输入框切换tag
    showInput(row) {
      row.inputVisible = true
      // 让文本自动获取焦点
      // dom发生更新时候,改函数立即执行$nextTick()
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 失去焦点,文本框变按钮
    handleInputConfirm(row) {
      // 判断用户输入是否为空
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 用户输入不为空,处理
      // 发起网络请求,保存输入的tag内容
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttr_vals(row)
    },
    // 对tag标签进行操作，保存到数据库中
    async saveAttr_vals(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' '),
      })
      if (res.data.status !== 200) {
        this.$message.error('参数修改失败')
      }
      this.$message.success('参数修改成功')
    },
    // 删除tag标签
    handleClose(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttr_vals(row)
    },
  },
  computed: {
    // 如果按钮需要禁用，则为true，否则为false
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 动态计算文本提示
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    },
  },
}
</script>

<style scope lang="less">
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px !important;
}
</style>