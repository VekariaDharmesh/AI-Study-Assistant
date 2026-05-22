Aura Study 🌌
AI-Powered Cognitive Study Assistant & Gamified Revision Suite
Premium Spaced-Repetition System (Leitner Box) · Built-in Speech Compiler · Procedural Web Audio Ambient Sounds

📌 What is Aura Study?
Aura Study is a professional-grade, AI-powered cognitive study assistant web application designed to act as an intelligent layer over your learning workflow. Blending the high-fidelity aesthetics of Notion AI, the conversational mastery of ChatGPT, and the addictive, gamified motivation loop of Duolingo, Aura Study helps students, self-learners, and developers organize and retain complex information.

It combines the power of local browser execution (for instant, zero-latency interactions) with state-of-the-art AI synthesis to provide:

- Spaced Repetition (Leitner system Box 1-5 schedules for active recall and memory retention)
- Real-time speech-to-notes transcription (Native browser SpeechRecognition Web API)
- Procedural audio synthesis (Custom Web Audio API ambient engines for Rain, Waves, and Binaural Beats)
- Gamified metrics cockpit (Animated streaks, leveling system, XP multipliers, and study leaderboards)

✨ Main Features
- **Smart AI Tutor Workspaces**: Split-pane layout with Socratic, ELI5 (Explain Like I'm 5), and Staff Developer personas beside a Notion-styled markdown editor.
- **Micro-Speech Compiler**: Native Speech-to-Text dictation with a canvas-based `WaveformVisualizer` to transcribe lectures and instantly generate summary revision sheets.
- **3D Spaced Flashcards**: Interactive 3D flip-cards utilizing the Leitner spaced-repetition box intervals to optimize your cognitive forgetting curve.
- **Active MCQ Quiz Arena**: Gamified multiple-choice quizzes with visual XP gains, streak multipliers, and detailed socratic explanations.
- **Weekly Analytics Diagnostics**: Recharts-powered focus distribution metrics, XP progress lines, and AI-driven weak-topic diagnostics recommending corrective actions.
- **Theme Color Selector**: A dark-first glassmorphic UI offering custom-tailored color aesthetics (Midnight, Emerald, Cyberpunk, and Rose Gold).

🚀 Quick Start (most users)
1. Clone Repository
```bash
git clone https://github.com/VekariaDharmesh/AI-Study-Assistant.git
cd AI-Study-Assistant
```

2. Install Dependencies
```bash
npm install
```

3. Run Developer Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. All states are loaded with interactive mock profiles and persist locally via `localStorage` instantly.

4. Build for Production
```bash
npm run build
```

📂 Project Structure
```text
AI-Study-Assistant/
├── prisma/
│   └── schema.prisma        # Database blueprint for scale integrations
├── public/                  # Static vectors & brand assets
├── src/
│   ├── app/                 # Next.js 15 App Router Views
│   │   ├── layout.tsx       # Core styling & Context provider wrap
│   │   ├── page.tsx         # Premium animated Landing Page
│   │   ├── auth/            # Apple-style Auth / Demo Entrance
│   │   ├── dashboard/       # 3-column Widget Student Cockpit
│   │   ├── workspace/       # Split AI Workspace & Markdown Editor
│   │   ├── upload/          # Drag-Drop OCR & Voice-to-Note Dictator
│   │   ├── quiz/            # 3D Spaced Flashcards & MCQ Game Loop
│   │   ├── analytics/       # Visual Charts & AI Weak Topic Diagnostics
│   │   ├── planner/         # Calendar Schedule & Planners
│   │   └── settings/        # API key & UI theme configurations
│   ├── components/          # Reusable UI widgets
│   │   ├── Sidebar.tsx      # Collapsible theme navigation
│   │   ├── PomodoroTimer.tsx# Web Audio Procedural Noise & Focus Mode
│   │   └── WaveformVisualizer.tsx # Canvas voice wave feedback node
│   ├── context/
│   │   └── StudyContext.tsx # Central offline-first state engine
│   └── services/
│       └── ai.ts            # Hybrid AI simulation & OpenAI bridge
├── package.json
└── README.md
```

🛠️ Full Setup Guide
Requirements
- Node.js 18.x or 20.x
- Modern Web Browser (Google Chrome / Apple Safari recommended for Web Speech APIs)
- OpenAI API Key (Optional, for advanced cloud AI tutoring. Standard models run on built-in adaptive simulators fallback!)

Optional Database Setup
Aura Study operates out of the box with zero setup using browser storage. To scale the workspace to a SQL database:
1. Initialize Prisma client: `npx prisma db push`
2. Connect your PostgreSQL/MySQL endpoint in `.env`.

🎵 Ambient Focus Soundscapes
Aura Study features procedural audio generators inside the Pomodoro widget to maximize focus without loading external media:
- **🌧️ Rain Hum**: Low-pass filtered noise simulating static raindrops.
- **🌊 Ocean Waves**: Dual slow-frequency modulators replicating low-frequency tides.
- **🎧 Binaural Alpha Beats**: Dual detuned sine wave oscillators (`10Hz` split) to induce alpha-wave deep focus.

⚠️ Notes & Limitations
- **SpeechRecognition Permissions**: Ensure your browser has active microphone privileges inside the `upload/` dictation page.
- **API Keys**: Adding a custom API key in `/settings` elevates AI responses using real cloud OpenAI models. Otherwise, standard mock tutoring engines will simulate answers offline.
- **Offline States**: Resetting all data inside `/settings` clears local browser stores and resets metrics.

🔮 Future Improvements
- **Mobile Companion Apps**: Dedicated iOS and Android native study widgets.
- **Real PDF Text Extraction**: Expanding simulated OCR dropzones using real PDF.js parse grids.
- **Collaborative Leaderboards**: Real-time multiplayer quiz challenges using WebSockets.
- **Advanced LaTeX Rendering**: Real-time rendering of complex mathematical notations inside the markdown editor.

📄 License
MIT License — Free to use, modify, and distribute.

👨💻 Author
Dharmesh Vekaria
Anand, Gujarat · 2025–2026

Focused on building the next generation of gamified study and AI productivity engines.

🛡️ Stay Smart · Stay Focused
