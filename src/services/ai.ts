// AI Service handling official OpenAI API integrations or custom context-aware fallbacks

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GeneratedFlashcard {
  front: string;
  back: string;
}

// System Persona Presets for the AI Chat Assistant
export const AI_PERSONAS = {
  socratic: "You are a Socratic tutor. Do not give the user direct answers. Instead, ask guided questions that help them discover the answer themselves, encouraging critical thinking.",
  explain5: "You are a kind teacher who explains highly complex academic or programming concepts in simple language, using analogies suitable for a 5-year-old child.",
  expertDev: "You are a senior elite staff developer and tech lead. Provide high-fidelity, production-grade code, deep technical explanations, architectural diagrams in text, and performance trade-offs."
};

// Generic OpenAI fetch client
async function fetchOpenAI(
  messages: AIChatMessage[],
  apiKey: string,
  responseFormat?: 'json_object'
): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        response_format: responseFormat ? { type: responseFormat } : undefined
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI Error:', error);
    throw error;
  }
}

// 1. AI Chat Doubt-Solver
export async function askAI(
  messages: AIChatMessage[],
  persona: 'socratic' | 'explain5' | 'expertDev' | 'none',
  noteContext?: string,
  apiKey?: string
): Promise<string> {
  if (apiKey && apiKey.trim().length > 10) {
    const systemInstruction = persona !== 'none' ? AI_PERSONAS[persona] : "You are a helpful academic study tutor.";
    const fullMessages: AIChatMessage[] = [
      { 
        role: 'system', 
        content: `${systemInstruction} ${noteContext ? `\nContextual Notes for Reference:\n"""\n${noteContext}\n"""` : ''}` 
      },
      ...messages
    ];
    try {
      return await fetchOpenAI(fullMessages, apiKey);
    } catch (e) {
      console.warn("Falling back to local AI due to API error", e);
    }
  }

  // Local Intelligent Fallback Simulation
  return new Promise((resolve) => {
    setTimeout(() => {
      const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
      
      // Contextual response generator
      let response = "";
      
      if (persona === 'socratic') {
        response = `That is an excellent point of inquiry! Let us examine this closer.\n\n`;
        if (lastUserMsg.includes('transformer') || lastUserMsg.includes('attention')) {
          response += `When we look at self-attention, we project our tokens into Query, Key, and Value vectors. If you want to find out which words in a sentence depend on each other, what mathematical operation (like dot-product, addition, or division) would you use to measure their compatibility or "closeness"? \n\nWhat do you think happens if we do not divide by the square root of the dimension?`;
        } else if (lastUserMsg.includes('forgetting') || lastUserMsg.includes('spaced')) {
          response += `To understand memory retention, think about a path in a forest. If you walk it once, it fades. If you walk it repeatedly at spaced intervals, it becomes a permanent road. \n\nHow do you think the brain decides what is "crucial information" to store versus "noise" that can be discarded? What happens if you review immediately after learning versus waiting three days?`;
        } else {
          response += `To help you grasp this, let's break it down. What do you see as the primary bottleneck or core challenge when dealing with this specific topic? Try explaining the basic premise in your own words, and we can build from there!`;
        }
      } else if (persona === 'explain5') {
        response = `Let me tell you a cool story! 🧸\n\n`;
        if (lastUserMsg.includes('transformer') || lastUserMsg.includes('attention')) {
          response += `Imagine you are in a busy playground with 10 of your friends. If everyone screams at the same time, it is hard to hear. But what if you had a magical magnifying glass that makes your best friend shine super bright so you can focus only on their voice? \n\nThat is what **Self-Attention** does! It helps the computer look at a long sentence and say, "Aha! The word 'bark' goes with the word 'dog', not the word 'tree'!" It helps the computer focus on the most important friends in the sentence!`;
        } else if (lastUserMsg.includes('forgetting') || lastUserMsg.includes('spaced')) {
          response += `Imagine your brain is a giant sandy beach! 🏖️ If you build a sandcastle (which is a new fact you learned), the ocean waves will wash it away by tomorrow.\n\nBut if you build a sandcastle, and then tomorrow you rebuild it, and then next week you rebuild it again, the sand becomes super hard and turns into stone! That is **Spaced Repetition**. It tells your brain: "Hey, do not wash this sandcastle away, we need it!"`;
        } else {
          response += `Think of this like building a Lego tower! You cannot put the roof on until you build a strong, solid base of bricks at the bottom. Let's make sure our bottom bricks are locked together first! What part of this puzzle feels a little too heavy to carry?`;
        }
      } else if (persona === 'expertDev') {
        response = `### High-Performance Technical Breakdown & Blueprint\n\n`;
        if (lastUserMsg.includes('transformer') || lastUserMsg.includes('attention')) {
          response += `#### Scaled Dot-Product Attention Core Architecture
\`\`\`typescript
// PyTorch-style Tensor Math Formulation in TypeScript
function scaledDotProductAttention(Q: Tensor, K: Tensor, V: Tensor, mask?: Tensor): Tensor {
  const d_k = Q.shape[Q.shape.length - 1];
  
  // 1. Compute Raw Attention Scores (Dot-Product query-key matrices)
  const scores = Q.matmul(K.transpose(-2, -1)).div(Math.sqrt(d_k));
  
  // 2. Apply Causal/Padding Masks if present
  if (mask) {
    scores.maskedFill(mask, -1e9);
  }
  
  // 3. Apply Softmax to obtain probability distributions
  const attentionWeights = scores.softmax(dim = -1);
  
  // 4. Multiply by Value matrix to gather representative vectors
  return attentionWeights.matmul(V);
}
\`\`\`
##### Performance Metrics & Bottlenecks:
- **Time Complexity:** $O(N^2 \\cdot d)$ where $N$ is sequence length. The quadratic $O(N^2)$ scale represents the key computational bottleneck, triggering the rise of Linear attention models (e.g., FlashAttention, Reformer).
- **Spatial Complexity:** $O(N^2)$ attention map allocation.`;
        } else {
          response += `#### Systems Architecture Blueprint
We will enforce strict architectural separation between our layers:
1. **Client Core:** Handles UI paint schedules and local IndexedDB state cache.
2. **Serverless Orchestrator:** Manages streaming LLM responses and vector lookups.

Here is a clean implementation pattern for scalable operations:
\`\`\`typescript
interface APICallback<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function executeSafeTransaction<T>(fn: () => Promise<T>): Promise<APICallback<T>> {
  try {
    const result = await fn();
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
\`\`\`
Let me know if you want to write a custom parser or hook up a specific Prisma middleware!`;
        }
      } else {
        // Standard tutor helper
        response = `Here is a structured explanation of the topic:\n\n`;
        if (lastUserMsg.includes('transformer') || lastUserMsg.includes('attention') || (noteContext && noteContext.toLowerCase().includes('transformer'))) {
          response += `### Understanding the Transformer Model\n\nThe Transformer model represents a revolutionary leap forward in AI. Unlike earlier Recurrent Neural Networks (RNNs) which analyzed words sequentially, Transformers analyze words **all at once**.\n\n#### Key Pillars of Transformers:\n1. **Positional Encoding:** Since there is no sequential recursion, we add sine and cosine wave indices directly to the word embeddings so the model knows the position of each word.\n2. **Self-Attention mechanism:** Maps queries, keys, and values to assign proportional focus weight to relative context.\n3. **Multi-Head Layers:** Splits the attention mechanism into parallel blocks to capture distinct relational dimensions.\n\nIs there a specific aspect, like positional math or multi-head projection, that we should drill down into?`;
        } else if (lastUserMsg.includes('forgetting') || lastUserMsg.includes('spaced') || (noteContext && noteContext.toLowerCase().includes('spacing'))) {
          response += `### Spaced Repetition Study Guide\n\nSpaced repetition is a science-backed learning technique designed to optimize cognitive retrieval. \n\n#### The Forgetting Curve Breakdown:\n- **Immediate Recall:** 100% absorption right after the session.\n- **24 Hours Later:** Drops to 50-80% without review.\n- **30 Days Later:** Only about 2-10% is retained.\n\n#### Active Spacing Schedule:\n- Review 1: 1 Day after learning (locks basic concepts)\n- Review 2: 3 Days after (strengthens definitions)\n- Review 3: 7 Days after (cements complex applications)\n- Review 4: 14 Days after (permanent retention mapping)\n\nTry using our built-in interactive Quiz tool and Leitner Flashcards to put this system into immediate action!`;
        } else {
          response += `Thank you for sharing your thoughts! Based on your query, here are the most vital takeaways:\n\n1. **Focus on first principles:** Always master the basic definitions before moving to complex formulas.\n2. **Active Recall:** Instead of just re-reading, close your notes and attempt to write down the core concepts from scratch.\n3. **Spaced Repetition:** Re-verify your understanding at increasing intervals to solidify the memory.\n\nWhat other questions can I solve to speed up your learning?`;
        }
      }
      
      resolve(response);
    }, 1000);
  });
}

