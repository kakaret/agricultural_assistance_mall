<template>
  <div class="data-table">
    <!-- Search and Filter Bar -->
    <div v-if="showSearch" class="table-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入关键词搜索"
          prefix-icon="el-icon-search"
          clearable
          @clear="handleSearch"
          @keyup.enter.native="handleSearch"
          style="width: 300px"
        ></el-input>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar"></slot>
      </div>
    </div>

    <!-- Table -->
    <el-table
      :data="tableData"
      :loading="loading"
      v-bind="$attrs"
      v-on="$listeners"
      style="width: 100%"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <!-- Selection Column -->
      <el-table-column
        v-if="showSelection"
        type="selection"
        width="55"
        align="center"
      ></el-table-column>

      <!-- Index Column -->
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="60"
        align="center"
      ></el-table-column>

      <!-- Data Columns -->
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth"
        :align="column.align || 'left'"
        :sortable="column.sortable"
        :formatter="column.formatter"
      >
        <template slot-scope="scope">
          <!-- Custom Slot -->
          <slot
            v-if="column.slot"
            :name="column.slot"
            :row="scope.row"
            :column="column"
            :$index="scope.$index"
          ></slot>
          
          <!-- Default Display -->
          <span v-else>
            {{ column.formatter ? column.formatter(scope.row, column) : scope.row[column.prop] }}
          </span>
        </template>
      </el-table-column>

      <!-- Action Column -->
      <el-table-column
        v-if="showAction"
        label="操作"
        :width="actionWidth"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <slot name="action" :row="scope.row" :$index="scope.$index">
            <el-button
              v-if="showEdit"
              type="text"
              size="small"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="showDelete"
              type="text"
              size="small"
              icon="el-icon-delete"
              style="color: #f56c6c"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div v-if="showPagination" class="table-pagination">
      <el-pagination
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        :total="total"
        :layout="paginationLayout"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  
  props: {
    // Table data
    data: {
      type: Array,
      default: () => []
    },
    
    // Column configuration
    columns: {
      type: Array,
      required: true
    },
    
    // Loading state
    loading: {
      type: Boolean,
      default: false
    },
    
    // Show search bar
    showSearch: {
      type: Boolean,
      default: true
    },
    
    // Show selection column
    showSelection: {
      type: Boolean,
      default: false
    },
    
    // Show index column
    showIndex: {
      type: Boolean,
      default: true
    },
    
    // Show action column
    showAction: {
      type: Boolean,
      default: true
    },
    
    // Show edit button
    showEdit: {
      type: Boolean,
      default: true
    },
    
    // Show delete button
    showDelete: {
      type: Boolean,
      default: true
    },
    
    // Action column width
    actionWidth: {
      type: String,
      default: '150'
    },
    
    // Pagination
    showPagination: {
      type: Boolean,
      default: true
    },
    
    total: {
      type: Number,
      default: 0
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
      default: () => [10, 20, 50, 100]
    },
    
    paginationLayout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    }
  },
  
  data() {
    return {
      searchKeyword: '',
      selectedRows: []
    }
  },
  
  computed: {
    tableData() {
      return this.data
    }
  },
  
  methods: {
    handleSearch() {
      this.$emit('search', this.searchKeyword)
    },
    
    handleReset() {
      this.searchKeyword = ''
      this.$emit('reset')
    },
    
    handleSortChange({ column, prop, order }) {
      this.$emit('sort-change', { column, prop, order })
    },
    
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },
    
    handleSizeChange(size) {
      this.$emit('size-change', size)
    },
    
    handleCurrentChange(page) {
      this.$emit('page-change', page)
    },
    
    handleEdit(row) {
      this.$emit('edit', row)
    },
    
    handleDelete(row) {
      this.$emit('delete', row)
    },
    
    // Public methods
    clearSelection() {
      this.$refs.table && this.$refs.table.clearSelection()
    },
    
    toggleRowSelection(row, selected) {
      this.$refs.table && this.$refs.table.toggleRowSelection(row, selected)
    },
    
    getSelectedRows() {
      return this.selectedRows
    }
  }
}
</script>

<style scoped>
.data-table {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Table Styles */
.data-table >>> .el-table {
  font-size: 14px;
}

.data-table >>> .el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.data-table >>> .el-table td,
.data-table >>> .el-table th {
  padding: 12px 0;
}

.data-table >>> .el-table__row:hover {
  background-color: #f5f7fa;
}

.data-table >>> .el-button--text {
  padding: 0;
  margin: 0 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .data-table {
    padding: 12px;
  }
  
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: flex-start;
  }
  
  .toolbar-left >>> .el-input {
    width: 100% !important;
  }
  
  .table-pagination {
    justify-content: center;
  }
  
  .table-pagination >>> .el-pagination {
    flex-wrap: wrap;
  }
}
</style>
