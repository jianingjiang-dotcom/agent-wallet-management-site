export default function Frame() {
  return (
    <div className="bg-white relative size-full">
      <div className="absolute bg-[#1F32D6] h-[181px] left-[62px] top-[84px] w-[243px]" />
      <div className="absolute bg-white h-[181px] left-[62px] top-[313px] w-[243px]" />
      <div className="absolute bg-[#0a0a0a] h-[181px] left-[353px] top-[84px] w-[243px]" />
      <div className="absolute bg-[#4f4f4f] h-[181px] left-[644px] top-[84px] w-[243px]" />
      <div className="absolute bg-[rgba(10,10,10,0.08)] h-[181px] left-[353px] top-[313px] w-[243px]" />
    </div>
  );
}