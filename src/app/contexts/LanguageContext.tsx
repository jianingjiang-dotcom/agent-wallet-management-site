import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type Language = "en" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Auth
    "auth.welcome": "Welcome to Agent Wallet",
    "auth.subtitle":
      "Secure and intelligent wallet management platform",
    "auth.login": "Sign In",
    "auth.selectProvider":
      "Select your preferred sign-in method",
    "auth.continueWithGoogle": "Continue with Google",
    "auth.continueWithApple": "Continue with Apple",
    "auth.continueWithGithub": "Continue with Github",
    "auth.privacyNotice":
      "By continuing, you agree to our Terms of Service and Privacy Policy",
    "auth.register": "Sign Up",
    "auth.logout": "Sign Out",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.name": "Full Name",
    "auth.rememberMe": "Remember me",
    "auth.forgotPassword": "Forgot password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.signUpNow": "Sign up now",
    "auth.signInNow": "Sign in now",
    "auth.orContinueWith": "Or continue with",
    "auth.resetPassword": "Reset Password",
    "auth.sendResetLink": "Send Reset Link",
    "auth.backToLogin": "Back to Sign In",
    "auth.emailSent": "Email Sent",
    "auth.resetEmailSent":
      "We have sent a password reset link to",
    "auth.checkEmail":
      "Please check your email and follow the instructions.",
    "auth.createAccount": "Create your account",
    "auth.resetPasswordTitle": "Reset your password",
    "auth.resetPasswordSubtitle":
      "Enter your email address to reset your password",
    "auth.error.invalidCredentials":
      "Invalid email or password",
    "auth.error.emailExists":
      "This email is already registered",
    "auth.error.passwordMismatch": "Passwords do not match",
    "auth.error.passwordLength":
      "Password must be at least 8 characters",
    "auth.useMagicLink": "Use Magic Link",
    "auth.enterEmail": "Enter your email address",
    "auth.sendMagicLink": "Send Login Link",
    "auth.sent": "Link Sent",
    "auth.loginWithMagicLink": "Simulate Click Link",

    // Navigation
    "nav.overview": "Overview",
    "nav.chat": "Chat",
    "nav.delegation": "Delegation & Policy",
    "nav.aiAssistant": "AI Assistant",
    "nav.gasless": "Gasless",
    "nav.billing": "Billing",
    "nav.walletAgent": "Wallet & Agent",
    "nav.gasAccount": "Gas Account",
    "nav.comingSoon": "Coming Soon",
    "nav.setupWallet": "Setup Wallet",
    "nav.settings": "Settings",
    "nav.language": "Language",

    // Overview — paired user
    "overview.welcome": "Welcome back",
    "overview.subtitle": "Manage your Agent wallet and monitor activity",
    "overview.walletCard": "Wallet",
    "overview.agentCard": "Agent Status",
    "overview.gasCard": "Gas Balance",
    "overview.recentTx": "Recent Transactions",
    "overview.noTx": "No transactions yet. Your Agent's activity will appear here.",
    "overview.viewAll": "View all",
    "overview.quickActions": "Quick Actions",
    "overview.depositGas": "Deposit Gas",
    "overview.adjustRules": "Adjust Rules",
    "overview.chatAI": "Chat with AI",
    // Overview — new user
    "overview.welcomeTitle": "Welcome to Agent Wallet",
    "overview.introText": "Agent Wallet lets you give an AI Agent controlled access to a crypto wallet. You set the rules — spending limits, allowed operations — and the Agent operates within those boundaries.",
    "overview.setupFirst": "Set Up Your First Wallet",
    "overview.learnMore": "Learn how it works →",
    "overview.howItWorks": "How It Works",
    "overview.step1": "Create a wallet",
    "overview.step1Desc": "Generate a pairing code and create a secure wallet",
    "overview.step2": "Connect your Agent",
    "overview.step2Desc": "Share the pairing code with your AI Agent",
    "overview.step3": "Set spending rules",
    "overview.step3Desc": "Define transaction limits and permissions",

    // Installation
    "install.forAgentOwners": "FOR AGENT OWNERS",
    "install.title": "Agent Installation Guide",
    "install.subtitle":
      "Follow these steps to install and configure wallet for your Agent",
    "install.step1.title": "1. Download Agent Wallet SDK",
    "install.step1.description":
      "Install Agent Wallet SDK using npm or yarn",
    "install.step2.title": "2. Initialize SDK",
    "install.step2.description":
      "Import and initialize the SDK in your Agent code",
    "install.step3.title": "3. Configure API Key",
    "install.step3.description":
      "Get your API key from dashboard and configure environment variables",
    "install.additionalResources": "Additional Resources",
    "install.apiDocs": "→ Complete API Documentation",
    "install.examples": "→ Example Code Repository",
    "install.faq": "→ Frequently Asked Questions",
    "install.community": "→ Community Support Forum",
    "install.needHelp": "Need Help?",
    "install.supportText":
      "Our technical team is ready to assist you",
    "install.contactSupport": "Contact Technical Support",
    "install.copyCode": "Copy code",

    // Risk Control
    "risk.title": "Risk Control",
    "risk.subtitle":
      "Monitor and manage your Agent wallet security settings",
    "risk.currentLevel": "Current Risk Level",
    "risk.refreshStatus": "Refresh Status",
    "risk.low": "Low Risk",
    "risk.lowDesc":
      "System operating normally, no anomalous activity detected",
    "risk.medium": "Medium Risk",
    "risk.mediumDesc":
      "Some activities detected that require attention",
    "risk.high": "High Risk",
    "risk.highDesc":
      "Suspicious activity detected, immediate review recommended",
    "risk.autoBlock": "Auto Block",
    "risk.autoBlockDesc":
      "Automatically block suspicious transactions and activities",
    "risk.twoFactor": "Two-Factor Authentication",
    "risk.twoFactorDesc":
      "Add an extra layer of security for sensitive operations",
    "risk.transactionLimit": "Transaction Limit",
    "risk.transactionLimitDesc":
      "Set daily transaction amount limits",
    "risk.ipWhitelist": "IP Whitelist",
    "risk.ipWhitelistDesc":
      "Only allow specific IP addresses to access",
    "risk.enabled": "Enabled",
    "risk.disabled": "Disabled",
    "risk.quickActions": "Quick Actions",
    "risk.forceReview": "Force Review All Transactions",
    "risk.emergencyFreeze": "Emergency Freeze All Activity",
    "risk.generateReport": "Generate Security Report",

    // AI Assistant / Chat
    "ai.title": "AI Assistant",
    "ai.subtitle":
      "Chat with official AI assistant for real-time help and guidance",
    "ai.history": "History",
    "ai.chatTab": "AI Chat",
    "ai.newChat": "New Chat",
    "ai.noHistory": "No conversation history",
    "ai.noMessages": "No messages",
    "ai.startChat": "Start a conversation to view messages",
    "ai.approvalRequest": "Approval Request",
    "ai.operation": "Operation",
    "ai.amount": "Amount",
    "ai.target": "Target",
    "ai.reason": "Reason",
    "ai.approve": "Approve",
    "ai.reject": "Reject",
    "ai.approved": "Approved",
    "ai.rejected": "Rejected",
    "ai.uploadFile": "Upload File",
    "ai.inputPlaceholder": "Enter message...",
    "ai.send": "Send",
    "ai.quickQuestions": "Quick Questions:",
    "ai.placeholder": "Type your question...",
    "ai.greeting":
      "Hello! I'm the Agent Wallet AI assistant. I can help you with wallet management, Agent configuration, security settings, and more. How can I assist you today?",
    "ai.q1": "How to install an Agent?",
    "ai.q2": "How to improve security?",
    "ai.q3": "View API documentation",
    "ai.q4": "Transaction limit settings",

    // Onboarding
    "onboarding.title": "Create Agent Wallet",
    "onboarding.subtitle": "Send the instructions below to your AI Agent — it will create and configure your wallet automatically",
    "onboarding.skip": "Skip for now",
    // Prompt card
    "onboarding.promptLabel": "Pairing Instructions",
    "onboarding.expiresIn": "Expires in",
    "onboarding.copyPrompt": "Copy Instructions",
    "onboarding.copyPromptDone": "Copied!",
    "onboarding.copyTokenOnly": "Copy Token only",
    "onboarding.copyTokenDone": "Copied!",
    "onboarding.regenerate": "Regenerate",
    // Spending limits
    "onboarding.limits.title": "Security Spending Limits",
    "onboarding.limits.desc": "Set spending limits for your Agent. Adjustable anytime.",
    "onboarding.limits.perTx": "Per-Transaction Limit",
    "onboarding.limits.daily": "Daily Spending Limit",
    "onboarding.limits.others": "Others",
    "onboarding.limits.warning": "Changing limits will regenerate the pairing instructions",
    "onboarding.limits.confirm": "Confirm Limits",
    "onboarding.limits.regenerating": "Regenerating...",
    // Steps
    "onboarding.stepsTitle": "Steps",
    "onboarding.step1": "Click the \"Copy Instructions\" button",
    "onboarding.step2": "Paste into your AI Agent conversation",
    "onboarding.step3": "Agent will auto-install and pair. This page updates automatically.",
    // Doc link
    "onboarding.docLink": "View full documentation",
    // Waiting phases
    "onboarding.simulate": "Simulate Pairing (Demo)",
    "onboarding.cancel": "Cancel",
    "onboarding.waiting.waiting": "Waiting for Agent to create wallet...",
    "onboarding.waiting.connected": "Agent connected, creating wallet...",
    "onboarding.waiting.configuring": "Configuring risk policies...",
    // Success
    "onboarding.success.title": "Agent Wallet Created Successfully",
    "onboarding.success.desc": "Your Agent wallet has been initialized and is ready to use",
    "onboarding.success.wallet": "Wallet Address",
    "onboarding.success.walletId": "Wallet ID",
    "onboarding.success.agentId": "Agent ID",
    "onboarding.success.linked": "Linked",
    "onboarding.success.limitsApplied": "Applied Spending Limits",
    "onboarding.success.nextSteps": "Next Steps",
    "onboarding.success.step1": "View your wallet in Dashboard",
    "onboarding.success.step2": "Set up advanced rules in Delegation & Policy",
    "onboarding.success.step3": "Bind Telegram for notifications",
    "onboarding.success.enter": "Enter Dashboard",

    // Delegation & Policy
    "delegation.title": "Delegation & Policy Management",
    "delegation.subtitle":
      "Manage Agent permissions and transfer limits",
    "delegation.wallets": "Your Wallets",
    "delegation.info": "Delegation Info",
    "delegation.agent": "Agent",
    "delegation.agentId": "Agent ID",
    "delegation.status": "Status",
    "delegation.active": "Active",
    "delegation.permissions": "Permissions",
    "delegation.transferPermission": "Transfer & Contract Call",
    "delegation.freeze": "Freeze Delegation",
    "delegation.revoke": "Revoke Delegation",
    "delegation.noAgent": "No Agent bound to this wallet",
    "delegation.freezeConfirm": "Delegation frozen temporarily",
    "delegation.revokeWarning":
      "Are you sure? This will permanently revoke Agent access.",
    "delegation.revokeSuccess":
      "Delegation revoked successfully",
    "delegation.changeLog": "Change Log",
    "delegation.operator": "Operator",
    "delegation.agentBound": "Agent Bound",
    "delegation.frozen": "Frozen",
    "delegation.unfreeze": "Unfreeze Delegation",
    "delegation.createdAt": "Created At",
    "delegation.noAuditLog": "No audit log",
    "delegation.pauseAction": "Pause Delegation",
    "delegation.resumeAction": "Resume Delegation",
    "delegation.revokeAction": "Revoke Delegation",
    "delegation.frozenBanner": "Agent delegation is paused — Agent cannot execute any transactions",
    "delegation.revokeConfirmTitle": "Confirm Revoke Delegation",
    "delegation.revokeConfirmDesc": "This will permanently remove the Agent's access to this wallet. This action cannot be undone.",
    "delegation.revokeConfirmBtn": "Confirm Revoke",
    "delegation.paused": "Paused",

    // Policy
    "policy.title": "Policy Rules",
    "policy.singleTxLimit": "Single Transaction Limit",
    "policy.dailyLimit": "Daily Cumulative Limit",
    "policy.approvalRequired": "Require Approval",
    "policy.approvalDesc":
      "Transactions exceeding limit require manual approval",
    "policy.updatePolicy": "Update Policy",
    "policy.updateSuccess":
      "Policy updated successfully. Changes will take effect on next operation.",
    "policy.advancedTip":
      "Need address whitelist or token restrictions? Configure advanced rules via AI Assistant.",
    "policy.noAgentDesc": "Bind an Agent to configure policies",
    "policy.limitUpdated": "Limit Updated",
    "policy.policyCreated": "Policy Created",
    "policy.noPolicyConfigured": "No policy configured",
    "policy.currentConfig": "Current Configuration",
    "policy.perTxLimit": "Per-Tx Limit",
    "policy.dailyLimitLabel": "Daily Limit",
    "policy.approvalLabel": "Over-Limit Approval",
    "policy.approvalOn": "Enabled",
    "policy.approvalOff": "Disabled",
    "policy.advancedTitle": "Need more risk controls?",
    "policy.advancedDesc": "Beyond basic limits, you can configure advanced rules through conversation with the AI assistant:",
    "policy.advancedItem1": "Address whitelist / blacklist",
    "policy.advancedItem2": "Token type restrictions",
    "policy.advancedItem3": "Time window restrictions",
    "policy.advancedItem4": "Gas fee cap",
    "policy.advancedItem5": "Contract interaction whitelist",
    "policy.goToChat": "Configure via AI Assistant",

    // Wallet & Agent
    "walletAgent.title": "Wallet & Agent",
    "walletAgent.subtitle": "Manage what your Agent can do with your wallet",
    "walletAgent.yourWallet": "Your Wallet",
    "walletAgent.connectedAgent": "Connected Agent",
    "walletAgent.connectedSince": "Connected since",
    "walletAgent.ready": "Ready",
    "walletAgent.settingUp": "Setting Up",
    "walletAgent.paused": "Paused",
    "walletAgent.permExecute": "Can execute transactions",
    "walletAgent.permManage": "Can manage wallet settings",
    "walletAgent.permRules": "Can update spending rules",
    "walletAgent.spendingRules": "Spending Rules",
    "walletAgent.currentLimits": "Current limits",
    "walletAgent.perTx": "per transaction",
    "walletAgent.perDay": "per day",
    "walletAgent.limitsTip": "These limits were set during wallet setup. You can adjust them anytime.",
    "walletAgent.emergency": "Emergency Actions",
    "walletAgent.freezeDesc": "Temporarily pause your Agent's access. No transactions will go through until you unfreeze.",
    "walletAgent.revokeDesc": "Permanently remove this Agent's access. This cannot be undone.",
    "walletAgent.activityLog": "Activity Log",
    "walletAgent.noActivity": "No changes recorded yet. Actions like freezing, policy updates, and revocations will be logged here.",

    // Gas Account
    "gasAccount.title": "Gas Account",
    "gasAccount.subtitle": "Keep your Agent fueled for on-chain transactions",
    "gasAccount.comingSoonBadge": "Coming Soon",
    "gasAccount.comingSoonTitle": "Gas Account is under development",
    "gasAccount.comingSoonDesc": "We're building a unified gas management solution so your Agents can execute on-chain transactions seamlessly. Stay tuned!",

    // Step-up Auth
    "stepUp.title": "Identity Verification Required",
    "stepUp.revokeTitle": "Revoke Requires Verification",
    "stepUp.policyTitle": "Policy Update Requires Verification",
    "stepUp.desc": "This action requires re-authentication to proceed.",
    "stepUp.verify": "Re-verify",
    "stepUp.verifying": "Verifying...",

    // Common
    "common.cancel": "Cancel",

    // Account Settings
    "account.title": "Account Settings",
    "account.subtitle":
      "Manage your personal information and security settings",
    "account.basicInfo": "Basic Information",
    "account.name": "Name",
    "account.email": "Email",
    "account.registeredAt": "Registered",
    "account.lastLogin": "Last Login",
    "account.security": "Security Settings",
    "account.connected": "Connected",
    "account.notConnected": "Not Connected",
    "account.bind": "Bind",
    "account.unbind": "Unbind",
    "account.securityTip":
      "Binding multiple OAuth providers improves account security. At least one provider must remain bound.",
    "account.error.mustKeepOne":
      "You must keep at least one OAuth provider bound",
    "account.logout": "Sign Out",
    "account.logoutDesc": "Sign out from this device",

    // Gasless
    "gasless.title": "Gasless (Fee Station)",
    "gasless.subtitle":
      "Manage your Fuel balance and transaction fees",
    "gasless.fuelBalance": "Fuel Balance",
    "gasless.usdValue": "USD Value",
    "gasless.sufficientBalance": "Balance is sufficient",
    "gasless.healthy": "Healthy",
    "gasless.alertSettings": "Alert Settings",
    "gasless.alertDesc": "Get notified when balance is low",
    "gasless.alertThreshold": "Alert Threshold (Fuel)",
    "gasless.saveSettings": "Save Settings",
    "gasless.depositAddress": "Deposit Address",
    "gasless.depositDesc":
      "Send tokens to this address to top up your Fuel balance",
    "gasless.copyAddress": "Copy Address",
    "gasless.copied": "Copied!",
    "gasless.supportedChains": "Supported Chains:",
    "gasless.transactionHistory": "Transaction History",
    "gasless.time": "Time",
    "gasless.chain": "Chain",
    "gasless.txHash": "Transaction Hash",
    "gasless.fuelUsed": "Fuel Used",
    "gasless.operationType": "Operation Type",
    "gasless.previous": "Previous",
    "gasless.next": "Next",
    "gasless.deposit": "Deposit Fuel",
    "gasless.selectChain": "Select Chain",
    "gasless.notifyPage": "Page Notification",
    "gasless.notifyEmail": "Email Notification",

    // Billing
    "billing.title": "Billing & Payments",
    "billing.subtitle":
      "View your billing information and payment history",
    "billing.comingSoon": "Coming Soon",
    "billing.comingSoonDesc":
      "Billing and payment features are under development and will be available soon.",
    "billing.expectedFeatures": "Expected Features",
    "billing.feature1":
      "Monthly billing statements and usage reports",
    "billing.feature2":
      "Multiple payment methods (card, crypto)",
    "billing.feature3":
      "Automatic billing and subscription management",
    "billing.feature4":
      "Detailed fee breakdown and pricing tiers",

    // Onboarding Steps
    "steps.create": "Create Wallet",
    "steps.connect": "Connect Agent",
    "steps.configure": "Set Rules",

    // Wallet Card
    "walletCard.noAgent": "No Agent delegated",
    "walletCard.manage": "Manage",

    // Permissions Panel
    "permissions.title": "Permissions",
    "permissions.desc": "Define operation types your Agent can perform",
    "permissions.transfer": "Transfer",
    "permissions.contractCall": "Contract Call",
    "permissions.walletManagement": "Wallet Management",
    "permissions.transferDesc": "Send and receive tokens",
    "permissions.contractCallDesc": "Interact with smart contracts",
    "permissions.walletManagementDesc": "Manage wallet settings and configuration",
    "permissions.save": "Save Permissions",
    "permissions.needAgent": "Delegate an Agent first",
    "policy.emptyStateDesc": "Delegate an Agent to configure risk control rules",

    // Policy Panel
    "policyPanel.title": "Risk Control Rules",
    "policyPanel.desc": "Set spending limits and approval thresholds",

    // Wallet Detail
    "walletDetail.back": "Back to wallets",
    "walletDetail.delegateAgent": "Delegate Agent",
    "walletDetail.addresses": "Addresses",
    "walletDetail.noAddresses": "No addresses yet",
    "walletDetail.copyAddress": "Copy address",

    // Wallet Agent Page
    "walletPage.title": "Wallets",
    "walletPage.subtitle": "Manage your wallets and connected Agents",
    "walletPage.createWallet": "Create Wallet",
    "walletPage.createNew": "Create New Wallet",
    // Welcome (empty state)
    "welcome.greeting": "Welcome to Agent Wallet",
    "welcome.subtitle": "Set up your first wallet in minutes — delegate to an AI Agent, define permissions, and let it operate on-chain within the rules you set.",
    "welcome.cta": "Create Your First Wallet",
    "welcome.feat1.title": "Smart Delegation",
    "welcome.feat1.desc": "Authorize an AI Agent to manage your wallet with fine-grained permission controls.",
    "welcome.feat2.title": "Risk Controls",
    "welcome.feat2.desc": "Set per-transaction and daily spending limits. Require approval for high-value operations.",
    "welcome.feat3.title": "Full Visibility",
    "welcome.feat3.desc": "Monitor every action your Agent takes. Freeze or revoke access instantly at any time.",

    // Activity Log
    "log.walletCreated": "Wallet Created",
    "log.agentDelegated": "Agent Delegated",
    "log.permissionUpdated": "Permission Updated",
    "log.policyUpdated": "Policy Updated",
    "log.delegationFrozen": "Delegation Frozen",
    "log.delegationResumed": "Delegation Resumed",
    "log.delegationRevoked": "Delegation Revoked",
    "log.walletRenamed": "Wallet Renamed",
    "log.transferExecuted": "Transfer Executed",
    "log.contractCalled": "Contract Called",
    "log.swapExecuted": "Swap Executed",
    "log.stakeExecuted": "Stake Executed",
    "log.transferRejected": "Transfer Rejected",
    "log.approvalRequested": "Approval Requested",
    "log.approvalGranted": "Approval Granted",
    "log.approvalDenied": "Approval Denied",
    "log.actor.user": "User",
    "log.actor.agent": "Agent",
    "log.actor.system": "System",
    "log.status.success": "Success",
    "log.status.failed": "Failed",
    "log.status.pending": "Pending",
    "log.detail.walletCreated": "Wallet initialized with default settings",
    "log.detail.agentDelegated": "Agent bound with transfer, contract call, swap permissions",
    "log.detail.permissionEnabled": "Enabled permission: Stake",
    "log.detail.permissionDisabled": "Disabled permission: Swap",
    "log.detail.policyLimitUpdated": "Per-tx limit changed from $10 to $25",
    "log.detail.dailyLimitUpdated": "Daily limit changed from $50 to $100",
    "log.detail.approvalToggled": "Over-limit approval set to required",
    "log.detail.delegationFrozen": "Agent delegation paused — all operations suspended",
    "log.detail.delegationResumed": "Agent delegation resumed — operations re-enabled",
    "log.detail.delegationRevoked": "Agent access permanently revoked",
    "log.detail.walletRenamed": "Wallet renamed from \"Wallet #1\" to \"Main Wallet\"",
    "log.detail.transferExecuted": "Sent 0.5 ETH to 0x742d…35Cc",
    "log.detail.contractCalled": "Called approve() on USDC contract 0x1234…5678",
    "log.detail.swapExecuted": "Swapped 100 USDC → 0.035 ETH via Uniswap",
    "log.detail.stakeExecuted": "Staked 1.2 ETH in Lido",
    "log.detail.transferRejected": "Transfer of $150 rejected — exceeds per-tx limit of $25",
    "log.detail.approvalRequested": "Agent requests approval: send 2 ETH to 0xAbCd…eF01",
    "log.detail.approvalGranted": "Approved: send 2 ETH to 0xAbCd…eF01",
    "log.detail.approvalDenied": "Denied: send 2 ETH to 0xAbCd…eF01 — amount too high",

    // Agent Pairing
    "agentPairing.title": "Pair New Agent",
    "agentPairing.subtitle": "Send the pairing instructions to your AI Agent to establish a connection",
    "agentPairing.promptLabel": "Pairing Instructions",
    "agentPairing.copyToken": "Copy Token",
    "agentPairing.copyPrompt": "Copy Full Instructions",
    "agentPairing.copied": "Copied!",
    "agentPairing.expiresIn": "Expires in",
    "agentPairing.regenerate": "Regenerate",
    "agentPairing.waiting": "Waiting for Agent to connect...",
    "agentPairing.connected": "Agent connected!",
    "agentPairing.success": "Agent Paired Successfully",
    "agentPairing.successDesc": "Your Agent is now paired and can be delegated to manage wallets.",
    "agentPairing.agentId": "Agent ID",
    "agentPairing.done": "Done",

    // Wallet Delegation
    "walletDelegation.title": "Delegate Wallet to Agent",
    "walletDelegation.subtitle": "Choose an Agent to manage this wallet",
    "walletDelegation.selectAgent": "Select Paired Agent",
    "walletDelegation.noAgents": "No paired Agents yet",
    "walletDelegation.noAgentsDesc": "Pair an Agent first, then you can delegate wallets to it.",
    "walletDelegation.pairNew": "Pair New Agent",
    "walletDelegation.pairNewDesc": "Pair a new Agent and delegate this wallet in one step",
    "walletDelegation.configurePermissions": "Configure Permissions",
    "walletDelegation.configurePolicy": "Configure Risk Controls",
    "walletDelegation.confirm": "Confirm Delegation",
    "walletDelegation.delegating": "Delegating...",
    "walletDelegation.success": "Wallet Delegated Successfully",
    "walletDelegation.successDesc": "The Agent can now operate this wallet within the configured permissions.",
    "walletDelegation.alreadyDelegated": "Already delegated to this Agent",

    // Claim Wallet
    "claimWallet.title": "Claim Existing Wallet",
    "claimWallet.subtitle": "Claim a wallet that was created by an Agent",
    "claimWallet.tip": "Copy the instructions below and send them to the AI Agent to complete the wallet claim.",
    "claimWallet.copyPrompt": "Copy Instructions",
    "claimWallet.verifying": "Verifying claim request...",
    "claimWallet.transferring": "Transferring ownership...",
    "claimWallet.success": "Wallet Claimed Successfully",
    "claimWallet.successDesc": "The wallet has been transferred to your account.",
    "claimWallet.walletId": "Wallet ID",
    "claimWallet.agentId": "Agent ID",
    "claimWallet.done": "Done",
    "claimWallet.confirmTitle": "Confirm Wallet Claim",
    "claimWallet.confirmDesc": "Please verify the details below before claiming",
    "claimWallet.agentInfo": "Agent Info",
    "claimWallet.agentName": "Agent Name",
    "claimWallet.walletInfo": "Wallet Info",
    "claimWallet.walletName": "Wallet Name",
    "claimWallet.userInfo": "Claim Identity",
    "claimWallet.claimedBy": "Claimed By",
    "claimWallet.claimedAt": "Claimed At",
    "claimWallet.confirmBtn": "Claim Wallet",

    // Delegation Card
    "delegationCard.delegatedAt": "Delegated",
    "delegationCard.permissions": "permissions",
    "delegationCard.frozen": "Frozen",
    "delegationCard.signer": "Signer",
    "delegationCard.expand": "Manage",
    "delegationCard.collapse": "Close",

    // Wallet Page new entries
    "walletPage.pairAgent": "Pair Agent",
    "walletPage.claimWallet": "Claim Wallet",
    "walletPage.agents": "agents",
    "walletPage.noAgents": "No agents",

    // Welcome page new entries
    "welcome.claimWallet": "Have a wallet created by an Agent?",
    "welcome.claimAction": "Claim Wallet",

    // Onboarding claim entry
    "onboarding.claimEntry": "Already have a wallet? Claim it",

    // Common
    "common.copyright":
      "© 2026 Agent Wallet. All rights reserved.",
  },
  zh: {
    // Auth
    "auth.welcome": "欢迎来到 Agent Wallet",
    "auth.subtitle": "安全、智能的钱包管理平台",
    "auth.login": "登录",
    "auth.selectProvider": "选择您的首选登录方式",
    "auth.continueWithGoogle": "使用 Google 登录",
    "auth.continueWithApple": "使用 Apple 登录",
    "auth.continueWithGithub": "使用 Github 登录",
    "auth.privacyNotice":
      "继续操作即表示您同意我们的服务条款和隐私政策",
    "auth.register": "注册",
    "auth.logout": "退出登录",
    "auth.email": "邮箱地址",
    "auth.password": "密码",
    "auth.confirmPassword": "确认密码",
    "auth.name": "用户名",
    "auth.rememberMe": "记住我",
    "auth.forgotPassword": "忘记密码？",
    "auth.noAccount": "还没有账户？",
    "auth.hasAccount": "已有账户？",
    "auth.signUpNow": "立即注册",
    "auth.signInNow": "立即登录",
    "auth.orContinueWith": "或使用以下方式继续",
    "auth.resetPassword": "重置密码",
    "auth.sendResetLink": "发送重置链接",
    "auth.backToLogin": "返回登录",
    "auth.emailSent": "邮件已发送",
    "auth.resetEmailSent": "我们已向以下邮箱发送了密码重置链接",
    "auth.checkEmail": "请查收邮件并按照说明操作。",
    "auth.createAccount": "创建您的账户",
    "auth.resetPasswordTitle": "重置您的密码",
    "auth.resetPasswordSubtitle": "输入您的邮箱地址来重置密码",
    "auth.error.invalidCredentials": "邮箱或密码错误",
    "auth.error.emailExists": "该邮箱已被注册",
    "auth.error.passwordMismatch": "两次输入的密码不一致",
    "auth.error.passwordLength": "密码长度至少为8位",
    "auth.useMagicLink": "使用魔法链接",
    "auth.enterEmail": "输入您的邮箱地址",
    "auth.sendMagicLink": "发送登录链接",
    "auth.sent": "链接已发送",
    "auth.loginWithMagicLink": "模拟点击链接",

    // Navigation
    "nav.overview": "概览",
    "nav.chat": "聊天",
    "nav.delegation": "委托与策略",
    "nav.aiAssistant": "AI 助手",
    "nav.gasless": "无 Gas",
    "nav.billing": "账单",
    "nav.walletAgent": "钱包 & Agent",
    "nav.gasAccount": "Gas 账户",
    "nav.comingSoon": "即将上线",
    "nav.setupWallet": "创建钱包",
    "nav.settings": "设置",
    "nav.language": "语言",

    // Overview — 已配对用户
    "overview.welcome": "欢迎回来",
    "overview.subtitle": "管理你的 Agent 钱包并监控活动",
    "overview.walletCard": "钱包",
    "overview.agentCard": "Agent 状态",
    "overview.gasCard": "Gas 余额",
    "overview.recentTx": "近期交易",
    "overview.noTx": "暂无交易记录。Agent 的操作将显示在这里。",
    "overview.viewAll": "查看全部",
    "overview.quickActions": "快捷操作",
    "overview.depositGas": "充值 Gas",
    "overview.adjustRules": "调整规则",
    "overview.chatAI": "与 AI 对话",
    // Overview — 新用户
    "overview.welcomeTitle": "欢迎使用 Agent Wallet",
    "overview.introText": "Agent Wallet 让你给 AI Agent 授予对加密钱包的受控访问权限。你设定规则 —— 消费限额、允许的操作 —— Agent 在规则范围内运行。",
    "overview.setupFirst": "创建你的第一个钱包",
    "overview.learnMore": "了解工作原理 →",
    "overview.howItWorks": "工作原理",
    "overview.step1": "创建钱包",
    "overview.step1Desc": "生成配对码并创建安全钱包",
    "overview.step2": "连接 Agent",
    "overview.step2Desc": "将配对码分享给你的 AI Agent",
    "overview.step3": "设置消费规则",
    "overview.step3Desc": "定义交易限额和操作权限",

    // Installation
    "install.forAgentOwners": "FOR AGENT OWNERS",
    "install.title": "Agent 安装指南",
    "install.subtitle":
      "按照以下步骤为您的 Agent 安装和配置钱包",
    "install.step1.title": "下载 Agentic Wallet SDK",
    "install.step1.description":
      "使用 npm 或 yarn 安装 Agentic Wallet SDK",
    "install.step2.title": "初始化 SDK",
    "install.step2.description":
      "在您的 Agent 代码中导入并初始化 SDK",
    "install.step3.title": "配置 API Key",
    "install.step3.description":
      "从仪表板获取您的 API Key 并配置环境变量",
    "install.additionalResources": "其他资源",
    "install.apiDocs": "→ 完整 API 文档",
    "install.examples": "→ 示例代码库",
    "install.faq": "→ 常见问题解答",
    "install.community": "→ 社区支持论坛",
    "install.needHelp": "需要帮助？",
    "install.supportText": "我们的技术团队随时为您提供支持",
    "install.contactSupport": "联系技术支持",
    "install.copyCode": "复制代码",

    // Risk Control
    "risk.title": "风控管理",
    "risk.subtitle": "监控和管理您的 Agent 钱包安全设置",
    "risk.currentLevel": "当前风险等级",
    "risk.refreshStatus": "刷新状态",
    "risk.low": "低风险",
    "risk.lowDesc": "系统运行正常，无异常活动检测",
    "risk.medium": "中等风险",
    "risk.mediumDesc": "检测到一些需要关注的活动",
    "risk.high": "高风险",
    "risk.highDesc": "检测到可疑活动，建议立即审查",
    "risk.autoBlock": "自动拦截",
    "risk.autoBlockDesc": "自动阻止可疑交易和活动",
    "risk.twoFactor": "双因素认证",
    "risk.twoFactorDesc": "为敏感操作添加额外安全层",
    "risk.transactionLimit": "交易限额",
    "risk.transactionLimitDesc": "设置每日交易金额上限",
    "risk.ipWhitelist": "IP 白名单",
    "risk.ipWhitelistDesc": "仅允许特定 IP 地址访问",
    "risk.enabled": "已启用",
    "risk.disabled": "已禁用",
    "risk.quickActions": "快速操作",
    "risk.forceReview": "强制审核所有交易",
    "risk.emergencyFreeze": "紧急冻结所有活动",
    "risk.generateReport": "生成安全报告",

    // AI Assistant
    "ai.title": "AI 助手",
    "ai.subtitle": "与官方 AI 助手对话，获取实时帮助和建议",
    "ai.quickQuestions": "快速提问：",
    "ai.placeholder": "输入您的问题...",
    "ai.greeting":
      "您好！我是 Agent Wallet 的 AI 助手。我可以帮助您解答关于钱包管理、Agent 配置、安全设置等问题。请问有什么可以帮到您的吗？",
    "ai.q1": "如何安装 Agent？",
    "ai.q2": "如何提高安全性？",
    "ai.q3": "查看 API 文档",
    "ai.q4": "交易限额设置",
    "ai.history": "历史记录",
    "ai.chatTab": "AI 对话",
    "ai.newChat": "新建对话",
    "ai.noHistory": "暂无历史记录",
    "ai.noMessages": "暂无消息",
    "ai.startChat": "开始对话吧",
    "ai.approvalRequest": "审批请求",
    "ai.operation": "操作",
    "ai.amount": "金额",
    "ai.target": "目标地址",
    "ai.reason": "原因",
    "ai.approve": "批准",
    "ai.reject": "拒绝",
    "ai.approved": "已批准",
    "ai.rejected": "已拒绝",
    "ai.uploadFile": "上传文件",
    "ai.inputPlaceholder": "输入消息...",
    "ai.send": "发送",

    // Onboarding
    "onboarding.title": "创建 Agent Wallet",
    "onboarding.subtitle": "将以下指令发送给你的 AI Agent，它将自动为你创建并配置钱包",
    "onboarding.skip": "暂时跳过",
    // Prompt card
    "onboarding.promptLabel": "配对指令",
    "onboarding.expiresIn": "有效期",
    "onboarding.copyPrompt": "复制全部指令",
    "onboarding.copyPromptDone": "已复制！",
    "onboarding.copyTokenOnly": "复制 Token",
    "onboarding.copyTokenDone": "已复制！",
    "onboarding.regenerate": "重新生成指令",
    // Spending limits
    "onboarding.limits.title": "安全支出限额",
    "onboarding.limits.desc": "为你的 Agent 设置支出限额，之后可随时调整。",
    "onboarding.limits.perTx": "单笔交易限额",
    "onboarding.limits.daily": "每日支出限额",
    "onboarding.limits.others": "其他",
    "onboarding.limits.warning": "限额变更将重新生成配对指令",
    "onboarding.limits.confirm": "确认限额",
    "onboarding.limits.regenerating": "重新生成中...",
    // Steps
    "onboarding.stepsTitle": "操作步骤",
    "onboarding.step1": "点击「复制指令」按钮",
    "onboarding.step2": "将指令粘贴到你的 AI Agent 对话中",
    "onboarding.step3": "Agent 会自动安装工具并完成配对，此页面将自动更新",
    // Doc link
    "onboarding.docLink": "查看完整文档",
    // Waiting phases
    "onboarding.simulate": "模拟配对（演示）",
    "onboarding.cancel": "取消",
    "onboarding.waiting.waiting": "等待 Agent 创建钱包...",
    "onboarding.waiting.connected": "Agent 已连接，正在创建钱包...",
    "onboarding.waiting.configuring": "正在配置风控策略...",
    // Success
    "onboarding.success.title": "Agent Wallet 创建成功",
    "onboarding.success.desc": "你的 Agent 钱包已初始化完成，可以开始使用",
    "onboarding.success.wallet": "钱包地址",
    "onboarding.success.walletId": "Wallet ID",
    "onboarding.success.agentId": "Agent ID",
    "onboarding.success.linked": "已关联",
    "onboarding.success.limitsApplied": "已应用的限额配置",
    "onboarding.success.nextSteps": "接下来",
    "onboarding.success.step1": "在 Dashboard 查看你的钱包",
    "onboarding.success.step2": "在委托与策略中设置高级规则",
    "onboarding.success.step3": "绑定 Telegram 接收通知",
    "onboarding.success.enter": "进入 Dashboard",

    // Delegation & Policy
    "delegation.title": "委托与策略管理",
    "delegation.subtitle": "管理 Agent 权限和转账限额",
    "delegation.wallets": "您的钱包",
    "delegation.info": "委托信息",
    "delegation.agent": "Agent",
    "delegation.agentId": "Agent ID",
    "delegation.status": "状态",
    "delegation.active": "活跃",
    "delegation.permissions": "权限",
    "delegation.transferPermission": "转账 & 合约调用",
    "delegation.freeze": "冻结委托",
    "delegation.revoke": "撤销委托",
    "delegation.noAgent": "此钱包未绑定 Agent",
    "delegation.freezeConfirm": "委托暂时冻结",
    "delegation.revokeWarning":
      "确定吗？这将永久撤销 Agent 访问权限。",
    "delegation.revokeSuccess": "委托成功撤销",
    "delegation.changeLog": "变更日志",
    "delegation.operator": "操作员",
    "delegation.agentBound": "Agent 已绑定",
    "delegation.frozen": "已冻结",
    "delegation.unfreeze": "解冻委托",
    "delegation.createdAt": "创建时间",
    "delegation.noAuditLog": "暂无审计日志",
    "delegation.pauseAction": "暂停委托",
    "delegation.resumeAction": "恢复委托",
    "delegation.revokeAction": "撤销委托",
    "delegation.frozenBanner": "Agent 委托已暂停 — Agent 当前无法执行任何交易操作",
    "delegation.revokeConfirmTitle": "确认撤销委托",
    "delegation.revokeConfirmDesc": "这将永久移除该 Agent 对此钱包的访问权限。此操作不可撤销。",
    "delegation.revokeConfirmBtn": "确认撤销",
    "delegation.paused": "已暂停",

    // Policy
    "policy.title": "策略规则",
    "policy.singleTxLimit": "单笔交易限额",
    "policy.dailyLimit": "每日累计限额",
    "policy.approvalRequired": "需要审批",
    "policy.approvalDesc": "超过限额的交易需要手动审批",
    "policy.updatePolicy": "更新策略",
    "policy.updateSuccess":
      "策略更新成功。更改将在下一次操作时生效。",
    "policy.advancedTip":
      "需要地址白名单或代币限制？通过 AI 助手配置高级规则。",
    "policy.noAgentDesc": "绑定 Agent 以配置策略",
    "policy.limitUpdated": "限额已更新",
    "policy.policyCreated": "策略已创建",
    "policy.noPolicyConfigured": "尚未配置策略",
    "policy.currentConfig": "当前配置",
    "policy.perTxLimit": "单笔限额",
    "policy.dailyLimitLabel": "每日限额",
    "policy.approvalLabel": "超限审批",
    "policy.approvalOn": "已开启",
    "policy.approvalOff": "已关闭",
    "policy.advancedTitle": "需要更多风控配置？",
    "policy.advancedDesc": "除了基础限额，你还可以通过与 AI 助手对话配置更多高级规则：",
    "policy.advancedItem1": "地址白名单 / 黑名单",
    "policy.advancedItem2": "代币类型限制",
    "policy.advancedItem3": "时间窗口限制",
    "policy.advancedItem4": "Gas 费上限",
    "policy.advancedItem5": "合约交互白名单",
    "policy.goToChat": "前往 AI 助手配置",

    // 钱包 & Agent
    "walletAgent.title": "钱包 & Agent",
    "walletAgent.subtitle": "管理 Agent 可以用你的钱包做什么",
    "walletAgent.yourWallet": "你的钱包",
    "walletAgent.connectedAgent": "已关联的 Agent",
    "walletAgent.connectedSince": "连接时间",
    "walletAgent.ready": "就绪",
    "walletAgent.settingUp": "设置中",
    "walletAgent.paused": "已暂停",
    "walletAgent.permExecute": "可以执行交易",
    "walletAgent.permManage": "可以管理钱包设置",
    "walletAgent.permRules": "可以更新消费规则",
    "walletAgent.spendingRules": "消费规则",
    "walletAgent.currentLimits": "当前限额",
    "walletAgent.perTx": "每笔交易",
    "walletAgent.perDay": "每日",
    "walletAgent.limitsTip": "这些限额在钱包创建时设定，你可以随时调整。",
    "walletAgent.emergency": "紧急操作",
    "walletAgent.freezeDesc": "临时暂停 Agent 的访问权限。在解冻之前不会执行任何交易。",
    "walletAgent.revokeDesc": "永久移除此 Agent 的访问权限。此操作不可撤销。",
    "walletAgent.activityLog": "操作日志",
    "walletAgent.noActivity": "暂无操作记录。冻结、策略更新和撤销等操作将记录在这里。",

    // Gas 账户
    "gasAccount.title": "Gas 账户",
    "gasAccount.subtitle": "为 Agent 的链上交易保持充足的 Gas",
    "gasAccount.comingSoonBadge": "即将上线",
    "gasAccount.comingSoonTitle": "Gas 账户功能开发中",
    "gasAccount.comingSoonDesc": "我们正在打造统一的 Gas 管理方案，让你的 Agent 无缝执行链上交易。敬请期待！",

    // Step-up Auth
    "stepUp.title": "需要身份验证",
    "stepUp.revokeTitle": "撤销委托需要重新验证",
    "stepUp.policyTitle": "更新策略需要重新验证",
    "stepUp.desc": "此操作需要重新验证身份才能继续。",
    "stepUp.verify": "重新验证",
    "stepUp.verifying": "验证中...",

    // Common
    "common.cancel": "取消",

    // Account Settings
    "account.title": "账户设置",
    "account.subtitle": "管理您的个人信息和安全设置",
    "account.basicInfo": "基本信息",
    "account.name": "姓名",
    "account.email": "邮箱",
    "account.registeredAt": "注册时间",
    "account.lastLogin": "上次登录",
    "account.security": "安全设置",
    "account.connected": "已连接",
    "account.notConnected": "未连接",
    "account.bind": "绑定",
    "account.unbind": "解绑",
    "account.securityTip":
      "绑定多个 OAuth 提供商可以提高账户安全性。必须保留至少一个提供商绑定。",
    "account.error.mustKeepOne":
      "您必须保留至少一个 OAuth 提供商绑定",
    "account.logout": "退出登录",
    "account.logoutDesc": "从该设备退出登录",

    // Gasless
    "gasless.title": "无手续费（费用站）",
    "gasless.subtitle": "管理您的燃料余额和交易费用",
    "gasless.fuelBalance": "燃料余额",
    "gasless.usdValue": "USD 价值",
    "gasless.sufficientBalance": "余额充足",
    "gasless.healthy": "健康",
    "gasless.alertSettings": "警报设置",
    "gasless.alertDesc": "当余额较低时收到通知",
    "gasless.alertThreshold": "警报阈值（燃料）",
    "gasless.saveSettings": "保存设置",
    "gasless.depositAddress": "存款地址",
    "gasless.depositDesc":
      "将代币发送到此地址以增加您的燃料余额",
    "gasless.copyAddress": "复制地址",
    "gasless.copied": "已复制！",
    "gasless.supportedChains": "支持的链：",
    "gasless.transactionHistory": "交易历史",
    "gasless.time": "时间",
    "gasless.chain": "链",
    "gasless.txHash": "交易哈希",
    "gasless.fuelUsed": "使用的燃料",
    "gasless.operationType": "操作类型",
    "gasless.previous": "上一页",
    "gasless.next": "下一页",
    "gasless.deposit": "存款燃料",
    "gasless.selectChain": "选择链",
    "gasless.notifyPage": "页面通知",
    "gasless.notifyEmail": "电子邮件通知",

    // Billing
    "billing.title": "计费与支付",
    "billing.subtitle": "查看您的计费信息和支付历史",
    "billing.comingSoon": "即将推出",
    "billing.comingSoonDesc":
      "计费和支付功能正在开发中，即将推出。",
    "billing.expectedFeatures": "预期功能",
    "billing.feature1": "每月计费单和使用报告",
    "billing.feature2": "多种支付方式（信用卡、加密货币）",
    "billing.feature3": "自动计费和订阅管理",
    "billing.feature4": "详细的费用细分和定价层级",

    // Onboarding Steps
    "steps.create": "创建钱包",
    "steps.connect": "连接 Agent",
    "steps.configure": "设置规则",

    // Wallet Card
    "walletCard.noAgent": "未委托 Agent",
    "walletCard.manage": "管理",

    // Permissions Panel
    "permissions.title": "权限",
    "permissions.desc": "定义 Agent 可以执行的操作类型",
    "permissions.transfer": "转账",
    "permissions.contractCall": "合约调用",
    "permissions.walletManagement": "钱包管理",
    "permissions.transferDesc": "发送和接收代币",
    "permissions.contractCallDesc": "与智能合约交互",
    "permissions.walletManagementDesc": "管理钱包设置和配置",
    "permissions.save": "保存权限",
    "permissions.needAgent": "需要先委托 Agent",
    "policy.emptyStateDesc": "委托 Agent 后即可配置风控规则",

    // Policy Panel
    "policyPanel.title": "风控规则",
    "policyPanel.desc": "设定消费限额和审批门槛",

    // Wallet Detail
    "walletDetail.back": "返回钱包列表",
    "walletDetail.delegateAgent": "委托 Agent",
    "walletDetail.addresses": "地址",
    "walletDetail.noAddresses": "暂无地址",
    "walletDetail.copyAddress": "复制地址",

    // Wallet Agent Page
    "walletPage.title": "钱包",
    "walletPage.subtitle": "管理你的钱包和已连接的 Agent",
    "walletPage.createWallet": "创建钱包",
    "walletPage.createNew": "创建新钱包",
    // Welcome (empty state)
    "welcome.greeting": "欢迎使用 Agent Wallet",
    "welcome.subtitle": "只需几分钟即可创建你的第一个钱包 — 委托给 AI Agent，定义权限与规则，让它在你设定的范围内自主完成链上操作。",
    "welcome.cta": "创建你的第一个钱包",
    "welcome.feat1.title": "智能委托",
    "welcome.feat1.desc": "授权 AI Agent 管理你的钱包，支持细粒度的权限控制。",
    "welcome.feat2.title": "风控规则",
    "welcome.feat2.desc": "设定单笔和每日消费限额，高额操作可要求人工审批。",
    "welcome.feat3.title": "全程可见",
    "welcome.feat3.desc": "监控 Agent 的每一步操作，随时冻结或撤销访问权限。",

    // Activity Log
    "log.walletCreated": "钱包创建",
    "log.agentDelegated": "Agent 绑定",
    "log.permissionUpdated": "权限变更",
    "log.policyUpdated": "策略更新",
    "log.delegationFrozen": "委托冻结",
    "log.delegationResumed": "委托恢复",
    "log.delegationRevoked": "委托撤销",
    "log.walletRenamed": "钱包重命名",
    "log.transferExecuted": "转账执行",
    "log.contractCalled": "合约调用",
    "log.swapExecuted": "兑换执行",
    "log.stakeExecuted": "质押执行",
    "log.transferRejected": "转账拒绝",
    "log.approvalRequested": "审批请求",
    "log.approvalGranted": "审批通过",
    "log.approvalDenied": "审批拒绝",
    "log.actor.user": "用户",
    "log.actor.agent": "Agent",
    "log.actor.system": "系统",
    "log.status.success": "成功",
    "log.status.failed": "失败",
    "log.status.pending": "待处理",
    "log.detail.walletCreated": "钱包已初始化，使用默认配置",
    "log.detail.agentDelegated": "Agent 已绑定，授予转账、合约调用、兑换权限",
    "log.detail.permissionEnabled": "开启权限：质押",
    "log.detail.permissionDisabled": "关闭权限：兑换",
    "log.detail.policyLimitUpdated": "单笔限额从 $10 调整为 $25",
    "log.detail.dailyLimitUpdated": "每日限额从 $50 调整为 $100",
    "log.detail.approvalToggled": "超限审批已设为必须",
    "log.detail.delegationFrozen": "Agent 委托已暂停 — 所有操作已挂起",
    "log.detail.delegationResumed": "Agent 委托已恢复 — 操作已重新启用",
    "log.detail.delegationRevoked": "Agent 访问权限已永久撤销",
    "log.detail.walletRenamed": "钱包从「Wallet #1」重命名为「Main Wallet」",
    "log.detail.transferExecuted": "发送 0.5 ETH 至 0x742d…35Cc",
    "log.detail.contractCalled": "调用 USDC 合约 0x1234…5678 的 approve()",
    "log.detail.swapExecuted": "通过 Uniswap 兑换 100 USDC → 0.035 ETH",
    "log.detail.stakeExecuted": "在 Lido 质押 1.2 ETH",
    "log.detail.transferRejected": "转账 $150 被拒绝 — 超过单笔限额 $25",
    "log.detail.approvalRequested": "Agent 请求审批：发送 2 ETH 至 0xAbCd…eF01",
    "log.detail.approvalGranted": "已批准：发送 2 ETH 至 0xAbCd…eF01",
    "log.detail.approvalDenied": "已拒绝：发送 2 ETH 至 0xAbCd…eF01 — 金额过高",

    // Agent Pairing
    "agentPairing.title": "配对新 Agent",
    "agentPairing.subtitle": "将配对指令发送给你的 AI Agent 以建立连接",
    "agentPairing.promptLabel": "配对指令",
    "agentPairing.copyToken": "复制 Token",
    "agentPairing.copyPrompt": "复制完整指令",
    "agentPairing.copied": "已复制！",
    "agentPairing.expiresIn": "有效期",
    "agentPairing.regenerate": "重新生成",
    "agentPairing.waiting": "等待 Agent 连接中...",
    "agentPairing.connected": "Agent 已连接！",
    "agentPairing.success": "Agent 配对成功",
    "agentPairing.successDesc": "你的 Agent 已配对成功，现在可以将钱包委托给它管理。",
    "agentPairing.agentId": "Agent ID",
    "agentPairing.done": "完成",

    // Wallet Delegation
    "walletDelegation.title": "委托钱包给 Agent",
    "walletDelegation.subtitle": "选择一个 Agent 来管理此钱包",
    "walletDelegation.selectAgent": "选择已配对的 Agent",
    "walletDelegation.noAgents": "暂无已配对的 Agent",
    "walletDelegation.noAgentsDesc": "请先配对一个 Agent，然后才能将钱包委托给它。",
    "walletDelegation.pairNew": "配对新 Agent",
    "walletDelegation.pairNewDesc": "配对新 Agent 并一步完成钱包委托",
    "walletDelegation.configurePermissions": "配置权限",
    "walletDelegation.configurePolicy": "配置风控规则",
    "walletDelegation.confirm": "确认委托",
    "walletDelegation.delegating": "委托中...",
    "walletDelegation.success": "钱包委托成功",
    "walletDelegation.successDesc": "Agent 现在可以在配置的权限范围内操作此钱包。",
    "walletDelegation.alreadyDelegated": "已委托给此 Agent",

    // Claim Wallet
    "claimWallet.title": "认领已有钱包",
    "claimWallet.subtitle": "认领由 Agent 创建的钱包",
    "claimWallet.tip": "复制下方指令并发送给 AI Agent，即可完成钱包认领与所有权转移。",
    "claimWallet.copyPrompt": "复制指令",
    "claimWallet.verifying": "验证认领请求...",
    "claimWallet.transferring": "转移所有权...",
    "claimWallet.success": "钱包认领成功",
    "claimWallet.successDesc": "钱包已成功转入你的账户。",
    "claimWallet.walletId": "钱包 ID",
    "claimWallet.agentId": "Agent ID",
    "claimWallet.done": "完成",
    "claimWallet.confirmTitle": "确认认领钱包",
    "claimWallet.confirmDesc": "请确认以下信息无误后完成认领",
    "claimWallet.agentInfo": "代理信息",
    "claimWallet.agentName": "Agent 名称",
    "claimWallet.walletInfo": "钱包信息",
    "claimWallet.walletName": "钱包名称",
    "claimWallet.userInfo": "认领身份",
    "claimWallet.claimedBy": "认领者",
    "claimWallet.claimedAt": "认领时间",
    "claimWallet.confirmBtn": "认领钱包",

    // Delegation Card
    "delegationCard.delegatedAt": "委托于",
    "delegationCard.permissions": "项权限",
    "delegationCard.frozen": "已暂停",
    "delegationCard.signer": "签名人",
    "delegationCard.expand": "管理",
    "delegationCard.collapse": "收起",

    // Wallet Page new entries
    "walletPage.pairAgent": "配对 Agent",
    "walletPage.claimWallet": "认领钱包",
    "walletPage.agents": "个 Agent",
    "walletPage.noAgents": "无 Agent",

    // Welcome page new entries
    "welcome.claimWallet": "已有 Agent 创建的钱包？",
    "welcome.claimAction": "认领钱包",

    // Onboarding claim entry
    "onboarding.claimEntry": "已有钱包？去认领",

    // Common
    "common.copyright": "© 2026 Agent Wallet. 保留所有权利。",
  },
};

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<Language>("zh");

  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)["en"]
      ] || key
    );
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error(
      "useLanguage must be used within a LanguageProvider",
    );
  }
  return context;
}