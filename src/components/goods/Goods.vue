<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" @clear="getGoodsList" clearable v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表视图区域 -->
      <el-table :data="goodsList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="380px"> </el-table-column>
        <el-table-column prop="goods_price" label="价格(元)" width="180px"> </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"> </el-table-column>
        <el-table-column prop="add_time" label="创建时间">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit"></el-button>
            <el-button type="warning" size="mini" icon="el-icon-delete" @click="removeGoodsById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页码视图区域 -->
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 8]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="queryInfo.total"> </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 保存商品列表的数组
      goodsList: [],
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
        total: 0,
      },
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表的函数
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: {
          pagenum: this.queryInfo.pagenum,
          pagesize: this.queryInfo.pagesize,
        },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('商品列表数据获取失败')
      }
      // 保存商品列表数据
      this.goodsList = res.data.goods
      this.queryInfo.total = res.data.total
    },
    // 监听当前页显示多少条数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听切换页操作
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 实现删除操作
    async removeGoodsById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((error) => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('你已经取消删除')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getGoodsList()
    },
    // 添加商品
    goAddpage() {
      this.$router.push('/goods/add')
    },
  },
}
</script>

<style scope lang="less">
</style>