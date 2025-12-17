import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArchitectureViz } from './ArchitectureViz';
import { TrainingConfig, TrainingLog, SentimentResult } from '../types';
import { BrainIcon, PlayIcon, RefreshIcon } from './Icon';

// Mock Sentiment Analysis Inference
const analyzeSentiment = (text: string, isTrained: boolean): SentimentResult => {
  if (!isTrained) {
    // Untrained model is random/confused
    const random = Math.random();
    return {
      label: random > 0.5 ? 'POSITIVE' : 'NEGATIVE',
      score: 0.5 + (Math.random() * 0.1) // Low confidence
    };
  }

  const lower = text.toLowerCase();
  const positiveWords = ['good', 'great', 'love', 'excellent', 'amazing', 'happy', 'best', 'cool'];
  const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'sad', 'worst', 'poor', 'slow'];

  let score = 0;
  positiveWords.forEach(w => { if (lower.includes(w)) score += 1; });
  negativeWords.forEach(w => { if (lower.includes(w)) score -= 1; });

  if (score > 0) return { label: 'POSITIVE', score: 0.8 + (Math.min(score, 3) * 0.05) };
  if (score < 0) return { label: 'NEGATIVE', score: 0.8 + (Math.min(Math.abs(score), 3) * 0.05) };
  return { label: 'NEUTRAL', score: 0.6 };
};

export const TrainingDashboard: React.FC = () => {
  // Config State
  const [config, setConfig] = useState<TrainingConfig>({
    rank: 8,
    alpha: 16,
    learningRate: 0.0003,
    epochs: 5,
    batchSize: 32,
  });

  // Training State
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [isTrained, setIsTrained] = useState(false);

  // Inference State
  const [inputText, setInputText] = useState("The movie was fantastic and I loved the acting.");
  const [inferenceResult, setInferenceResult] = useState<SentimentResult | null>(null);

  const trainingRef = useRef<number | null>(null);

  // Simulation Logic
  const startTraining = useCallback(() => {
    setIsTraining(true);
    setLogs([]);
    setProgress(0);
    setIsTrained(false);

    let step = 0;
    const totalSteps = 50; // Simulation steps
    const initialLoss = 2.5;
    
    // Simulate learning curve based on LR and Rank
    const learningSpeed = (config.learningRate * 1000) + (config.rank / 16); 
    
    trainingRef.current = window.setInterval(() => {
      step++;
      const currentProgress = (step / totalSteps) * 100;
      setProgress(currentProgress);

      // Math magic to make a nice curve
      const decay = Math.exp(-step / (10 + learningSpeed));
      const noise = (Math.random() - 0.5) * 0.1;
      const currentLoss = Math.max(0.1, (initialLoss * decay) + noise);
      const currentAcc = Math.min(0.95, (1 - decay) + noise);

      setLogs(prev => [...prev, {
        step,
        loss: parseFloat(currentLoss.toFixed(3)),
        accuracy: parseFloat(currentAcc.toFixed(3))
      }]);

      if (step >= totalSteps) {
        if (trainingRef.current) clearInterval(trainingRef.current);
        setIsTraining(false);
        setIsTrained(true);
      }
    }, 100);
  }, [config]);

  useEffect(() => {
    return () => {
      if (trainingRef.current) clearInterval(trainingRef.current);
    };
  }, []);

  const handleInference = () => {
    const result = analyzeSentiment(inputText, isTrained);
    setInferenceResult(result);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      
      {/* Left Column: Configuration & Architecture */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Architecture Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
             <BrainIcon className="w-5 h-5 text-blue-500" />
             Architecture
          </h3>
          <ArchitectureViz />
          <p className="text-xs text-slate-500 mt-3 italic">
            Visual representation of how LoRA matrices (A & B) are added to the frozen GPT-2 weights.
          </p>
        </div>

        {/* Hyperparameters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-800 mb-4">Hyperparameters</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-700">Rank (r)</label>
                <span className="text-sm font-mono text-slate-500">{config.rank}</span>
              </div>
              <input 
                type="range" min="2" max="64" step="2"
                value={config.rank}
                onChange={(e) => setConfig({...config, rank: parseInt(e.target.value)})}
                disabled={isTraining}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">Controls the capacity of the adapter.</p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-700">Alpha</label>
                <span className="text-sm font-mono text-slate-500">{config.alpha}</span>
              </div>
              <input 
                type="range" min="8" max="128" step="8"
                value={config.alpha}
                onChange={(e) => setConfig({...config, alpha: parseInt(e.target.value)})}
                disabled={isTraining}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">Scaling factor for the weights.</p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-700">Learning Rate</label>
                <span className="text-sm font-mono text-slate-500">{config.learningRate}</span>
              </div>
               <select 
                value={config.learningRate}
                onChange={(e) => setConfig({...config, learningRate: parseFloat(e.target.value)})}
                disabled={isTraining}
                className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
               >
                 <option value={0.0001}>1e-4 (Slow)</option>
                 <option value={0.0003}>3e-4 (Standard)</option>
                 <option value={0.001}>1e-3 (Aggressive)</option>
               </select>
            </div>
          </div>

          <button
            onClick={startTraining}
            disabled={isTraining}
            className={`mt-6 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-all ${
              isTraining 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isTraining ? (
              <>Running Epoch {Math.ceil(progress / 20)}...</>
            ) : (
              <><PlayIcon className="w-4 h-4" /> Start Training</>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Monitor & Inference */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Monitoring Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-80 flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-800">Training Metrics (Simulation)</h3>
             {isTraining && <span className="text-xs font-mono text-blue-600 animate-pulse">Live Updating...</span>}
          </div>
          
          <div className="flex-1 w-full min-h-0">
            {logs.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={logs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="step" hide />
                  <YAxis yAxisId="left" domain={[0, 3]} stroke="#94a3b8" fontSize={12} label={{ value: 'Loss', angle: -90, position: 'insideLeft' }}/>
                  <YAxis yAxisId="right" orientation="right" domain={[0, 1]} stroke="#94a3b8" fontSize={12} label={{ value: 'Accuracy', angle: 90, position: 'insideRight' }}/>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Training Loss" />
                  <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Accuracy" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                <p>No training data yet.</p>
                <p className="text-sm">Click "Start Training" to begin the experiment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Inference Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-800">Model Playground</h3>
             <div className={`px-2 py-1 rounded text-xs font-semibold ${isTrained ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                Status: {isTrained ? 'Fine-Tuned (LoRA)' : 'Base Model (Untrained)'}
             </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-700 h-24"
                placeholder="Type a sentence to analyze sentiment..."
              />
            </div>
            <div className="w-1/3 flex flex-col gap-2">
               <button 
                onClick={handleInference}
                className="w-full h-full bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex flex-col items-center justify-center gap-1"
               >
                 <RefreshIcon className="w-5 h-5" />
                 Analyze
               </button>
            </div>
          </div>

          {inferenceResult && (
             <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between animate-fade-in">
                <div>
                   <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Prediction</span>
                   <div className={`text-xl font-bold ${
                      inferenceResult.label === 'POSITIVE' ? 'text-green-600' : 
                      inferenceResult.label === 'NEGATIVE' ? 'text-red-600' : 'text-slate-600'
                   }`}>
                      {inferenceResult.label}
                   </div>
                </div>
                <div className="text-right">
                   <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Confidence</span>
                   <div className="text-xl font-mono text-slate-800">
                      {(inferenceResult.score * 100).toFixed(1)}%
                   </div>
                </div>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};