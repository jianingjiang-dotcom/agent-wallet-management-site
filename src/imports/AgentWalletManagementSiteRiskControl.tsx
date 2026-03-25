import svgPaths from "./svg-tl3rmresjt";

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
          <path d={svgPaths.p1adee180} fill="var(--fill-0, #0A0A0A)" id="Union" />
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
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#0a0a0a] text-[16px] whitespace-nowrap">
        <p className="leading-[1.5]">Overview</p>
      </div>
    </div>
  );
}

function Tab() {
  return (
    <div className="h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Tab-2">
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
          <path d={svgPaths.p377dab00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d="M10 7.5V10.8333" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d="M10 14.1667H10.0083" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Margin">
      <Icon />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">
        <p className="leading-[1.5]">Risk Control</p>
      </div>
    </div>
  );
}

function Tab1() {
  return (
    <div className="bg-[#4f5eff] h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Tab-2">
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
    <div className="bg-[rgba(79,94,255,0.1)] content-stretch flex items-center justify-center p-[1.25px] relative rounded-full shrink-0 size-[40px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.25px] border-[rgba(79,94,255,0.2)] border-solid inset-0 pointer-events-none rounded-full" />
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
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0 w-[280px]" data-name="Sidebar Navigation">
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
        <p className="leading-[1.2]">Risk Control</p>
      </div>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[16px] text-black w-full">Manage your Agent wallet and monitor system status</p>
    </div>
  );
}

function Icon2() {
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
    <div className="bg-[rgba(79,94,255,0.08)] relative rounded-[8px] shrink-0 size-[40px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(79,94,255,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center p-px relative size-full">
        <Icon2 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start not-italic pb-[4px] relative whitespace-nowrap">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] mb-[-4px] relative shrink-0 text-[#4f4f4f] text-[12px]">
          <p className="leading-[1.5]">Current Risk Level</p>
        </div>
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.2] relative shrink-0 text-[#00a63e] text-[24px]">Low Risk</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Container5 />
      <Container6 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-center relative">
        <Container4 />
        <div className="flex flex-row items-center self-stretch">
          <div className="h-full relative shrink-0 w-0">
            <div className="absolute inset-[-1.45%_-0.63px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.25 44.25">
                <path d="M0.625 0.625V43.625" id="Vector 3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeOpacity="0.08" strokeWidth="1.25" />
              </svg>
            </div>
          </div>
        </div>
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#0a0a0a] text-[16px] whitespace-nowrap">System operating normally, no anomalous activity detected</p>
      </div>
    </div>
  );
}

function RefreshCw() {
  return (
    <div className="absolute left-0 size-[16px] top-[4px]" data-name="RefreshCw">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="RefreshCw">
          <path d={svgPaths.p19987d80} id="Vector" stroke="var(--stroke-0, #4F5EFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d="M14 2V5.33333H10.6667" id="Vector_2" stroke="var(--stroke-0, #4F5EFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d={svgPaths.p2a3e9c80} id="Vector_3" stroke="var(--stroke-0, #4F5EFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
          <path d="M5.33333 10.6667H2V14" id="Vector_4" stroke="var(--stroke-0, #4F5EFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[24px] relative shrink-0 w-[136.031px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <RefreshCw />
        <p className="-translate-x-1/2 absolute font-['Inter:Medium',sans-serif] font-medium leading-[1.5] left-[80.5px] not-italic text-[#4f5eff] text-[16px] text-center top-[-1px] whitespace-nowrap">Refresh Status</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Frame9 />
      <Button />
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(10,10,10,0.12)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start p-[24px] relative w-full">
        <Container3 />
      </div>
    </div>
  );
}

function Icon3() {
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

function Container7() {
  return (
    <div className="bg-[rgba(79,94,255,0.08)] content-stretch flex flex-col items-center justify-center p-px relative rounded-[8px] shrink-0 size-[40px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(79,94,255,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon3 />
    </div>
  );
}

function Switch1() {
  return (
    <div className="bg-white relative rounded-full shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] shrink-0 size-[12px]" data-name="Switch">
      <div className="size-full" />
    </div>
  );
}

function SwitchOn() {
  return (
    <div className="bg-[#4f5eff] col-1 content-stretch flex h-[16px] items-center justify-end ml-0 mt-0 px-[2px] relative rounded-full row-1 w-[28px]" data-name="Switch_On">
      <Switch1 />
    </div>
  );
}

function Switch() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Switch">
      <SwitchOn />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Container7 />
      <Switch />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[#0a0a0a] text-[16px] w-full">
        <p className="leading-[1.5]">Auto Block</p>
      </div>
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[#4f4f4f] text-[12px] w-full">
        <p className="leading-[1.5]">Automatically block suspicious transactions and activities</p>
      </div>
    </div>
  );
}

function CheckCircle() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="CheckCircle">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_33_974)" id="CheckCircle">
          <path d={svgPaths.p34e03900} id="Vector" stroke="var(--stroke-0, #059669)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1f2c5400} id="Vector_2" stroke="var(--stroke-0, #059669)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_33_974">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="Container">
      <CheckCircle />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#059669] text-[12px] whitespace-nowrap">
        <p className="leading-[normal]">Enabled</p>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Frame1 />
      <Frame5 />
      <Container8 />
    </div>
  );
}

