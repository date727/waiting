<template>
  <view class="login-container">
    <view class="header">
      <image src="/static/images/login-banner.png" class="banner-image" mode="aspectFit"></image>
      <text class="welcome-text">食客请登录</text>
    </view>
    <view class="form">
      <view class="form-item">
        <text class="label">手机号</text>
        <input
          v-model="phone"
          type="number"
          placeholder="请输入手机号"
          @focus="handleFocus('phone')"
          @blur="handleBlur('phone')"
          :class="{ 'input-focused': focusedInput === 'phone' }"
        />
      </view>
      <view class="form-item">
        <text class="label">密码</text>
        <input
          v-model="password"
          type="password"
          placeholder="请输入密码"
          password
          @focus="handleFocus('password')"
          @blur="handleBlur('password')"
          :class="{ 'input-focused': focusedInput === 'password' }"
        />
      </view>
      <button class="login-btn" @click="handleLogin">登录/注册</button>
      <text class="register-hint">（第一次登录自动注册，没有反应的话稍微等一下）</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      phone: '',
      password: '',
      focusedInput: '' // 当前聚焦的输入框
    };
  },
  methods: {
    handleFocus(inputType) {
      this.focusedInput = inputType;
    },
    handleBlur() {
      this.focusedInput = '';
    },
    async handleLogin() {
      if (!this.phone || !this.password) {
        uni.showToast({
          title: '手机号和密码不能为空',
          icon: 'none'
        });
        return;
      }

      try {
        const res = await uniCloud.callFunction({
          name: 'user-login',
          data: {
            phone: this.phone,
            password: this.password
          }
        });

        if (res.result.code === 200) {
          uni.setStorageSync('token', res.result.token);
          uni.setStorageSync('phone', this.phone);
          uni.setStorageSync('password', this.password);
          uni.reLaunch({
            url: '/pages/index/index'
          });
        } else {
          uni.showToast({
            title: res.result.message,
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style>
.login-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.banner-image {
  width: 120px;
  height: 120px;
  margin-bottom: 10px;
}

.welcome-text {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.form {
  width: 100%;
  max-width: 90%;
  padding: 0 20px;
  box-sizing: border-box;
}

.form-item {
  margin-bottom: 15px;
}

.label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

input {
  width: 100%;
  height: 40px;
  padding: 0 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
}

.input-focused {
  border-color: #007aff;
  box-shadow: 0 0 5px rgba(0, 122, 255, 0.5);
}

.login-btn {
  width: 100%;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background-color: #007aff;
  color: #fff;
  border-radius: 4px;
  margin-bottom: 10px;
}

.register-hint {
  font-size: 12px;
  color: #666;
  text-align: center;
}
</style> 