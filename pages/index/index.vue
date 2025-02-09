<template>
	<view class="container">
		<!-- 计时器区域 -->
		<scroll-view class="timer-section" scroll-y>
			<view class="timer-box">
				<view v-if="timers.length > 0" class="timers-list">
					<view 
						v-for="(timer, index) in timers" 
						:key="index"
						class="timer-area"
					>
						<view class="timer-content">
							<view class="ringtone-container">
								<button class="ringtone-btn" @click="toggleRingtone(index)">
									<image :src="timer.ringtoneEnabled ? '/static/images/bell-active.png' : '/static/images/bell-inactive.png'" mode="aspectFit" class="ringtone-icon"></image>
								</button>
							</view>
							<view class="timer-info">
								<text class="timer-name">{{ timer.name }}</text>
								<text class="timer-countdown">{{ formatTime(timer.time) }}</text>
							</view>
						</view>
						<view class="timer-actions">
							<button class="close-btn" @click="stopTimer(index)">×</button>
						</view>
					</view>
				</view>
				<view v-else class="empty-timer">
					<text>下点东西778~</text>
				</view>
			</view>
		</scroll-view>

		<!-- 分类导航 -->
		<scroll-view class="category-nav" scroll-x enable-flex>
			<view 
				v-for="(category, index) in categories" 
				:key="index"
				:class="['category-item', activeCategory === index ? 'active' : '']"
				@click="changeCategory(index)"
			>
				{{ category }}
			</view>
			<view class="add-category" @click="addCategory">
				+ 添加
			</view>
		</scroll-view>

		<!-- 食材列表 -->
		<scroll-view class="food-list" scroll-y>
			<view 
				v-for="(item, index) in filteredItems" 
				:key="index"
				class="food-card"
				@click="startTimer(item)"
			>
				<text class="food-name">{{ item.name }}</text>
				<text class="food-time">{{ item.time }} 秒</text>
				<button class="edit-btn" @click.stop="editTime(index)">编辑</button>
			</view>
		</scroll-view>

		<!-- 添加食材按钮 -->
		<button class="add-btn" @click="addFood">+ 添加食材</button>

		<!-- 底部导航 -->
		<view class="bottom-nav">
			<view class="nav-item active">Timer</view>
			<view class="nav-item" @click="goToSettings">setting</view>
		</view>

		<!-- 添加编辑时间的弹窗 -->
		<uni-popup ref="popup" type="dialog">
			<uni-popup-dialog
				mode="input"
				title="设置涮煮时间"
				:value="editTimeValue"
				placeholder="请输入时间（秒）"
				@confirm="confirmEditTime"
			></uni-popup-dialog>
		</uni-popup>

		<!-- 添加新的popup -->
		<uni-popup ref="categoryPopup" type="dialog">
			<uni-popup-dialog
				mode="input"
				title="添加分类"
				placeholder="请输入分类名称"
				@confirm="confirmAddCategory"
			></uni-popup-dialog>
		</uni-popup>

		<!-- 在template中添加新的popup -->
		<uni-popup ref="foodPopup" type="dialog">
			<uni-popup-dialog
				mode="input"
				title="添加食材"
				:value="newFoodName"
				placeholder="请输入食材名称"
				@confirm="confirmAddFoodName"
			></uni-popup-dialog>
		</uni-popup>

		<uni-popup ref="timePopup" type="dialog">
			<uni-popup-dialog
				mode="input"
				title="设置时间"
				:value="newFoodTime"
				placeholder="请输入时间（秒）"
				@confirm="confirmAddFoodTime"
			></uni-popup-dialog>
		</uni-popup>

		<uni-popup ref="categoryPicker" type="dialog">
			<view class="popup-content" style="width: 90%; max-width: 500px;">
				<text class="popup-title">选择分类</text>
				<picker
					mode="selector"
					:range="categories.filter(c => c !== '所有')"
					@change="handleCategoryChange"
					style="width: 100%; height: 50px; font-size: 16px;"
				>
					<view class="picker">
						<text>{{ selectedCategory || '类别' }}</text>
					</view>
				</picker>
				<button class="confirm-btn" @click="confirmCategory">确定</button>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue'
import uniPopupDialog from '@dcloudio/uni-ui/lib/uni-popup-dialog/uni-popup-dialog.vue'
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

