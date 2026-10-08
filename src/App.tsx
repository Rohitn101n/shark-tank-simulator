import React, { useState, useEffect, useRef } from 'react';
import { PitchData, SharkStatus, SharkOffer, MessageLog, ViabilityMetrics, DebriefReport, SharkQuestion, SharkProfile } from './types/shark';
import { SHARKS } from './data/sharks';
import { TankHeader } from './components/TankHeader';
import { SharkPanel } from './components/SharkPanel';
import { FinancialDashboard } from './components/FinancialDashboard';
import { LiveTankArena } from './components/LiveTankArena';
import { PitchSetupModal } from './components/PitchSetupModal';
import { PitcherEntranceAnimation } from './components/PitcherEntranceAnimation';
import { FinalOffersShowdown } from './components/FinalOffersShowdown';
import { HandshakeAnimation } from './components/HandshakeAnimation';
import { OfferNegotiationModal } from './components/OfferNegotiationModal';
import { DebriefModal } from './components/DebriefModal';
import { tankAudio } from './utils/tankAudio';
import { sharkVoice } from './utils/speechSynthesis';
import { generateFinalSharkOffers } from './utils/dealGenerator';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function App() {
  const [pitch, setPitch] = useState<PitchData | null>(null);
  const [pendingPitch, setPendingPitch] = useState<PitchData | null>(null);
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(true);
  const [isEntranceActive, setIsEntranceActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 5-Minute (300s) Session Timer
  const [tankTimeSeconds, setTankTimeSeconds] = useState<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Final Showdown & Handshake States
  const [isShowdownOpen, setIsShowdownOpen] = useState<boolean>(false);
  const [finalOffers, setFinalOffers] = useState<SharkOffer[]>([]);
  const [acceptedOffer, setAcceptedOffer] = useState<SharkOffer | null>(null);
  const [acceptedShark, setAcceptedShark] = useState<SharkProfile | null>(null);
  const [isHandshakeActive, setIsHandshakeActive] = useState<boolean>(false);

  // Turn-by-Turn Questioning state
  const [currentQuestion, setCurrentQuestion] = useState<SharkQuestion | null>(null);

  // Shark states
  const [statuses, setStatuses] = useState<Record<string, SharkStatus>>({
    mark: 'LISTENING',
    kevin: 'LISTENING',
    lori: 'LISTENING',
    daymond: 'LISTENING',
    barbara: 'LISTENING',
  });
  const [interestScores, setInterestScores] = useState<Record<string, number>>({
    mark: 50,
    kevin: 50,
    lori: 50,
    daymond: 50,
    barbara: 50,
  });
  const [latestQuotes, setLatestQuotes] = useState<Record<string, string>>({});
  const [activeOffers, setActiveOffers] = useState<SharkOffer[]>([]);
  const [speakingSharkId, setSpeakingSharkId] = useState<string | null>(null);

  // Drama state
  const [activeBrawl, setActiveBrawl] = useState<{ shark1: string; shark2: string; dialogue: string } | null>(null);
  const [shotClockSeconds, setShotClockSeconds] = useState<number | null>(null);
  const shotClockRef = useRef<NodeJS.Timeout | null>(null);

  // Metrics and Logs
  const [viability, setViability] = useState<ViabilityMetrics | null>(null);
  const [messages, setMessages] = useState<MessageLog[]>([]);

  // Modals
  const [selectedOfferForModal, setSelectedOfferForModal] = useState<SharkOffer | null>(null);
  const [debriefReport, setDebriefReport] = useState<DebriefReport | null>(null);
  const [isDebriefOpen, setIsDebriefOpen] = useState<boolean>(false);

  // Audio toggles
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);

  const handleToggleAudio = () => {
    const muted = tankAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleToggleVoice = () => {
    const enabled = sharkVoice.toggle();
    setIsVoiceEnabled(enabled);
  };

  const handleSharkSpeak = (speakerId: string, text: string) => {
    setSpeakingSharkId(speakerId);
    sharkVoice.speak(speakerId, text);
    setTimeout(() => {
      setSpeakingSharkId(null);
    }, 4500);
  };

  // Step 1: User submits pitch setup form -> Launch Entrance Animation
  const handleStartPitch = (newPitch: PitchData) => {
    setPendingPitch(newPitch);
    setIsSetupOpen(false);
    setIsEntranceActive(true);
  };

  // 5-Minute Timer Countdown Effect
  useEffect(() => {
    if (tankTimeSeconds === null) return;

    if (tankTimeSeconds > 0) {
      timerIntervalRef.current = setTimeout(() => {
        setTankTimeSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (tankTimeSeconds === 0) {
      // 5 minutes reached: Trigger Final Offers Showdown!
      triggerFinalOffersShowdown();
    }

    return () => {
      if (timerIntervalRef.current) clearTimeout(timerIntervalRef.current);
    };
  }, [tankTimeSeconds]);

  // Step 2: Entrance animation completes -> Deliver Opening Summary & Start Timer
  const handleEntranceComplete = async () => {
    if (!pendingPitch) return;
    const currentPitch = pendingPitch;
    setIsEntranceActive(false);
    setPitch(currentPitch);
    setIsLoading(true);

    // Start 5-minute (300s) deliberation countdown
    setTankTimeSeconds(300);

    const initialStatuses: Record<string, SharkStatus> = {
      mark: 'LISTENING',
      kevin: 'LISTENING',
      lori: 'LISTENING',
      daymond: 'LISTENING',
      barbara: 'LISTENING',
    };
    setStatuses(initialStatuses);
    setActiveOffers([]);
    setActiveBrawl(null);
    setShotClockSeconds(null);
    setCurrentQuestion(null);

    // Opening Pitch Summary
    const pitcherSummary = `Hello Sharks, my name is Alex and my company is ${currentPitch.businessName}. Today we are seeking $${currentPitch.askAmount.toLocaleString()} in exchange for ${currentPitch.askEquity}% equity in our business. ${currentPitch.tagline}. ${currentPitch.pitchText} Last year, we did $${currentPitch.annualSales.toLocaleString()} in sales. We are here today to scale and secure a strategic partner. Sharks, who is ready to partner with us?`;

    const initialMessages: MessageLog[] = [
      {
        id: 'msg_sys_entrance',
        sender: 'system',
        text: 'The heavy broadcast doors slide shut. You stand on the carpet marker facing the Sharks with their notebooks.',
        timestamp: Date.now(),
      },
      {
        id: 'msg_pitcher_summary',
        sender: 'pitcher',
        text: pitcherSummary,
        timestamp: Date.now() + 20,
      },
    ];
    setMessages(initialMessages);

    if (isVoiceEnabled) {
      handleSharkSpeak('pitcher', pitcherSummary);
    }

    try {
      const res = await fetch('/api/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch: currentPitch }),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      setViability(data.viability);

      if (data.firstQuestion) {
        setCurrentQuestion(data.firstQuestion);
        setStatuses((prev) => ({
          ...prev,
          [data.firstQuestion.sharkId]: 'QUESTIONING',
        }));
        setLatestQuotes((prev) => ({
          ...prev,
          [data.firstQuestion.sharkId]: data.firstQuestion.question,
        }));

        initialMessages.push({
          id: `msg_question_${data.firstQuestion.id}`,
          sender: 'shark',
          sharkId: data.firstQuestion.sharkId,
          text: data.firstQuestion.question,
          timestamp: Date.now() + 500,
        });
        setMessages([...initialMessages]);

        if (isVoiceEnabled) {
          setTimeout(() => {
            handleSharkSpeak(data.firstQuestion.sharkId, data.firstQuestion.question);
          }, 3500);
        }
      }

      if (data.sharkBrawl) {
        setActiveBrawl(data.sharkBrawl);
        tankAudio.playBrawlClash();
        initialMessages.push({
          id: `msg_brawl_${Date.now()}`,
          sender: 'brawl',
          text: data.sharkBrawl.dialogue,
          timestamp: Date.now() + 600,
          brawl: data.sharkBrawl,
        });
        setMessages([...initialMessages]);
      }
    } catch (err) {
      console.error('Failed to evaluate pitch:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Turn-by-Turn Answering
  const handleAnswerQuestion = async (userAnswerText: string) => {
    if (!pitch || !currentQuestion || isLoading) return;

    const answeredQ = currentQuestion;
    const userMsg: MessageLog = {
      id: `msg_user_answer_${Date.now()}`,
      sender: 'pitcher',
      text: userAnswerText,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitch,
          answeredQuestion: answeredQ,
          userAnswerText,
          currentStatuses: statuses,
          currentScores: interestScores,
          activeOffers,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      const newStatuses = { ...statuses };
      const newScores = { ...interestScores };
      const newQuotes = { ...latestQuotes };
      const currentOffers = [...activeOffers];
      const newMsgList = [...updatedMessages];

      if (data.sharkReaction) {
        const sr = data.sharkReaction;
        newStatuses[sr.sharkId] = sr.status || newStatuses[sr.sharkId];
        if (sr.interestScore !== undefined) newScores[sr.sharkId] = sr.interestScore;
        newQuotes[sr.sharkId] = sr.dialogue;

        if (sr.status === 'OUT') {
          tankAudio.playBuzzer();
        }

        newMsgList.push({
          id: `msg_reaction_${sr.sharkId}_${Date.now()}`,
          sender: 'shark',
          sharkId: sr.sharkId,
          text: sr.dialogue,
          timestamp: Date.now() + 100,
          offer: sr.offer || undefined,
          isOutAnnouncement: sr.status === 'OUT',
        });

        if (isVoiceEnabled) {
          handleSharkSpeak(sr.sharkId, sr.dialogue);
        }
      }

      if (data.newOffer) {
        tankAudio.playCashDing();
        currentOffers.push(data.newOffer);
      }

      // Next Question or Trigger Final Offers
      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        newStatuses[data.nextQuestion.sharkId] = 'QUESTIONING';
        newQuotes[data.nextQuestion.sharkId] = data.nextQuestion.question;

        newMsgList.push({
          id: `msg_question_${data.nextQuestion.id}`,
          sender: 'shark',
          sharkId: data.nextQuestion.sharkId,
          text: data.nextQuestion.question,
          timestamp: Date.now() + 400,
        });

        if (isVoiceEnabled) {
          setTimeout(() => {
            handleSharkSpeak(data.nextQuestion.sharkId, data.nextQuestion.question);
          }, 3500);
        }
      } else {
        // All 5 questions answered -> Automatically trigger Final Offers Showdown!
        setCurrentQuestion(null);
        setTimeout(() => {
          triggerFinalOffersShowdown();
        }, 1200);
      }

      if (data.sharkBrawl) {
        setActiveBrawl(data.sharkBrawl);
        tankAudio.playBrawlClash();
        newMsgList.push({
          id: `msg_brawl_${Date.now()}`,
          sender: 'brawl',
          text: data.sharkBrawl.dialogue,
          timestamp: Date.now() + 250,
          brawl: data.sharkBrawl,
        });
      }

      setStatuses(newStatuses);
      setInterestScores(newScores);
      setLatestQuotes(newQuotes);
      setActiveOffers(currentOffers);
      setMessages(newMsgList);
    } catch (err) {
      console.error('Error answering question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Final Competing Offers Showdown
  const triggerFinalOffersShowdown = () => {
    if (!pitch) return;
    tankAudio.playCashDing();
    const generatedOffers = generateFinalSharkOffers(pitch, statuses, interestScores);
    setFinalOffers(generatedOffers);
    setIsShowdownOpen(true);
  };

  // User accepts a deal from any one Shark -> Trigger Handshake Animation!
  const handleAcceptDeal = (offer: SharkOffer) => {
    const chosenShark = SHARKS.find((s) => s.id === offer.sharkId);
    if (!chosenShark) return;

    setIsShowdownOpen(false);
    setSelectedOfferForModal(null);
    setAcceptedOffer(offer);
    setAcceptedShark(chosenShark);

    // Stop 5-minute timer
    if (timerIntervalRef.current) clearTimeout(timerIntervalRef.current);
    setTankTimeSeconds(null);

    // Launch the Handshake Animation!
    setIsHandshakeActive(true);
  };

  // When Handshake Animation completes -> Show Executed Term Sheet Debrief
  const handleHandshakeComplete = () => {
    setIsHandshakeActive(false);
    if (acceptedOffer && acceptedShark) {
      handleConcludePitch(true, acceptedOffer);
    }
  };

  const handleDeclineOffer = (offerId: string) => {
    setActiveOffers((prev) => prev.filter((o) => o.id !== offerId));
    tankAudio.playBuzzer();
  };

  const handleCounterOffer = (counterText: string, _originalOffer: SharkOffer) => {
    handleAnswerQuestion(counterText);
  };

  const handleConcludePitch = async (dealClosed: boolean = false, winningDeal?: SharkOffer) => {
    if (!pitch) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitch,
          history: messages,
          outcome: { dealClosed, winningDeal },
        }),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const report: DebriefReport = await res.json();
      setDebriefReport(report);
      setIsDebriefOpen(true);
    } catch (err) {
      console.error('Error generating debrief:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartPitch = () => {
    setIsDebriefOpen(false);
    setIsSetupOpen(true);
    setPitch(null);
    setPendingPitch(null);
    setCurrentQuestion(null);
    setAcceptedOffer(null);
    setAcceptedShark(null);
    setIsHandshakeActive(false);
    setIsShowdownOpen(false);
    if (timerIntervalRef.current) clearTimeout(timerIntervalRef.current);
    setTankTimeSeconds(null);
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-200 flex flex-col selection:bg-zinc-700 selection:text-zinc-100">
      {/* Top Header */}
      <TankHeader
        pitch={pitch}
        tankTimeSeconds={tankTimeSeconds}
        isAudioMuted={isAudioMuted}
        isVoiceEnabled={isVoiceEnabled}
        activeBrawl={activeBrawl}
        onToggleAudio={handleToggleAudio}
        onToggleVoice={handleToggleVoice}
        onNewPitch={() => setIsSetupOpen(true)}
        onConcludePitch={() => handleConcludePitch(activeOffers.length > 0, activeOffers[0])}
        onTriggerFinalDeals={triggerFinalOffersShowdown}
        onSkipBrawl={() => {
          sharkVoice.stop();
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          setActiveBrawl(null);
        }}
      />

      {/* Main Studio Arena */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-4">
        {/* 5 Shark Characters Sitting with Notebooks */}
        <section>
          <SharkPanel
            sharks={SHARKS}
            statuses={statuses}
            interestScores={interestScores}
            latestQuotes={latestQuotes}
            activeOffers={activeOffers}
            speakingSharkId={speakingSharkId}
            currentQuestioningSharkId={currentQuestion?.sharkId}
            onSharkSpeak={handleSharkSpeak}
            onOpenOffer={(offer) => setSelectedOfferForModal(offer)}
          />
        </section>

        {/* Floor: Conversation & Turn-by-Turn Questioning */}
        {pitch && !isEntranceActive && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <LiveTankArena
                sharks={SHARKS}
                messages={messages}
                activeOffers={activeOffers}
                shotClockSeconds={shotClockSeconds}
                activeBrawl={activeBrawl}
                currentQuestion={currentQuestion}
                isLoading={isLoading}
                onSelectOption={handleAnswerQuestion}
                onSendMessage={handleAnswerQuestion}
                onAcceptOffer={handleAcceptDeal}
                onOpenCounterModal={(offer) => setSelectedOfferForModal(offer)}
                onDeclineOffer={handleDeclineOffer}
                onSharkSpeak={handleSharkSpeak}
                onDismissBrawl={() => setActiveBrawl(null)}
              />
            </div>

            <div className="lg:col-span-4">
              <FinancialDashboard pitch={pitch} viability={viability} />
            </div>
          </section>
        )}

        {/* If no pitch active yet, show high-energy invitation to enter the Tank */}
        {!pitch && !isEntranceActive && (
          <section className="bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-[#07090e] border border-zinc-800 rounded-2xl p-6 md:p-8 text-center relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(161,161,170,0.06),transparent_70%)] pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-3.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium bg-zinc-850 text-zinc-300 border border-zinc-700">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                BROADCAST STAGE READY
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 font-['Cinzel']">
                Step Onto The Carpet Marker
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Pitch your own company to the 5 Sharks. Enter your ask, equity, sales, and unit margins. Answer turn-by-turn cross-examination questions, survive clashing Shark brawls, and seal a handshake deal.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSetupOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold font-mono text-xs sm:text-sm rounded-xl border border-zinc-600 shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>ENTER YOUR COMPANY DETAILS & PITCH</span>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Pitch Setup Modal (100% blank input fields) */}
      <PitchSetupModal
        isOpen={isSetupOpen}
        onStartPitch={handleStartPitch}
        onClose={() => setIsSetupOpen(false)}
      />

      {/* Cinematic Pitcher Entrance Animation */}
      {isEntranceActive && pendingPitch && (
        <PitcherEntranceAnimation
          pitch={pendingPitch}
          sharks={SHARKS}
          onEntranceComplete={handleEntranceComplete}
        />
      )}

      {/* Final Offers Showdown Modal (All active Sharks lay their deals on the table) */}
      <FinalOffersShowdown
        isOpen={isShowdownOpen}
        offers={finalOffers}
        sharks={SHARKS}
        onAcceptDeal={handleAcceptDeal}
        onWalkAway={() => {
          setIsShowdownOpen(false);
          handleConcludePitch(false);
        }}
      />

      {/* Cinematic Handshake Deal Animation */}
      {isHandshakeActive && acceptedOffer && acceptedShark && pitch && (
        <HandshakeAnimation
          acceptedOffer={acceptedOffer}
          acceptedShark={acceptedShark}
          companyName={pitch.businessName}
          onAnimationComplete={handleHandshakeComplete}
        />
      )}

      {/* Offer Negotiation Modal */}
      <OfferNegotiationModal
        offer={selectedOfferForModal}
        shark={SHARKS.find((s) => s.id === selectedOfferForModal?.sharkId)}
        isOpen={!!selectedOfferForModal}
        onClose={() => setSelectedOfferForModal(null)}
        onAccept={handleAcceptDeal}
        onCounter={handleCounterOffer}
        onDecline={handleDeclineOffer}
      />

      {/* Debrief Report Card Modal */}
      <DebriefModal
        report={debriefReport}
        pitch={pitch || { businessName: 'Your Venture', tagline: '', pitchText: '', askAmount: 0, askEquity: 0, annualSales: 0, cogs: 0, retailPrice: 0, patents: '', category: '' }}
        sharks={SHARKS}
        isOpen={isDebriefOpen}
        onClose={() => setIsDebriefOpen(false)}
        onRestartPitch={handleRestartPitch}
      />
    </div>
  );
}
