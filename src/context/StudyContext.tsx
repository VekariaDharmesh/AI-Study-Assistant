'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Data Definitions
export interface User {
  name: string;
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  lastActiveDate: string;
  avatar: string;
  rankName: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // hex or Tailwind name
  xp: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  type: 'pdf' | 'doc' | 'voice';
  summary?: string;
  revisionSheet?: string;
  date: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subjectId: string;
  noteId?: string;
  box: number; // 1 to 5 (Leitner System)
  nextReviewDate: string;
}

export interface Quiz {
  id: string;
  title: string;
  subjectId: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  date: string;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
  xpEarned: number;
}

export interface PomodoroSession {
  id: string;
  subjectId?: string;
  duration: number; // minutes
  date: string;
  type: 'focus' | 'short_break' | 'long_break';
}

export interface LeaderboardUser {
  name: string;
  level: number;
  xp: number;
  streak: number;
  avatar: string;
  isUser?: boolean;
}

interface StudyContextType {
  user: User;
  subjects: Subject[];
  notes: Note[];
  flashcards: Flashcard[];
  quizzes: Quiz[];
  tasks: Task[];
  pomodoros: PomodoroSession[];
  leaderboard: LeaderboardUser[];
  theme: 'midnight' | 'emerald' | 'cyberpunk' | 'rosegold';
  apiKey: string;
  focusMode: boolean;
  soundEnabled: boolean;
  
  // Actions
  addXp: (amount: number) => void;
  addSubject: (name: string, icon: string, color: string) => void;
  addNote: (title: string, content: string, subjectId: string, type: 'pdf' | 'doc' | 'voice', summary?: string, revisionSheet?: string) => string;
  deleteNote: (noteId: string) => void;
  addFlashcard: (front: string, back: string, subjectId: string, noteId?: string) => void;
  updateFlashcardBox: (cardId: string, isCorrect: boolean) => void;
  saveQuizResult: (title: string, subjectId: string, score: number, totalQuestions: number) => void;
  addTask: (title: string, subjectId: string, dueDate: string, estimatedPomodoros: number) => void;
  completeTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  incrementPomodoroProgress: (taskId: string) => void;
  logPomodoroSession: (subjectId: string | undefined, duration: number, type: 'focus' | 'short_break' | 'long_break') => void;
  setTheme: (theme: 'midnight' | 'emerald' | 'cyberpunk' | 'rosegold') => void;
  setApiKey: (key: string) => void;
  setFocusMode: (mode: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  triggerStreakCheck: () => void;
  resetAllData: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

// Initial Sample Data (Preloads Aura Study with beautiful portfolio filler content)
const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'AI & Neural Networks', icon: 'BrainCircuit', color: '#6366f1', xp: 450 },
  { id: 'sub-2', name: 'Advanced Algorithms', icon: 'Code', color: '#10b981', xp: 220 },
  { id: 'sub-3', name: 'UX/UI Design Systems', icon: 'Sparkles', color: '#ec4899', xp: 180 },
  { id: 'sub-4', name: 'Next.js 15 Concepts', icon: 'Layers', color: '#06b6d4', xp: 90 },
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Transformer Architecture & Self-Attention',
    content: 'The Transformer architecture, introduced by Vaswani et al. in 2017, relies entirely on self-attention mechanisms to model global dependencies. The Core formula for Scaled Dot-Product Attention is:\n\nAttention(Q, K, V) = softmax(QK^T / sqrt(d_k))V\n\nUnlike RNNs, Transformers process entire sequences concurrently, allowing high levels of parallelization and achieving state-of-the-art results in NLP and vision tasks.',
    subjectId: 'sub-1',
    type: 'pdf',
    summary: '• Transformer architectures completely replaced sequential RNNs by processing tokens in parallel.\n• Self-Attention computes key-query matches to dynamically weigh token dependencies.\n• Softmax scaling avoids gradient vanishing in high-dimensional vector math.',
    revisionSheet: '# Revision Guide: Transformers\n- **Encoder:** Reads inputs and builds continuous representations.\n- **Decoder:** Generates outputs autoregressively using masked self-attention.\n- **Multi-Head Attention:** Multiplies projection layers to capture different relational aspects simultaneously.',
    date: '2026-05-20'
  },
  {
    id: 'note-2',
    title: 'Spaced Repetition & Spacing Effect',
    content: 'Ebbinghaus first described the Forgetting Curve in 1885, proving memory retention drops exponentially over time. Spaced repetition counteracts this by reviewing materials at expanding mathematical intervals (1d, 3d, 7d, 14d, 30d). The Leitner system manages flashcards in five incremental boxes, promoting cards to larger intervals upon correct answers, and resetting them back upon failure.',
    subjectId: 'sub-3',
    type: 'doc',
    summary: '• Memory degrades exponentially; review resets the forgetting rate.\n• Leitner uses 5 physical/digital boxes to sort review frequencies.\n• Space expansion locks information into active long-term cerebral storage.',
    revisionSheet: '# Leitner Review Intervals\n1. **Box 1:** Every day\n2. **Box 2:** Every 3 days\n3. **Box 3:** Every 7 days\n4. **Box 4:** Every 14 days\n5. **Box 5:** Every 30 days',
    date: '2026-05-21'
  }
];

