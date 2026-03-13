import svgPaths from "./svg-zu39gs7vho";

function CoboAgenticWallet() {
  return (
    <div className="h-[20px] relative shrink-0 w-[188.538px]" data-name="CoboAgenticWallet">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 188.538 19.9998">
        <g id="CoboAgenticWallet">
          <path d={svgPaths.p12420d80} fill="var(--fill-0, #0A0A0A)" id="Vector" />
          <path d={svgPaths.p19bafe80} fill="var(--fill-0, #0A0A0A)" id="Vector_2" />
          <path d={svgPaths.p161a0400} fill="var(--fill-0, #0A0A0A)" id="Vector_3" />
          <path d={svgPaths.p3456db00} fill="var(--fill-0, #0A0A0A)" id="Vector_4" />
          <path d={svgPaths.p5983200} fill="var(--fill-0, #0A0A0A)" id="Vector_5" />
          <path d={svgPaths.p35ddbb80} fill="var(--fill-0, #0A0A0A)" id="Vector_6" />
          <path d={svgPaths.p192f4b80} fill="var(--fill-0, #4F5EFF)" id="Vector_7" />
          <path d={svgPaths.p2c193100} fill="var(--fill-0, #4F5EFF)" id="Vector_8" />
          <path d={svgPaths.p357a0d00} fill="var(--fill-0, #4F5EFF)" id="Vector_9" />
          <path d={svgPaths.p26dee800} fill="var(--fill-0, #4F5EFF)" id="Vector_10" />
          <path d={svgPaths.pf8ab380} fill="var(--fill-0, #4F5EFF)" id="Vector_11" />
          <path d={svgPaths.p25b8a100} fill="var(--fill-0, #4F5EFF)" id="Vector_12" />
          <path d={svgPaths.p1a427e00} fill="var(--fill-0, #4F5EFF)" id="Vector_13" />
          <path d={svgPaths.p37c6db00} fill="var(--fill-0, #0A0A0A)" id="Vector_14" />
          <path d={svgPaths.p16c2cc00} fill="var(--fill-0, #0A0A0A)" id="Vector_15" />
          <path d={svgPaths.p2ed1f700} fill="var(--fill-0, #0A0A0A)" id="Vector_16" />
          <path d={svgPaths.p123d8680} fill="var(--fill-0, #0A0A0A)" id="Vector_17" />
        </g>
      </svg>
    </div>
  );
}

function Nav() {
  return (
    <div className="bg-[#fafafa] h-[80px] relative shrink-0 w-full" data-name="Nav">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center p-[24px] relative size-full">
          <CoboAgenticWallet />
        </div>
      </div>
    </div>
  );
}

function SidebarTabIcon() {
  return (
    <div className="absolute inset-[17.71%]" data-name="Sidebar Tab Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.917 12.917">
        <g id="Sidebar Tab Icon">
          <path d={svgPaths.p1adee180} fill="var(--fill-0, white)" id="Union" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Frame">
      <SidebarTabIcon />
    </div>
  );
}

function SidebarTabIconFrame() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="Sidebar Tab Icon Frame">
      <Frame />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Margin">
      <SidebarTabIconFrame />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="leading-[1.5]">Overview</p>
      </div>
    </div>
  );
}

function Tab() {
  return (
    <div className="bg-[#4f5eff] h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Tab-2">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[10px] relative size-full">
          <Margin />
        </div>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p377dab00} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d="M10 7.5V10.8333" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d="M10 14.1667H10.0083" id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Margin">
      <Icon />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#0a0a0a] text-[16px] whitespace-nowrap">
        <p className="leading-[1.5]">Risk Control</p>
      </div>
    </div>
  );
}

function Tab1() {
  return (
    <div className="h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Tab-2">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[10px] relative size-full">
          <Margin1 />
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p383b2000} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Margin">
      <Icon1 />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#0a0a0a] text-[16px] whitespace-nowrap">
        <p className="leading-[1.5]">AI Assistant</p>
      </div>
    </div>
  );
}

function Tab2() {
  return (
    <div className="h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Tab-2">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[10px] relative size-full">
          <Margin2 />
        </div>
      </div>
    </div>
  );
}

function SidebarTabContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Sidebar Tab Container">
      <Tab />
      <Tab1 />
      <Tab2 />
    </div>
  );
}

function Nav1() {
  return (
    <div className="bg-[#fafafa] flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Nav">
      <div className="content-stretch flex flex-col items-start pb-[16px] px-[24px] relative size-full">
        <SidebarTabContainer />
      </div>
    </div>
  );
}

