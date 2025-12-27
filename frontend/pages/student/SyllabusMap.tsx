import React, { useEffect, useState } from 'react';
import { db } from '../../services/mockDb';
import { generateMindMapData } from '../../services/geminiService';
import { SyllabusTopic } from '../../types';
import { Brain, FileText, Loader2, Sparkles } from 'lucide-react';

export const SyllabusMap: React.FC = () => {
  const [syllabi, setSyllabi] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mindMap, setMindMap] = useState<SyllabusTopic[] | null>(null);

  useEffect(() => {
    const fetchSyllabi = async () => {
      try {
        const response = await fetch('http://localhost:4200/syllabus/all');
        if (!response.ok) throw new Error('Failed to fetch syllabi');
        const data = await response.json();
        setSyllabi(data.syllabi);
        setSelectedSyllabus(data.syllabi[0]?.id || '');
        setMindMap(data.syllabi[0]?.mindMapData || null);
      } catch (error) {
        console.error('Error fetching syllabi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSyllabi();
  }, []);

  const handleGenerate = async () => {
    if (!selectedSyllabus) return;
    const s = syllabi.find(x => x.id === selectedSyllabus);
    if (!s) return;

    setLoading(true);
    try {
      // Simulate checking env key or using a real one if provided
      if(!process.env.API_KEY) {
         // Mock response if no key for demo stability
         await new Promise(r => setTimeout(r, 2000));
         const mockData: SyllabusTopic[] = [
             { title: "AI Generated Topic 1", subtopics: ["Concept A", "Concept B", "Deep Dive"] },
             { title: "AI Generated Topic 2", subtopics: ["Analysis", "Synthesis"] }
         ];
         setMindMap(mockData);
      } else {
         const data = await generateMindMapData(s.contentRaw);
         setMindMap(data);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate mind map. Ensure API Key is set.");
    } finally {
      setLoading(false);
    }
  };

  const currentSyllabus = syllabi.find(s => s.id === selectedSyllabus);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Brain className="text-purple-600" /> Syllabus Mind Maps
          </h2>
          <p className="text-gray-500">Visualize your curriculum with AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
          <select 
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 mb-4 p-2 border"
            value={selectedSyllabus}
            onChange={(e) => {
              setSelectedSyllabus(e.target.value);
              const s = syllabi.find(x => x.id === e.target.value);
              setMindMap(s?.mindMapData || null);
            }}
          >
            {syllabi.map(s => (
              <option key={s.id} value={s.id}>{s.subjectName} ({s.subjectCode})</option>
            ))}
          </select>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Raw Content Preview</h4>
            <p className="text-xs text-gray-600 line-clamp-4 font-mono">
              {currentSyllabus?.contentRaw}
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            <span>Generate Visual Map</span>
          </button>
        </div>

        {/* Visualization Area */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>AI is analyzing syllabus structure...</p>
            </div>
          ) : mindMap ? (
            <div className="space-y-6">
              {mindMap.map((topic, idx) => (
                <div key={idx} className="border border-indigo-100 rounded-xl overflow-hidden">
                  <div className="bg-indigo-50 p-3 border-b border-indigo-100">
                    <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                      <span className="bg-indigo-200 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      {topic.title}
                    </h3>
                  </div>
                  <div className="p-4 bg-white flex flex-wrap gap-2">
                    {topic.subtopics.map((sub, sIdx) => (
                      <span key={sIdx} className="bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm shadow-sm hover:border-indigo-300 transition-colors cursor-default">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
              <FileText size={48} className="mb-2" />
              <p>Select a subject and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