export default {
	components: {
		uniPopup,
		uniPopupDialog,
		uniIcons
	},
	data() {
		return {
			timers: [],
			activeCategory: 0,
			categories: [],
			items: [],
			editIndex: null,
			editTimeValue: '',
			newFoodName: '',
			newFoodTime: '',
			showCategoryPicker: false,
			selectedCategory: '',
			ringtoneEnabled: false
		}
	},
	computed: {
		filteredItems() {
			if (this.activeCategory === 0) return this.items;
			const categoryName = this.categories[this.activeCategory];
			return this.items.filter(item => item.category === categoryName);
		}
	},
	onLoad() {
		const token = uni.getStorageSync('token');
		if (!token) {
			uni.reLaunch({
				url: '/pages/login/index'
			});
		} else {
			console.log('调用fetchCustomTimes方法');
			uni.showLoading({
				title: '正在加载食材信息...'
			});
			this.fetchCustomTimes().finally(() => {
				uni.hideLoading();
			});
		}
	},
	onShow() {
		// 如果计时器区域已经有内容，直接返回
		if (this.timers.length > 0) return;
		// 其他需要在页面显示时执行的逻辑
	},
	methods: {
		getRingtoneUrl(ringtoneValue) {
			const ringtones = [
				{ value: 'default', url: '/static/ringtone/default.mp3' },
				{ value: 'light', url: '/static/ringtone/light.mp3' },
				{ value: 'QQ', url: '/static/ringtone/QQ.mp3' }
			];
			const selectedRingtone = ringtones.find(rt => rt.value === ringtoneValue);
			return selectedRingtone ? selectedRingtone.url : '/static/ringtone/default.mp3';
		},
		playRingtone(url) {
			const audioContext = uni.createInnerAudioContext();
			audioContext.src = url;
			audioContext.onError((err) => {
				console.error('音频播放失败:', err);
				uni.showToast({
					title: '音频播放失败，请检查文件路径',
					icon: 'none'
				});
			});
			audioContext.play();
		},
		startTimer(item) {
			const newTimer = {
				...item,
				time: item.time,
				ringtoneEnabled: false,
				timer: setInterval(() => {
					if (newTimer.time > 0) {
						newTimer.time--;
					} else {
						clearInterval(newTimer.timer);
						this.timers = this.timers.filter(t => t !== newTimer);
						uni.showToast({
							title: `${newTimer.name} 计时结束`,
							icon: 'none'
						});
						if (newTimer.ringtoneEnabled) {
							const selectedRingtone = uni.getStorageSync('ringtone') || 'default';
							const ringtoneUrl = this.getRingtoneUrl(selectedRingtone);
							this.playRingtone(ringtoneUrl);
						}
					}
				}, 1000)
			};
			this.timers.push(newTimer);
		},
		stopTimer(index) {
			clearInterval(this.timers[index].timer)
			this.timers.splice(index, 1)
		},
		toggleRingtone(index) {
			this.timers[index].ringtoneEnabled = !this.timers[index].ringtoneEnabled;
		},
		changeCategory(index) {
			if (this.activeCategory === index) return; // 如果当前分类已经是目标分类，直接返回
			this.activeCategory = index;
		},
		addCategory() {
			this.$refs.categoryPopup.open();
		},
		async confirmAddCategory(value) {
			if (!value) {
				uni.showToast({
					title: '分类名称不能为空',
					icon: 'none'
				});
				return;
			}

			if (this.categories.includes(value)) {
				uni.showToast({
					title: '该分类已存在',
					icon: 'none'
				});
				return;
			}

			const phone = uni.getStorageSync('phone');
			const password = uni.getStorageSync('password');
			if (phone && password) {
				try {
					const res = await uniCloud.callFunction({
						name: 'add-category',
						data: { phone, password, category: value }
					});

					if (res.result.code === 200) {
						this.categories.push(value);
						this.activeCategory = this.categories.length - 1;
						uni.showToast({
							title: '添加成功',
							icon: 'success'
						});
						this.fetchCustomTimes(); // 重新获取分类信息
					} else {
						uni.showToast({
							title: res.result.message || '添加分类失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.showToast({
						title: '添加分类失败，请重试',
						icon: 'none'
					});
					console.error('添加分类失败:', error);
				}
			}
		},
		addFood() {
			this.newFoodName = '';
			this.newFoodTime = '';
			this.$refs.foodPopup.open();
		},
		confirmAddFoodName(value) {
			if (!value) {
				uni.showToast({
					title: '食材名称不能为空',
					icon: 'none'
				});
				return;
			}
			this.newFoodName = value;
			this.$refs.timePopup.open();
		},
		confirmAddFoodTime(value) {
			if (isNaN(value) || value <= 0) {
				uni.showToast({
					title: '请输入有效的时间',
					icon: 'none'
				});
				return;
			}

			if (this.categories[this.activeCategory] === '所有') {
				this.newFoodTime = parseInt(value);
				this.$refs.categoryPicker.open();
				return;
			}

			const categoryName = this.categories[this.activeCategory];
			const newFood = {
				name: this.newFoodName,
				time: parseInt(value),
				category: categoryName
			};
			this.saveFood(newFood);
		},
		confirmCategory() {
			if (!this.selectedCategory) {
				uni.showToast({
					title: '请选择分类',
					icon: 'none'
				});
				return;
			}

			const newFood = {
				name: this.newFoodName,
				time: this.newFoodTime,
				category: this.selectedCategory
			};
			this.saveFood(newFood);
			this.$refs.categoryPicker.close();
		},
		saveFood(newFood) {
			this.items.push(newFood);
			uni.showToast({
				title: '添加成功',
				icon: 'success'
			});
			this.saveCustomTime(newFood.name, newFood.time, newFood.category);
		},
		formatTime(seconds) {
			const minutes = Math.floor(seconds / 60)
			const secs = seconds % 60
			return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
		},
		editTime(index) {
			const currentItems = this.getCurrentCategoryItems();
			this.editIndex = this.items.findIndex(item => item.name === currentItems[index].name);
			this.editTimeValue = currentItems[index].time;
			this.$refs.popup.open();
		},
		async confirmEditTime(value) {
			if (isNaN(value) || value <= 0) {
				uni.showToast({
					title: '请输入有效的时间',
					icon: 'none'
				});
				return;
			}

			const phone = uni.getStorageSync('phone');
			const password = uni.getStorageSync('password');
			const itemName = this.items[this.editIndex].name;
			const newTime = parseInt(value);

			try {
				const res = await uniCloud.callFunction({
					name: 'update-custom-time',
					data: {
						phone,
						password,
						itemName,
						newTime
					}
				});

				if (res.result.code === 200) {
					this.items[this.editIndex].time = newTime;
					uni.showToast({
						title: '更新成功',
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: res.result.message || '更新失败',
						icon: 'none'
					});
				}
			} catch (error) {
				uni.showToast({
					title: '更新失败，请重试',
					icon: 'none'
				});
				console.error('更新失败:', error);
			}

			this.$refs.popup.close();
		},
		goToSettings() {
			uni.navigateTo({
				url: '/pages/settings/index'
			});
		},
		async saveCustomTime(itemName, time, category) {
			const phone = uni.getStorageSync('phone');
			const password = uni.getStorageSync('password');
			console.log('phone:', phone, 'password:', password); // 添加调试日志
			if (phone && password) {
				try {
					console.log('调用get-custom-times云函数'); // 添加调试日志
					const res = await uniCloud.callFunction({
						name: 'save-custom-times',
						data: {
							phone,
							password,
							items: [{ name: itemName, time, category }]
						}
					});
					if (res.result.code === 200) {
						this.fetchCustomTimes(); // 保存成功后重新获取食材
						uni.showToast({ title: '保存成功', icon: 'success' });
					} else {
						uni.showToast({ title: res.result.message || '保存失败', icon: 'none' });
					}
				} catch (error) {
					uni.showToast({ title: '保存失败，请重试', icon: 'none' });
					console.error('保存失败:', error);
				}
			}
		},
		async fetchCustomTimes() {
			const phone = uni.getStorageSync('phone');
			const password = uni.getStorageSync('password');
			if (phone && password) {
				try {
					// 获取分类信息
					const categoriesRes = await uniCloud.callFunction({
						name: 'get-categories',
						data: { phone, password }
					});

					if (categoriesRes.result.code === 200) {
						this.categories = ['所有', ...categoriesRes.result.data];
					} else {
						uni.showToast({ title: '获取分类信息失败', icon: 'none' });
					}

					// 获取自定义食材
					const res = await uniCloud.callFunction({
						name: 'get-custom-times',
						data: { phone, password }
					});
					if (res.result.code === 200) {
						this.items = res.result.data;
					} else {
						uni.showToast({ title: '获取食材失败', icon: 'none' });
					}
				} catch (error) {
					uni.showToast({ title: '获取数据失败，请重试', icon: 'none' });
					console.error('获取数据失败:', error);
				}
			}
		},
		handleCategoryChange(e) {
			const index = e.detail.value;
			this.selectedCategory = this.categories.filter(c => c !== '所有')[index];
		},
		getCurrentCategoryItems() {
			if (this.activeCategory === 0) return this.items;
			const categoryName = this.categories[this.activeCategory];
			return this.items.filter(item => item.category === categoryName);
		}
	}
}
</script>

<style>
	.container {
		padding: 20px;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.timer-section {
		height: 45%; /* 增加计时器区域高度 */
		margin-bottom: 20px;
		overflow: hidden;
	}

	.timer-box {
		height: 100%;
		background: #f5f5f5;
		border-radius: 10px;
	}

	.timers-list {
		padding: 10px;
	}

	.timer-area {
		background: white;
		border-radius: 8px;
		padding: 12px;
		margin-bottom: 10px;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.timer-content {
		display: flex;
		align-items: center;
		flex-grow: 1;
	}

	.timer-info {
		display: flex;
		flex-direction: column;
	}

	.timer-name {
		font-size: 16px;
		font-weight: bold;
	}

	.timer-countdown {
		font-size: 14px;
		color: #e74c3c;
	}

	.timer-actions {
		display: flex;
		align-items: center;
	}

	.ringtone-container {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 10px;
	}

	.ringtone-btn {
		background: none;
		border: none;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn {
		font-size: 24px;
		color: #999;
		background: none;
		border: none;
		padding: 0;
	}

	.empty-timer {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		color: #666;
	}

	.category-nav {
		height: 6%;
		display: flex;
		white-space: nowrap;
		margin-bottom: 5px;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		flex-direction: row;
		width: 100%;
	}

	.category-item {
		width: 20%;
		min-width: 0;
		padding: 4px 10px; /* 减少内边距 */
		margin-right: 10px;
		border-radius: 20px;
		background: #f5f5f5;
		color: #666;
		flex-shrink: 0;
		font-size: 14px;
		text-align: center;
		box-sizing: border-box;
		height: 38px; /* 设置固定高度 */
		line-height: 22px; /* 调整文字垂直居中 */
	}

	.category-item.active {
		background: #007aff;
		color: white;
	}

	.add-category {
		min-width: 100px; /* 设置最小宽度 */
		padding: 8px 15px; /* 调整内边距 */
		color: #007aff;
		flex-shrink: 0; /* 防止添加按钮被压缩 */
		font-size: 14px;
		text-align: center; /* 文字居中 */
		box-sizing: border-box; /* 确保宽度包含内边距 */
	}

	.food-list {
		flex: 1;
		overflow: hidden;
	}

	.food-card {
		background: white;
		border-radius: 10px;
		padding: 15px;
		margin-bottom: 10px;
		display: flex;
		align-items: center;
	}

	.food-name {
		flex: 1;
		font-size: 16px;
	}

	.food-time {
		color: #666;
	}

	.add-btn {
		background: #007aff;
		color: white;
		border-radius: 25px;
		margin: 20px 0;
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

	.edit-btn {
		background: #f0ad4e;
		color: white;
		padding: 2px 8px;
		border-radius: 3px;
		font-size: 12px;
		margin-left: 10px;
	}

	.popup-content {
		padding: 20px;
		background: white;
		border-radius: 10px;
		width: 90%;
		max-width: 500px;
		margin: 0 auto;
	}

	.popup-title {
		font-size: 16px;
		font-weight: bold;
		margin-bottom: 15px;
		display: block;
	}

	.confirm-btn {
		margin-top: 20px;
		background: #007aff;
		color: white;
		border-radius: 5px;
	}

	.picker {
		width: 100%;
		height: 50px;
		line-height: 50px;
		border: 1px solid #ddd;
		border-radius: 5px;
		margin-bottom: 20px;
		text-align: center;
		color: #666;
		font-size: 16px;
	}

	.ringtone-icon {
		width: 20px;
		height: 20px;
	}
</style>
