<template>
  <div class="pagination-container">
    <el-pagination
      :current-page="currentPage"
      :page-sizes="pageSizes"
      :page-size="pageSize"
      :total="total"
      :layout="layout"
      :background="background"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    total: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    },
    pageSizes: {
      type: Array,
      default: () => [10, 20, 30, 50]
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    background: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleSizeChange(size) {
      this.$emit('size-change', size)
      this.$emit('page-change', { page: this.currentPage, size })
    },
    
    handleCurrentChange(page) {
      this.$emit('current-change', page)
      this.$emit('page-change', { page, size: this.pageSize })
    }
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>
