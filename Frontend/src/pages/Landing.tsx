import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Upload, Settings, GitBranch, Cpu, BarChart3, Zap, BookOpen, GraduationCap, CheckCircle, Eraser, Wand2, Split } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Slide {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const slides: Slide[] = [
  {
    icon: (
      <div className="flex items-center justify-center h-full w-full p-4">
        {/* MacBook Frame */}
        <div className="relative w-full max-w-5xl">
          {/* Screen */}
          <div className="bg-gray-900 rounded-t-2xl p-2 border-4 border-gray-800">
            {/* MacBook Camera */}
            <div className="flex justify-center mb-1">
              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
            </div>
            {/* Screen Content */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/10' }}>
              {/* Browser Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded px-3 py-1 text-xs text-gray-600 dark:text-gray-400 text-center">
                  localhost:3000 - ML Pipeline Builder
                </div>
              </div>
              {/* App Content - Step 1 */}
              <div className="flex h-full">
                {/* Sidebar */}
                <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-3 overflow-y-auto">
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-3">ML Pipeline Builder</div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-move">
                      <div className="flex items-start gap-2">
                        <div className="bg-purple-500 p-1.5 rounded">
                          <Upload className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Upload Dataset</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="bg-pink-500 p-1.5 rounded">
                          <Eraser className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Clean Data</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="bg-indigo-500 p-1.5 rounded">
                          <Wand2 className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Preprocess Data</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="bg-cyan-500 p-1.5 rounded">
                          <Split className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Train-Test Split</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="bg-emerald-500 p-1.5 rounded">
                          <Cpu className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Train Model</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="bg-violet-500 p-1.5 rounded">
                          <BarChart3 className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">View Results</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold text-[11px] mb-2">
                        <span>🚀</span>
                        <span>Quick Start</span>
                      </div>
                      <div className="space-y-1 text-[9px] text-gray-700 dark:text-gray-300">
                        <div>1. Drag Upload Dataset to canvas</div>
                        <div>2. Add Preprocess, Split, Train, Results</div>
                        <div>3. Connect them in order</div>
                        <div>4. Configure each node (double-click)</div>
                        <div className="text-purple-600 dark:text-purple-400 font-semibold">5. Click "Run Pipeline"</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Canvas */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-8 relative">
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 }}></div>
                  <div className="relative pt-8 pl-8">
                    {/* Upload Node on Canvas */}
                    <div className="inline-block bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-purple-500">
                      <div className="bg-purple-500 px-3 py-2 rounded-t-lg flex items-center gap-2">
                        <Upload className="h-4 w-4 text-white" />
                        <span className="font-semibold text-white text-xs">Upload Dataset</span>
                        <CheckCircle className="h-3.5 w-3.5 text-white ml-auto" />
                      </div>
                      <div className="p-3 w-52">
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 mb-2">Upload CSV/XLSX dataset for ML pipeline</div>
                        <div className="text-[10px] bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600 dark:text-gray-400">Configured</span>
                          </div>
                          <div className="text-[9px] text-green-600 dark:text-green-400 font-medium">✓ Dataset Loaded</div>
                          <div className="text-[9px] text-gray-500">15 rows × 3 columns</div>
                        </div>
                      </div>
                      {/* Output Handle */}
                      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* MacBook Base */}
          <div className="bg-gray-800 h-3 rounded-b-2xl"></div>
          <div className="bg-gray-700 h-1 w-48 mx-auto rounded-b-lg"></div>
        </div>
      </div>
    ),
    title: "",
    description: "",
    color: "bg-gray-50 dark:bg-gray-900",
  },
  {
    icon: (
      <div className="flex items-center justify-center h-full w-full p-4">
        <div className="relative w-full max-w-5xl">
          <div className="bg-gray-900 rounded-t-2xl p-2 border-4 border-gray-800">
            <div className="flex justify-center mb-1">
              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/10' }}>
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded px-3 py-1 text-xs text-gray-600 dark:text-gray-400 text-center">
                  localhost:3000 - ML Pipeline Builder
                </div>
              </div>
              <div className="flex h-full">
                <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-3 overflow-y-auto">
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-3">ML Pipeline Builder</div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50">
                      <div className="flex items-start gap-2">
                        <div className="bg-purple-500 p-1.5 rounded">
                          <Upload className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Upload Dataset</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-move">
                      <div className="flex items-start gap-2">
                        <div className="bg-pink-500 p-1.5 rounded">
                          <Eraser className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Clean Data</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="bg-indigo-500 p-1.5 rounded">
                          <Wand2 className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Preprocess Data</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="bg-cyan-500 p-1.5 rounded">
                          <Split className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Train-Test Split</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="bg-emerald-500 p-1.5 rounded">
                          <Cpu className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Train Model</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="bg-violet-500 p-1.5 rounded">
                          <BarChart3 className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">View Results</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold text-[11px] mb-2">
                        <span>🚀</span>
                        <span>Quick Start</span>
                      </div>
                      <div className="space-y-1 text-[9px] text-gray-700 dark:text-gray-300">
                        <div className="opacity-50">1. Drag Upload Dataset to canvas</div>
                        <div className="text-pink-600 dark:text-pink-400 font-semibold">2. Add Preprocess, Split, Train, Results</div>
                        <div>3. Connect them in order</div>
                        <div>4. Configure each node (double-click)</div>
                        <div>5. Click "Run Pipeline"</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-6 relative">
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 }}></div>
                  <div className="relative pt-6 pl-6">
                    {/* Upload Node */}
                    <div className="inline-block bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-700">
                      <div className="bg-purple-500 px-3 py-2 rounded-t-lg flex items-center gap-2">
                        <Upload className="h-4 w-4 text-white" />
                        <span className="font-semibold text-white text-xs">Upload Dataset</span>
                        <CheckCircle className="h-3.5 w-3.5 text-white ml-auto" />
                      </div>
                      <div className="p-3 w-48">
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">Upload CSV/XLSX dataset for ML pipeline</div>
                        <div className="text-[10px] bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600 dark:text-gray-400">Configured</span>
                          </div>
                          <div className="text-[9px] text-green-600 dark:text-green-400 font-medium">✓ Dataset Loaded</div>
                          <div className="text-[9px] text-gray-500">15 rows × 3 columns</div>
                        </div>
                      </div>
                      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    </div>
                    {/* Connection Line */}
                    <div className="absolute left-[12.5rem] top-[5.5rem] w-16 h-0.5 bg-blue-400"></div>
                    {/* Clean Data Node */}
                    <div className="inline-block bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-pink-500 ml-16 ring-2 ring-pink-400">
                      <div className="bg-pink-500 px-3 py-2 rounded-t-lg flex items-center gap-2">
                        <Eraser className="h-4 w-4 text-white" />
                        <span className="font-semibold text-white text-xs">Clean Data</span>
                        <CheckCircle className="h-3.5 w-3.5 text-white ml-auto" />
                      </div>
                      <div className="p-3 w-48">
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 mb-2">Handle missing values in dataset</div>
                        <div className="text-[10px] bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600 dark:text-gray-400">Configured</span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 h-3 rounded-b-2xl"></div>
          <div className="bg-gray-700 h-1 w-48 mx-auto rounded-b-lg"></div>
        </div>
      </div>
    ),
    title: "",
    description: "",
    color: "bg-gray-50 dark:bg-gray-900",
  },
  {
    icon: (
      <div className="flex items-center justify-center h-full w-full p-4">
        <div className="relative w-full max-w-5xl">
          <div className="bg-gray-900 rounded-t-2xl p-2 border-4 border-gray-800">
            <div className="flex justify-center mb-1">
              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/10' }}>
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded px-3 py-1 text-xs text-gray-600 dark:text-gray-400 text-center">
                  localhost:3000 - ML Pipeline Builder
                </div>
              </div>
              <div className="flex h-full">
                <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-3 overflow-y-auto">
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-3">ML Pipeline Builder</div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50">
                      <div className="flex items-start gap-2">
                        <div className="bg-purple-500 p-1.5 rounded">
                          <Upload className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Upload Dataset</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50">
                      <div className="flex items-start gap-2">
                        <div className="bg-pink-500 p-1.5 rounded">
                          <Eraser className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Clean Data</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-move">
                      <div className="flex items-start gap-2">
                        <div className="bg-indigo-500 p-1.5 rounded">
                          <Wand2 className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Preprocess Data</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="bg-cyan-500 p-1.5 rounded">
                          <Split className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Train-Test Split</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="bg-emerald-500 p-1.5 rounded">
                          <Cpu className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Train Model</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="bg-violet-500 p-1.5 rounded">
                          <BarChart3 className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">View Results</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold text-[11px] mb-2">
                        <span>🚀</span>
                        <span>Quick Start</span>
                      </div>
                      <div className="space-y-1 text-[9px] text-gray-700 dark:text-gray-300">
                        <div className="opacity-50">1. Drag Upload Dataset to canvas</div>
                        <div className="opacity-50">2. Add Preprocess, Split, Train, Results</div>
                        <div className="text-indigo-600 dark:text-indigo-400 font-semibold">3. Connect them in order</div>
                        <div>4. Configure each node (double-click)</div>
                        <div>5. Click "Run Pipeline"</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-6 relative overflow-hidden">
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 }}></div>
                  <div className="relative flex flex-col items-center pt-2">
                    {/* Upload Node */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-700 mb-1.5">
                      <div className="bg-purple-500 px-2.5 py-1.5 rounded-t-lg flex items-center gap-1.5">
                        <Upload className="h-3 w-3 text-white" />
                        <span className="font-semibold text-white text-[10px]">Upload Dataset</span>
                        <CheckCircle className="h-2.5 w-2.5 text-white ml-auto" />
                      </div>
                      <div className="p-2 w-40">
                        <div className="text-[9px] bg-green-50 dark:bg-green-900/20 text-green-600 p-1 rounded">✓ 100 rows loaded</div>
                      </div>
                    </div>
                    {/* Line */}
                    <div className="w-0.5 h-3 bg-blue-400"></div>
                    {/* Clean Node */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-700 mb-1.5">
                      <div className="bg-pink-500 px-2.5 py-1.5 rounded-t-lg flex items-center gap-1.5">
                        <Eraser className="h-3 w-3 text-white" />
                        <span className="font-semibold text-white text-[10px]">Clean Data</span>
                        <CheckCircle className="h-2.5 w-2.5 text-white ml-auto" />
                      </div>
                      <div className="p-2 w-40">
                        <div className="text-[9px] bg-green-50 dark:bg-green-900/20 text-green-600 p-1 rounded">✓ 5 missing handled</div>
                      </div>
                    </div>
                    {/* Line */}
                    <div className="w-0.5 h-3 bg-blue-400"></div>
                    {/* Preprocess Node - ACTIVE */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-indigo-500 mb-1.5 ring-2 ring-indigo-400">
                      <div className="bg-indigo-500 px-2.5 py-1.5 rounded-t-lg flex items-center gap-1.5">
                        <Wand2 className="h-3 w-3 text-white" />
                        <span className="font-semibold text-white text-[10px]">Preprocess Data</span>
                        <CheckCircle className="h-2.5 w-2.5 text-white ml-auto" />
                      </div>
                      <div className="p-2 w-40">
                        <div className="text-[9px] text-gray-600 dark:text-gray-400 mb-1">Standardize or normalize numeric columns</div>
                        <div className="text-[9px] bg-gray-50 dark:bg-gray-900 p-1.5 rounded border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600 dark:text-gray-400">Configured</span>
                          </div>
                          <div className="text-[8px] text-green-600 dark:text-green-400 font-medium">✓ Preprocessed</div>
                          <div className="text-[8px] text-gray-500">1 column scaled</div>
                        </div>
                      </div>
                    </div>
                    {/* Line */}
                    <div className="w-0.5 h-3 bg-gray-300 dark:bg-gray-700"></div>
                    {/* Split Node - Not connected yet */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-gray-300 dark:border-gray-600 opacity-40">
                      <div className="bg-gray-400 px-2.5 py-1.5 rounded-t-lg flex items-center gap-1.5">
                        <Split className="h-3 w-3 text-white" />
                        <span className="font-semibold text-white text-[10px]">Train-Test Split</span>
                      </div>
                      <div className="p-2 w-40">
                        <div className="text-[9px] text-gray-400">Not configured</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 h-3 rounded-b-2xl"></div>
          <div className="bg-gray-700 h-1 w-48 mx-auto rounded-b-lg"></div>
        </div>
      </div>
    ),
    title: "",
    description: "",
    color: "bg-gray-50 dark:bg-gray-900",
  },
  {
    icon: (
      <div className="flex items-center justify-center h-full w-full p-4">
        <div className="relative w-full max-w-5xl">
          <div className="bg-gray-900 rounded-t-2xl p-2 border-4 border-gray-800">
            <div className="flex justify-center mb-1">
              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/10' }}>
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded px-3 py-1 text-xs text-gray-600 dark:text-gray-400 text-center">
                  localhost:3000 - ML Pipeline Builder
                </div>
              </div>
              <div className="flex h-full">
                <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-3 overflow-y-auto">
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-3">ML Pipeline Builder</div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50">
                      <div className="flex items-start gap-2">
                        <div className="bg-purple-500 p-1.5 rounded">
                          <Upload className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Upload Dataset</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50">
                      <div className="flex items-start gap-2">
                        <div className="bg-pink-500 p-1.5 rounded">
                          <Eraser className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Clean Data</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50">
                      <div className="flex items-start gap-2">
                        <div className="bg-indigo-500 p-1.5 rounded">
                          <Wand2 className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Preprocess Data</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-move">
                      <div className="flex items-start gap-2">
                        <div className="bg-cyan-500 p-1.5 rounded">
                          <Split className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Train-Test Split</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="bg-emerald-500 p-1.5 rounded">
                          <Cpu className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Train Model</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="bg-violet-500 p-1.5 rounded">
                          <BarChart3 className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">View Results</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold text-[11px] mb-2">
                        <span>🚀</span>
                        <span>Quick Start</span>
                      </div>
                      <div className="space-y-1 text-[9px] text-gray-700 dark:text-gray-300">
                        <div className="opacity-50">1. Drag Upload Dataset to canvas</div>
                        <div className="opacity-50">2. Add Preprocess, Split, Train, Results</div>
                        <div className="opacity-50">3. Connect them in order</div>
                        <div className="text-cyan-600 dark:text-cyan-400 font-semibold">4. Configure each node (double-click)</div>
                        <div>5. Click "Run Pipeline"</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-6 relative overflow-hidden">
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 }}></div>
                  <div className="relative pt-8 pl-8">
                    {/* Train-Test Split Node - ACTIVE */}
                    <div className="inline-block bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-cyan-500 ring-2 ring-cyan-400">
                      <div className="bg-cyan-500 px-3 py-2 rounded-t-lg flex items-center gap-2">
                        <Split className="h-4 w-4 text-white" />
                        <span className="font-semibold text-white text-xs">Train-Test Split</span>
                        <CheckCircle className="h-3.5 w-3.5 text-white ml-auto" />
                      </div>
                      <div className="p-3 w-52">
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 mb-2">Split dataset into training and testing sets</div>
                        <div className="text-[10px] bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600 dark:text-gray-400">Configured</span>
                          </div>
                          <div className="text-[9px] text-green-600 dark:text-green-400 font-medium">✓ Data Split</div>
                          <div className="text-[9px] text-gray-500">Train: 12 | Test: 3</div>
                        </div>
                      </div>
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 h-3 rounded-b-2xl"></div>
          <div className="bg-gray-700 h-1 w-48 mx-auto rounded-b-lg"></div>
        </div>
      </div>
    ),
    title: "",
    description: "",
    color: "bg-gray-50 dark:bg-gray-900",
  },
  {
    icon: (
      <div className="flex items-center justify-center h-full w-full p-4">
        <div className="relative w-full max-w-5xl">
          <div className="bg-gray-900 rounded-t-2xl p-2 border-4 border-gray-800">
            <div className="flex justify-center mb-1">
              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/10' }}>
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded px-3 py-1 text-xs text-gray-600 dark:text-gray-400 text-center">
                  localhost:3000 - ML Pipeline Builder
                </div>
              </div>
              <div className="flex h-full">
                <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-3 overflow-y-auto">
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-3">ML Pipeline Builder</div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50">
                      <div className="flex items-start gap-2">
                        <div className="bg-purple-500 p-1.5 rounded">
                          <Upload className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Upload Dataset</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50">
                      <div className="flex items-start gap-2">
                        <div className="bg-pink-500 p-1.5 rounded">
                          <Eraser className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Clean Data</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50">
                      <div className="flex items-start gap-2">
                        <div className="bg-indigo-500 p-1.5 rounded">
                          <Wand2 className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Preprocess Data</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50">
                      <div className="flex items-start gap-2">
                        <div className="bg-cyan-500 p-1.5 rounded">
                          <Split className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Train-Test Split</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50">
                      <div className="flex items-start gap-2">
                        <div className="bg-emerald-500 p-1.5 rounded">
                          <Cpu className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">Train Model</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-move">
                      <div className="flex items-start gap-2">
                        <div className="bg-violet-500 p-1.5 rounded">
                          <BarChart3 className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[10px] text-gray-900 dark:text-white">View Results</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold text-[11px] mb-2">
                        <span>🚀</span>
                        <span>Quick Start</span>
                      </div>
                      <div className="space-y-1 text-[9px] text-gray-700 dark:text-gray-300">
                        <div className="opacity-50">1. Drag Upload Dataset to canvas</div>
                        <div className="opacity-50">2. Add Preprocess, Split, Train, Results</div>
                        <div className="opacity-50">3. Connect them in order</div>
                        <div className="opacity-50">4. Configure each node (double-click)</div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-semibold">5. Click "Run Pipeline"</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 }}></div>
                  <div className="relative h-full flex">
                    {/* Left Side: Complete Pipeline */}
                    <div className="flex-1 p-6 flex items-center justify-center">
                      <div className="flex items-center gap-3">
                        {/* Upload Node */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-purple-500">
                          <div className="bg-purple-500 px-2 py-1 rounded-t-lg flex items-center gap-1">
                            <Upload className="h-2.5 w-2.5 text-white" />
                            <CheckCircle className="h-2 w-2 text-white ml-auto" />
                          </div>
                          <div className="p-1.5 w-24">
                            <div className="text-[7px] text-gray-600 dark:text-gray-400">Upload</div>
                          </div>
                          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
                        </div>
                        <div className="w-3 h-0.5 bg-blue-400"></div>
                        {/* Clean Node */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-pink-500">
                          <div className="bg-pink-500 px-2 py-1 rounded-t-lg flex items-center gap-1">
                            <Eraser className="h-2.5 w-2.5 text-white" />
                            <CheckCircle className="h-2 w-2 text-white ml-auto" />
                          </div>
                          <div className="p-1.5 w-24">
                            <div className="text-[7px] text-gray-600 dark:text-gray-400">Clean</div>
                          </div>
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
                          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
                        </div>
                        <div className="w-3 h-0.5 bg-blue-400"></div>
                        {/* Preprocess Node */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-indigo-500">
                          <div className="bg-indigo-500 px-2 py-1 rounded-t-lg flex items-center gap-1">
                            <Wand2 className="h-2.5 w-2.5 text-white" />
                            <CheckCircle className="h-2 w-2 text-white ml-auto" />
                          </div>
                          <div className="p-1.5 w-24">
                            <div className="text-[7px] text-gray-600 dark:text-gray-400">Preprocess</div>
                          </div>
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
                          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
                        </div>
                        <div className="w-3 h-0.5 bg-blue-400"></div>
                        {/* Split Node */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-cyan-500">
                          <div className="bg-cyan-500 px-2 py-1 rounded-t-lg flex items-center gap-1">
                            <Split className="h-2.5 w-2.5 text-white" />
                            <CheckCircle className="h-2 w-2 text-white ml-auto" />
                          </div>
                          <div className="p-1.5 w-24">
                            <div className="text-[7px] text-gray-600 dark:text-gray-400">Split</div>
                          </div>
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
                          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
                        </div>
                        <div className="w-3 h-0.5 bg-blue-400"></div>
                        {/* Train Node */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-emerald-500">
                          <div className="bg-emerald-500 px-2 py-1 rounded-t-lg flex items-center gap-1">
                            <Cpu className="h-2.5 w-2.5 text-white" />
                            <CheckCircle className="h-2 w-2 text-white ml-auto" />
                          </div>
                          <div className="p-1.5 w-24">
                            <div className="text-[7px] text-gray-600 dark:text-gray-400">Train</div>
                          </div>
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
                          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
                        </div>
                        <div className="w-3 h-0.5 bg-blue-400"></div>
                        {/* Results Node - ACTIVE */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-violet-500 ring-2 ring-violet-400">
                          <div className="bg-violet-500 px-2 py-1 rounded-t-lg flex items-center gap-1">
                            <BarChart3 className="h-2.5 w-2.5 text-white" />
                            <CheckCircle className="h-2 w-2 text-white ml-auto" />
                          </div>
                          <div className="p-1.5 w-24">
                            <div className="text-[7px] text-violet-600 dark:text-violet-400 font-semibold">✓ Results Ready</div>
                          </div>
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
                        </div>
                      </div>
                    </div>
                    {/* Right Side: Results Panel */}
                    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">Configure Node</div>
                        <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">×</button>
                      </div>
                      <div className="text-[10px] text-violet-600 dark:text-violet-400 mb-2">View Results</div>
                      {/* Performance Card */}
                      <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-lg p-3 border border-violet-200 dark:border-violet-800 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🎓</span>
                          <div className="text-xs font-semibold text-violet-900 dark:text-violet-100">Your Model's Report Card</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[9px] text-violet-700 dark:text-violet-300 mb-1">Overall Score</div>
                          <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">100.0%</div>
                          <div className="h-2 bg-violet-200 dark:bg-violet-900 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500" style={{ width: '100%' }}></div>
                          </div>
                          <div className="text-[9px] text-green-600 dark:text-green-400 mt-1 font-semibold">🌟 Excellent!</div>
                          <div className="text-[8px] text-gray-600 dark:text-gray-400 mt-0.5">Your model is performing great! It can make accurate predictions.</div>
                        </div>
                      </div>
                      {/* Charts Section */}
                      <div className="space-y-2">
                        <div className="text-[10px] font-semibold text-gray-900 dark:text-white flex items-center gap-1 mb-1">
                          <span>💡</span>
                          <span>How to read the charts below:</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-[8px] text-gray-600 dark:text-gray-400 space-y-0.5">
                          <div>• <span className="font-semibold">Performance Chart:</span> Shows how well your model scores on different metrics</div>
                          <div>• <span className="font-semibold">Confusion Matrix:</span> Shows where your model got it right (diagonal) vs wrong</div>
                          <div>• <span className="font-semibold">Training vs Testing:</span> Checks if model learned properly without memorizing</div>
                        </div>
                        {/* Mock Charts */}
                        <div className="bg-green-50 dark:bg-green-950/20 rounded p-2 text-center border border-green-200 dark:border-green-800">
                          <BarChart3 className="h-6 w-6 text-green-600 mx-auto mb-1" />
                          <div className="text-[9px] text-green-700 dark:text-green-300 font-semibold">Performance Metrics Overview</div>
                          <div className="text-[8px] text-gray-600 dark:text-gray-400">How Well Did Your Model Perform?</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 h-3 rounded-b-2xl"></div>
          <div className="bg-gray-700 h-1 w-48 mx-auto rounded-b-lg"></div>
        </div>
      </div>
    ),
    title: "",
    description: "",
    color: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-950 dark:to-green-950/20",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-100 dark:border-gray-900 sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-purple-600 rounded-lg rotate-3"></div>
                <div className="absolute inset-0 w-10 h-10 bg-indigo-600 rounded-lg -rotate-3 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                  ML Pipeline Builder
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">10K+ learners</span>
              </div>
              <Button
                onClick={() => navigate("/app")}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5"
              >
                Try it free
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-6">
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-md text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Free for students • No credit card needed
              </div>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-7 leading-[1.1] tracking-tight">
              Build ML pipelines
              <br />
              <span className="text-blue-600 dark:text-blue-400">without code</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
              A visual interface for learning machine learning. Drag nodes, connect them, 
              and watch your models train in real-time. Perfect for understanding ML concepts hands-on.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                onClick={() => navigate("/app")}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-8 py-6 text-lg font-medium shadow-sm hover:shadow-md transition-all"
              >
                Get started free
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-md px-8 py-6 text-lg border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See how it works
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No installation required
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Works in your browser
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Built for learners
              </div>
            </div>
          </div>

          {/* Demo Preview - Right Side */}
          <div className="relative">
            <div className="relative bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">ML Pipeline Builder</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Upload Dataset</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">iris_dataset.csv</div>
                  </div>
                  <div className="text-green-600 font-semibold text-sm">✓ Ready</div>
                </div>
                <div className="pl-8 flex">
                  <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-700"></div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Standardize Features</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Normalize data scale</div>
                  </div>
                  <div className="text-green-600 font-semibold text-sm">✓ Done</div>
                </div>
                <div className="pl-8 flex">
                  <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-700"></div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-blue-300 dark:border-blue-700 ring-2 ring-blue-400/50">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Cpu className="h-6 w-6 text-white animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Train Model</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Random Forest • 80/20 split</div>
                  </div>
                  <div className="text-blue-600 font-semibold text-sm">Training...</div>
                </div>
                <div className="pl-8 flex">
                  <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-700"></div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 opacity-60">
                  <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">View Results</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Waiting for training...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Slider Section */}
      <section id="features" className="bg-gray-50 dark:bg-gray-900/50 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              How it works
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Five simple steps from data to trained model. No PhD required, just curiosity and 15 minutes of your time.
            </p>
          </div>

          {/* Slide Container - Visual Preview Tabs */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {slides.map((slide, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className={`${slide.color} p-8 md:p-16 min-h-[600px] flex items-center justify-center`}>
                      {slide.icon}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => { previousSlide(); setAutoPlay(false); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-4 rounded-full transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => { nextSlide(); setAutoPlay(false); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-4 rounded-full transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-3 mt-10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentSlide
                      ? "bg-purple-600 w-12"
                      : "bg-gray-300 dark:bg-gray-700 w-6 hover:bg-gray-400 dark:hover:bg-gray-600"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why It's Different */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Why students love this
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Learning ML doesn't have to be intimidating. We've made it visual, interactive, and actually fun.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Learn by doing</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Forget passive video tutorials. Build real pipelines, make mistakes, iterate, and actually understand what's happening.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Instant feedback</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    See results immediately. No waiting for compile times or setup. Your pipeline runs in seconds, not minutes.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Visual understanding</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    See how data flows through your pipeline. Watch preprocessing transform your data, models train, and accuracy improve.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:pt-12">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">What you'll learn</div>
              </div>
              <div className="space-y-3">
                {[
                  'Data preprocessing techniques',
                  'Train-test split methodology',
                  'Multiple ML algorithms',
                  'Model evaluation metrics',
                  'Hyperparameter tuning',
                  'Pipeline best practices'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">~15 min</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">to complete</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">Free</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">forever</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg rotate-3"></div>
                  <div className="absolute inset-0 w-8 h-8 bg-indigo-600 rounded-lg -rotate-3"></div>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">ML Pipeline Builder</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                A visual learning tool for understanding machine learning pipelines through hands-on practice.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
              <p>Built using React & FastAPI </p>
              <p>© 2025 • Made for learners</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
