import React, { useState } from 'react';
import { TrainingDashboard } from './components/TrainingDashboard';
import { Documentation } from './components/Documentation';
import { AppView } from './types';
import { ChartIcon, BookIcon, BrainIcon } from './components/Icon';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <BrainIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              LoRA <span className="text-blue-600">Lab</span>
              <span className="ml-2 text-xs font-normal text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">Experiment v1.0</span>
            </h1>
          </div>
          
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setCurrentView(AppView.DASHBOARD)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currentView === AppView.DASHBOARD 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ChartIcon className="w-4 h-4" />
              Experiment
            </button>
            <button
              onClick={() => setCurrentView(AppView.DOCUMENTATION)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currentView === AppView.DOCUMENTATION
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookIcon className="w-4 h-4" />
              Documentation
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === AppView.DASHBOARD ? <TrainingDashboard /> : <Documentation />}
        </div>
      </main>
    </div>
  );
};

export default App;