# Web Console PRD

**版本**：0.2 详细设计
**日期**：2026-03-10
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

使用 Agent Wallet 的 Human Principals。

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

## 4. P0 功能

### 4.1 注册 / 登录页

#### 页面状态

| 状态 | 描述 |
| -- | -- |
| 初始 | 展示 Google / Apple 登录按钮 |
| OAuth 进行中 | 跳转至 OAuth Provider，等待回调 |
| 处理中 | OAuth 回调后后端处理，展示 loading |
| 成功（新用户） | 跳转 Onboarding |
| 成功（已有账号） | 跳转上次离开页面，无记录则跳转 Dashboard |
| 失败 | 展示错误信息 + 重试按钮 |

#### 交互流程

```
用户访问 Web Console
→ 检查本地 session token
  ├── 有效 → 跳转 Dashboard（无需登录）
  └── 无效 / 无 → 展示登录页

用户点击 [Continue with Google] / [Continue with Apple]
→ 跳转 Auth0 OAuth flow
→ 回调至 /auth/callback
→ POST /auth/login { auth0_token }
  ├── 新用户（首次）：
  │   → 后端创建 Account
  │   → 向 Core Engine 申请 human Principal + API Key
  │   → 返回 session token
  │   → 跳转 Onboarding
  └── 已有账号：
      → 验证 auth0_sub，更新 last_login
      → 返回 session token
      → 跳转上次离开页面 / Dashboard
```

#### 错误状态

| 错误 | 展示 |
| -- | -- |
| OAuth 授权被用户取消 | "登录已取消，请重试" + 重试按钮 |
| OAuth Provider 服务异常 | "登录服务暂时不可用，请稍后重试" |
| 后端创建 Account 失败 | "账号创建失败，请联系支持" + 错误码 |
| session token 过期（已登录用户刷新页面） | 静默跳回登录页，不展示报错 |

#### API 依赖

- `POST /auth/login` — 验证 auth0_token，返回 session token
- `GET /auth/me` — 获取当前 Account 信息（用于 session 有效性检查）

---

### 4.2 Onboarding 页

#### 页面状态

| 状态 | 描述 |
| -- | -- |
| 入口检测中 | 检查 Account 是否已有 Wallet，展示 loading |
| 有 Wallet | 跳过 Onboarding，直接进入 Dashboard |
| 展示 Setup Token | 展示 Token 和二维码，等待用户操作 |
| 等待 Pairing | Token 已发送，轮询 Pairing 状态 |
| Token 已过期 | 展示过期提示，提供重新生成按钮 |
| Pairing 完成 | 展示 Wallet 地址和 MPC 份额状态，提示进入 Dashboard |
| Pairing 失败 | 展示错误原因，提供重试入口 |

#### 交互流程

```
进入 Onboarding
→ GET /wallets 检查是否已有 Wallet
  ├── 有 Wallet → 跳转 Dashboard
  └── 无 Wallet → 进入 Pairing 流程

Pairing 流程：
→ POST /onboarding/setup-token 生成 Setup Token（15 分钟有效）
→ 页面展示：
    - Token 文本（可复制）
    - Token 对应的二维码
    - 说明文字："将此 Token 发送给你的 Agent，Agent 执行 caw provision --token <token>"
    - 倒计时：Token 剩余有效时间
→ 前端每 5 秒轮询 GET /onboarding/pairing-status
  ├── status: pending → 继续等待，更新 UI 提示
  ├── status: completed →
  │   → 展示：钱包地址（按链列出）、MPC 份额状态（2/2，Server Share by Cobo，Device Share by Agent）
  │   → 展示 [进入 Dashboard] 按钮
  │   → 可选引导：安装 Human App / 绑定 Telegram
  ├── status: failed → 展示失败原因，提供重试按钮
  └── Token 过期（轮询超过 15 分钟）→ 展示过期提示，提供 [重新生成 Token] 按钮
```

#### 空状态 / 边界情况

- 用户中途关闭页面，重新进入：重新生成 Token（旧 Token 仍有效但不展示）
- 用户在 Pairing 等待期间刷新页面：恢复轮询状态
- 网络断开期间 Pairing 完成：恢复网络后下次轮询时正常显示完成状态

#### API 依赖

- `GET /wallets` — 检查是否已有 Wallet
- `POST /onboarding/setup-token` — 生成 Setup Token
- `GET /onboarding/pairing-status` — 轮询 Pairing 状态

> **Q1**：以上两个 Onboarding API 是否已在后端实现？

---

### 4.3 AI 对话页

#### 消息类型