function User() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="User">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="User">
          <path d={svgPaths.p2026e800} id="Vector" stroke="var(--stroke-0, #4F5EFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d={svgPaths.p32ab0300} id="Vector_2" stroke="var(--stroke-0, #4F5EFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-[rgba(79,94,255,0.1)] content-stretch flex items-center justify-center p-[1.25px] relative rounded-[16777200px] shrink-0 size-[40px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px] border-[rgba(79,94,255,0.2)] border-solid inset-0 pointer-events-none rounded-[16777200px]" />
      <User />
    </div>
  );
}

function UserTextContainer() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center not-italic relative shrink-0 whitespace-nowrap" data-name="User Text Container">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.5] relative shrink-0 text-[14px] text-black">Google User</p>
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#7c7c7c] text-[12px]">
        <p className="leading-[1.5]">user@google.com</p>
      </div>
    </div>
  );
}

function UserInfoContainer() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="User Info Container">
      <Container />
      <UserTextContainer />
    </div>
  );
}

function Tab3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="Tab-3">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[8px] relative w-full">
          <UserInfoContainer />
          <div className="flex items-center justify-center relative shrink-0 size-[20px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
            <div className="-rotate-90 flex-none">
              <div className="relative size-[20px]" data-name="Component 1">
                <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
                  <div className="absolute inset-[-12.5%_-6.25%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.25 6.25">
                      <path d={svgPaths.p2161abc0} id="Vector" stroke="var(--stroke-0, #4F4F4F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="bg-[#fafafa] relative shrink-0 w-full" data-name="LOGO">
      <div aria-hidden="true" className="absolute border-[rgba(10,10,10,0.08)] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[8px] py-[16px] relative w-full">
          <Tab3 />
        </div>
      </div>
    </div>
  );
}

function SidebarLogoContainer() {
  return (
    <div className="bg-[#fafafa] content-stretch flex flex-col h-[72px] items-start relative shrink-0 w-full" data-name="Sidebar Logo Container">
      <Logo />
    </div>
  );
}

function SidebarNavigation() {
  return (
    <div className="content-stretch flex flex-col h-full items-start relative shrink-0 w-[280px]" data-name="Sidebar Navigation">
      <Nav />
      <Nav1 />
      <SidebarLogoContainer />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center not-italic relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#0a0a0a] text-[24px] w-full">
        <p className="leading-[1.2]">Welcome Back</p>
      </div>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[16px] text-black w-full">Manage your Agent wallet and monitor system status</p>
    </div>
  );
}

function TitleContainer() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full" data-name="Title Container">
      <div className="flex flex-col justify-center relative shrink-0 text-[#4f5eff] text-[12px] tracking-[1px] uppercase w-full">
        <p className="leading-[normal]">For Agent Owners</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#0a0a0a] text-[24px] w-full">
        <p className="leading-[1.2]">Agent Installation Guide</p>
      </div>
    </div>
  );
}

function StepNumberContainer() {
  return (
    <div className="bg-[rgba(79,94,255,0.08)] relative rounded-[99px] shrink-0 size-[28px]" data-name="Step Number Container">
      <div className="content-stretch flex items-center justify-center overflow-clip px-[11px] py-[5px] relative rounded-[inherit] size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#4f5eff] text-[16px] text-center whitespace-nowrap">
          <p className="leading-[1.5]">1</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(79,94,255,0.2)] border-solid inset-0 pointer-events-none rounded-[99px]" />
    </div>
  );
}

function StepHeaderContainer() {
  return (
    <div className="content-stretch flex flex-col items-start leading-[0] not-italic relative shrink-0 w-full" data-name="Step Header Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[#0a0a0a] text-[16px] w-full">
        <p className="leading-[1.5]">Download Agent Wallet SDK</p>
      </div>
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[#4f4f4f] text-[14px] w-full">
        <p className="leading-[1.5]">Install Agent Wallet SDK using npm or yarn</p>
      </div>
    </div>
  );
}

function Eyebrow() {
  return (
    <div className="bg-[rgba(255,255,255,0.08)] content-stretch flex items-center px-[11px] py-[5px] relative rounded-[6px] shrink-0" data-name="eyebrow">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.5)] whitespace-nowrap">
        <p className="leading-[normal]">Copy</p>
      </div>
    </div>
  );
}

