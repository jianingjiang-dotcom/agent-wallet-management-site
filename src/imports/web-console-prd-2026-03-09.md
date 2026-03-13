# Web Console PRD

**版本**：0.1 草稿
**日期**：2026-03-09
**受众**：内部工程师、设计师

---

## 1. 产品概述

Web Console 是 Cobo Agent Wallet 面向终端用户的 Web 端产品，与 Human App（移动端）等效互通，共享同一套 Account 体系。

**核心定位**：注册入口 + 管理中心。精细配置操作（风控规则、Delegation、账号安全）在 Web Console 完成；日常使用通过 AI 对话驱动。

**设计原则**：

- 规则优先：所有策略在签名层前置检查，Agent 无法绕过
- 渐进复杂：默认展示简单限额，高级能力按需开放
- 可解释：每次操作（允许 / 拒绝）都有结构化说明
- 用户控制：随时暂停 Agent、修改规则、撤销委托

---

## 2. 用户

使用Agent Wallet的Human Principals。

---

## 3. 技术背景

**身份模型**

- Account（`auth0_sub`）：由 Google / Apple OAuth 唯一确定的身份根
- Channel（ChannelBinding）：Web Console、Human App、IM Bot 均为渠道，与 Account 两层分离
- 每个 Account 维护单一 session

**钱包类型**

- **Human Created Wallet**：用户通过 Human App 创建，设备持有 Device Share；Web Console 可查看但不负责创建
- **Agent Created Wallet**：Agent 通过 `caw provision` 创建，Agent TSS Node 持有 Device Share；Web Console 负责 Pairing（身份确认）环节

**核心引擎（Core Engine）**

- 管理 Principal、Wallet、Delegation、Policy、Audit Log
- Web Console 通过 assistant-backend 中转调用 Core Engine API
- 策略决策结果：ALLOW / REQUIRE_APPROVAL / DENY（DENY 携带 `suggestion` 字段）

---

## 4. 核心页面

### 4.1 注册 / 登录页

**入口**：新用户直接访问域名，已登录用户跳转至 Onboarding 或 Dashboard。

**功能**：

- Google OAuth 登录 / 注册
- Apple OAuth 登录 / 注册
- 新用户首次 OAuth 完成后：后端创建 Account，向 Core Engine 申请 human Principal + API Key，跳转 Onboarding
- 已有账号：验证 `auth0_sub`，返回 session token，跳转上次离开页面

**状态**：

- 登录成功（新用户）→ Onboarding
- 登录成功（已有账号）→ Dashboard / AI 对话
- OAuth 失败 → 错误提示 + 重试入口

---

### 4.2 Onboarding 页

用户注册完成后的引导流程，完成 Pairing 后即可进入 Dashboard，可随时退出（退出后从 Dashboard 重新进入）。

**Onboarding 入口检测**：进入 Onboarding 前，后端检查 Account 当前状态：


| 状态       | 进入位置                       |
| -------- | -------------------------- |
| 无 Wallet | Pairing                    |
| 有 Wallet | 跳过 Onboarding，进入 Dashboard |


#### 初始化 Agent（Pairing）

引导用户将 Agent 与钱包绑定，对应 `caw provision` 流程中的 Web Console 确认环节。

```
步骤 0  用户通过 Agent 调研推荐或其他渠道了解到产品
步骤 1  打开 Web Console
步骤 2  完成 OAuth 注册（Google / Apple）
        → 后端创建 Account
步骤 3  Onboarding 页展示 Setup Token（15 分钟有效）
        → 用户将 Token 发送给 Agent
        → Agent 执行 caw provision --token <token>，完成 TSS 初始化和 Pairing，创建钱包
步骤 4  Pairing 完成后页面自动更新，显示 Wallet 地址
步骤 5  可选：引导安装 Human App，用同一 Account 登录即自动关联
步骤 6  可选：从渠道管理页发起 Deep Link 绑定 IM 渠道
```

---

### 4.3 风控管理 + Delegation 管理

此页面承担两个紧密相关的职责：**规则在哪些范围生效**（Policy）和 **谁被授权操作**（Delegation）。

#### 页面布局

```
┌─────────────────────────────────────────────┐
│  钱包列表（左侧或顶部 Tab）                      │
│  ├── Wallet A  [Agent: gpt-agent-1]         │
│  └── Wallet B  [未绑定 Agent]                │
└─────────────────────────────────────────────┘

选中 Wallet A 后展示：

┌──────────────────┬──────────────────────────┐
│  Delegation 信息  │  Policy 规则              │
│  Agent: xxx      │  单笔限额：$100             │
│  状态：Active     │  日限额：$500              │
│                  │  审批阈值：$100 以上需确认   │
│  [取消委托] [冻结] │  [修改限额]                │
└──────────────────┴──────────────────────────┘
```

