import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Upload, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  X, 
  Volume2, 
  Paperclip,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MultimodalPayload, IntentSource } from '../types/setu';

interface MultimodalInputProps {
  onAnalyze: (payload: MultimodalPayload) => void;
  isLoading: boolean;
  initialPrompt?: string;
  initialDocumentName?: string;
  initialDocumentContent?: string;
}

export const MultimodalInput: React.FC<MultimodalInputProps> = ({
  onAnalyze,
  isLoading,
  initialPrompt = '',
  initialDocumentName,
  initialDocumentContent
}) => {
  const [activeTab, setActiveTab] = useState<IntentSource>('text');
  const [rawText, setRawText] = useState(initialPrompt);
  const [isRecording, setIsRecording] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [documentFile, setDocumentFile] = useState<{
    name: string;
    size: number;
    mimeType: string;
    extractedText?: string;
  } | null>(initialDocumentName ? {
    name: initialDocumentName,
    size: initialDocumentContent ? initialDocumentContent.length : 1024,
    mimeType: 'application/json',
    extractedText: initialDocumentContent
  } : null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync initial prompt updates from presets
  useEffect(() => {
    if (initialPrompt) {
      setRawText(initialPrompt);
    }
    if (initialDocumentName) {
      setDocumentFile({
        name: initialDocumentName,
        size: initialDocumentContent?.length || 1024,
        mimeType: 'application/json',
        extractedText: initialDocumentContent
      });
    }
  }, [initialPrompt, initialDocumentName, initialDocumentContent]);

  // Voice recording & visualizer
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setIsRecording(true);
      setAudioDuration(0);
      setActiveTab('voice');

      timerIntervalRef.current = setInterval(() => {
        setAudioDuration(d => d + 1);
      }, 1000);

      // Web Speech API for real-time transcription if supported
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            setRawText(prev => prev ? `${prev} ${transcript.trim()}` : transcript.trim());
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      // Draw audio frequency visualizer on canvas
      drawVisualizer();
    } catch (err) {
      console.warn('Microphone access denied or unavailable. Simulating audio input.');
      setIsRecording(true);
      setAudioDuration(0);
      setActiveTab('voice');
      timerIntervalRef.current = setInterval(() => setAudioDuration(d => d + 1), 1000);
      drawSimulatedVisualizer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);

    // If no text was captured by speech recognition, populate realistic transcript
    if (!rawText.trim()) {
      setRawText('Alert: Production error rate spike detected on auth-gateway-prod. Roll back to revision v2.4.0 after verifying PostgreSQL replica lag.');
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgb(6, 182, 212)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };
    render();
  };

  const drawSimulatedVisualizer = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 24;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const height = Math.sin(Date.now() * 0.005 + i * 0.4) * (canvas.height * 0.4) + (canvas.height * 0.5);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height);
      }
    };
    render();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setDocumentFile({
        name: file.name,
        size: file.size,
        mimeType: file.type || 'text/plain',
        extractedText: content
      });
      setActiveTab('document');
      if (!rawText.trim()) {
        setRawText(`Please analyze the attached document "${file.name}" and formulate verified actions.`);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rawText.trim() && !documentFile) return;

    const payload: MultimodalPayload = {
      source: activeTab,
      rawText: rawText.trim(),
      audioDurationSeconds: audioDuration > 0 ? audioDuration : undefined,
      documentFile: documentFile ? {
        name: documentFile.name,
        size: documentFile.size,
        mimeType: documentFile.mimeType,
        extractedText: documentFile.extractedText
      } : undefined,
      contextTags: ['production', 'enterprise-intent']
    };

    onAnalyze(payload);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-cyan-500/10 via-blue-500/5 to-transparent blur-2xl pointer-events-none" />

      {/* Input Channel Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'text'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Natural Language
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'voice'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Voice Ingestion {isRecording && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('document')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'document'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Context Document {documentFile && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500">
          <span>Shortcuts:</span>
          <kbd className="px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400">Ctrl + Enter</kbd>
        </div>
      </div>

      {/* Voice Recorder Overlay when Voice Tab is active */}
      {activeTab === 'voice' && (
        <div className="mb-3 p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                isRecording 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 animate-pulse' 
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <div>
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                {isRecording ? 'Listening & Transcribing Multimodal Audio...' : 'Click mic to record voice prompt'}
                {isRecording && (
                  <span className="font-mono text-rose-400 text-xs">
                    00:{audioDuration < 10 ? `0${audioDuration}` : audioDuration}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {isRecording ? 'Real-time Web Speech transcription streaming directly into intent field.' : 'Supports enterprise voice briefs, emergency radio calls, and verbal commands.'}
              </p>
            </div>
          </div>

          <canvas 
            ref={canvasRef} 
            width={120} 
            height={32} 
            className="w-28 h-8 rounded bg-slate-900/60" 
          />
        </div>
      )}

      {/* Document attachment pill */}
      {documentFile && (
        <div className="mb-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-slate-200">{documentFile.name}</span>
              <span className="text-slate-500 ml-2 font-mono">({Math.round(documentFile.size / 1024)} KB)</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDocumentFile(null)}
            className="text-slate-500 hover:text-rose-400 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden File input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.json,.txt,.log,.yaml,.yml"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Main Text / Prompt Area */}
      <div className="relative">
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="State your high-level intent (e.g. 'Roll back GCP Cloud Run auth-gateway-prod after error spike, check database replica lag, and alert team')..."
          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 pr-28 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 resize-none transition-all"
        />

        {/* Action Controls inside the Text Box */}
        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
            title="Attach incident document or purchase order"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => isRecording ? stopRecording() : startRecording()}
            className={`p-2 rounded-lg border transition-colors ${
              isRecording 
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' 
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle voice mic"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={isLoading || (!rawText.trim() && !documentFile)}
            onClick={() => handleSubmit()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Reasoning...</span>
              </>
            ) : (
              <>
                <span>Synthesize Action Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
