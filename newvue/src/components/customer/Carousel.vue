<template>
  <div class="carousel-container">
    <el-carousel 
      :interval="interval" 
      :height="height"
      arrow="hover"
      indicator-position="outside"
    >
      <el-carousel-item v-for="item in items" :key="item.id">
        <div 
          class="carousel-item" 
          :style="{ backgroundImage: `url(${getImageUrl(item.imageUrl)})` }"
          @click="handleClick(item)"
        >
          <div class="carousel-content">
            <h3 v-if="item.title" class="carousel-title">{{ item.title }}</h3>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script>
import { getImageUrl } from '@/utils/image'

export default {
  name: 'Carousel',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    height: {
      type: String,
      default: '400px'
    },
    interval: {
      type: Number,
      default: 5000
    }
  },
  methods: {
    getImageUrl(url) {
      return getImageUrl(url)
    },
    
    handleClick(item) {
      if (item.linkUrl) {
        // Check if it's an external link
        if (item.linkUrl.startsWith('http')) {
          window.open(item.linkUrl, '_blank')
        } else {
          // Internal route
          this.$router.push(item.linkUrl)
        }
      }
    }
  }
}
</script>

<style scoped>
.carousel-container {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.carousel-item {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  position: relative;
  transition: transform 0.3s;
}

.carousel-item:hover {
  transform: scale(1.02);
}

.carousel-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}

.carousel-title {
  color: #fff;
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* Override Element UI carousel styles */
::v-deep .el-carousel__indicator--horizontal {
  padding: 12px 6px;
}

::v-deep .el-carousel__button {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.85);
  border: 2px solid rgba(255, 255, 255, 1);
  transition: all 0.3s;
  opacity: 1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

::v-deep .el-carousel__indicator.is-active .el-carousel__button {
  width: 36px;
  border-radius: 7px;
  background-color: #67c23a;
  border-color: #67c23a;
  box-shadow: 0 3px 10px rgba(103, 194, 58, 0.6);
}

::v-deep .el-carousel__indicator:hover .el-carousel__button {
  background-color: #fff;
  transform: scale(1.15);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
}

::v-deep .el-carousel__arrow {
  background-color: rgba(0, 0, 0, 0.5);
}

::v-deep .el-carousel__arrow:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

/* Responsive */
@media (max-width: 768px) {
  .carousel-title {
    font-size: 20px;
  }
  
  .carousel-content {
    padding: 20px;
  }
}
</style>