function DivCtaCardSnippet() {
  return (
    <div className="bg-[#0a0a0a] relative rounded-[8px] shrink-0 w-full" data-name="div.cta-card-snippet">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16px] py-[12px] relative w-full">
          <div className="flex flex-col font-['JetBrains_Mono:Regular',sans-serif] font-normal justify-center leading-[1.5] relative shrink-0 text-[0px] text-[12px] text-[rgba(255,255,255,0.3)] tracking-[0.24px] whitespace-nowrap">
            <p className="mb-0 text-[#e2e8f0]">Tell your agent:</p>
            <p className="text-[#818cf8]">{`"Install the Cobo Agentic Wallet skill"`}</p>
          </div>
          <Eyebrow />
        </div>
      </div>
    </div>
  );
}

function StepInfoContainer() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Step Info Container">
      <StepHeaderContainer />
      <DivCtaCardSnippet />
    </div>
  );
}

function NumberedStepContainer() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Numbered Step Container">
      <StepNumberContainer />
      <StepInfoContainer />
    </div>
  );
}

function UlAudList() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[24px] relative shrink-0 w-full" data-name="ul.aud-list">
      <div aria-hidden="true" className="absolute border-[rgba(10,10,10,0.08)] border-b border-solid inset-0 pointer-events-none" />
      <NumberedStepContainer />
    </div>
  );
}

function StepNumberContainer1() {
  return (
    <div className="bg-[rgba(79,94,255,0.08)] relative rounded-[99px] shrink-0 size-[28px]" data-name="Step Number Container">
      <div className="content-stretch flex items-center justify-center overflow-clip px-[11px] py-[5px] relative rounded-[inherit] size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#4f5eff] text-[16px] text-center whitespace-nowrap">
          <p className="leading-[1.5]">2</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(79,94,255,0.2)] border-solid inset-0 pointer-events-none rounded-[99px]" />
    </div>
  );
}

function StepHeaderContainer1() {
  return (
    <div className="content-stretch flex flex-col items-start leading-[0] not-italic relative shrink-0 w-full" data-name="Step Header Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[#0a0a0a] text-[16px] w-full">
        <p className="leading-[1.5]">Initialize SDK</p>
      </div>
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[#4f4f4f] text-[14px] w-full">
        <p className="leading-[1.5]">Import and initialize the SDK in your Agent code</p>
      </div>
    </div>
  );
}

function Eyebrow1() {
  return (
    <div className="bg-[rgba(255,255,255,0.08)] content-stretch flex items-center px-[11px] py-[5px] relative rounded-[6px] shrink-0" data-name="eyebrow">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.5)] whitespace-nowrap">
        <p className="leading-[normal]">Copy</p>
      </div>
    </div>
  );
}

function DivCtaCardSnippet1() {
  return (
    <div className="bg-[#0a0a0a] relative rounded-[8px] shrink-0 w-full" data-name="div.cta-card-snippet">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16px] py-[12px] relative w-full">
          <div className="flex flex-col font-['JetBrains_Mono:Regular',sans-serif] font-normal justify-center leading-[1.5] relative shrink-0 text-[#e2e8f0] text-[12px] tracking-[0.24px] whitespace-nowrap whitespace-pre">
            <p className="mb-0">{`import { AgentWallet } from '@agent-wallet/sdk';`}</p>
            <p className="mb-0">&nbsp;</p>
            <p className="mb-0">{`const wallet = new AgentWallet({`}</p>
            <p className="mb-0">{`  apiKey: 'YOUR_API_KEY',`}</p>
            <p className="mb-0">{`  environment: 'production'`}</p>
            <p>{`});`}</p>
          </div>
          <Eyebrow1 />
        </div>
      </div>
    </div>
  );
}

function StepInfoContainer1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Step Info Container">
      <StepHeaderContainer1 />
      <DivCtaCardSnippet1 />
    </div>
  );
}

function NumberedStepContainer1() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Numbered Step Container">
      <StepNumberContainer1 />
      <StepInfoContainer1 />
    </div>
  );
}

function UlAudList1() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[24px] relative shrink-0 w-full" data-name="ul.aud-list">
      <div aria-hidden="true" className="absolute border-[rgba(10,10,10,0.08)] border-b border-solid inset-0 pointer-events-none" />
      <NumberedStepContainer1 />
    </div>
  );
}

