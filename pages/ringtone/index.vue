<template>
  <view class="ringtone-container">
    <view class="ringtone-item" v-for="(ringtone, index) in ringtones" :key="index" @click="selectRingtone(ringtone)">
      <text>{{ ringtone.name }}</text>
      <uni-icons v-if="selectedRingtone === ringtone.value" type="checkmarkempty" size="20" color="#007aff"></uni-icons>
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
      ringtones: [
        { name: '默认铃声', value: 'default', url: '/static/ringtone/default.mp3' },
        { name: '轻快铃声', value: 'light', url: '/static/ringtone/light.mp3' },
        { name: 'QQ提示', value: 'QQ', url: '/static/ringtone/QQ.mp3' }
      ],
      selectedRingtone: uni.getStorageSync('ringtone') || 'default',
      audioContext: null
    }
  },
  methods: {
    selectRingtone(ringtone) {
      this.selectedRingtone = ringtone.value;
      uni.setStorageSync('ringtone', ringtone.value);
      this.playRingtone(ringtone.url);
      uni.showToast({
        title: '铃声设置成功',
        icon: 'success'
      });
    },
    playRingtone(url) {
      if (this.audioContext) {
        this.audioContext.stop();
        this.audioContext.destroy();
      }
      this.audioContext = uni.createInnerAudioContext();
      this.audioContext.src = url;
      this.audioContext.onError((err) => {
        console.error('音频播放失败:', err);
        uni.showToast({
          title: '音频播放失败，请检查文件路径',
          icon: 'none'
        });
      });
      this.audioContext.play();
    }
  }
}
</script>

<style>
.ringtone-container {
  padding: 20px;
}

.ringtone-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}
</style> 