<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: '', //当前页码
        pagesize: '', //每页显示条数
        total: 0,
      },
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        this.$message.error('订单信息获取失败')
      }
      this.$message.success('订单信息获取成功!')
      console.log(res)
      this.orderList = res.data
      // this.queryInfo.total = res.data.total
    },
  },
}
</script>

<style src lang="less">
</style>