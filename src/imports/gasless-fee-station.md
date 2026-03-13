4.4 Gasless（Fee Station）

Fuel 是预付服务积分，非链上资产。Cobo 代付 Gas，从 Fuel 余额扣除。

页面状态







状态



描述





正常



展示余额、充值地址、扣费记录





余额不足



顶部红色 Banner 提示，引导充值





余额告警触发



顶部黄色 Banner 提示





加载中



余额和记录 skeleton 占位

模块详情

Fuel 余额





当前余额（Fuel 单位）及等值美元估算



余额变更实时更新（SSE / WebSocket）



余额低于告警阈值时展示警告横幅

充值

用户点击 [充值]
→ 展示充值弹窗：
    - 按链选择（ETH、BTC 等）
    - 展示对应充值地址 + 二维码
    - 提示：充值确认后余额自动更新

扣费记录





时间倒序列表



每条记录：时间、链、交易 hash（可点击跳转区块浏览器）、消耗 Fuel 量、关联操作类型



支持分页加载

余额告警设置

用户点击 [设置告警]
→ 输入告警阈值（低于 X Fuel 时提醒）
→ 选择通知方式（页面通知 / 绑定渠道通知）
→ 保存

API 依赖





GET /fuel/balance — 获取 Fuel 余额



GET /fuel/deposit-address — 获取充值地址（按链）



GET /fuel/transactions — 获取扣费记录（分页）



GET /fuel/alert-config — 获取告警配置



PUT /fuel/alert-config — 更新告警配置