import React, { useState, useEffect, useRef } from 'react';
import { SharkProfile, MessageLog, SharkOffer, SharkQuestion, SharkBrawl } from '../types/shark';
import { SharkAvatar } from './SharkAvatar';
import { SharkBrawlBanner } from './SharkBrawlBanner';
import {
  Send,
  Volume2,
  Mic,
  Clock,
  Swords,
  FastForward,
  BookOpen,
  Square,
  AlertCircle,
} from 'lucide-react';
import { tankAudio } from '../utils/tankAudio';
import { tankSpeech, SpeechRecognitionStatus } from '../utils/speechRecognition';

interface LiveTankArenaProps {
  sharks: SharkProfile[];
  messages: MessageLog[];
  activeOffers: SharkOffer[];
  shotClockSeconds: number | null;
  activeBrawl?: SharkBrawl | null;
  currentQuestion?: SharkQuestion | null;
  isLoading: boolean;
  onSelectOption: (optionText: string) => void;
  onSendMessage: (text: string) => void;
  onAcceptOffer: (offer: SharkOffer) => void;
  onOpenCounterModal: (offer: SharkOffer) => void;
  onDeclineOffer: (offerId: string) => void;
  onSharkSpeak: (sharkId: string, text: string) => void;
  onDismissBrawl?: () => void;
}

