import { Zap } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* Simple Icon */}
      <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-lg">
        <Zap className="h-5 w-5 text-white fill-white" />
      </div>

      {/* Brand Text - Clean and Simple */}
      <div className="flex flex-col">
        <span className="text-lg font-bold text-gray-900">
          Feast-Faster
        </span>
        <span className="text-[10px] text-gray-500 -mt-1">
          Restaurant Dashboard
        </span>
      </div>
    </div>
  );
}