function StepNumberContainer2() {
  return (
    <div className="bg-[rgba(79,94,255,0.08)] relative rounded-[99px] shrink-0 size-[28px]" data-name="Step Number Container">
      <div className="content-stretch flex items-center justify-center overflow-clip px-[11px] py-[5px] relative rounded-[inherit] size-full">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#4f5eff] text-[16px] text-center whitespace-nowrap">
          <p className="leading-[1.5]">3</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(79,94,255,0.2)] border-solid inset-0 pointer-events-none rounded-[99px]" />
    </div>
  );
}

function StepHeaderContainer2() {
  return (
    <div className="content-stretch flex flex-col items-start leading-[0] not-italic relative shrink-0 w-full" data-name="Step Header Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[#0a0a0a] text-[16px] w-full">
        <p className="leading-[1.5]">Configure API Key</p>
      </div>
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[#4f4f4f] text-[14px] w-full">
        <p className="leading-[1.5]">Get your API key from dashboard and configure environment variables</p>
      </div>
    </div>
  );
}

function Eyebrow2() {
  return (
    <div className="bg-[rgba(255,255,255,0.08)] content-stretch flex items-center px-[11px] py-[5px] relative rounded-[6px] shrink-0" data-name="eyebrow">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(255,255,255,0.5)] whitespace-nowrap">
        <p className="leading-[normal]">Copy</p>
      </div>
    </div>
  );
}

function DivCtaCardSnippet2() {
  return (
    <div className="bg-[#0a0a0a] relative rounded-[8px] shrink-0 w-full" data-name="div.cta-card-snippet">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16px] py-[12px] relative w-full">
          <div className="flex flex-col font-['JetBrains_Mono:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#e2e8f0] text-[12px] tracking-[0.24px] whitespace-nowrap">
            <p className="leading-[1.5]">AGENT_WALLET_API_KEY=your_api_key_here</p>
          </div>
          <Eyebrow2 />
        </div>
      </div>
    </div>
  );
}

function StepInfoContainer2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative" data-name="Step Info Container">
      <StepHeaderContainer2 />
      <DivCtaCardSnippet2 />
    </div>
  );
}

function NumberedStepContainer2() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Numbered Step Container">
      <StepNumberContainer2 />
      <StepInfoContainer2 />
    </div>
  );
}

function UlAudList2() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[24px] relative shrink-0 w-full" data-name="ul.aud-list">
      <NumberedStepContainer2 />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#4f5eff] content-stretch flex h-[40px] items-center justify-center px-[24px] py-[5px] relative rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] shrink-0" data-name="button">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.5] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Contact Technical Support</p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.5] not-italic relative shrink-0 text-[#0a0a0a] text-[16px] text-right whitespace-nowrap">Need Help?</p>
      <Button />
    </div>
  );
}

function GuideContainer() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start min-h-px min-w-px relative" data-name="Guide Container">
      <TitleContainer />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#0a0a0a] text-[16px] w-full">
        <p className="leading-[1.5]">Follow these steps to install and configure wallet for your Agent</p>
      </div>
      <UlAudList />
      <UlAudList1 />
      <UlAudList2 />
      <Frame10 />
    </div>
  );
}

function X() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="X">
      <div className="absolute inset-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
            <path d={svgPaths.p354ab980} id="Vector" stroke="var(--stroke-0, #4F4F4F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
            <path d={svgPaths.p2a4db200} id="Vector" stroke="var(--stroke-0, #4F4F4F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 size-[20px]" data-name="button">
      <X />
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(10,10,10,0.08)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex items-start justify-between p-[24px] relative w-full">
        <GuideContainer />
        <Button1 />
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p25397b80} id="Vector" stroke="var(--stroke-0, #4F5EFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d={svgPaths.p2c4f400} id="Vector_2" stroke="var(--stroke-0, #4F5EFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d={svgPaths.p2241fff0} id="Vector_3" stroke="var(--stroke-0, #4F5EFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d={svgPaths.pae3c380} id="Vector_4" stroke="var(--stroke-0, #4F5EFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="bg-[rgba(79,94,255,0.08)] content-stretch flex flex-col items-center justify-center p-px relative rounded-[8px] shrink-0 size-[40px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(79,94,255,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon2 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[#0a0a0a] text-[24px] w-full">
        <p className="leading-[1.2]">12</p>
      </div>
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[#4f4f4f] text-[12px] w-full">
        <p className="leading-[1.5]">Active Agents</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Container3 />
      <Frame1 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#059669] text-[12px] w-[min-content]">
        <p className="leading-[normal]">+3 this month</p>
      </div>
    </div>
  );
}

