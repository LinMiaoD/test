<template>
	<view class="container">
		<!-- 连接配置 -->
		<!-- <view class="config-section">
		</view> -->

		<!-- 消息显示区域 -->
		<view class="messages-section">
			<view class="messages-header">
				<text class="section-title">消息列表</text>
				<!-- <view class="header-buttons">
					<button v-if="!isConnected && !isConnecting" class="btn connect-btn"
						@click="connectWebSocket">连接</button>
					<button v-if="isConnected" class="btn disconnect-btn" @click="disconnectWebSocket">断开</button>
					<button v-if="!isConnected && !isConnecting" class="btn reconnect-btn"
						@click="reconnectWebSocket">重连</button>
					<!-- <button class="btn clear-btn" @click="clearMessages">清空</button> -->
				</view> -->
			</view>

			<!-- 连接状态显示 -->
			<view class="status-container">
				<text :class="['status', statusClass]">{{ statusText }}</text>
			</view>

			<scroll-view class="messages-container" scroll-y="true" :scroll-top="scrollTop" scroll-with-animation>
				<view v-for="(message, index) in messages" :key="index" :class="['message', message.className]">
					<text class="timestamp">{{ message.timestamp }} {{ message.type }}{{ message.eventInfo }}</text>
					<text class="content">{{ message.content }}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 发送消息测试区域 -->
		<view class="test-section">
			<view class="section-title">测试发送</view>

			<!-- 心跳测试 -->
			<view class="input-group">
				<button class="btn send-btn" @click="sendHeartbeat" :disabled="!isConnected">发送心跳</button>
			</view>

			<!-- 聊天消息测试 -->
			<view class="input-group">
				<input class="input" v-model="chatMessage" placeholder="输入聊天内容" />
				<button class="btn send-btn" @click="sendChatMessage" :disabled="!isConnected">发送聊天</button>
			</view>

			<!-- 私聊消息测试 -->
			<view class="input-group">
				<input class="input" v-model="targetUserId" placeholder="目标用户ID" />
				<input class="input" v-model="privateMessage" placeholder="私聊内容" />
				<button class="btn send-btn" @click="sendPrivateMessage" :disabled="!isConnected">发送私聊</button>
			</view>

			<!-- 高级消息发送 -->
			<view class="advanced-section">
				<view class="subsection-title">高级消息发送</view>

				<!-- 消息类型选择 -->
				<view class="input-group">
					<picker @change="onMessageTypeChange" :value="messageTypeIndex" :range="messageTypes"
						range-key="name">
						<view class="picker">
							消息类型: {{messageTypes[messageTypeIndex].name}}
						</view>
					</picker>
				</view>

				<!-- 消息标题 -->
				<view class="input-group">
					<input class="input" v-model="advancedMessage.title" placeholder="消息标题（可选）" />
				</view>

				<!-- 消息内容 -->
				<view class="input-group">
					<textarea class="textarea" v-model="advancedMessage.content" placeholder="请输入消息内容" />
				</view>

				<!-- 目标用户（私聊/通知时使用） -->
				<view class="input-group" v-if="needTargetUser">
					<input class="input" v-model="advancedMessage.toUserId" placeholder="目标用户ID" />
					<input class="input" v-model="advancedMessage.toUserName" placeholder="目标用户名（可选）" />
				</view>

				<!-- 消息等级 -->
				<view class="input-group">
					<picker @change="onMessageLevelChange" :value="messageLevelIndex" :range="messageLevels"
						range-key="name">
						<view class="picker">
							消息等级: {{messageLevels[messageLevelIndex].name}}
						</view>
					</picker>
				</view>

				<!-- 其他选项 -->
				<view class="checkbox-group">
					<label class="checkbox-item">
						<checkbox :checked="advancedMessage.needAck" @change="onNeedAckChange" />
						<text>需要确认收到</text>
					</label>
				</view>

				<!-- 发送按钮 -->
				<view class="input-group">
					<button class="btn send-advanced-btn" @click="sendAdvancedMessage"
						:disabled="!isConnected || !advancedMessage.content">
						发送高级消息
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import api from "@/api/index.js";
	import manifest from '@/manifest.json';

	export default {
		data() {
			return {
				serverUrl: 'ws://192.168.0.196:8081', // WebSocket 服务器地址
				wsPath: '/devapi/websocket', // WebSocket 路径
				userId: '',
				studentUid: '',
				chatMessage: '',
				privateMessage: '',
				targetUserId: '',

				// 高级消息发送
				messageTypeIndex: 0,
				messageLevelIndex: 1, // 默认 normal
				messageTypes: [{
						value: 'notice',
						name: '系统通知'
					},
					{
						value: 'broadcast',
						name: '广播消息'
					},
					{
						value: 'private',
						name: '私聊消息'
					},
					{
						value: 'chat',
						name: '聊天消息'
					}
				],
				messageLevels: [{
						value: 'low',
						name: '低'
					},
					{
						value: 'normal',
						name: '普通'
					},
					{
						value: 'high',
						name: '高'
					},
					{
						value: 'urgent',
						name: '紧急'
					}
				],
				advancedMessage: {
					title: '',
					content: '',
					toUserId: '',
					toUserName: '',
					needAck: false
				},

				// 连接状态
				isConnected: false,
				isConnecting: false,
				statusText: '未连接',
				statusClass: 'disconnected',

				// 消息列表
				messages: [],
				scrollTop: 0,

				// 重连配置
				maxReconnectAttempts: 5,
				reconnectDelay: 3000,

				// 心跳配置
				heartbeatInterval: 30000 // 30秒心跳
			}
		},

		computed: {
			// 是否需要目标用户输入
			needTargetUser() {
				const currentType = this.messageTypes[this.messageTypeIndex].value;
				return currentType === 'notice' || currentType === 'private';
			}
		},

		beforeCreate() {
			// 在响应式系统初始化前设置非响应式属性
			this._webSocket = null;
			this._reconnectTimer = null;
			this._heartbeatTimer = null;
			this._reconnectAttempts = 0;
			this._isConnecting = false;
			this._isManualDisconnect = false;
		},

		onLoad() {
			this.addMessage('系统', '欢迎使用 WebSocket 测试工具！正在自动连接...');
			this.studentUid = uni.getStorageSync("studentUid");
			this.userId = this.studentUid;

			// 延迟连接，确保页面完全加载
			this.$nextTick(() => {
				setTimeout(() => {
					this.connectWebSocket();
				}, 500);
			});
		},

		onUnload() {
			this._isManualDisconnect = true;
			this.disconnectWebSocket();
		},

		onHide() {
			// 页面隐藏时不断开连接，保持后台运行
		},

		onShow() {
			// 页面显示时检查连接状态
			if (!this.isConnected && !this._isConnecting && this.studentUid) {
				this.connectWebSocket();
			}
		},

		methods: {
			// 获取 WebSocket URL
			getWebSocketUrl() {
				const baseUrl = this.serverUrl.replace(/^http/, 'ws');
				return `${baseUrl}${this.wsPath}/${encodeURIComponent(this.studentUid)}`;
			},

			// 更新连接状态
			updateConnectionStatus(status, message) {
				this.statusClass = status;
				this.statusText = message;

				if (status === 'connected') {
					this.isConnected = true;
					this.isConnecting = false;
				} else if (status === 'connecting') {
					this.isConnected = false;
					this.isConnecting = true;
				} else {
					this.isConnected = false;
					this.isConnecting = false;
				}
			},

			// 添加消息到显示列表
			addMessageInfo(type, content, isError = false, eventType = '') {
				const timestamp = new Date().toLocaleTimeString();
				const eventInfo = eventType ? ` [事件: ${eventType.toUpperCase()}]` : '';

				let className = 'message';
				if (isError) className += ' error';
				if (eventType === 'notice') className += ' notice-event';
				if (eventType === 'broadcast') className += ' broadcast-event';
				if (eventType === 'connection') className += ' connection-event';
				if (eventType === 'heartbeat') className += ' heartbeat-event';

				this.messages.push({
					timestamp,
					type,
					content,
					eventInfo,
					className
				});

				// 限制消息数量，防止内存溢出
				if (this.messages.length > 500) {
					this.messages.splice(0, 100);
				}

				// 滚动到底部
				this.$nextTick(() => {
					this.scrollTop = this.messages.length * 100;
				});
			},

			// 仅记录日志，不显示在界面
			addMessage(type, content, isError = false, eventType = '') {
				console.log(`[${type}${eventType ? '-' + eventType : ''}] ${content}`);
			},

			// 连接 WebSocket
			connectWebSocket() {
				// 严格防止重复连接
				if (this._isConnecting) {
					console.log('正在连接中，忽略重复连接请求');
					return;
				}

				if (this.isConnected && this._webSocket && this._webSocket.readyState === WebSocket.OPEN) {
					console.log('连接已存在且正常，跳过重连');
					return;
				}

				if (!this.studentUid) {
					this.addMessage('错误', '用户ID为空，无法建立连接', true);
					this.addMessageInfo('错误', '用户ID为空，无法建立连接', true);
					return;
				}

				this._isConnecting = true;
				this._isManualDisconnect = false;

				// 清理现有连接
				this.cleanupConnection();

				const wsUrl = this.getWebSocketUrl();

				this.updateConnectionStatus('connecting', '正在连接...');
				this.addMessage('系统', `尝试连接到: ${wsUrl}`);
				// this.addMessageInfo('系统', `🔗 尝试连接到: ${wsUrl}`);

				try {
					this._webSocket = new WebSocket(wsUrl);

					// 连接超时保护
					const connectTimeout = setTimeout(() => {
						if (this._isConnecting) {
							this._isConnecting = false;
							this.addMessage('错误', '连接超时，请检查网络', true);
							// this.addMessageInfo('错误', '⏰ 连接超时，请检查网络', true);
							this.updateConnectionStatus('disconnected', '连接超时');
							this.cleanupConnection();
						}
					}, 15000);

					// 连接成功
					this._webSocket.onopen = (event) => {
						clearTimeout(connectTimeout);
						this._isConnecting = false;
						this._reconnectAttempts = 0;

						this.updateConnectionStatus('connected', `已连接 (用户: ${this.studentUid})`);
						this.addMessage('系统', 'WebSocket 连接已建立');
						// this.addMessageInfo('系统', '✅ WebSocket 连接已建立');

						// 启动心跳
						this.startHeartbeat();
					};

					// 收到消息
					this._webSocket.onmessage = (event) => {
						try {
							const message = JSON.parse(event.data);
							this.handleWebSocketMessage(message);
						} catch (e) {
							// 如果不是 JSON 格式，作为普通文本处理
							this.addMessage('文本消息', event.data);
						}
					};

					// 连接关闭
					this._webSocket.onclose = (event) => {
						clearTimeout(connectTimeout);
						this._isConnecting = false;
						this.stopHeartbeat();

						console.log('WebSocket 连接关闭', event);

						if (event.wasClean) {
							this.updateConnectionStatus('disconnected', '连接已正常关闭');
							this.addMessage('系统', '🔌 连接已正常关闭');
						} else {
							this.updateConnectionStatus('disconnected', '连接异常断开');
							this.addMessage('错误', '❌ 连接异常断开', true);

							// 只有在非手动断开时才尝试重连
							if (!this._isManualDisconnect && this._reconnectAttempts < this.maxReconnectAttempts) {
								this.startReconnect();
							} else if (this._reconnectAttempts >= this.maxReconnectAttempts) {
								this.addMessage('错误', '❌ 重连次数已达上限，请手动重连', true);
							}
						}
					};

					// 连接错误
					this._webSocket.onerror = (error) => {
						clearTimeout(connectTimeout);
						this._isConnecting = false;
						console.error('WebSocket 错误:', error);

						this.addMessage('错误', 'WebSocket 连接错误', true);
						// this.addMessageInfo('错误', '❌ WebSocket 连接错误', true);

						if (!this.isConnected) {
							this.updateConnectionStatus('disconnected', '连接失败');
						}
					};

				} catch (error) {
					this._isConnecting = false;
					this.updateConnectionStatus('disconnected', '连接失败');
					this.addMessage('错误', `连接失败: ${error.message}`, true);
					// this.addMessageInfo('错误', `❌ 连接失败: ${error.message}`, true);
				}
			},

			// 处理 WebSocket 消息
			handleWebSocketMessage(message) {
				console.log('收到 WebSocket 消息:', message);

				// 统一的消息处理
				const displayTitle = this.getMessageDisplayTitle(message);
				const displayContent = this.getMessageDisplayContent(message);
				const eventType = message.type;

				switch (message.type) {
					case 'CONNECTION':
					case 'connection':
						this.addMessage(displayTitle, displayContent, false, 'connection');
						break;

					case 'NOTICE':
					case 'notice':
						this.addMessageInfo(displayTitle, displayContent, false, 'notice');
						// 高等级消息显示系统通知
						if (message.level === 'HIGH' || message.level === 'URGENT') {
							uni.showToast({
								title: message.title || '重要通知',
								icon: 'none',
								duration: 3000
							});
						}
						// 如果需要确认收到，发送ACK
						if (message.needAck) {
							this.sendMessageAck(message.messageId);
						}
						break;

					case 'BROADCAST':
					case 'broadcast':
						this.addMessageInfo(displayTitle, displayContent, false, 'broadcast');
						break;

					case 'CHAT':
					case 'chat':
						this.addMessageInfo(displayTitle, displayContent, false, 'chat');
						break;

					case 'PRIVATE':
					case 'private':
						this.addMessageInfo(displayTitle, displayContent, false, 'private');
						// 私聊消息显示提示
						uni.showToast({
							title: '收到私聊',
							icon: 'none'
						});
						break;

					case 'HEARTBEAT':
					case 'heartbeat':
						this.addMessage('心跳', `收到心跳回复: ${displayContent}`, false, 'heartbeat');
						// 心跳消息不显示在界面上，只记录日志
						break;

					case 'ERROR':
					case 'error':
						this.addMessageInfo(displayTitle, displayContent, true, 'error');
						break;

					case 'WARNING':
					case 'warning':
						this.addMessageInfo(displayTitle, displayContent, false, 'warning');
						break;

					case 'DISCONNECT':
					case 'disconnect':
					case 'serverClose':
						this.addMessage(displayTitle, displayContent, false, 'disconnect');
						break;

					default:
						this.addMessage('未知消息', JSON.stringify(message));
						break;
				}
			},

			// 获取消息显示标题
			getMessageDisplayTitle(message) {
				if (message.title) {
					return message.title;
				}

				const typeMap = {
					'CONNECTION': '连接消息',
					'connection': '连接消息',
					'NOTICE': '系统通知',
					'notice': '系统通知',
					'BROADCAST': '广播消息',
					'broadcast': '广播消息',
					'CHAT': '聊天消息',
					'chat': '聊天消息',
					'PRIVATE': '私聊消息',
					'private': '私聊消息',
					'ERROR': '错误消息',
					'error': '错误消息',
					'WARNING': '警告消息',
					'warning': '警告消息'
				};

				return typeMap[message.type] || '消息';
			},

			// 获取消息显示内容
			getMessageDisplayContent(message) {
				let content = message.content || '';

				// 添加发送者信息
				if (message.fromUserName && message.type !== 'HEARTBEAT' && message.type !== 'heartbeat') {
					const sender = message.fromUserName !== '系统' ? `来自 ${message.fromUserName}` : '';
					content = sender ? `${sender}: ${content}` : content;
				}

				// 添加时间信息（如果消息比较旧）
				if (message.createTime) {
					const messageTime = new Date(message.createTime);
					const now = new Date();
					const diffMinutes = (now - messageTime) / (1000 * 60);

					if (diffMinutes > 5) {
						content += ` (${this.formatTime(messageTime)})`;
					}
				}

				// 添加等级标识
				if (message.level && (message.level === 'HIGH' || message.level === 'URGENT')) {
					const levelMap = {
						'HIGH': '🔥',
						'URGENT': '🚨'
					};
					content = `${levelMap[message.level]} ${content}`;
				}

				return content;
			},

			// 发送消息确认
			sendMessageAck(messageId) {
				const ackMessage = {
					type: 'ack',
					messageId: messageId,
					timestamp: Date.now()
				};

				if (this.sendWebSocketMessage(ackMessage)) {
					this.addMessage('系统', `发送消息确认: ${messageId}`);
				}
			},

			// 发送 WebSocket 消息
			sendWebSocketMessage(message) {
				if (this._webSocket && this._webSocket.readyState === WebSocket.OPEN) {
					const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
					this._webSocket.send(messageStr);
					return true;
				} else {
					this.addMessage('错误', '连接未建立，无法发送消息', true);
					return false;
				}
			},

			// 发送心跳
			sendHeartbeat() {
				const heartbeatMessage = {
					type: 'heartbeat',
					timestamp: Date.now()
				};

				if (this.sendWebSocketMessage(heartbeatMessage)) {
					this.addMessage('心跳', '发送心跳消息');
					// 手动发送的心跳显示在界面上
					this.addMessage('心跳', '💓 手动发送心跳', false, 'heartbeat');
				}
			},

			// 发送聊天消息
			sendChatMessage() {
				if (!this.chatMessage.trim()) {
					uni.showToast({
						title: '请输入聊天内容',
						icon: 'none'
					});
					return;
				}

				const chatMessage = {
					type: 'chat',
					content: this.chatMessage,
					fromUserId: this.studentUid,
					fromUserName: this.getUserName(),
					timestamp: Date.now()
				};

				if (this.sendWebSocketMessage(chatMessage)) {
					this.addMessageInfo('发送', `我: ${this.chatMessage}`, false, 'chat');
					this.chatMessage = '';
				}
			},

			// 发送私聊消息
			sendPrivateMessage() {
				if (!this.privateMessage.trim()) {
					uni.showToast({
						title: '请输入私聊内容',
						icon: 'none'
					});
					return;
				}

				if (!this.targetUserId.trim()) {
					uni.showToast({
						title: '请输入目标用户ID',
						icon: 'none'
					});
					return;
				}

				const privateMessage = {
					type: 'private',
					content: this.privateMessage,
					fromUserId: this.studentUid,
					fromUserName: this.getUserName(),
					toUserId: this.targetUserId,
					timestamp: Date.now()
				};

				if (this.sendWebSocketMessage(privateMessage)) {
					this.addMessageInfo('发送', `私聊给 ${this.targetUserId}: ${this.privateMessage}`, false, 'private');
					this.privateMessage = '';
				}
			},

			// 获取用户名（可以从缓存或接口获取）
			getUserName() {
				return uni.getStorageSync("userName") || uni.getStorageSync("studentName") || `用户${this.studentUid}`;
			},

			// 格式化时间
			formatTime(date) {
				const hours = date.getHours().toString().padStart(2, '0');
				const minutes = date.getMinutes().toString().padStart(2, '0');
				return `${hours}:${minutes}`;
			},

			// 消息类型改变
			onMessageTypeChange(e) {
				this.messageTypeIndex = parseInt(e.detail.value);
				// 如果切换到广播消息，清空目标用户
				if (this.messageTypes[this.messageTypeIndex].value === 'broadcast') {
					this.advancedMessage.toUserId = '';
					this.advancedMessage.toUserName = '';
				}
			},

			// 消息等级改变
			onMessageLevelChange(e) {
				this.messageLevelIndex = parseInt(e.detail.value);
			},

			// 需要确认收到改变
			onNeedAckChange(e) {
				this.advancedMessage.needAck = e.detail.value.length > 0;
			},

			// 发送高级消息
			sendAdvancedMessage() {
				if (!this.advancedMessage.content.trim()) {
					uni.showToast({
						title: '请输入消息内容',
						icon: 'none'
					});
					return;
				}

				const messageType = this.messageTypes[this.messageTypeIndex].value;
				const messageLevel = this.messageLevels[this.messageLevelIndex].value;

				// 检查必要字段
				if (this.needTargetUser && !this.advancedMessage.toUserId.trim()) {
					uni.showToast({
						title: '请输入目标用户ID',
						icon: 'none'
					});
					return;
				}

				const message = {
					type: messageType,
					title: this.advancedMessage.title || this.messageTypes[this.messageTypeIndex].name,
					content: this.advancedMessage.content,
					fromUserId: this.studentUid,
					fromUserName: this.getUserName(),
					level: messageLevel.toUpperCase(),
					needAck: this.advancedMessage.needAck,
					timestamp: Date.now()
				};

				// 添加目标用户信息（如果需要）
				if (this.needTargetUser) {
					message.toUserId = this.advancedMessage.toUserId;
					message.toUserName = this.advancedMessage.toUserName || message.toUserId;
				}

				if (this.sendWebSocketMessage(message)) {
					const displayText = this.needTargetUser ?
						`发送${this.messageTypes[this.messageTypeIndex].name}给 ${message.toUserId}: ${message.content}` :
						`发送${this.messageTypes[this.messageTypeIndex].name}: ${message.content}`;

					this.addMessageInfo('发送', displayText, false, messageType);

					// 清空表单
					this.advancedMessage = {
						title: '',
						content: '',
						toUserId: '',
						toUserName: '',
						needAck: false
					};

					uni.showToast({
						title: '消息发送成功',
						icon: 'success'
					});
				}
			},

			sendPrivateMessage() {
				if (!this.privateMessage.trim()) {
					uni.showToast({
						title: '请输入私聊内容',
						icon: 'none'
					});
					return;
				}
			
				if (!this.targetUserId.trim()) {
					uni.showToast({
						title: '请输入目标用户ID',
						icon: 'none'
					});
					return;
				}
			
				const privateMessage = {
					type: 'private',
					content: this.privateMessage,
					fromUserId: this.studentUid,
					fromUserName: this.getUserName(),
					toUserId: this.targetUserId,
					timestamp: Date.now()
				};
			
				if (this.sendWebSocketMessage(privateMessage)) {
					this.addMessageInfo('发送', `私聊给 ${this.targetUserId}: ${this.privateMessage}`, false, 'private');
					this.privateMessage = '';
				}
			},

			// 启动心跳
			startHeartbeat() {
				this.stopHeartbeat(); // 先停止之前的心跳

				this._heartbeatTimer = setInterval(() => {
					if (this.isConnected) {
						const heartbeatMessage = {
							type: 'heartbeat',
							timestamp: Date.now()
						};
						this.sendWebSocketMessage(heartbeatMessage);
					}
				}, this.heartbeatInterval);
			},

			// 停止心跳
			stopHeartbeat() {
				if (this._heartbeatTimer) {
					clearInterval(this._heartbeatTimer);
					this._heartbeatTimer = null;
				}
			},

			// 开始重连
			startReconnect() {
				this._reconnectAttempts++;
				const delay = Math.min(this.reconnectDelay * this._reconnectAttempts, 30000); // 递增延迟，最大30秒

				this.addMessage('系统',
					`准备第${this._reconnectAttempts}次重连 (${this._reconnectAttempts}/${this.maxReconnectAttempts})，${delay/1000}秒后开始...`
				);
				this.addMessage('系统', `⏱️ 准备重连 (${this._reconnectAttempts}/${this.maxReconnectAttempts})...`);

				// 清除之前的重连定时器
				if (this._reconnectTimer) {
					clearTimeout(this._reconnectTimer);
				}

				this._reconnectTimer = setTimeout(() => {
					if (!this.isConnected && !this._isConnecting && !this._isManualDisconnect) {
						this.connectWebSocket();
					}
				}, delay);
			},

			// 清理连接资源
			cleanupConnection() {
				if (this._webSocket) {
					this._webSocket.onopen = null;
					this._webSocket.onmessage = null;
					this._webSocket.onclose = null;
					this._webSocket.onerror = null;

					if (this._webSocket.readyState === WebSocket.OPEN) {
						this._webSocket.close();
					}
					this._webSocket = null;
				}

				this.stopHeartbeat();

				if (this._reconnectTimer) {
					clearTimeout(this._reconnectTimer);
					this._reconnectTimer = null;
				}
			},

			// 断开 WebSocket 连接
			async disconnectWebSocket() {
				this._isManualDisconnect = true;
				this._isConnecting = false;

				// 清理重连定时器
				if (this._reconnectTimer) {
					clearTimeout(this._reconnectTimer);
					this._reconnectTimer = null;
				}

				try {
					// 调用服务端断开接口（如果有的话）
					const disconnectUrl = await api.disconnect({
						userId: this.studentUid
					});
					if (disconnectUrl) {
						console.log("断开连接响应:", disconnectUrl);
					}
				} catch (error) {
					console.error('调用断开连接接口失败:', error);
				}

				// 清理连接资源
				this.cleanupConnection();

				this.updateConnectionStatus('disconnected', '已手动断开连接');
				this.addMessage('系统', '已断开 WebSocket 连接');
				// this.addMessageInfo('系统', '🔌 已断开 WebSocket 连接');
				this._reconnectAttempts = 0;
			},

			// 手动重连
			reconnectWebSocket() {
				if (this._isConnecting) {
					this.addMessage('提示', '正在连接中，请稍候...', false);
					return;
				}

				this._isManualDisconnect = false;
				this._reconnectAttempts = 0;
				this.addMessage('系统', '🔄 手动重连中...');
				this.connectWebSocket();
			},

			// 清空消息
			clearMessages() {
				this.messages = [];
				this.scrollTop = 0;
				this.addMessage('系统', '消息已清空');
			}
		}
	}
