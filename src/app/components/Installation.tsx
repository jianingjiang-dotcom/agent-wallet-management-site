import { CheckCircle, Download, Terminal, Key, Copy } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Installation() {
  const { t } = useLanguage();
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      title: t('install.step1.title'),
      description: t('install.step1.description'),
      code: 'npm install @agent-wallet/sdk',
      icon: Download,
    },
    {
      title: t('install.step2.title'),
      description: t('install.step2.description'),
      code: `import { AgentWallet } from '@agent-wallet/sdk';

const wallet = new AgentWallet({
  apiKey: 'YOUR_API_KEY',
  environment: 'production'
});`,
      icon: Terminal,
    },
    {
      title: t('install.step3.title'),
      description: t('install.step3.description'),
      code: 'AGENT_WALLET_API_KEY=your_api_key_here',
      icon: Key,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">{t('install.title')}</h1>
        <p className="text-slate-600">{t('install.subtitle')}</p>
      </div>

      {/* Installation Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start mb-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl mr-4 shadow-sm">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
              </div>
              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm font-mono">
                  <code>{step.code}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(step.code, index)}
                  className="absolute top-3 right-3 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors"
                  title={t('install.copyCode')}
                >
                  {copiedStep === index ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Resources */}
      <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('install.additionalResources')}</h2>
        <div className="space-y-3">
          <a
            href="#"
            className="block text-amber-600 hover:text-amber-700 transition-colors font-medium"
          >
            {t('install.apiDocs')}
          </a>
          <a
            href="#"
            className="block text-amber-600 hover:text-amber-700 transition-colors font-medium"
          >
            {t('install.examples')}
          </a>
          <a
            href="#"
            className="block text-amber-600 hover:text-amber-700 transition-colors font-medium"
          >
            {t('install.faq')}
          </a>
          <a
            href="#"
            className="block text-amber-600 hover:text-amber-700 transition-colors font-medium"
          >
            {t('install.community')}
          </a>
        </div>
      </div>

      {/* Support Banner */}
      <div className="mt-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-center shadow-md">
        <h3 className="text-xl font-semibold text-white mb-2">{t('install.needHelp')}</h3>
        <p className="text-amber-50 mb-4">
          {t('install.supportText')}
        </p>
        <button className="bg-white text-amber-600 px-6 py-2.5 rounded-xl font-medium hover:bg-amber-50 transition-colors shadow-sm">
          {t('install.contactSupport')}
        </button>
      </div>
    </div>
  );
}