| 类型 | 展示形式 |
| -- | -- |
| 用户消息 | 右侧气泡 |
| Agent 文本回复 | 左侧气泡，支持 Markdown 渲染 |
| Agent 思考中 | 左侧气泡，loading 动画 |
| 审批请求 | 左侧特殊卡片，含操作详情 + 确认 / 拒绝按钮 |
| 系统通知 | 居中灰色文本（如"规则已更新"、"Agent 已暂停"） |
| 错误消息 | 左侧气泡，红色提示，含重试入口 |

#### 交互流程

**发送消息**

```
用户输入文本，点击发送 / 回车
→ POST /chat/message { content }
→ 展示用户消息气泡
→ 展示 Agent 思考中动画
→ 接收 streaming 响应（SSE / WebSocket）
→ 逐字渲染 Agent 回复
→ 若回复中含审批请求：渲染审批卡片
```

**审批卡片**

```
审批卡片展示：
  - 操作类型（转账 / 合约调用）
  - 目标地址、金额、链
  - 触发原因（超过单笔限额 $100）
  - [确认] [拒绝] 按钮

用户点击 [确认]：
→ POST /pending-operations/{id}/approve
→ 按钮变为 loading，操作完成后更新卡片状态为"已确认"
→ Agent 继续执行后续流程

用户点击 [拒绝]：
→ POST /pending-operations/{id}/reject { reason? }
→ 卡片状态更新为"已拒绝"
```

**被动通知（审批请求推送）**

```
WebSocket / SSE 推送审批请求
→ 若用户在对话页：在对话流中插入审批卡片
→ 若用户在其他页：展示页面顶部 Banner 提示，点击跳转对话页
→ 审批在其他渠道已处理：卡片自动更新为对应状态，按钮禁用
```

#### 空状态

- 首次对话（无历史）：展示引导提示，如"你好，我是你的 Agent。你可以问我查询余额、发起转账，或者说「帮我设置风控规则」。"
- 网络断开：输入框禁用，展示"连接已断开，正在重连…"

#### API 依赖

- `POST /chat/message` — 发送消息，streaming 响应
- `GET /chat/history` — 获取历史对话
- `POST /pending-operations/{id}/approve` — 确认审批
- `POST /pending-operations/{id}/reject` — 拒绝审批
- WebSocket / SSE — 实时推送审批请求、通知

---

### 4.4 Gasless（Fee Station）

Fuel 是预付服务积分，非链上资产。Cobo 代付 Gas，从 Fuel 余额扣除。

#### 页面状态

| 状态 | 描述 |
| -- | -- |
| 正常 | 展示余额、充值地址、扣费记录 |
| 余额不足 | 顶部红色 Banner 提示，引导充值 |
| 余额告警触发 | 顶部黄色 Banner 提示 |
| 加载中 | 余额和记录 skeleton 占位 |

#### 模块详情

**Fuel 余额**

- 当前余额（Fuel 单位）及等值美元估算
- 余额变更实时更新（SSE / WebSocket）
- 余额低于告警阈值时展示警告横幅

**充值**

```
用户点击 [充值]
→ 展示充值弹窗：
    - 按链选择（ETH、BTC 等）
    - 展示对应充值地址 + 二维码
    - 提示：充值确认后余额自动更新
```

**扣费记录**

- 时间倒序列表
- 每条记录：时间、链、交易 hash（可点击跳转区块浏览器）、消耗 Fuel 量、关联操作类型
- 支持分页加载

**余额告警设置**

```
用户点击 [设置告警]
→ 输入告警阈值（低于 X Fuel 时提醒）
→ 选择通知方式（页面通知 / 绑定渠道通知）
→ 保存
```

#### API 依赖

- `GET /fuel/balance` — 获取 Fuel 余额
- `GET /fuel/deposit-address` — 获取充值地址（按链）
- `GET /fuel/transactions` — 获取扣费记录（分页）
- `GET /fuel/alert-config` — 获取告警配置
- `PUT /fuel/alert-config` — 更新告警配置

---

### 4.5 账号信息页

#### 模块详情

**基本信息**

- 头像（来自 OAuth Provider，只读）
- 邮箱（来自 OAuth Provider，只读）
- 注册时间 / 上次登录时间

**安全等级**

展示当前已绑定的 OAuth 提供商列表：

| 状态 | 展示 |
| -- | -- |
| 仅 1 个 OAuth | 黄色提示横幅："建议绑定第二个登录方式，防止账号失联" + [立即绑定] 按钮 |
| 已绑定 2 个 OAuth | 绿色状态，不打扰 |

**绑定第二个 OAuth 流程**

```
用户点击 [绑定 Google] / [绑定 Apple]
→ 触发 step-up auth（重新 OAuth 验证当前身份）
→ 验证通过后，跳转目标 OAuth Provider 完成授权
→ 后端关联新 OAuth 到当前 Account
→ 页面刷新，展示两个已绑定的 OAuth
```