export const LiveTankArena: React.FC<LiveTankArenaProps> = ({
  sharks,
  messages,
  activeOffers,
  shotClockSeconds,
  activeBrawl,
  currentQuestion,
  isLoading,
  onSelectOption,
  onSendMessage,
  onAcceptOffer,
  onOpenCounterModal,
  onDeclineOffer,
  onSharkSpeak,
  onDismissBrawl,
}) => {
  const [inputText, setInputText] = useState('');
  const [speechStatus, setSpeechStatus] = useState<SpeechRecognitionStatus>(tankSpeech.getStatus());
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getShark = (id?: string) => sharks.find((s) => s.id === id);

  // Subscribe to speech engine updates
  useEffect(() => {
    const unsubscribe = tankSpeech.subscribe((status) => {
      setSpeechStatus(status);
      if (status.isListening && (status.transcript || status.interimTranscript)) {
        const liveText = (status.transcript + ' ' + status.interimTranscript).trim();
        setInputText(liveText);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleToggleVoiceRecording = async () => {
    if (speechStatus.isListening) {
      const finalRecorded = await tankSpeech.stopListening();
      if (finalRecorded) {
        setInputText(finalRecorded);
      }
      tankAudio.playCashDing();
    } else {
      tankAudio.playCashDing();
      const success = await tankSpeech.startListening();
      if (!success) {
        inputRef.current?.focus();
      }
    }
  };

  const handleVoiceSendNow = async () => {
    const recorded = await tankSpeech.stopListening();
    const textToSend = (recorded || inputText || speechStatus.transcript).trim();
    if (textToSend && !isLoading) {
      onSendMessage(textToSend);
      setInputText('');
      tankSpeech.clear();
      tankAudio.playCashDing();
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, activeBrawl, currentQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (speechStatus.isListening) {
      tankSpeech.stopListening();
    }
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    tankSpeech.clear();
  };

  const handleSkipActiveBrawl = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (onDismissBrawl) {
      onDismissBrawl();
    }
  };

  return (
    <div
      className={`flex flex-col ${
        activeBrawl ? 'min-h-[820px]' : 'min-h-[740px] lg:h-[840px]'
      } bg-[#0b0e14] border border-zinc-800 rounded-xl relative shadow-lg transition-all duration-300`}
    >
      {/* Broadcast Subtitle & Live Status Strip - Muted Styling */}
      <div className="px-5 py-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-xs select-none rounded-t-xl">
        <div className="flex items-center gap-2.5 font-mono text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-zinc-400" />
          <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-200">
            {currentQuestion
              ? `Round ${currentQuestion.questionNumber}/${currentQuestion.totalQuestions} · Cross-Examination`
              : activeBrawl
              ? 'Investor Showdown · Live Brawl'
              : 'The Tank Floor · Live Negotiations'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Shot Clock */}
          {shotClockSeconds !== null && shotClockSeconds > 0 && (
            <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span className="tabular-nums font-bold">{shotClockSeconds}s</span>
            </div>
          )}

          {activeOffers.length > 0 && (
            <div className="font-mono text-zinc-300 bg-zinc-800 px-2.5 py-0.5 rounded text-[11px] border border-zinc-700">
              {activeOffers.length} Active {activeOffers.length === 1 ? 'Bid' : 'Bids'}
            </div>
          )}
        </div>
      </div>

      {/* DEDICATED SHARK BRAWL ALERT - Muted Palette */}
      {activeBrawl && (
        <div className="p-3 sm:p-4 bg-zinc-950/80 border-b border-zinc-800 relative z-10 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <SharkBrawlBanner
            brawl={activeBrawl}
            sharks={sharks}
            onSharkSpeak={onSharkSpeak}
            onDismiss={handleSkipActiveBrawl}
            onSkip={handleSkipActiveBrawl}
          />
        </div>
      )}

      {/* Message Stream with Muted Aesthetics */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 scroll-smooth">
        {messages.map((msg) => {
          const isPitcher = msg.sender === 'pitcher';
          const shark = getShark(msg.sharkId);

          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="text-center my-3">
                <span className="inline-block px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                  {msg.text}
                </span>
              </div>
            );
          }

          if (msg.sender === 'brawl' || msg.brawl) {
            const brawlData = msg.brawl || {
              shark1: 'kevin',
              shark2: 'mark',
              dialogue: msg.text,
              topic: 'Showdown',
              tensionLevel: 'HIGH',
            };
            const s1 = getShark(brawlData.shark1);
            const s2 = getShark(brawlData.shark2);

            return (
              <div
                key={msg.id}
                className="my-3.5 p-4 rounded-xl border border-zinc-700 bg-zinc-900/80 text-zinc-200 shadow-sm"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs font-mono">
                  <div className="flex items-center gap-2 text-zinc-300 font-semibold uppercase tracking-wider text-xs">
                    <Swords className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Shark Clash · {s1?.name || brawlData.shark1} vs {s2?.name || brawlData.shark2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 font-mono">
                      {brawlData.tensionLevel || 'HIGH'}
                    </span>
                    {activeBrawl && (
                      <button
                        onClick={handleSkipActiveBrawl}
                        className="text-xs text-zinc-300 hover:text-white underline font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <FastForward className="w-3 h-3" />
                        <span>Skip</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 py-1.5">
                  <div className="flex items-center gap-2.5">
                    <SharkAvatar sharkId={brawlData.shark1} size="sm" circular={true} />
                    <span className="font-['Cinzel'] font-bold text-zinc-200 text-xs sm:text-sm">{s1?.name}</span>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold border border-zinc-700 flex items-center justify-center">
                    VS
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="font-['Cinzel'] font-bold text-zinc-200 text-xs sm:text-sm">{s2?.name}</span>
                    <SharkAvatar sharkId={brawlData.shark2} size="sm" circular={true} />
                  </div>
                </div>

                <div className="mt-2.5 p-3 rounded-lg bg-zinc-950/70 border border-zinc-800 text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                  "{msg.text}"
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 text-[11px]">Recorded confrontation</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSharkSpeak(brawlData.shark1, msg.text)}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1 border border-zinc-700 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3 text-zinc-400" />
                      <span>Hear exchange</span>
                    </button>
                    <button
                      onClick={handleSkipActiveBrawl}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono flex items-center gap-1 border border-zinc-700 transition-colors cursor-pointer"
                    >
                      <FastForward className="w-3 h-3 text-zinc-400" />
                      <span>Skip</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          if (msg.isOutAnnouncement) {
            return (
              <div key={msg.id} className="text-center my-3">
                <div className="inline-block px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs">
                  {shark?.name || 'Shark'} closes notebook: "{msg.text}"
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isPitcher ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {isPitcher ? (
                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center font-mono text-[10px] font-bold text-zinc-200 shrink-0 select-none">
                  YOU
                </div>
              ) : (
                <SharkAvatar sharkId={msg.sharkId || 'mark'} size="sm" />
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3.5 border shadow-sm transition-all ${
                  isPitcher
                    ? 'bg-zinc-850 border-zinc-700 text-zinc-100 rounded-tr-none'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-zinc-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-zinc-200">
                      {isPitcher ? 'Founder (You)' : shark?.name || 'Shark'}
                    </span>
                    {!isPitcher && shark?.nickname && (
                      <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                        · {shark.nickname}
                      </span>
                    )}
                  </div>
                  {!isPitcher && msg.sharkId && (
                    <button
                      onClick={() => onSharkSpeak(msg.sharkId!, msg.text)}
                      className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded hover:bg-zinc-800 cursor-pointer"
                    >
                      <Volume2 className="w-2.5 h-2.5 text-zinc-400" />
                      <span>hear</span>
                    </button>
                  )}
                </div>

                <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans text-zinc-200">
                  {msg.text}
                </p>

                {/* Offer Card - Muted Design */}
                {msg.offer && (
                  <div className="mt-3 p-3.5 bg-zinc-950/80 border border-zinc-700 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
                        Investment Term Sheet
                      </div>
                      <span className="text-zinc-400 font-['Cinzel']">{shark?.name}</span>
                    </div>

                    <div className="text-base font-mono font-bold text-zinc-100 tracking-tight">
                      ${msg.offer.amount.toLocaleString()} for {msg.offer.equity}% equity
                    </div>

                    {msg.offer.royalty && (
                      <div className="text-[11px] text-zinc-300 font-mono bg-zinc-900 border border-zinc-800 p-1.5 rounded">
                        Royalty: {msg.offer.royalty.description}
                      </div>
                    )}

                    <p className="text-xs text-zinc-300 italic bg-zinc-900/60 p-2 rounded border border-zinc-800/80">
                      "{msg.offer.explanation}"
                    </p>

                    <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                      <button
                        onClick={() => onAcceptOffer(msg.offer!)}
                        className="px-3.5 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-semibold rounded border border-zinc-500 transition-colors cursor-pointer"
                      >
                        Accept Deal
                      </button>
                      <button
                        onClick={() => onOpenCounterModal(msg.offer!)}
                        className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 transition-colors cursor-pointer"
                      >
                        Counter
                      </button>
                      <button
                        onClick={() => onDeclineOffer(msg.offer!.id)}
                        className="px-3.5 py-1.5 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-xs font-mono text-zinc-400 italic p-2 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span>The Shark is reviewing your numbers in their notebook...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* ACTIVE QUESTION PANEL - Muted Styling */}
      {currentQuestion && !isLoading && (
        <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-300">
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              <span className="uppercase tracking-wider font-semibold">
                {getShark(currentQuestion.sharkId)?.name} Asks:
              </span>
            </div>
            <span className="text-zinc-400">
              Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
            </span>
          </div>

          <div className="text-xs md:text-sm text-zinc-200 font-normal leading-relaxed bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
            "{currentQuestion.question}"
          </div>

          {/* Interactive Multiple Choice Options */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Choose your strategic response:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSelectOption(option.text)}
                  className="p-2.5 rounded-lg text-left bg-zinc-950/80 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 transition-all text-xs text-zinc-200 group flex items-start gap-2.5 cursor-pointer"
                >
                  <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 font-mono font-bold flex items-center justify-center shrink-0 text-[11px] border border-zinc-700 group-hover:bg-zinc-700 transition-colors">
                    {option.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 leading-relaxed text-[11px] text-zinc-200">
                      {option.text}
                    </p>
                    <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">
                      Strategy: {option.strategy}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTINUOUS LIVE VOICE RECORDING STATUS BAR - Muted */}
      {(speechStatus.isListening || speechStatus.isTranscribing) && (
        <div className="px-5 py-2.5 bg-zinc-900 border-t border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-1 h-3.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-2.5 bg-zinc-400 rounded-full animate-bounce" />
            </div>

            <div className="min-w-0">
              <div className="text-zinc-300 uppercase font-semibold tracking-wider text-[10px]">
                {speechStatus.isTranscribing
                  ? 'TRANSCRIBING AUDIO VIA GEMINI AI...'
                  : 'MICROPHONE RECORDING ACTIVE • SPEAK FREELY'}
              </div>
              <div className="text-zinc-400 italic truncate max-w-md mt-0.5">
                "{inputText || speechStatus.interimTranscript || 'Listening to your speech...'}"
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleVoiceSendNow}
              disabled={speechStatus.isTranscribing}
              className="px-3.5 py-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-zinc-100 text-xs font-semibold font-mono rounded border border-zinc-500 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-zinc-300" />
              <span>{speechStatus.isTranscribing ? 'Transcribing...' : 'Send Spoken Answer'}</span>
            </button>
            <button
              type="button"
              onClick={handleToggleVoiceRecording}
              disabled={speechStatus.isTranscribing}
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded border border-zinc-700 flex items-center gap-1 cursor-pointer"
            >
              <Square className="w-3 h-3 text-zinc-400" />
              <span>Stop Mic</span>
            </button>
          </div>
        </div>
      )}

      {speechStatus.errorMessage && (
        <div className="px-5 py-2.5 bg-zinc-900 border-t border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>{speechStatus.errorMessage}</span>
          </div>
          <button
            onClick={() => tankSpeech.clear()}
            className="text-[11px] underline text-zinc-400 hover:text-white cursor-pointer ml-3 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Custom Answer Input Bar - Muted */}
      <form onSubmit={handleSubmit} className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2 rounded-b-xl">
        <button
          type="button"
          onClick={handleToggleVoiceRecording}
          className={`px-3 py-2 rounded transition-all font-mono text-xs flex items-center gap-1.5 border cursor-pointer ${
            speechStatus.isListening
              ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
              : 'text-zinc-300 hover:text-zinc-100 bg-zinc-900 border-zinc-800 hover:border-zinc-700'
          }`}
          title="Click to speak into microphone"
        >
          <Mic className="w-3.5 h-3.5 text-zinc-400" />
          <span>{speechStatus.isListening ? 'Mic Active' : 'Speak'}</span>
        </button>

        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            speechStatus.isListening
              ? 'Listening to you speak... click "Send Spoken Answer" when ready'
              : 'Speak into mic or type reply...'
          }
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 disabled:opacity-30 font-semibold text-xs rounded transition-colors font-mono flex items-center gap-1 cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-3 h-3 text-zinc-400" />
        </button>
      </form>
    </div>
  );
};
