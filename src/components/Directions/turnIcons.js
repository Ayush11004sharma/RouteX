import {
  ArrowUp,
  ArrowUpRight,
  ArrowUpLeft,
  ArrowRight,
  ArrowLeft,
  CornerUpRight,
  CornerUpLeft,
  RotateCcw,
  Compass,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

export function getTurnIcon(maneuver) {
  if (!maneuver) return Navigation;

  const type = maneuver.type || '';
  const modifier = (maneuver.modifier || '').toLowerCase();

  if (type === 'arrive') return CheckCircle2;
  if (type === 'depart') return Navigation;
  if (type === 'roundabout' || type === 'rotary') return RotateCcw;

  if (modifier.includes('sharp right')) return CornerUpRight;
  if (modifier.includes('sharp left')) return CornerUpLeft;
  if (modifier.includes('slight right')) return ArrowUpRight;
  if (modifier.includes('slight left')) return ArrowUpLeft;
  if (modifier.includes('right')) return ArrowRight;
  if (modifier.includes('left')) return ArrowLeft;
  if (modifier.includes('u-turn') || modifier.includes('uturn')) return RotateCcw;
  if (modifier.includes('straight')) return ArrowUp;

  return Compass;
}
