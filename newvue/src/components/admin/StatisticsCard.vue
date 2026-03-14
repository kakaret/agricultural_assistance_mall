<template>
  <div class="statistics-card" :class="cardClass">
    <div class="card-content">
      <div class="card-left">
        <div class="card-icon" :style="{ backgroundColor: iconBgColor }">
          <i :class="icon" :style="{ color: iconColor }"></i>
        </div>
      </div>
      
      <div class="card-right">
        <div class="card-title">{{ title }}</div>
        <div class="card-value">{{ formattedValue }}</div>
        
        <div v-if="trend !== null" class="card-trend">
          <i :class="trendIcon" :style="{ color: trendColor }"></i>
          <span :style="{ color: trendColor }">{{ trendText }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="showFooter" class="card-footer">
      <slot name="footer">
        <span class="footer-text">{{ footerText }}</span>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatisticsCard',
  
  props: {
    // Card title
    title: {
      type: String,
      required: true
    },
    
    // Statistic value
    value: {
      type: [Number, String],
      required: true
    },
    
    // Icon class
    icon: {
      type: String,
      default: 'el-icon-data-line'
    },
    
    // Icon color
    iconColor: {
      type: String,
      default: '#409eff'
    },
    
    // Icon background color
    iconBgColor: {
      type: String,
      default: 'rgba(64, 158, 255, 0.1)'
    },
    
    // Trend value (percentage or number)
    trend: {
      type: Number,
      default: null
    },
    
    // Card color theme
    color: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'success', 'warning', 'danger'].includes(value)
    },
    
    // Show footer
    showFooter: {
      type: Boolean,
      default: false
    },
    
    // Footer text
    footerText: {
      type: String,
      default: ''
    },
    
    // Value prefix (e.g., '¥', '$')
    prefix: {
      type: String,
      default: ''
    },
    
    // Value suffix (e.g., '件', '人')
    suffix: {
      type: String,
      default: ''
    },
    
    // Number format (add thousand separator)
    formatNumber: {
      type: Boolean,
      default: true
    }
  },
  
  computed: {
    cardClass() {
      return `card-${this.color}`
    },
    
    formattedValue() {
      let val = this.value
      
      if (this.formatNumber && typeof val === 'number') {
        val = val.toLocaleString()
      }
      
      return `${this.prefix}${val}${this.suffix}`
    },
    
    trendIcon() {
      if (this.trend === null) return ''
      return this.trend >= 0 ? 'el-icon-top' : 'el-icon-bottom'
    },
    
    trendColor() {
      if (this.trend === null) return ''
      return this.trend >= 0 ? '#67c23a' : '#f56c6c'
    },
    
    trendText() {
      if (this.trend === null) return ''
      const absValue = Math.abs(this.trend)
      return `${this.trend >= 0 ? '+' : '-'}${absValue}%`
    }
  }
}
</script>

<style scoped>
.statistics-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.statistics-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-left {
  flex-shrink: 0;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.card-right {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
}

.card-trend i {
  font-size: 14px;
  font-weight: bold;
}

.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.footer-text {
  font-size: 13px;
  color: #909399;
}

/* Color Themes */
.card-primary {
  border-left: 4px solid #409eff;
}

.card-success {
  border-left: 4px solid #67c23a;
}

.card-warning {
  border-left: 4px solid #e6a23c;
}

.card-danger {
  border-left: 4px solid #f56c6c;
}

/* Responsive */
@media (max-width: 768px) {
  .statistics-card {
    padding: 16px;
  }
  
  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
  
  .card-value {
    font-size: 24px;
  }
  
  .card-title {
    font-size: 13px;
  }
}
</style>
