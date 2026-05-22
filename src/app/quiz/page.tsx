'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStudy, Flashcard } from '../../context/StudyContext';
import Sidebar from '../../components/Sidebar';
import PomodoroTimer from '../../components/PomodoroTimer';
import { generateQuizQuestions, GeneratedQuestion } from '../../services/ai';
import { 
  Award, 
  Layers, 
  HelpCircle, 
  Check, 
  X, 
  ChevronRight, 
  RefreshCcw, 
  Sparkles, 
  BrainCircuit,
  Volume2
} from 'lucide-react';

function QuizPageContent() {
  const searchParams = useSearchParams();
  const { 
    subjects, 
    flashcards, 
    updateFlashcardBox, 
    saveQuizResult, 
    apiKey, 
    addXp,
    theme
  } = useStudy();

  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // 1. FLASHCARD STATES
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsReviewedCount, setCardsReviewedCount] = useState(0);

  // 2. QUIZ STATES
  const [quizQuestions, setQuizQuestions] = useState<GeneratedQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isOptionSubmitted, setIsOptionSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [questionsCount, setQuestionsCount] = useState(3);

  // Parse URL tab query parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'flashcards' || tab === 'quiz') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Set default subject
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects]);

  // Filter flashcard decks on subject change
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const filtered = flashcards.filter(c => c.subjectId === selectedSubjectId && c.nextReviewDate <= todayStr);
    
    // Fallback: If no cards due today, load all subject cards to allow endless reviewing!
    if (filtered.length === 0) {
      setDeck(flashcards.filter(c => c.subjectId === selectedSubjectId));
    } else {
      setDeck(filtered);
    }
    
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCardsReviewedCount(0);
  }, [selectedSubjectId, flashcards]);

  // 3. Leitner flashcard card actions
  const handleCardResult = (isCorrect: boolean) => {
    if (deck.length === 0) return;
    
    const activeCard = deck[currentCardIndex];
    
    // Update Spaced Repetition Box & Schedule
    updateFlashcardBox(activeCard.id, isCorrect);
    
    setCardsReviewedCount(prev => prev + 1);
    
    // Increment index
    setIsFlipped(false);
    setTimeout(() => {
      if (currentCardIndex < deck.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        // Deck complete! Re-fetch to clear already reviewed items
        setDeck([]);
      }
    }, 200);
  };

  // 4. Quiz MCQ Generation Actions
  const handleMaterializeQuiz = async () => {
    if (!selectedSubjectId || isQuizLoading) return;
    setIsQuizLoading(true);
    setIsQuizFinished(false);
    setQuizQuestions([]);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setSelectedOptionIndex(null);
    setIsOptionSubmitted(false);

    try {
      const subjectName = subjects.find(s => s.id === selectedSubjectId)?.name || 'General';
      const sampleNoteText = "Transformers solve sequential RNN bottle-necks. Self attention computes matrices Q, K, V with soft-max scale. Leitner spaced flashcards sort card boxes 1-5 to space memory review intervals.";
      
      const mcqs = await generateQuizQuestions(subjectName, sampleNoteText, questionsCount, apiKey);
      setQuizQuestions(mcqs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (isOptionSubmitted) return;
    setSelectedOptionIndex(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null || isOptionSubmitted) return;
    
    setIsOptionSubmitted(true);
    const correctIdx = quizQuestions[currentQuizIndex].correctIndex;
    
    if (selectedOptionIndex === correctIdx) {
      setQuizScore(prev => prev + 1);
      addXp(20); // Small correct answer reward
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedOptionIndex(null);
    setIsOptionSubmitted(false);

    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Quiz complete! Log results to history
      const title = `${subjects.find(s => s.id === selectedSubjectId)?.name || 'Subject'} Active MCQ Quiz`;
      saveQuizResult(title, selectedSubjectId, quizScore, quizQuestions.length);
      setIsQuizFinished(true);
    }
  };

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      
      {/* Sidebar shell wrapper */}
      <Sidebar />

      {/* Main Playroom Frame */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-pink-500/5 blur-3xl pointer-events-none animate-pulse-glow" />

        {/* Header navigation bar */}
        <header className="pb-6 border-b border-white/5 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-20">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Revision & Gamification Room
            </h1>
            <p className="text-xs text-text-muted">Reinforce first-principles memory schemas using Duolingo-styled MCQs and 3D Leitner flip decks.</p>
          </div>

          {/* Subject selections */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-text-muted uppercase">TOPIC:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-color text-xs font-semibold text-text-primary"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Tab Selection menu */}
        <div className="flex items-center border-b border-white/5 pb-4 mb-6 gap-6 relative z-10">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer
              ${activeTab === 'flashcards' 
                ? 'border-pink-500 text-white font-black' 
                : 'border-transparent text-text-muted hover:text-white'}`}
          >
            <Layers size={15} />
            3D Spaced Flashcards
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer
              ${activeTab === 'quiz' 
                ? 'border-indigo-500 text-white font-black' 
                : 'border-transparent text-text-muted hover:text-white'}`}
          >
            <Award size={15} />
            Active MCQ Quiz
          </button>
        </div>

        {/* Core content arena */}
        <div className="max-w-2xl mx-auto relative z-10">
          
          {/* TAB 1: 3D spaced Flashcards */}
          {activeTab === 'flashcards' && (
            <div className="space-y-6">
              
              {deck.length > 0 && currentCardIndex < deck.length ? (
                <div className="space-y-8 flex flex-col items-center">
                  
                  {/* Visual card counter progress */}
                  <div className="w-full flex justify-between items-center text-xs text-text-muted">
                    <span>Reviewed: **{cardsReviewedCount}**</span>
                    <span>Card **{currentCardIndex + 1}** of **{deck.length}**</span>
                  </div>

                  {/* 3D perspective flip card container */}
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full aspect-[5/3] cursor-pointer group relative perspective-1000 select-none"
                  >
                    <div 
                      className={`w-full h-full duration-500 transform-style-3d relative rounded-3xl border border-white/10 shadow-2xl transition-transform
                        ${isFlipped ? 'rotate-y-180' : ''}`}
                    >
                      {/* CARD FRONT PANEL */}
                      <div className="absolute inset-0 backface-hidden rounded-3xl bg-[#0f1626]/90 border border-white/5 p-8 flex flex-col justify-between items-center text-center">
                        <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">QUESTION CARD (BOX {deck[currentCardIndex].box})</span>
                        
                        <p className="text-base sm:text-lg font-bold text-white max-w-md leading-relaxed selection:bg-indigo-500/40">
                          {deck[currentCardIndex].front}
                        </p>
                        
                        <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase animate-pulse">
                          Click card to flip
                        </span>
                      </div>

                      {/* CARD BACK PANEL */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-indigo-950/90 border border-indigo-500/25 p-8 flex flex-col justify-between items-center text-center">
                        <span className="text-[10px] font-bold tracking-widest text-pink-400 uppercase">ANSWER CORE KEY</span>
                        
                        <p className="text-xs sm:text-sm font-semibold text-text-primary leading-relaxed max-w-md whitespace-pre-wrap">
                          {deck[currentCardIndex].back}
                        </p>
                        
                        <span className="text-[10px] text-text-muted font-bold uppercase">Click to flip back</span>
                      </div>
                    </div>
                  </div>

                  {/* Leitner Actions Selector panel (visible only when flipped) */}
                  <div className={`flex gap-4 w-full transition-opacity duration-300
                    ${isFlipped ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                  >
                    <button
                      onClick={() => handleCardResult(false)}
                      className="flex-1 py-3 px-5 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 text-red-400 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X size={14} />
                      Study Again (Box 1 reset)
                    </button>

                    <button
                      onClick={() => handleCardResult(true)}
                      className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:scale-102 font-bold text-white text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/10"
                    >
                      <Check size={14} />
                      Know It (Promote Box + XP!)
                    </button>
                  </div>

                </div>
              ) : (
                /* Empty deck card review completition */
                <div className="glass-panel border border-color rounded-3xl p-8 text-center space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mx-auto">
                    <Check size={28} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">Spaced deck Fully Reviewed!</h3>
                    <p className="text-xs text-text-muted max-w-sm mx-auto leading-normal">
                      Excellent work! You have finished reviewing all active memory flashcards for this subject today. Check back tomorrow!
                    </p>
                  </div>
                  <button
                    onClick={() => setDeck(flashcards.filter(c => c.subjectId === selectedSubjectId))}
                    className="px-4.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-color text-text-muted hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Review Endless mode
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: MCQ Quiz */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              
              {quizQuestions.length === 0 && !isQuizFinished && (
                /* 1. Quiz Settings panel selector */
                <div className="glass-panel border border-color rounded-3xl p-6 space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                      <BrainCircuit size={16} className="text-indigo-400" />
                      Materialize Active MCQ Quiz
                    </h3>
                    <p className="text-[10px] text-text-muted">
                      Select subject and compile. Our AI service automatically scans notes to write dynamic MCQs with first-principles explanations.
                    </p>
                  </div>

                  {/* MCQ Questions length */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase">Quiz Size (Questions):</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[3, 5, 10].map(count => (
                        <button
                          key={count}
                          onClick={() => setQuestionsCount(count)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer
                            ${questionsCount === count 
                              ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                              : 'bg-white/5 border-color text-text-muted hover:text-white'}`}
                        >
                          {count} Questions
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleMaterializeQuiz}
                    disabled={isQuizLoading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 font-extrabold text-white text-sm shadow-xl shadow-indigo-500/10 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isQuizLoading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin animate-pulse" />
                        Generating Quiz Matrices...
                      </>
                    ) : (
                      <>
                        Generate Quiz Decks
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* 2. Active MCQ Game Loop */}
              {quizQuestions.length > 0 && !isQuizFinished && (
                <div className="space-y-6">
                  
                  {/* Header progress meters */}
                  <div className="flex justify-between items-center text-xs text-text-muted">
                    <span className="font-bold text-indigo-400">XP Streak active</span>
                    <span>Question **{currentQuizIndex + 1}** of **{quizQuestions.length}**</span>
                  </div>

                  {/* Horizontal progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>

                  {/* Active Question Title */}
                  <div className="p-5 rounded-2xl bg-[#0f1626]/80 border border-white/5 text-center py-6">
                    <p className="text-sm sm:text-base font-extrabold leading-normal text-white">
                      {quizQuestions[currentQuizIndex].question}
                    </p>
                  </div>

                  {/* MCQ Option selector cards */}
                  <div className="space-y-2.5">
                    {quizQuestions[currentQuizIndex].options.map((option, idx) => {
                      const isSelected = selectedOptionIndex === idx;
                      const correctIdx = quizQuestions[currentQuizIndex].correctIndex;
                      
                      let btnStyle = 'bg-white/5 border-color hover:border-white/15 text-text-primary';
                      if (isSelected) {
                        btnStyle = 'bg-indigo-600/10 border-indigo-500 text-white';
                      }

                      if (isOptionSubmitted) {
                        if (idx === correctIdx) {
                          btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-extrabold';
                        } else if (isSelected) {
                          btnStyle = 'bg-red-500/15 border-red-500 text-red-400 font-extrabold';
                        } else {
                          btnStyle = 'bg-white/2 border-transparent text-text-muted opacity-40';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          disabled={isOptionSubmitted}
                          className={`w-full p-4 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between cursor-pointer transition-all duration-200
                            ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {isOptionSubmitted && idx === correctIdx && <Check size={14} className="text-emerald-400" />}
                          {isOptionSubmitted && isSelected && idx !== correctIdx && <X size={14} className="text-red-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* First principles detailed explanation panel */}
                  {isOptionSubmitted && (
                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                      <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <HelpCircle size={13} />
                        First Principles Explanation
                      </h4>
                      <p className="text-[11px] text-text-muted leading-relaxed font-semibold">
                        {quizQuestions[currentQuizIndex].explanation}
                      </p>
                    </div>
                  )}

                  {/* Controls console */}
                  <div className="flex justify-end">
                    {!isOptionSubmitted ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={selectedOptionIndex === null}
                        className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors font-bold text-white text-xs disabled:opacity-40 cursor-pointer shadow-lg shadow-indigo-600/15"
                      >
                        Verify Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuizQuestion}
                        className="py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:scale-102 transition-all font-bold text-white text-xs cursor-pointer shadow-lg flex items-center gap-1"
                      >
                        {currentQuizIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>

                </div>
              )}

              {/* 3. Quiz Completion screen */}
              {isQuizFinished && (
                <div className="glass-panel border border-color rounded-3xl p-6 text-center space-y-6">
                  
                  <div className="w-14 h-14 rounded-full bg-yellow-500/15 flex items-center justify-center text-yellow-400 mx-auto animate-bounce">
                    <Award size={28} />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl font-black text-white">Quiz complete!</h3>
                    <p className="text-xs text-text-muted max-w-sm mx-auto leading-normal">
                      Excellent work! You answered **{quizScore} out of {quizQuestions.length} questions** correctly.
                    </p>
                  </div>

                  {/* XP Gain badge logs */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs select-none">
                    <Sparkles size={14} className="text-yellow-400" />
                    +{Math.floor((quizScore / quizQuestions.length) * 200)} XP Earned!
                  </div>

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleMaterializeQuiz}
                      className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={() => {
                        setQuizQuestions([]);
                        setIsQuizFinished(false);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-color text-text-muted hover:text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Back to Setup
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* Floating Pomodoro controller */}
      <PomodoroTimer />
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-primary text-text-muted text-xs">
        Loading Gamification Room...
      </div>
    }>
      <QuizPageContent />
    </Suspense>
  );
}