</script>

<style>
	.container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.header {
		text-align: center;
		margin-bottom: 30rpx;
	}

	.title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	.messages-section,
	.test-section {
		background-color: white;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
	}

	.input-group {
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.label {
		width: 200rpx;
		font-size: 28rpx;
		color: #666;
	}

	.input {
		flex: 1;
		height: 80rpx;
		padding: 0 20rpx;
		border: 2rpx solid #ddd;
		border-radius: 8rpx;
		font-size: 28rpx;
		margin-right: 20rpx;
	}

	.input:disabled {
		background-color: #f0f0f0;
		color: #999;
	}

	.button-group {
		display: flex;
		justify-content: space-around;
		margin: 30rpx 0;
	}

	.header-buttons {
		display: flex;
		gap: 10rpx;
	}

	.btn {
		padding: 20rpx 40rpx;
		border-radius: 8rpx;
		font-size: 28rpx;
		border: none;
		color: white;
	}

	.connect-btn {
		background-color: #007AFF;
	}

	.connect-btn:disabled {
		background-color: #ccc;
	}

	.disconnect-btn {
		background-color: #FF3B30;
	}

	.disconnect-btn:disabled {
		background-color: #ccc;
	}

	.reconnect-btn {
		background-color: #FF9500;
	}

	.send-btn {
		background-color: #34C759;
		padding: 20rpx 30rpx;
	}

	.send-btn:disabled {
		background-color: #ccc;
	}

	.clear-btn {
		background-color: #FF9500;
		padding: 15rpx 25rpx;
		font-size: 24rpx;
	}

	.status-container {
		text-align: center;
		margin: 20rpx 0;
	}

	.status {
		padding: 15rpx 30rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		font-weight: bold;
	}

	.status.connected {
		background-color: #d4edda;
		color: #155724;
	}

	.status.connecting {
		background-color: #fff3cd;
		color: #856404;
	}

	.status.disconnected {
		background-color: #f8d7da;
		color: #721c24;
	}

	.messages-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.messages-container {
		height: 600rpx;
		border: 2rpx solid #eee;
		border-radius: 8rpx;
		padding: 20rpx;
		background-color: #fafafa;
	}

	.message {
		margin-bottom: 20rpx;
		padding: 15rpx;
		border-radius: 8rpx;
		background-color: white;
		border-left: 6rpx solid #007AFF;
	}

	.message.error {
		border-left-color: #FF3B30;
		background-color: #fff5f5;
	}

	.message.notice-event {
		border-left-color: #FF9500;
		background-color: #fff8f0;
	}

	.message.broadcast-event {
		border-left-color: #34C759;
		background-color: #f0fff4;
	}

	.message.connection-event {
		border-left-color: #5AC8FA;
		background-color: #f0f9ff;
	}

	.message.heartbeat-event {
		border-left-color: #AF52DE;
		background-color: #f8f0ff;
	}

	.message.private-event {
		border-left-color: #FF2D92;
		background-color: #fff0f6;
	}

	.message.warning-event {
		border-left-color: #FF9500;
		background-color: #fff8f0;
	}

	.message.error-event {
		border-left-color: #FF3B30;
		background-color: #fff5f5;
	}

	.advanced-section {
		margin-top: 30rpx;
		padding-top: 30rpx;
		border-top: 2rpx solid #eee;
	}

	.subsection-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #666;
		margin-bottom: 20rpx;
	}

	.picker {
		height: 80rpx;
		line-height: 80rpx;
		padding: 0 20rpx;
		border: 2rpx solid #ddd;
		border-radius: 8rpx;
		background-color: white;
		color: #333;
	}

	.textarea {
		min-height: 120rpx;
		padding: 20rpx;
		border: 2rpx solid #ddd;
		border-radius: 8rpx;
		font-size: 28rpx;
		width: 100%;
		box-sizing: border-box;
	}

	.checkbox-group {
		margin: 20rpx 0;
	}

	.checkbox-item {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.checkbox-item text {
		font-size: 28rpx;
		color: #333;
	}

	.send-advanced-btn {
		background-color: #5856D6;
		width: 100%;
	}

	.send-advanced-btn:disabled {
		background-color: #ccc;
	}

	.timestamp {
		font-size: 24rpx;
		color: #666;
		margin-bottom: 10rpx;
		display: block;
	}

	.content {
		font-size: 28rpx;
		color: #333;
		display: block;
		word-break: break-all;
	}
</style>