function DivSkillCard() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[12px]" data-name="div.skill-card">
      <div aria-hidden="true" className="absolute border border-[rgba(10,10,10,0.12)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start p-[24px] relative w-full">
        <Frame2 />
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p363df2c0} id="Vector" stroke="var(--stroke-0, #4F5EFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[rgba(79,94,255,0.08)] content-stretch flex flex-col items-center justify-center p-px relative rounded-[8px] shrink-0 size-[40px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(79,94,255,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon3 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[#0a0a0a] text-[24px] w-full">
        <p className="leading-[1.2]">1,248</p>
      </div>
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[#4f4f4f] text-[12px] w-full">
        <p className="leading-[1.5]">Total Transactions</p>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Container4 />
      <Frame5 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#059669] text-[12px] w-[min-content]">
        <p className="leading-[normal]">+18% this week</p>
      </div>
    </div>
  );
}

function DivSkillCard1() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[12px]" data-name="div.skill-card">
      <div aria-hidden="true" className="absolute border border-[rgba(10,10,10,0.12)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start p-[24px] relative w-full">
        <Frame4 />
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p25fc4100} id="Vector" stroke="var(--stroke-0, #4F5EFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-[rgba(79,94,255,0.08)] content-stretch flex flex-col items-center justify-center p-px relative rounded-[8px] shrink-0 size-[40px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(79,94,255,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon4 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[#0a0a0a] text-[24px] w-full">
        <p className="leading-[1.2]">Low</p>
      </div>
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[#4f4f4f] text-[12px] w-full">
        <p className="leading-[1.5]">Risk Level</p>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Container5 />
      <Frame7 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#059669] text-[12px] w-[min-content]">
        <p className="leading-[normal]">System Secure</p>
      </div>
    </div>
  );
}

function DivSkillCard2() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[12px]" data-name="div.skill-card">
      <div aria-hidden="true" className="absolute border border-[rgba(10,10,10,0.12)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start p-[24px] relative w-full">
        <Frame6 />
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p3c797180} id="Vector" stroke="var(--stroke-0, #4F5EFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d={svgPaths.p3ac0b600} id="Vector_2" stroke="var(--stroke-0, #4F5EFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-[rgba(79,94,255,0.08)] content-stretch flex flex-col items-center justify-center p-px relative rounded-[8px] shrink-0 size-[40px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(79,94,255,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon5 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[#0a0a0a] text-[24px] w-full">
        <p className="leading-[1.2]">+24.5%</p>
      </div>
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[#4f4f4f] text-[12px] w-full">
        <p className="leading-[1.5]">Asset Growth</p>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Container6 />
      <Frame9 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#059669] text-[12px] w-[min-content]">
        <p className="leading-[normal]">Past 30 days</p>
      </div>
    </div>
  );
}

function DivSkillCard3() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[12px]" data-name="div.skill-card">
      <div aria-hidden="true" className="absolute border border-[rgba(10,10,10,0.12)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start p-[24px] relative w-full">
        <Frame8 />
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[24px] h-[190px] items-start relative shrink-0 w-full">
      <DivSkillCard />
      <DivSkillCard1 />
      <DivSkillCard2 />
      <DivSkillCard3 />
    </div>
  );
}

