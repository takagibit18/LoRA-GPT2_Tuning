import React from 'react';

export const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          LoRA Fine-Tuning Guide
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Understanding how to adapt Large Language Models (LLMs) efficiently using Low-Rank Adaptation.
        </p>
      </div>

      {/* Concept Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          The Concept: What is LoRA?
        </h2>
        <div className="prose text-slate-600 leading-relaxed">
          <p className="mb-4">
            Imagine GPT-2 is a massive encyclopedia. We want to teach it a specific task, like <strong>Sentiment Analysis</strong> (detecting if a sentence is happy or sad).
          </p>
          <p className="mb-4">
            <strong>Full Fine-Tuning</strong> would mean rewriting the entire encyclopedia. This is slow, expensive, and risks "Catastrophic Forgetting" (where the model forgets English while learning sentiment).
          </p>
          <p className="mb-4">
            <strong>LoRA (Low-Rank Adaptation)</strong> is like adding sticky notes to the pages. We freeze the original encyclopedia (the pre-trained weights) and only train small, low-rank matrices (the sticky notes) that modify the output.
          </p>
          <div className="bg-slate-50 border-l-4 border-blue-500 p-4 mt-4">
            <h4 className="font-semibold text-slate-900">Key Analogy</h4>
            <p>
              Full Fine-Tuning = Brain surgery. <br/>
              LoRA = Wearing glasses. You don't change the brain, you just adjust how it sees the data.
            </p>
          </div>
        </div>
      </section>

      {/* Code Structure Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Code Structure & Logic
        </h2>
        <div className="space-y-6 text-slate-600">
          <p>If we were writing this in Python (PyTorch/HuggingFace), the code structure follows these steps:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-2">1. Load Base Model</h3>
              <code className="text-xs bg-slate-800 text-green-400 p-2 rounded block mb-2">
                model = GPT2ForSequenceClassification.from_pretrained('gpt2')
              </code>
              <p className="text-sm">We load the standard GPT-2 model.</p>
            </div>

            <div className="border rounded-lg p-4 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-2">2. Inject LoRA Config</h3>
              <code className="text-xs bg-slate-800 text-green-400 p-2 rounded block mb-2">
                config = LoraConfig(r=8, lora_alpha=32, ...)
                <br/>
                model = get_peft_model(model, config)
              </code>
              <p className="text-sm">We wrap the model using a library like <code>peft</code>. This freezes the main weights.</p>
            </div>
            
             <div className="border rounded-lg p-4 bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-2">3. Training Loop</h3>
              <code className="text-xs bg-slate-800 text-green-400 p-2 rounded block mb-2">
                trainer.train()
              </code>
              <p className="text-sm">We feed labeled sentences (e.g., "I love this" -> POSITIVE) into the model. Only the LoRA weights update.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Parameters Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          Critical Parameters (For Debugging)
        </h2>
        <p className="text-slate-600 mb-6">When tuning LoRA, these are the knobs you turn. Understanding them is key to good results.</p>

        <div className="space-y-6">
          
          {/* Rank */}
          <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl hover:border-purple-300 transition-colors">
            <div className="md:w-1/4">
              <h3 className="font-bold text-slate-900">Rank (r)</h3>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">Typical: 4, 8, 16</span>
            </div>
            <div className="md:w-3/4 text-sm text-slate-600">
              <p className="mb-2"><strong>Meaning:</strong> The dimension of the low-rank matrices. It determines how "complex" the adaptation can be.</p>
              <p><strong>Usage:</strong> Start with <code>r=8</code>. If the model isn't learning enough nuance, increase to 16. If it overfits or the file size is too big, decrease to 4.</p>
            </div>
          </div>

          {/* Alpha */}
          <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl hover:border-purple-300 transition-colors">
            <div className="md:w-1/4">
              <h3 className="font-bold text-slate-900">LoRA Alpha</h3>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">Typical: 16, 32</span>
            </div>
            <div className="md:w-3/4 text-sm text-slate-600">
              <p className="mb-2"><strong>Meaning:</strong> A scaling factor. It determines how much "weight" the LoRA adapter has compared to the original model weights.</p>
              <p><strong>Usage:</strong> A rule of thumb is <code>alpha = 2 * r</code>. If your model output is gibberish, your alpha might be too high (overpowering the pre-trained knowledge).</p>
            </div>
          </div>

          {/* Learning Rate */}
          <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl hover:border-purple-300 transition-colors">
            <div className="md:w-1/4">
              <h3 className="font-bold text-slate-900">Learning Rate</h3>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">Typical: 2e-4 to 1e-3</span>
            </div>
            <div className="md:w-3/4 text-sm text-slate-600">
              <p className="mb-2"><strong>Meaning:</strong> How big of a step we take during optimization.</p>
              <p><strong>Usage:</strong> LoRA can handle higher learning rates than full fine-tuning. If loss explodes, lower it. If loss stays flat, increase it.</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};