**解绑 OAuth 流程**

```
用户点击 [解绑]
→ 检查：若当前仅剩 1 个 OAuth，禁用解绑，提示"必须保留至少一个登录方式"
→ 若有 2 个 OAuth：
  → 触发 step-up auth
  → 确认弹窗："解绑后将无法通过此方式登录，确认解绑？"
  → 确认 → 后端解绑，刷新页面
```

**登出**

```
用户点击 [退出登录]
→ 确认弹窗："确认退出？退出后需重新登录"
→ 确认 → DELETE /auth/session → 清除本地 token → 跳转登录页
```

#### 错误状态

| 错误 | 展示 |
| -- | -- |
| step-up auth 失败 | "身份验证失败，操作已取消" |
| 绑定已被其他账号占用的 OAuth | "该 Google / Apple 账号已关联其他用户" |
| 解绑失败 | "解绑失败，请重试" + 错误码 |

#### API 依赖

- `GET /auth/me` — 获取账号信息和已绑定 OAuth 列表
- `POST /auth/link` — 绑定新 OAuth
- `DELETE /auth/link/{provider}` — 解绑 OAuth
- `DELETE /auth/session` — 登出

---

## 5. P1 功能

### 5.1 风控管理 + Delegation 管理

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

#### 页面状态

| 状态 | 描述 |
| -- | -- |
| 无 Wallet | 空状态，引导前往 Onboarding |
| Wallet 无 Delegation | 展示 Wallet 信息，Delegation 区域显示"未绑定 Agent" |
| Delegation Active | 正常展示 |
| Delegation Frozen | 顶部黄色状态标签，[解冻] 按钮 |
| Delegation Expired | 顶部灰色状态标签，操作按钮禁用 |
| Delegation Revoked | 顶部红色状态标签，操作按钮禁用 |

#### Delegation 操作

**冻结 / 解冻**

```
用户点击 [冻结]
→ 确认弹窗："冻结后 Agent 将无法操作，Delegation 保留，可随时解冻"
→ 确认 → POST /delegations/{id}/freeze
→ 状态更新为 Frozen，按钮变为 [解冻]

用户点击 [解冻]
→ 确认弹窗
→ 确认 → POST /delegations/{id}/unfreeze
→ 状态恢复 Active
```

**取消委托（高风险）**

```
用户点击 [取消委托]
→ 风险提示弹窗："撤销后 Agent 立即失去所有操作资格，此操作不可恢复"
→ 用户确认 → 触发 step-up auth
→ step-up auth 通过 → DELETE /delegations/{id}
→ 状态更新为 Revoked，页面展示"委托已撤销"
```

#### Policy 操作

**修改限额**

```
用户点击 [修改限额]
→ 展示编辑表单：
    - 单笔转账限额（输入框，支持滑块）
    - 每日累计限额
    - 超限审批开关
→ 用户修改后点击 [保存]
→ 触发 step-up auth
→ 通过后 → PATCH /policies/{id} { rules_json }
→ 页面提示："规则已更新，下次 Agent 操作时生效"
```

#### 变更日志

- 时间倒序列表
- 每条记录：操作时间、操作类型（Policy 变更 / Delegation 状态变更）、变更内容摘要、操作人

页面底部提示：「需要设置地址白名单、Token 限制等高级规则？通过 AI 对话告诉 Agent。」

#### API 依赖

- `GET /wallets` — 获取 Wallet 列表
- `GET /delegations` — 获取 Delegation 列表
- `POST /delegations/{id}/freeze` — 冻结
- `POST /delegations/{id}/unfreeze` — 解冻
- `DELETE /delegations/{id}` — 撤销委托
- `GET /policies` — 获取 Policy 列表
- `PATCH /policies/{id}` — 更新 Policy
- `GET /audit-logs` — 获取变更日志

---

### 5.2 Dashboard

#### 页面状态

| 状态 | 描述 |
| -- | -- |
| 无 Wallet / 未完成 Pairing | 展示引导横幅，链接至 Onboarding |
| 正常 | 展示所有模块 |
| Fuel 余额不足 | 顶部红色横幅，链接至 Gasless 页 |
| 有待审批事项 | 待审批卡片列表高亮展示 |

#### 模块详情

**资产概览**

- 所有 Wallet 余额汇总（USD 估算）
- 各链分布列表：链名、余额、占比
- 数据加载中展示 skeleton

**Agent 运行状态**

- Delegation 状态（Active / Frozen / Expired）
- 今日操作次数 / 今日消耗金额（对应日限额进度条）
- 若 Delegation Frozen：黄色提示 + [解冻] 快捷按钮