// 2. AI Document Summarizer
export async function generateSummary(
  noteTitle: string,
  noteContent: string,
  apiKey?: string
): Promise<{ summary: string; revisionSheet: string }> {
  if (apiKey && apiKey.trim().length > 10) {
    const messages: AIChatMessage[] = [
      {
        role: 'system',
        content: 'You are an elite academic summarize-engine. Your goal is to convert long technical documents into a highly organized, bulleted Summary and a comprehensive markdown Study Revision Sheet.'
      },
      {
        role: 'user',
        content: `Please generate a structured summary and revision sheet in JSON format.
        
        The JSON must contain precisely these two fields:
        {
          "summary": "Short concise bullet points of the main ideas",
          "revisionSheet": "A complete, beautifully formatted markdown study guide, using bolding, lists, and clear subheadings"
        }
        
        Document Title: ${noteTitle}
        Document Content:
        ${noteContent}`
      }
    ];

    try {
      const resText = await fetchOpenAI(messages, apiKey, 'json_object');
      const parsed = JSON.parse(resText);
      return {
        summary: parsed.summary || 'Summary generation completed.',
        revisionSheet: parsed.revisionSheet || '# Revision Guide\nNo sheet generated.'
      };
    } catch (e) {
      console.warn("Failing back to simulated summary", e);
    }
  }

  // Local Summary Simulation
  return new Promise((resolve) => {
    setTimeout(() => {
      // Split content into sentences
      const sentences = noteContent.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
      const bullets = sentences.slice(0, 3).map(s => `• ${s}.`).join('\n');
      
      const revisionMarkdown = `# Study Sheet: ${noteTitle}\n\n## 📌 Core Overview\n${sentences[0] || 'No summary text available.'}\n\n## 🔑 Key Points\n${sentences.slice(1, 4).map(s => `- **Main concept:** ${s}`).join('\n')}\n\n## 📝 Study Guide & Formulas\n- Review this concept using active recall every 3 days.\n- Attempt to explain the relationship of these terms to an external peer.`;
      
      resolve({
        summary: bullets || '• Document analyzed. Ready for revision.',
        revisionSheet: revisionMarkdown
      });
    }, 1500);
  });
}