function DivSkillCard() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[12px]" data-name="div.skill-card">
      <div aria-hidden="true" className="absolute border border-[rgba(10,10,10,0.12)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start p-[24px] relative w-full">
        <Frame3 />
      </div>
    </div>
  );
}

function Icon4() {
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

function Container9() {
  return (
    <div className="bg-[rgba(79,94,255,0.08)] content-stretch flex flex-col items-center justify-center p-px relative rounded-[8px] shrink-0 size-[40px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(79,94,255,0.2)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon4 />
    </div>
  );
}

function Switch3() {
  return (
    <div className="bg-white relative rounded-full shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] shrink-0 size-[12px]" data-name="Switch">
      <div className="size-full" />
    </div>
  );
}

function SwitchOn1() {
  return (
    <div className="bg-[#4f5eff] col-1 content-stretch flex h-[16px] items-center justify-end ml-0 mt-0 px-[2px] relative rounded-full row-1 w-[28px]" data-name="Switch_On">
      <Switch3 />
    </div>
  );
}

function Switch2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Switch">
      <SwitchOn1 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Container9 />
      <Switch2 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center relative shrink-0 text-[#0a0a0a] text-[16px] w-full">
        <p className="leading-[1.5]">Two-Factor Authentication</p>
      </div>
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[#4f4f4f] text-[12px] w-full">
        <p className="leading-[1.5]">Add an extra layer of security for sensitive operations</p>
      </div>
    </div>
  );
}

function CheckCircle1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="CheckCircle">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_33_974)" id="CheckCircle">
          <path d={svgPaths.p34e03900} id="Vector" stroke="var(--stroke-0, #059669)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1f2c5400} id="Vector_2" stroke="var(--stroke-0, #059669)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_33_974">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex gap-[8px] h-[20px] items-center relative shrink-0 w-full" data-name="Container">
      <CheckCircle1 />
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#059669] text-[12px] whitespace-nowrap">
        <p className="leading-[normal]">Enabled</p>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Frame2 />
      <Frame7 />
      <Container10 />
    </div>
  );
}

function DivSkillCard1() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[12px]" data-name="div.skill-card">
      <div aria-hidden="true" className="absolute border border-[rgba(10,10,10,0.12)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start p-[24px] relative w-full">
        <Frame6 />
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
      <DivSkillCard />
      <DivSkillCard1 />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white flex-[1_0_0] h-[40px] min-h-px min-w-px relative rounded-[8px]" data-name="button">
      <div aria-hidden="true" className="absolute border border-[rgba(10,10,10,0.08)] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[24px] py-[5px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.5] not-italic relative shrink-0 text-[#0a0a0a] text-[16px] text-center whitespace-nowrap">Force Review All Transactions</p>
        </div>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#e7000b] flex-[1_0_0] h-[40px] min-h-px min-w-px relative rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" data-name="button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[24px] py-[5px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.5] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Emergency Freeze All Activity</p>
        </div>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#4f5eff] flex-[1_0_0] h-[40px] min-h-px min-w-px relative rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" data-name="button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[24px] py-[5px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.5] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap">Generate Security Report</p>
        </div>
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full">
      <Button1 />
      <Button2 />
      <Button3 />
    </div>
  );
}

function GuideContainer() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start min-h-px min-w-px relative" data-name="Guide Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#0a0a0a] text-[24px] w-full">
        <p className="leading-[1.2]">Quick Actions</p>
      </div>
      <Frame10 />
    </div>
  );
}

function Container11() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(10,10,10,0.08)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex items-start justify-between p-[24px] relative w-full">
        <GuideContainer />
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[40px] items-start left-[80px] top-[30px] w-[1000px]">
      <Container1 />
      <Container2 />
      <Frame4 />
      <Container11 />
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

function Button4() {
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
      <Frame8 />
      <Button4 />
    </div>
  );
}

export default function AgentWalletManagementSiteRiskControl() {
  return (
    <div className="content-stretch flex items-start justify-between relative size-full" data-name="Agent Wallet Management Site_Risk Control">
      <SidebarNavigation />
      <Main />
    </div>
  );
}