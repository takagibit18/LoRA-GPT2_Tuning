
import React from 'react';

export const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          LoRA 微调指南
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          了解如何使用低秩自适应 (Low-Rank Adaptation, LoRA) 高效地适配大型语言模型 (LLM)。
        </p>
      </div>

      {/* Concept Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          核心概念：什么是 LoRA？
        </h2>
        <div className="prose text-slate-600 leading-relaxed">
          <p className="mb-4">
            想象一下 GPT-2 是一本厚重的百科全书。我们想教它完成一个特定任务，例如<strong>情感分析</strong>（判断一句话是褒义还是贬义）。
          </p>
          <p className="mb-4">
            <strong>全量微调 (Full Fine-Tuning)</strong> 意味着我们要重写整本百科全书。这不仅速度慢、成本高，而且容易导致“灾难性遗忘”（模型在学习情感分析的过程中忘记了原本的语言能力）。
          </p>
          <p className="mb-4">
            <strong>LoRA (低秩自适应)</strong> 就像是在书页上贴便利贴。我们冻结了原始百科全书（预训练权重），只训练这些小巧的、低秩的矩阵（便利贴），用来微调输出。
          </p>
          <div className="bg-slate-50 border-l-4 border-blue-500 p-4 mt-4">
            <h4 className="font-semibold text-slate-900">形象类比</h4>
            <p>
              全量微调 = 脑部手术。直接改变大脑结构。<br/>
              LoRA = 戴眼镜。不需要改变大脑，只是调整看数据的方式。
            </p>
          </div>
        </div>
      </section>

      {/* Code Structure Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          代码结构与逻辑
        </h2>
        <div className="space-y-6 text-slate-600">
          <p>如果我们使用 Python (PyTorch/HuggingFace) 编写，通常遵循以下步骤：</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-2">1. 加载基础模型</h3>
              <code className="text-xs bg-slate-800 text-green-400 p-2 rounded block mb-2">
                model = GPT2ForSequenceClassification.from_pretrained('gpt2')
              </code>
              <p className="text-sm">加载标准的 GPT-2 预训练模型。</p>
            </div>

            <div className="border rounded-lg p-4 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-2">2. 注入 LoRA 配置</h3>
              <code className="text-xs bg-slate-800 text-green-400 p-2 rounded block mb-2">
                config = LoraConfig(r=8, lora_alpha=32, ...)
                <br/>
                model = get_peft_model(model, config)
              </code>
              <p className="text-sm">使用 <code>peft</code> 库包装模型。这会自动冻结主权重。</p>
            </div>
            
             <div className="border rounded-lg p-4 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-2">3. 训练循环</h3>
              <code className="text-xs bg-slate-800 text-green-400 p-2 rounded block mb-2">
                trainer.train()
              </code>
              <p className="text-sm">喂入带标签的句子（如：“我爱这个” -> 褒义）。此时只有 LoRA 权重在更新。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Parameters Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          关键参数 (调试指南)
        </h2>
        <p className="text-slate-600 mb-6">在调优 LoRA 时，这些是你需要拨动的旋钮。理解它们是获得好结果的关键。</p>

        <div className="space-y-6">
          
          {/* Rank */}
          <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl hover:border-purple-300 transition-colors">
            <div className="md:w-1/4">
              <h3 className="font-bold text-slate-900">秩 (Rank, r)</h3>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">典型值: 4, 8, 16</span>
            </div>
            <div className="md:w-3/4 text-sm text-slate-600">
              <p className="mb-2"><strong>含义：</strong> 低秩矩阵的维度。它决定了适配器可以捕捉多少“复杂度”。</p>
              <p><strong>用法：</strong> 通常从 <code>r=8</code> 开始。如果模型学不到细节，增加到 16；如果过拟合或文件太大，减小到 4。</p>
            </div>
          </div>

          {/* Alpha */}
          <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl hover:border-purple-300 transition-colors">
            <div className="md:w-1/4">
              <h3 className="font-bold text-slate-900">LoRA Alpha</h3>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">典型值: 16, 32</span>
            </div>
            <div className="md:w-3/4 text-sm text-slate-600">
              <p className="mb-2"><strong>含义：</strong> 缩放因子。它决定了 LoRA 权重相对于原始模型权重的“权重”。</p>
              <p><strong>用法：</strong> 经验法则通常是 <code>alpha = 2 * r</code>。如果输出变乱码，可能是 alpha 过高，压过了预训练知识。</p>
            </div>
          </div>

          {/* Learning Rate */}
          <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl hover:border-purple-300 transition-colors">
            <div className="md:w-1/4">
              <h3 className="font-bold text-slate-900">学习率 (LR)</h3>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">典型值: 2e-4 到 1e-3</span>
            </div>
            <div className="md:w-3/4 text-sm text-slate-600">
              <p className="mb-2"><strong>含义：</strong> 优化过程中步子跨多大。</p>
              <p><strong>用法：</strong> LoRA 通常比全量微调能承受更高的学习率。如果 Loss 爆炸，请调低；如果 Loss 不动，请调高。</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
