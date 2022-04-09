<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table class="treeTable" :data="cateList" :columns="columns" :show-index="true" index-text="#" border :selection-type="false" :expand-type="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-search" @click="showEditDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 8]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog @close="addCateDialogClosed" title="添加分类" :visible.sync="addCateDialogVisible" width="50%">
      <span slot="footer" class="dialog-footer">
        <!-- 添加分类表单 -->
        <el-form :model="addCateForm" :rules="addCateRule" ref="addCateRef" label-width="100px">
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类:">
            <el-cascader class="el-cascader-panel" clearable change-hover-select v-model="selectKeys" :options="parentCateList" :props="{ expandTrigger: 'hover', ...cascaderProps, checkStrictly: true }" @change="parentCateChange"></el-cascader>
          </el-form-item>
        </el-form>
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类的数据列表
      cateList: [],
      total: 0,
      // 为table指定列的定义
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          // 将此列的定义为模板列
          type: 'template',
          // 表示这一列使用的模板名称
          template: 'isok',
        },
        {
          label: '排序',
          type: 'template',
          template: 'order',
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt',
        },
      ],
      // 添加对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类表单的数据对象
      addCateForm: {
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        cat_level: 0,
      },
      // 添加分类表单的规则
      addCateRule: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' },
        ],
      },
      // 父级分类数据
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 选中的父级分类的id
      selectKeys: [],
      // 修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改对话框的数据
      editForm: {},
      // 修改对话框数据规则
      editRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取删除分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 监听添加分类对话框显示与隐藏
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('父级分类数据获取失败')
      }
      console.log('res888', res.data)
      this.parentCateList = res.data
    },
    // 选择项发生改变时触发这个函数
    parentCateChange() {
      console.log(this.selectKeys)
      // 如果 selectdKeys 数组中的length大于0证明选中父级分类
      // 反之,就说明没有选中任何父级分类
      if (this.selectKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectKeys.length
        return
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加新的分类
    addCate() {
      console.log(this.addCateForm)
      this.$refs.addCateRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 关闭对话框事件,重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateRef.resetFields()
      this.selectKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 展示修改对话框并显示数据
    async showEditDialog(editCateInfo) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('categories/' + editCateInfo.cat_id)
      if (res.meta.status !== 200) {
        return this.$message.error('分类数据获取失败')
      }
      this.editForm = res.data
    },
    // 修改对话框提交数据
    async editCateInfo() {
      const { data: res } = await this.$http.put('categories/' + this.editForm.cat_id, { cat_name: this.editForm.cat_name })
      console.log('res', res)
      if (res.meta.status !== 200) {
        return this.$message.error('分类修改失败')
      }
      this.$message.success('分类修改成功')
      this.getCateList()
      this.editDialogVisible = false
    },
    // 根据id删除对应的分类
    async removeCateById(id) {
      const confirmResult =await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('你已经取消删除')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      
      if (res.meta.status !== 200) {
        return this.$message.error('分类删除失败')
      }
      this.$message.success('分类删除成功')
      this.getCateList()
    },
  },
}
</script>

<style scoped lang="less">
.treeTable {
  margin-top: 15px;
}
.el-cascader-panel {
  width: 100%;
}
</style>