<template>
  <div class="category-grid">
    <div 
      v-for="category in categories" 
      :key="category.id" 
      class="category-card"
      @click="handleCategoryClick(category)"
    >
      <div class="category-icon">
        <i v-if="category.icon" :class="category.icon"></i>
        <i v-else class="el-icon-goods"></i>
      </div>
      <h4 class="category-name">{{ category.name }}</h4>
      <p v-if="category.description" class="category-desc">{{ category.description }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoryGrid',
  props: {
    categories: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleCategoryClick(category) {
      this.$emit('category-click', category)
      // Navigate to products page with category filter
      this.$router.push({
        path: '/products',
        query: { categoryId: category.id }
      })
    }
  }
}
</script>

<style scoped>
.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 30px;
  padding: 20px 0;
  justify-items: center;
}

.category-card {
  background: #fff;
  border-radius: 12px;
  padding: 35px 25px 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 200px;
  position: relative;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.category-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 4px;
  background: linear-gradient(90deg, transparent, #67c23a, transparent);
  border-radius: 2px 2px 0 0;
  transition: all 0.3s;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(103, 194, 58, 0.15);
  border-color: #67c23a;
}

.category-card:hover::after {
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #85ce61, #67c23a, #85ce61);
}

.category-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #fff;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
}

.category-card:hover .category-icon {
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 6px 20px rgba(103, 194, 58, 0.4);
}

.category-name {
  font-size: 17px;
  color: #303133;
  margin: 0 0 10px 0;
  font-weight: 600;
  transition: color 0.3s;
}

.category-card:hover .category-name {
  color: #67c23a;
}

.category-desc {
  font-size: 13px;
  color: #909399;
  margin: 0 0 15px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 1200px) {
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .category-card {
    padding: 25px 20px;
  }
  
  .category-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
}

@media (max-width: 900px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .category-card {
    padding: 20px 15px;
    max-width: none;
  }
  
  .category-icon {
    width: 45px;
    height: 45px;
    font-size: 22px;
    margin-bottom: 10px;
  }
  
  .category-name {
    font-size: 14px;
  }
  
  .category-desc {
    display: none;
  }
}

@media (max-width: 480px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .category-card {
    padding: 15px 10px;
  }
  
  .category-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
</style>
