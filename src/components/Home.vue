<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  name: 'home',
  methods: {
    logout () {
      // 清除sessionStorage
      window.sessionStorage.clear()
      // 返回到login组件
      this.$router.push('/login')
    }
  }
}
</script>

<style>
</style>
