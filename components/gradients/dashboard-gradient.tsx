export function DashboardGradient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className={'dashboard-shared-top-grainy-blur'} />
      <div className={'dashboard-shared-bottom-grainy-blur'} />
      <div className={'grain-background dashboard-background-base h-full'}></div>
    </div>
  );
}