**待审批事项**

- 当前所有 REQUIRE_APPROVAL 状态的操作卡片
- 每张卡片：操作类型、金额、目标地址、发起时间、剩余审批时间
- [确认] [拒绝] 按钮，操作后实时更新列表
- 若无待审批：展示"暂无待处理事项"

**近期交易**

- 最近 5 条链上交易记录
- 每条：时间、类型、金额、状态（成功 / 失败 / 待执行）、规则触发结果
- [查看全部] 链接（v1 跳转至 AI 对话查询，完整交易记录页为未来功能）

#### API 依赖

- `GET /wallets` — 获取 Wallet 列表及余额
- `GET /delegations` — 获取 Delegation 状态
- `GET /pending-operations` — 获取待审批列表
- `POST /pending-operations/{id}/approve` — 确认
- `POST /pending-operations/{id}/reject` — 拒绝
- `GET /transactions` — 获取近期交易（分页）

---

## 6. P2 功能

### 6.1 渠道管理

#### 页面状态

| 状态 | 描述 |
| -- | -- |
| 仅 Web Console | 展示当前渠道，无 IM 绑定提示 |
| 已绑定 Telegram | 展示 Telegram 渠道条目 |
| 生成 Deep Link 中 | 展示 Deep Link 和二维码，等待用户操作 |
| 绑定成功 | 刷新渠道列表，展示新增渠道 |

#### 绑定 Telegram 流程

```
用户点击 [绑定 Telegram]
→ POST /channels/telegram/link-code 生成一次性 code（10 分钟有效）
→ 展示：
    - Deep Link（可点击跳转 / 复制）
    - 对应二维码
    - 说明：点击链接或扫码后，在 Telegram Bot 中完成绑定
→ 前端轮询 GET /channels 检查绑定状态
→ 绑定完成 → 刷新渠道列表，展示"Telegram 已绑定"
→ code 过期 → 提示过期，[重新生成] 按钮
```

#### 解绑渠道

```
用户点击 [解绑]
→ 触发 step-up auth
→ 确认弹窗："解绑后将无法通过此渠道操作 Agent"
→ 确认 → DELETE /channels/{channel_binding_id}
→ 渠道列表更新
```

#### API 依赖

- `GET /channels` — 获取已绑定渠道列表
- `POST /channels/telegram/link-code` — 生成 Telegram 绑定 code
- `DELETE /channels/{id}` — 解绑渠道

---

### 6.2 缴费 / 账单（计划中）

> 功能待规划，当前仅保留导航入口，页面显示"即将上线"。
>
> 预期内容：账单查看（按周期、按用量）、付款入口、计费规则说明。

---

## 7. 未来功能（v1 不做）

| 功能         | 说明                                             |
| ---------- | ---------------------------------------------- |
| 交易记录       | 完整链上交易历史，含规则触发原因、审批记录                          |
| 多 Agent 管理 | 多个 Delegation 的 Dashboard 视图，按 Agent 查看预算使用情况  |
| 用户记忆管理     | 查看 / 编辑 Agent 记住的偏好信息（常用地址、设置等）                |

---

## 8. 非功能需求

| 项目    | 要求                                                          |
| ----- | ----------------------------------------------------------- |
| 认证    | Google / Apple OAuth via Auth0；session TTL 可配置，默认 7 天       |
| 高风险操作 | step-up auth（重新 OAuth 验证）：修改 Policy、取消 Delegation、解绑 OAuth  |
| 国际化   | 英语                                                          |
| 响应式   | 桌面端和移动端适配都需要                                                |
| 实时性   | 审批请求、Fuel 余额：实时（WebSocket 或 SSE）；Policy 变更：最终一致             |
| 错误处理  | API 错误统一展示；Core Engine 的 DENY 响应展示 `suggestion` 内容          |

---

## 9. 待确认问题

| 编号 | 问题                                                                 | 影响范围            |
| -- | ------------------------------------------------------------------ | --------------- |
| Q1 | Onboarding Pairing 环节，Setup Token 的生成和轮询 API 是否已在后端实现？             | Onboarding 开发排期 |
| Q2 | step-up auth 当前实现方式？（重新触发 OAuth flow，还是另有机制）                       | 风控管理、账号页        |
| Q3 | ~~v1 Policy 是否支持地址白名单？~~ 已决策：v1 仅支持转账限额，高级规则通过 AI 对话设置             | 已关闭             |
| Q4 | Fuel / AutoFuel 功能是否进 v1，还是等独立排期？                                  | 导航结构            |
| Q5 | Web Console 域名和部署环境是否确定？                                           | 登录 / OAuth callback 配置 |