const INITIAL_FLASHCARDS: Flashcard[] = [
  { id: 'card-1', front: 'What is the mathematical equation for Scaled Dot-Product Attention?', back: 'Attention(Q, K, V) = softmax( QK^T / sqrt(d_k) ) * V', subjectId: 'sub-1', noteId: 'note-1', box: 2, nextReviewDate: '2026-05-24' },
  { id: 'card-2', front: 'Who introduced the Transformer architecture and in what year?', back: 'Vaswani et al. in the landmark 2017 paper "Attention Is All You Need".', subjectId: 'sub-1', noteId: 'note-1', box: 1, nextReviewDate: '2026-05-22' },
  { id: 'card-3', front: 'What is the Spacing Effect?', back: 'The psychological finding that learning is highly effective when review sessions are spaced out over time, rather than crammed.', subjectId: 'sub-3', noteId: 'note-2', box: 3, nextReviewDate: '2026-05-28' },
  { id: 'card-4', front: 'Explain the difference between Time Complexity of QuickSort in Best and Worst cases.', back: 'Best Case: O(N log N) when pivots split arrays equally. Worst Case: O(N^2) when elements are already sorted and pivots are extreme.', subjectId: 'sub-2', box: 1, nextReviewDate: '2026-05-22' }
];

const INITIAL_TASKS: Task[] = [
  { id: 'task-1', title: 'Complete Transformer architecture self-explanation sheet', subjectId: 'sub-1', dueDate: '2026-05-23', estimatedPomodoros: 3, completedPomodoros: 2, completed: false, xpEarned: 0 },
  { id: 'task-2', title: 'Implement QuickSort and MergeSort visualizations', subjectId: 'sub-2', dueDate: '2026-05-22', estimatedPomodoros: 2, completedPomodoros: 2, completed: true, xpEarned: 50 },
  { id: 'task-3', title: 'Design Glassmorphism Dashboard tokens', subjectId: 'sub-3', dueDate: '2026-05-24', estimatedPomodoros: 4, completedPomodoros: 0, completed: false, xpEarned: 0 }
];

const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { name: 'Alex Rivera (Socrates)', level: 24, xp: 12450, streak: 42, avatar: '🦊' },
  { name: 'Chloe Chen (Duolingo Fan)', level: 21, xp: 9800, streak: 28, avatar: '🐼' },
  { name: 'Dharmesh (You)', level: 12, xp: 2800, streak: 8, avatar: '⚡', isUser: true },
  { name: 'Marcus Aurelius', level: 11, xp: 2650, streak: 15, avatar: '🦁' },
  { name: 'Luna Star', level: 9, xp: 1950, streak: 5, avatar: '🦄' }
];

