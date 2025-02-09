<template>
  <view class="settings-container">
    <!-- 用户信息展示 -->
    <view class="user-info">
      <view class="info">
        <text class="phone">手机号：{{ phone }}</text>
      </view>
    </view>

    <!-- 设置项列表 -->
    <view class="settings-list">
      <view class="setting-item" @click="goToRingtoneSetting">
        <text>铃声设置</text>
        <uni-icons type="arrowright" size="20" color="#999"></uni-icons>
      </view>
    </view>

    <!-- 底部内容 -->
    <view class="bottom-content">
      <!-- 退出登录按钮 -->
      <button class="logout-btn" @click="handleLogout">退出登录</button>

      <!-- 底部导航 -->
      <view class="bottom-nav">
        <view class="nav-item" @click="goToHome">Timer</view>
        <view class="nav-item active">setting</view>
      </view>
    </view>
  </view>
</template>

<script>
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

export default {
  components: {
    uniIcons
  },
  data() {
    return {
      phone: uni.getStorageSync('phone') || '未登录'
    }
  },
  methods: {
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token');
            uni.removeStorageSync('phone'); // 删除phone
            uni.removeStorageSync('password'); // 删除password
            uni.reLaunch({
              url: '/pages/login/index'
            });
          }
        }
      });
    },
    goToHome() {
      uni.navigateBack();
    },
    goToRingtoneSetting() {
      uni.navigateTo({
        url: '/pages/ringtone/index'
      });
    }
  }
}
</script>

<style>
.settings-container {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 20px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
}

.info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.phone {
  font-size: 16px;
  color: #666;
}

.settings-list {
  background: #fff;
  border-radius: 10px;
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.setting-item:last-child {
  border-bottom: none;
}

.bottom-content {
  margin-top: auto;
  padding-bottom: 20px;
}

.logout-btn {
  background: #e74c3c;
  color: #fff;
  border-radius: 25px;
  margin-bottom: 20px;
}

.bottom-nav {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  border-top: 1px solid #eee;
}

.nav-item {
  color: #666;
}

.nav-item.active {
  color: #007aff;
  font-weight: bold;
}
</style>