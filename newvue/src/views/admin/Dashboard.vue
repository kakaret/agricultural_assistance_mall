<template>
  <div class="dashboard">
    <h2 class="page-title">数据概览</h2>
    
    <!-- Statistics Cards -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <StatisticsCard
          title="总销售额"
          :value="statistics.totalSales"
          icon="el-icon-money"
          icon-color="#67c23a"
          icon-bg-color="rgba(103, 194, 58, 0.1)"
          :trend="statistics.salesTrend"
          color="success"
          prefix="¥"
          show-footer
          footer-text="较上月"
        />
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <StatisticsCard
          title="订单总数"
          :value="statistics.totalOrders"
          icon="el-icon-s-order"
          icon-color="#409eff"
          icon-bg-color="rgba(64, 158, 255, 0.1)"
          :trend="statistics.ordersTrend"
          color="primary"
          suffix="单"
          show-footer
          footer-text="较上月"
        />
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <StatisticsCard
          title="用户总数"
          :value="statistics.totalUsers"
          icon="el-icon-user"
          icon-color="#e6a23c"
          icon-bg-color="rgba(230, 162, 60, 0.1)"
          :trend="statistics.usersTrend"
          color="warning"
          suffix="人"
          show-footer
          footer-text="较上月"
        />
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <StatisticsCard
          title="商品总数"
          :value="statistics.totalProducts"
          icon="el-icon-goods"
          icon-color="#f56c6c"
          icon-bg-color="rgba(245, 108, 108, 0.1)"
          :trend="statistics.productsTrend"
          color="danger"
          suffix="件"
          show-footer
          footer-text="较上月"
        />
      </el-col>
    </el-row>
    
    <!-- Charts -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="16">
        <div class="chart-card">
          <div class="card-header">
            <h3>销售趋势</h3>
            <el-radio-group v-model="salesPeriod" size="small" @change="loadSalesChart">
              <el-radio-button label="week">近7天</el-radio-button>
              <el-radio-button label="month">近30天</el-radio-button>
              <el-radio-button label="year">近一年</el-radio-button>
            </el-radio-group>
          </div>
          <div id="salesChart" class="chart-container"></div>
        </div>
      </el-col>
      
      <el-col :xs="24" :lg="8">
        <div class="chart-card">
          <div class="card-header">
            <h3>订单状态分布</h3>
          </div>
          <div id="orderStatusChart" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>
    
    <!-- Recent Orders -->
    <div class="recent-orders">
      <div class="section-header">
        <h3>最近订单</h3>
        <el-button type="text" @click="goToOrders">查看全部 <i class="el-icon-arrow-right"></i></el-button>
      </div>
      
      <el-table :data="recentOrders" style="width: 100%">
        <el-table-column prop="id" label="订单号" width="120"></el-table-column>
        <el-table-column prop="product.name" label="商品名称"></el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" align="center"></el-table-column>
        <el-table-column prop="totalPrice" label="金额" width="120">
          <template slot-scope="scope">
            ¥{{ scope.row.totalPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import StatisticsCard from '@/components/admin/StatisticsCard.vue'
import { getOrderStatistics, getAllOrders } from '@/api/order'
import { formatDate } from '@/utils/date'
import * as echarts from 'echarts'

export default {
  name: 'Dashboard',
  
  components: {
    StatisticsCard
  },
  
  data() {
    return {
      statistics: {
        totalSales: 0,
        salesTrend: 0,
        totalOrders: 0,
        ordersTrend: 0,
        totalUsers: 0,
        usersTrend: 0,
        totalProducts: 0,
        productsTrend: 0
      },
      salesPeriod: 'week',
      recentOrders: [],
      salesChart: null,
      orderStatusChart: null
    }
  },
  
  mounted() {
    this.loadStatistics()
    this.loadRecentOrders()
    this.initCharts()
  },
  
  beforeDestroy() {
    if (this.salesChart) {
      this.salesChart.dispose()
    }
    if (this.orderStatusChart) {
      this.orderStatusChart.dispose()
    }
  },
  
  methods: {
    formatDate,
    
    async loadStatistics() {
      try {
        // Mock data - replace with actual API call
        this.statistics = {
          totalSales: 125680.50,
          salesTrend: 12.5,
          totalOrders: 1256,
          ordersTrend: 8.3,
          totalUsers: 3420,
          usersTrend: 15.2,
          totalProducts: 156,
          productsTrend: -2.1
        }
      } catch (error) {
        console.error('Load statistics failed:', error)
      }
    },
    
    async loadRecentOrders() {
      try {
        const res = await getAllOrders({
          currentPage: 1,
          size: 5
        })
        
        if (res.code === '0') {
          this.recentOrders = res.data.records || []
        }
      } catch (error) {
        console.error('Load recent orders failed:', error)
      }
    },
    
    initCharts() {
      this.$nextTick(() => {
        this.initSalesChart()
        this.initOrderStatusChart()
      })
    },
    
    initSalesChart() {
      const chartDom = document.getElementById('salesChart')
      if (!chartDom) return
      
      this.salesChart = echarts.init(chartDom)
      this.loadSalesChart()
    },
    
    loadSalesChart() {
      // Mock data - replace with actual API call
      const dates = ['01-01', '01-02', '01-03', '01-04', '01-05', '01-06', '01-07']
      const sales = [3200, 4100, 3800, 5200, 4800, 6100, 5500]
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '销售额',
            type: 'line',
            smooth: true,
            data: sales,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
              ])
            },
            itemStyle: {
              color: '#409eff'
            }
          }
        ]
      }
      
      this.salesChart.setOption(option)
    },
    
    initOrderStatusChart() {
      const chartDom = document.getElementById('orderStatusChart')
      if (!chartDom) return
      
      this.orderStatusChart = echarts.init(chartDom)
      
      // Mock data
      const data = [
        { value: 120, name: '待支付' },
        { value: 280, name: '已支付' },
        { value: 450, name: '已发货' },
        { value: 350, name: '已完成' },
        { value: 56, name: '已取消' }
      ]
      
      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '订单状态',
            type: 'pie',
            radius: '60%',
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      
      this.orderStatusChart.setOption(option)
    },
    
    getStatusText(status) {
      const statusMap = {
        0: '待支付',
        1: '已支付',
        2: '已发货',
        3: '已完成',
        4: '已取消'
      }
      return statusMap[status] || '未知'
    },
    
    getStatusType(status) {
      const typeMap = {
        0: 'warning',
        1: 'success',
        2: 'primary',
        3: 'success',
        4: 'info'
      }
      return typeMap[status] || 'info'
    },
    
    goToOrders() {
      this.$router.push('/admin/orders')
    }
  }
}
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px 0;
}

.statistics-row {
  margin-bottom: 24px;
}

.statistics-row >>> .el-col {
  margin-bottom: 20px;
}

.charts-row {
  margin-bottom: 24px;
}

.charts-row >>> .el-col {
  margin-bottom: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.recent-orders {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 20px;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