const XP_PER_LEVEL = 1000;

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // State variables
  const [user, setUser] = useState<User>({
    name: 'Dharmesh',
    level: 12,
    xp: 800,
    totalXp: 12800,
    streak: 8,
    lastActiveDate: '2026-05-21',
    avatar: '⚡',
    rankName: 'Scholar Master'
  });
  
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(INITIAL_FLASHCARDS);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [pomodoros, setPomodoros] = useState<PomodoroSession[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);
  const [theme, setThemeState] = useState<'midnight' | 'emerald' | 'cyberpunk' | 'rosegold'>('midnight');
  const [apiKey, setApiKeyState] = useState<string>('');
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  // 1. Sync from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('aura_user');
      const storedSubjects = localStorage.getItem('aura_subjects');
      const storedNotes = localStorage.getItem('aura_notes');
      const storedFlashcards = localStorage.getItem('aura_flashcards');
      const storedQuizzes = localStorage.getItem('aura_quizzes');
      const storedTasks = localStorage.getItem('aura_tasks');
      const storedPomodoros = localStorage.getItem('aura_pomodoros');
      const storedLeaderboard = localStorage.getItem('aura_leaderboard');
      const storedTheme = localStorage.getItem('aura_theme');
      const storedApiKey = localStorage.getItem('aura_apiKey');
      const storedSound = localStorage.getItem('aura_sound');

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
      if (storedNotes) setNotes(JSON.parse(storedNotes));
      if (storedFlashcards) setFlashcards(JSON.parse(storedFlashcards));
      if (storedQuizzes) setQuizzes(JSON.parse(storedQuizzes));
      if (storedTasks) setTasks(JSON.parse(storedTasks));
      if (storedPomodoros) setPomodoros(JSON.parse(storedPomodoros));
      if (storedLeaderboard) setLeaderboard(JSON.parse(storedLeaderboard));
      if (storedTheme) setThemeState(JSON.parse(storedTheme) as any);
      if (storedApiKey) setApiKeyState(JSON.parse(storedApiKey));
      if (storedSound) setSoundEnabledState(JSON.parse(storedSound));
    } catch (e) {
      console.error('Failed to load storage assets', e);
    }
    setIsLoaded(true);
  }, []);

  // 2. Sync to localStorage when states update
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('aura_user', JSON.stringify(user));
  }, [user, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('aura_subjects', JSON.stringify(subjects));
  }, [subjects, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('aura_notes', JSON.stringify(notes));
  }, [notes, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('aura_flashcards', JSON.stringify(flashcards));
  }, [flashcards, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('aura_quizzes', JSON.stringify(quizzes));
  }, [quizzes, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('aura_tasks', JSON.stringify(tasks));
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('aura_pomodoros', JSON.stringify(pomodoros));
  }, [pomodoros, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('aura_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard, isLoaded]);

  // Synchronize dynamic Theme attribute to HTML document wrapper
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura_theme', JSON.stringify(theme));
  }, [theme]);

  // Play audio triggers on study rewards
  const playSound = (type: 'xp' | 'level' | 'success' | 'timer') => {
    if (!soundEnabled) return;
    try {
      const frequencies: Record<string, number[]> = {
        xp: [440, 554, 659], // A Major arpeggio
        level: [523, 659, 784, 1046], // C Major upward blast
        success: [659, 880], // Sweet high ping
        timer: [330, 220, 220] // Low ending alert
      };
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const notesToPlay = frequencies[type];
      
      notesToPlay.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);
        
        gain.gain.setValueAtTime(0.15, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.12 + 0.3);
        
        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.35);
      });
    } catch (e) {
      // AudioContext blocker fallback
    }
  };

  // XP addition algorithm
  const addXp = (amount: number) => {
    setUser(prev => {
      const newXp = prev.xp + amount;
      const newTotal = prev.totalXp + amount;
      let newLevel = prev.level;
      let levelUp = false;

      if (newXp >= XP_PER_LEVEL) {
        newLevel += Math.floor(newXp / XP_PER_LEVEL);
        levelUp = true;
      }
      
      const finalXp = newXp % XP_PER_LEVEL;
      
      // Determine Scholar ranks similar to Duolingo/Notion AI tiers
      const ranks = ['Apprentice', 'Scribe', 'Researcher', 'Scholar', 'Scholar Master', 'Grandmaster Sage', 'Ascended Academic'];
      const rankIdx = Math.min(Math.floor(newLevel / 3), ranks.length - 1);
      
      if (levelUp) {
        setTimeout(() => playSound('level'), 100);
      } else {
        setTimeout(() => playSound('xp'), 50);
      }

      // Update leaderboard user values dynamically
      updateLeaderboardXp(newTotal, newLevel);

      return {
        ...prev,
        level: newLevel,
        xp: finalXp,
        totalXp: newTotal,
        rankName: ranks[rankIdx]
      };
    });
  };

  // Synchronize leaderboards dynamically
  const updateLeaderboardXp = (totalXp: number, level: number) => {
    setLeaderboard(prev => {
      return prev.map(item => {
        if (item.isUser) {
          return { ...item, xp: totalXp, level };
        }
        // AI competitors increment slightly during active study
        const aiBoost = Math.random() > 0.65 ? Math.floor(Math.random() * 30) : 0;
        return {
          ...item,
          xp: item.xp + aiBoost,
          level: Math.floor((item.xp + aiBoost) / 1000) || item.level
        };
      }).sort((a, b) => b.xp - a.xp);
    });
  };

  // Check streaks daily
  const triggerStreakCheck = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setUser(prev => {
      if (prev.lastActiveDate === todayStr) return prev;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let newStreak = prev.streak;
      if (prev.lastActiveDate === yesterdayStr) {
        newStreak += 1;
      } else if (prev.lastActiveDate !== todayStr) {
        newStreak = 1; // Streak reset
      }
      
      return {
        ...prev,
        streak: newStreak,
        lastActiveDate: todayStr
      };
    });
  };

  // Actions implementations
  const addSubject = (name: string, icon: string, color: string) => {
    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      name,
      icon,
      color,
      xp: 0
    };
    setSubjects(prev => [...prev, newSubject]);
    addXp(50); // Create subject XP reward
  };

  const addNote = (
    title: string,
    content: string,
    subjectId: string,
    type: 'pdf' | 'doc' | 'voice',
    summary?: string,
    revisionSheet?: string
  ): string => {
    const noteId = `note-${Date.now()}`;
    const newNote: Note = {
      id: noteId,
      title,
      content,
      subjectId,
      type,
      summary,
      revisionSheet,
      date: new Date().toISOString().split('T')[0]
    };

    setNotes(prev => [newNote, ...prev]);
    
    // Add XP to subject and user
    setSubjects(prev =>
      prev.map(sub => (sub.id === subjectId ? { ...sub, xp: sub.xp + 100 } : sub))
    );
    addXp(150); // Comprehensive documentation XP boost

    // Auto-generate starting flashcards from content
    if (content.length > 30) {
      setTimeout(() => {
        // Quick basic card generation based on punctuation structure
        const blocks = content.split('\n').filter(b => b.trim().length > 15);
        if (blocks.length > 0) {
          const front = `Explain key concept: "${title}"`;
          const back = blocks[0].length > 150 ? blocks[0].substring(0, 150) + '...' : blocks[0];
          addFlashcard(front, back, subjectId, noteId);
        }
      }, 500);
    }
    
    triggerStreakCheck();
    return noteId;
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
    setFlashcards(prev => prev.filter(f => f.noteId !== noteId));
  };

  const addFlashcard = (front: string, back: string, subjectId: string, noteId?: string) => {
    const newCard: Flashcard = {
      id: `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      front,
      back,
      subjectId,
      noteId,
      box: 1,
      nextReviewDate: new Date().toISOString().split('T')[0]
    };
    setFlashcards(prev => [newCard, ...prev]);
    addXp(15);
  };

  // Leitner Spaced Repetition Logic
  const updateFlashcardBox = (cardId: string, isCorrect: boolean) => {
    setFlashcards(prev =>
      prev.map(card => {
        if (card.id !== cardId) return card;

        let nextBox = card.box;
        if (isCorrect) {
          nextBox = Math.min(card.box + 1, 5);
        } else {
          nextBox = 1; // Spaced repetition reset penalty
        }

        // Space out next review dates (Leitner expansion scale)
        const daysMap: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
        const nextInterval = daysMap[nextBox];
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + nextInterval);

        // Reward XP on memory successes
        if (isCorrect) {
          setTimeout(() => addXp(20 + nextBox * 5), 10);
        }

        return {
          ...card,
          box: nextBox,
          nextReviewDate: nextDate.toISOString().split('T')[0]
        };
      })
    );
    playSound('success');
  };

  const saveQuizResult = (title: string, subjectId: string, score: number, totalQuestions: number) => {
    const earnedXp = Math.floor((score / totalQuestions) * 200);
    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title,
      subjectId,
      score,
      totalQuestions,
      xpEarned: earnedXp,
      date: new Date().toISOString().split('T')[0]
    };

    setQuizzes(prev => [newQuiz, ...prev]);
    setSubjects(prev =>
      prev.map(s => (s.id === subjectId ? { ...s, xp: s.xp + score * 10 } : s))
    );
    
    if (earnedXp > 0) addXp(earnedXp);
    playSound('success');
    triggerStreakCheck();
  };

  const addTask = (title: string, subjectId: string, dueDate: string, estimatedPomodoros: number) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      subjectId,
      dueDate,
      estimatedPomodoros,
      completedPomodoros: 0,
      completed: false,
      xpEarned: 0
    };
    setTasks(prev => [...prev, newTask]);
    triggerStreakCheck();
  };

  const completeTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        
        // Award XP only on new completion
        if (!task.completed) {
          const reward = 50 + (task.estimatedPomodoros * 15);
          setTimeout(() => {
            addXp(reward);
            playSound('success');
          }, 10);
          return { ...task, completed: true, xpEarned: reward };
        }
        return { ...task, completed: false, xpEarned: 0 };
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const incrementPomodoroProgress = (taskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const completedCount = Math.min(task.completedPomodoros + 1, task.estimatedPomodoros);
          return { ...task, completedPomodoros: completedCount };
        }
        return task;
      })
    );
  };

  const logPomodoroSession = (
    subjectId: string | undefined,
    duration: number,
    type: 'focus' | 'short_break' | 'long_break'
  ) => {
    const newSession: PomodoroSession = {
      id: `pomo-${Date.now()}`,
      subjectId,
      duration,
      date: new Date().toISOString().split('T')[0],
      type
    };
    
    setPomodoros(prev => [newSession, ...prev]);

    if (type === 'focus') {
      const earnedXp = Math.floor(duration * 4); // 4 XP per focus minute
      addXp(earnedXp);
      
      if (subjectId) {
        setSubjects(prev =>
          prev.map(sub => (sub.id === subjectId ? { ...sub, xp: sub.xp + earnedXp } : sub))
        );
      }
      playSound('timer');
    }
    
    triggerStreakCheck();
  };

  const setTheme = (selectedTheme: 'midnight' | 'emerald' | 'cyberpunk' | 'rosegold') => {
    setThemeState(selectedTheme);
  };

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('aura_apiKey', JSON.stringify(key));
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem('aura_sound', JSON.stringify(enabled));
  };

  const resetAllData = () => {
    setUser({
      name: 'Dharmesh',
      level: 1,
      xp: 0,
      totalXp: 0,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      avatar: '⚡',
      rankName: 'Apprentice'
    });
    setSubjects(INITIAL_SUBJECTS);
    setNotes([]);
    setFlashcards([]);
    setQuizzes([]);
    setTasks([]);
    setPomodoros([]);
    setLeaderboard(INITIAL_LEADERBOARD.map(x => x.isUser ? { ...x, xp: 0, level: 1 } : x));
    setThemeState('midnight');
    setApiKeyState('');
    setFocusMode(false);
    
    localStorage.clear();
  };

  return (
    <StudyContext.Provider
      value={{
        user,
        subjects,
        notes,
        flashcards,
        quizzes,
        tasks,
        pomodoros,
        leaderboard,
        theme,
        apiKey,
        focusMode,
        soundEnabled,
        addXp,
        addSubject,
        addNote,
        deleteNote,
        addFlashcard,
        updateFlashcardBox,
        saveQuizResult,
        addTask,
        completeTask,
        deleteTask,
        incrementPomodoroProgress,
        logPomodoroSession,
        setTheme,
        setApiKey,
        setFocusMode,
        setSoundEnabled,
        triggerStreakCheck,
        resetAllData
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
