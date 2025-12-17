import React from 'react';

export const ArchitectureViz: React.FC = () => {
  return (
    <div className="relative w-full h-64 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-inner flex items-center justify-center">
      <div className="absolute top-2 left-3 text-xs text-slate-400 font-mono">LoRA Architecture Visualization</div>
      
      {/* Main Flow */}
      <div className="flex flex-col items-center gap-4 z-10">
        
        {/* Input X */}
        <div className="flex flex-col items-center animate-pulse">
            <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-xs">x</div>
            <div className="h-6 w-0.5 bg-blue-500/50"></div>
        </div>

        {/* Split paths */}
        <div className="flex gap-8 items-center">
          
          {/* Frozen Weights Path */}
          <div className="flex flex-col items-center relative group">
            <div className="absolute -top-6 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Frozen Pretrained</div>
            <div className="w-24 h-16 border-2 border-slate-500 bg-slate-800 rounded flex items-center justify-center text-slate-300 font-mono text-sm shadow-[0_0_15px_rgba(100,116,139,0.2)]">
              W_pre
            </div>
            <div className="text-[10px] text-blue-300 mt-1">d x d</div>
          </div>

          <div className="text-slate-500 text-xl">+</div>

          {/* LoRA Path */}
          <div className="flex flex-col items-center relative group">
             <div className="absolute -top-6 text-[10px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">Trainable LoRA</div>
             <div className="flex flex-col gap-1 items-center bg-amber-900/20 p-2 rounded border border-amber-700/50">
                <div className="w-20 h-6 border border-amber-500 bg-amber-600/20 rounded flex items-center justify-center text-amber-500 font-mono text-xs">
                    B (d x r)
                </div>
                <div className="h-2 w-0.5 bg-amber-500/50"></div>
                <div className="w-12 h-6 border border-amber-500 bg-amber-600/20 rounded flex items-center justify-center text-amber-500 font-mono text-xs">
                    A (r x d)
                </div>
             </div>
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col items-center mt-2">
            <div className="h-6 w-0.5 bg-green-500/50"></div>
            <div className="w-auto px-3 h-8 rounded bg-green-600 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_15px_rgba(22,163,74,0.4)]">
                h = Wx + BAx
            </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
         <div className="absolute bottom-10 right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};