#### Delegation 管理

显示当前 Active 的 Delegation 列表（每个 Wallet 对应的 Agent 授权）：

- 查看：Agent Principal ID、权限范围（转账 / 合约调用）、有效期、状态
- **取消委托**：吊销 Delegation，Agent 立即失去操作资格（高风险，需 step-up auth）
- **冻结 / 解冻**：临时暂停而不吊销，Agent 不可操作但 Delegation 保留

#### Policy（风控规则）

**v1 仅暴露转账限额**，底层支持的其他规则类型（地址白名单、Token 白名单、链白名单、合约调用规则、多层作用域）均不在 UI 中展示，用户可通过 AI 对话设置高级规则。

用户可调整：

- 单笔转账限额（滑块或输入框）
- 每日累计限额
- 超限审批开关（关闭 = 超限自动拒绝；开启 = 超限等待人工确认）

**修改限额**触发 step-up auth（重新 OAuth 验证），修改生效后在页面提示"规则已更新，下次 Agent 操作时生效"。

页面底部提示：「需要设置地址白名单、Token 限制等高级规则？通过 AI 对话告诉 Agent。」

**变更日志**：时间倒序列表，记录每次 Policy 和 Delegation 变更（操作人、时间、变更内容）。

---

### 4.4 AI 对话页

Web Console 内嵌的 Agent 对话界面，功能与 Telegram Bot 对等，适合习惯 Web 端操作的用户。

**功能**：

- 与 Agent 自然语言对话：发起转账、查询余额、修改规则（通过对话触发）、查看交易状态
- 对话中出现审批请求时，内嵌确认 / 拒绝按钮（无需跳转其他页面）
- 对话历史跨渠道共享（所有 Channel 共享同一 session）
- 用户记忆（持久化偏好、常用地址等）未来支持

**通知**：

- 被动通知（审批请求、交易确认、风控触发）通过页面内 Toast 或消息气泡推送
- 用户在任意渠道处理审批后，Web Console 侧通知自动失效

---

### 4.5 账号信息页

用户个人信息与安全设置的管理中心。

**模块**：

**基本信息**

- 头像（来自 OAuth Provider）
- 邮箱
- 注册时间 / 上次登录时间

**安全等级**

- **绑定第二个 OAuth**：当前仅 Google 或 Apple 登录的用户，可在此绑定另一个，提升账号安全等级
- 解绑 OAuth（需 step-up auth，且必须保留至少一个）

**登出**

- 当前设备登出（session 立即失效）

---

## 5. 辅助功能

### 5.1 Gasless（Fee Station）

以独立区块或设置页展示，不在主导航核心位置。


| 功能        | 说明                     |
| --------- | ---------------------- |
| Fuel 余额展示 | 当前余额及等值美元估算            |
| 充值地址      | 按链展示充值地址 + 二维码         |
| 扣费记录      | 时间、链、交易 hash、消耗 Fuel 量 |
| 余额告警设置    | 自定义告警阈值（低于 X 时提醒）      |
| 自动补充（未来）  | 触发阈值 + 补充金额配置          |


Fuel 定义：预付服务积分，非资产。Cobo 代付 Gas，从 Fuel 余额扣除。

### 5.2 缴费 / 账单（计划中）

> 功能待规划，当前仅保留导航入口，页面显示"即将上线"。
>
> 预期内容：账单查看（按周期、按用量）、付款入口、计费规则说明。

---

## 6. 进阶功能（未来，v1 不做）


| 功能         | 说明                                            |
| ---------- | --------------------------------------------- |
| IM 渠道管理    | 绑定 / 解绑 Telegram 等 IM 渠道；关联特定 Delegation      |
| 交易记录       | 完整链上交易历史，含规则触发原因、审批记录                         |
| 多 Agent 管理 | 多个 Delegation 的 Dashboard 视图，按 Agent 查看预算使用情况 |
| 用户记忆管理     | 查看 / 编辑 Agent 记住的偏好信息（常用地址、设置等）               |


---

## 7. 非功能需求


| 项目    | 要求                                                         |
| ----- | ---------------------------------------------------------- |
| 认证    | Google / Apple OAuth via Auth0；session TTL 可配置，默认 7 天      |
| 高风险操作 | step-up auth（重新 OAuth 验证）：修改 Policy、取消 Delegation、解绑 OAuth |
| 国际化   | 英语                                                         |
| 响应式   | 桌面端和移动端适配都需要。                                              |
| 实时性   | 审批请求、Fuel 余额：实时（WebSocket 或 SSE）；Policy 变更：最终一致            |
| 错误处理  | API 错误统一展示；Core Engine 的 DENY 响应展示 `suggestion` 内容         |


---

## 8. 待确认问题


