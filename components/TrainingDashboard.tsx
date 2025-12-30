
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArchitectureViz } from './ArchitectureViz';
import { TrainingConfig, TrainingLog, SentimentResult } from '../types';
import { BrainIcon, PlayIcon, RefreshIcon } from './Icon';

// Mock Sentiment Analysis Inference with slight randomness to feel alive
const analyzeSentiment = (text: string, isTrained: boolean): SentimentResult => {
  // 引入微小的随机扰动，模拟模型置信度的轻微波动
  const variance = (Math.random() - 0.5) * 0.03; 

  if (!isTrained) {
    // 未训练模型：结果随机且置信度低
    const random = Math.random();
    return {
      label: random > 0.5 ? 'POSITIVE' : 'NEGATIVE',
      score: 0.5 + (Math.random() * 0.1) + variance
    };
  }

  const lower = text.toLowerCase();
  // 扩充中文关键词库，增强语言逻辑的合理性
  const positiveWords = [
    'good', 'great', 'love', 'excellent', 'amazing', 'happy', 'best', 'cool', 
    '好', '棒', '赞', '喜欢', '开心', '出色', '爱', '给力', '支持', '推荐', '满意', '优'
  ];
  const negativeWords = [
    'bad', 'terrible', 'hate', 'awful', 'sad', 'worst', 'poor', 'slow', 
    '坏', '烂', '讨厌', '难过', '差', '糟糕', '失望', '生气', '不行', '垃圾', '恶心', '丑'
  ];

  let score = 0;
  positiveWords.forEach(w => { if (lower.includes(w)) score += 1; });
  negativeWords.forEach(w => { if (lower.includes(w)) score -= 1; });

  // 根据匹配到的词频调整分值
  if (score > 0) return { 
    label: 'POSITIVE', 
    score: Math.min(0.99, 0.82 + (Math.min(score, 3) * 0.04) + variance) 
  };
  if (score < 0) return { 
    label: 'NEGATIVE', 
    score: Math.min(0.99, 0.82 + (Math.min(Math.abs(score), 3) * 0.04) + variance) 
  };
  
  // 中性结果也加入随机分值
  return { label: 'NEUTRAL', score: 0.6 + variance };
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
  const [inputText, setInputText] = useState("这部电影太精彩了，我非常喜欢演员的演技。");
  const [inferenceResult, setInferenceResult] = useState<SentimentResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const trainingRef = useRef<number | null>(null);

  // Simulation Logic
  const startTraining = useCallback(() => {
    setIsTraining(true);
    setLogs([]);
    setProgress(0);
    setIsTrained(false);
    setInferenceResult(null); 

    let step = 0;
    const totalSteps = 50; 
    const initialLoss = 2.5;
    
    const learningSpeed = (config.learningRate * 1000) + (config.rank / 16); 
    
    trainingRef.current = window.setInterval(() => {
      step++;
      const currentProgress = (step / totalSteps) * 100;
      setProgress(currentProgress);

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
  }, [config.learningRate, config.rank]);

  useEffect(() => {
    return () => {
      if (trainingRef.current) clearInterval(trainingRef.current);
    };
  }, []);

  const handleInference = () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    setInferenceResult(null);

    setTimeout(() => {
      const result = analyzeSentiment(inputText, isTrained);
      setInferenceResult(result);
      setIsAnalyzing(false);
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      
      {/* Left Column: Configuration & Architecture */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Architecture Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
             <BrainIcon className="w-5 h-5 text-blue-500" />
             模型架构
          </h3>
          <ArchitectureViz />
          <p className="text-xs text-slate-500 mt-3 italic">
            可视化 LoRA 矩阵 (A & B) 如何叠加到已冻结的 GPT-2 权重上。
          </p>
        </div>

        {/* Hyperparameters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-800 mb-4">超参数配置</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-700">秩 (Rank, r)</label>
                <span className="text-sm font-mono text-slate-500">{config.rank}</span>
              </div>
              <input 
                type="range" min="2" max="64" step="2"
                value={config.rank}
                onChange={(e) => setConfig({...config, rank: parseInt(e.target.value)})}
                disabled={isTraining}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">控制适配器的容量（复杂度）。</p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-700">缩放因子 (Alpha)</label>
                <span className="text-sm font-mono text-slate-500">{config.alpha}</span>
              </div>
              <input 
                type="range" min="8" max="128" step="8"
                value={config.alpha}
                onChange={(e) => setConfig({...config, alpha: parseInt(e.target.value)})}
                disabled={isTraining}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">LoRA 权重的缩放倍率。</p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-slate-700">学习率</label>
                <span className="text-sm font-mono text-slate-500">{config.learningRate}</span>
              </div>
               <select 
                value={config.learningRate}
                onChange={(e) => setConfig({...config, learningRate: parseFloat(e.target.value)})}
                disabled={isTraining}
                className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
               >
                 <option value={0.0001}>1e-4 (稳健型)</option>
                 <option value={0.0003}>3e-4 (标准型)</option>
                 <option value={0.001}>1e-3 (激进型)</option>
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
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在运行第 {Math.ceil(progress / 20)} 轮...
              </span>
            ) : (
              <><PlayIcon className="w-4 h-4" /> 开始微调训练</>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Monitor & Inference */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Monitoring Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-80 flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-800">训练指标监控 (实时模拟)</h3>
             {isTraining && <span className="text-xs font-mono text-blue-600 animate-pulse">正在更新指标...</span>}
          </div>
          
          <div className="flex-1 w-full min-h-0">
            {logs.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={logs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="step" hide />
                  <YAxis yAxisId="left" domain={[0, 3]} stroke="#94a3b8" fontSize={12} label={{ value: '损失值 (Loss)', angle: -90, position: 'insideLeft' }}/>
                  <YAxis yAxisId="right" orientation="right" domain={[0, 1]} stroke="#94a3b8" fontSize={12} label={{ value: '准确率 (Acc)', angle: 90, position: 'insideRight' }}/>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="训练损失" />
                  <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="预测准确率" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                <p>暂无训练数据</p>
                <p className="text-sm">点击“开始微调训练”按钮观察模型收敛过程</p>
              </div>
            )}
          </div>
        </div>

        {/* Inference Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-800">模型演练场</h3>
             <div className={`px-2 py-1 rounded text-xs font-semibold ${isTrained ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                状态: {isTrained ? '已完成 LoRA 微调' : '原始模型 (未训练)'}
             </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-700 h-24"
                placeholder="输入一句话来分析其情感..."
              />
            </div>
            <div className="w-1/3 flex flex-col gap-2">
               <button 
                onClick={handleInference}
                disabled={isAnalyzing}
                className={`w-full h-full rounded-lg font-medium transition-colors flex flex-col items-center justify-center gap-1 ${
                  isAnalyzing 
                    ? 'bg-slate-200 text-slate-500 cursor-wait' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
               >
                 {isAnalyzing ? (
                   <>
                    <svg className="animate-spin h-6 w-6 text-slate-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>分析中...</span>
                   </>
                 ) : (
                   <>
                    <RefreshIcon className="w-5 h-5" />
                    分析情感
                   </>
                 )}
               </button>
            </div>
          </div>

          <div className="mt-4 min-h-[90px]">
            {isAnalyzing ? (
              <div className="h-full p-8 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50">
                 <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                 </div>
              </div>
            ) : inferenceResult ? (
               <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between animate-[fadeIn_0.3s_ease-out]">
                  <div>
                     <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">预测结果</span>
                     <div className={`text-xl font-bold ${
                        inferenceResult.label === 'POSITIVE' ? 'text-green-600' : 
                        inferenceResult.label === 'NEGATIVE' ? 'text-red-600' : 'text-slate-600'
                     }`}>
                        {inferenceResult.label === 'POSITIVE' ? '正向 (褒义)' : 
                         inferenceResult.label === 'NEGATIVE' ? '负向 (贬义)' : '中性'}
                     </div>
                  </div>
                  <div className="text-right">
                     <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">置信度</span>
                     <div className="text-xl font-mono text-slate-800">
                        {(inferenceResult.score * 100).toFixed(1)}%
                     </div>
                  </div>
               </div>
            ) : (
              <div className="h-full p-6 flex items-center justify-center text-slate-400 italic text-sm border-2 border-dashed border-slate-100 rounded-lg">
                等待输入或点击分析...
              </div>
            )}
          </div>
        </div>

      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