// 3. AI Flashcard Creator
export async function generateFlashcards(
  noteTitle: string,
  noteContent: string,
  apiKey?: string
): Promise<GeneratedFlashcard[]> {
  if (apiKey && apiKey.trim().length > 10) {
    const messages: AIChatMessage[] = [
      {
        role: 'system',
        content: 'You are a professional study-deck designer. You generate flashcards with concise, highly focused questions on the Front, and clear, complete answers on the Back.'
      },
      {
        role: 'user',
        content: `Analyze this content and generate between 3 to 5 study flashcards in JSON format.
        
        The output must be a JSON object containing an array of cards:
        {
          "cards": [
            { "front": "focused question", "back": "short concise answer" }
          ]
        }
        
        Document Title: ${noteTitle}
        Document Content:
        ${noteContent}`
      }
    ];

    try {
      const resText = await fetchOpenAI(messages, apiKey, 'json_object');
      const parsed = JSON.parse(resText);
      return parsed.cards || [];
    } catch (e) {
      console.warn("Failing back to simulated flashcards", e);
    }
  }

  // Local Flashcard Simulation
  return new Promise((resolve) => {
    setTimeout(() => {
      const cards: GeneratedFlashcard[] = [
        { front: `What is the primary subject discussed in "${noteTitle}"?`, back: `It explores the foundational mechanisms and concepts underlying ${noteTitle}.` },
        { front: `What is a critical definition to remember from "${noteTitle}"?`, back: `Understanding how the individual elements relate to each other is crucial to master this topic.` },
        { front: `Give a practical application of "${noteTitle}".`, back: `It is used to solve real-world problems by breaking large systems into digestible, structural layers.` }
      ];
      resolve(cards);
    }, 1200);
  });
}

