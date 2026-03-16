import { Check, CircleMinus, Clock4, Pause, SquarePen } from 'lucide-react';
import { ReactNode } from 'react';

interface Props {
  status: string;
}

interface StatusInfo {
  [key: string]: { color: string; icon: ReactNode; text: string };
}
// Ensure that any new colors are added to `safelist` in tailwind.config.js
const StatusInfo: StatusInfo = {
  active: { color: 'hsl(142 71% 45%)', icon: <Check size={16} />, text: 'Active' },
  paid: { color: 'hsl(142 71% 45%)', icon: <Check size={16} />, text: 'Paid' },
  completed: { color: 'hsl(142 71% 45%)', icon: <Check size={16} />, text: 'Completed' },
  trialing: { color: 'hsl(240 5% 90%)', icon: <Clock4 size={16} />, text: 'Trialing' },
  draft: { color: 'hsl(240 4% 65%)', icon: <SquarePen size={16} />, text: 'Draft' },
  ready: { color: 'hsl(240 4% 65%)', icon: <SquarePen size={16} />, text: 'Ready' },
  canceled: { color: 'hsl(240 4% 65%)', icon: <CircleMinus size={16} />, text: 'Canceled' },
  inactive: { color: 'hsl(0 72% 51%)', icon: <CircleMinus size={16} />, text: 'Inactive' },
  past_due: { color: 'hsl(0 72% 51%)', icon: <Clock4 size={16} />, text: 'Past due' },
  paused: { color: 'hsl(38 92% 50%)', icon: <Pause size={16} />, text: 'Paused' },
  billed: { color: 'hsl(38 92% 50%)', icon: <Clock4 size={16} />, text: 'Unpaid invoice' },
};

export function Status({ status }: Props) {
  const { color, icon, text } = StatusInfo[status] ?? { text: status };
  return (
    <div
      className={`self-end flex items-center gap-2 border rounded-xxs border-border py-1 px-2 text-[${color}] w-fit @4xs:text-nowrap text-wrap`}
    >
      {icon}
      {text}
    </div>
  );
}