function Container11() {
  return <div className="bg-[#00c950] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container12() {
  return (
    <div className="flex-[1_0_0] h-[44px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start leading-[1.5] not-italic relative size-full whitespace-nowrap">
        <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#0a0a0a] text-[16px]">Agent Connected</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#4f4f4f] text-[14px]">Trading Agent #7</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[44px] relative shrink-0 w-[157.703px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative size-full">
        <Container11 />
        <Container12 />
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[20px] relative shrink-0 w-[93.461px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[1.5] left-[94px] not-italic text-[#4f4f4f] text-[14px] text-right top-[0.5px] whitespace-nowrap">2 minutes ago</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex h-[69px] items-center justify-between pb-px relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(10,10,10,0.08)] border-b border-solid inset-0 pointer-events-none" />
      <Container10 />
      <Container13 />
    </div>
  );
}

function Container16() {
  return <div className="bg-[#4f5eff] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container18() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[1.5] left-0 not-italic text-[#0a0a0a] text-[16px] top-[-1px] whitespace-nowrap">Risk Check</p>
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[1.5] left-0 not-italic text-[#4f4f4f] text-[14px] top-[0.5px] whitespace-nowrap">System</p>
    </div>
  );
}

function Container17() {
  return (
    <div className="flex-[1_0_0] h-[44px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container18 />
        <Container19 />
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[44px] relative shrink-0 w-[109.172px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative size-full">
        <Container16 />
        <Container17 />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[20px] relative shrink-0 w-[98.922px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[1.5] left-[100px] not-italic text-[#4f4f4f] text-[14px] text-right top-[0.5px] whitespace-nowrap">15 minutes ago</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex h-[69px] items-center justify-between pb-px relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(10,10,10,0.08)] border-b border-solid inset-0 pointer-events-none" />
      <Container15 />
      <Container20 />
    </div>
  );
}

function Container23() {
  return <div className="bg-[#00c950] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container25() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[1.5] left-0 not-italic text-[#0a0a0a] text-[16px] top-[-1px] whitespace-nowrap">Agent Transaction</p>
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[1.5] left-0 not-italic text-[#4f4f4f] text-[14px] top-[0.5px] whitespace-nowrap">Portfolio Agent #3</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="flex-[1_0_0] h-[44px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container25 />
        <Container26 />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[44px] relative shrink-0 w-[163.914px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative size-full">
        <Container23 />
        <Container24 />
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[20px] relative shrink-0 w-[68.633px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[1.5] left-[70px] not-italic text-[#4f4f4f] text-[14px] text-right top-[0.5px] whitespace-nowrap">1 hour ago</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex h-[69px] items-center justify-between pb-px relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(10,10,10,0.08)] border-b border-solid inset-0 pointer-events-none" />
      <Container22 />
      <Container27 />
    </div>
  );
}

function Container30() {
  return <div className="bg-[#4f5eff] rounded-[16777200px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container32() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[1.5] left-0 not-italic text-[#0a0a0a] text-[16px] top-[-1px] whitespace-nowrap">Security Scan</p>
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[1.5] left-0 not-italic text-[#4f4f4f] text-[14px] top-[0.5px] whitespace-nowrap">System</p>
    </div>
  );
}

function Container31() {
  return (
    <div className="flex-[1_0_0] h-[44px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container32 />
        <Container33 />
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[44px] relative shrink-0 w-[130.609px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative size-full">
        <Container30 />
        <Container31 />
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[20px] relative shrink-0 w-[78.977px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[1.5] left-[79px] not-italic text-[#4f4f4f] text-[14px] text-right top-[0.5px] whitespace-nowrap">3 hours ago</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex h-[68px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container29 />
      <Container34 />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Container14 />
      <Container21 />
      <Container28 />
    </div>
  );
}

function GuideContainer1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start min-h-px min-w-px relative" data-name="Guide Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#0a0a0a] text-[24px] w-full">
        <p className="leading-[1.2]">Recent Activity</p>
      </div>
      <Container8 />
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(10,10,10,0.08)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex items-start justify-between p-[24px] relative w-full">
        <GuideContainer1 />
      </div>
    </div>
  );
}

function Frame11() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[40px] items-start left-[80px] top-[30px] w-[1000px]">
      <Container1 />
      <Container2 />
      <Frame3 />
      <Container7 />
    </div>
  );
}

function LanguageIconContainer() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Language Icon Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Language Icon Container">
          <path d={svgPaths.p1f383e80} id="Vector" stroke="var(--stroke-0, #1C1C1C)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p16a44980} id="Vector_2" stroke="var(--stroke-0, #1C1C1C)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p3157ad80} id="Vector_3" stroke="var(--stroke-0, #1C1C1C)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p64ade80} id="Vector_4" stroke="var(--stroke-0, #1C1C1C)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p58a5000} id="Vector_5" stroke="var(--stroke-0, #1C1C1C)" strokeLinecap="round" strokeLinejoin="round" />
          <g id="Vector_6" opacity="0" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-white h-[40px] left-[983px] rounded-[6px] top-[30px] w-[97px]" data-name="Button">
      <div className="content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[8px] relative rounded-[inherit] size-full">
        <LanguageIconContainer />
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.5] not-italic relative shrink-0 text-[#1c1c1c] text-[14px] text-right whitespace-nowrap">English</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(10,10,10,0.08)] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function Main() {
  return (
    <div className="bg-white h-[1576px] overflow-auto relative shrink-0 w-[1160px]" data-name="Main">
      <Frame11 />
      <Button2 />
    </div>
  );
}

export default function AgentWalletManagementSiteDashboard() {
  return (
    <div className="content-stretch flex items-start justify-between relative size-full" data-name="Agent Wallet Management Site_Dashboard">
      <SidebarNavigation />
      <Main />
    </div>
  );
}