// 4. AI Quiz Creator
export async function generateQuizQuestions(
  subjectName: string,
  noteContent: string,
  count: number = 5,
  apiKey?: string
): Promise<GeneratedQuestion[]> {
  if (apiKey && apiKey.trim().length > 10) {
    const messages: AIChatMessage[] = [
      {
        role: 'system',
        content: 'You are an academic test designer. You build multiple choice quizzes. Questions must be challenging, options must look plausible, and the explanation should clarify why the answer is correct.'
      },
      {
        role: 'user',
        content: `Please generate ${count} multiple choice questions (MCQs) in JSON based on the subject "${subjectName}" and content.
        
        Format the JSON strictly as:
        {
          "quizzes": [
            {
              "question": "Clear multiple choice question?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctIndex": 0,
              "explanation": "Detailed explanation of why index 0 is correct."
            }
          ]
        }
        
        Content Reference:
        ${noteContent}`
      }
    ];

    try {
      const resText = await fetchOpenAI(messages, apiKey, 'json_object');
      const parsed = JSON.parse(resText);
      return parsed.quizzes || [];
    } catch (e) {
      console.warn("Failing back to simulated quizzes", e);
    }
  }

  // Local Quiz Simulation
  return new Promise((resolve) => {
    setTimeout(() => {
      const hasTransformer = noteContent.toLowerCase().includes('transformer') || subjectName.toLowerCase().includes('neural');
      
      const neuralQuizzes: GeneratedQuestion[] = [
        {
          question: "Which component of the Transformer architecture calculates word dependencies simultaneously?",
          options: ["Recurrent Neural Connections", "Self-Attention Mechanism", "Causal Convolutional Filters", "Max Pooling Matrix"],
          correctIndex: 1,
          explanation: "Self-attention computes dynamic weight distributions across all tokens in a single step, bypassing sequential recurrence entirely."
        },
        {
          question: "Why is the dot-product divided by the square root of key dimension (d_k) in Attention?",
          options: ["To prevent scaling gradients from vanishing or exploding during softmax", "To enforce strict linear time complexity", "To align vectors into a perfect normal distribution", "To map characters to ASCII values"],
          correctIndex: 0,
          explanation: "For large values of d_k, dot products grow extremely large, pushing softmax into regions with small gradients. Dividing by sqrt(d_k) keeps the gradients healthy."
        },
        {
          question: "Who introduced the landmark paper 'Attention Is All You Need'?",
          options: ["Yann LeCun", "Geoffrey Hinton", "Vaswani et al.", "Andrew Ng"],
          correctIndex: 2,
          explanation: "Vaswani et al. published the paper at NeurIPS 2017, introducing the world to the Transformer model."
        }
      ];

      const defaultQuizzes: GeneratedQuestion[] = [
        {
          question: `What is the best way to avoid the exponential drop represented by Ebbinghaus's Forgetting Curve in "${subjectName}"?`,
          options: ["Cramming for 12 hours straight before an exam", "Re-reading the textbook passively twice a week", "Spaced Repetition review at expanding intervals", "Ignoring the topic for 3 months"],
          correctIndex: 2,
          explanation: "Spaced repetition repeatedly reactivates neural path configurations, flattening the forgetting rate and securing long-term storage."
        },
        {
          question: "In the Leitner flashcard system, what happens when you answer a flashcard incorrectly?",
          options: ["It is promoted to Box 5", "It resets all the way back to Box 1 for immediate review", "It is permanently deleted", "It remains in the current box"],
          correctIndex: 1,
          explanation: "Answering incorrectly carries a cognitive penalty: resetting the card back to Box 1 to reinforce and repair weak memory traces immediately."
        },
        {
          question: "What does 'Active Recall' stand for in study optimization?",
          options: ["Reading a document highlighting lines in yellow", "Attempting to retrieve concepts from memory without looking at notes", "Recording an audio lecture to listen to while sleeping", "Creating a beautiful handwritten copy of notes"],
          correctIndex: 1,
          explanation: "Active recall forces the brain to actively retrieve information, stimulating neural connection building much more than passive review."
        }
      ];

      const finalQuizSet = hasTransformer ? neuralQuizzes : defaultQuizzes;
      // Slice to match requested count
      resolve(finalQuizSet.slice(0, count));
    }, 1500);
  });
}
