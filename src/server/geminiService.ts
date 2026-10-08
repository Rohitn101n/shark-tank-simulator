import { GoogleGenAI } from '@google/genai';
import { PitchData, SharkTurnResponse, ViabilityMetrics, MessageLog, SharkOffer, DebriefReport, SharkQuestion } from '../types/shark';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `
You are the broadcast simulation engine for Shark Tank America.
The 5 Sharks are sitting in executive leather chairs with their Shark Tank notebooks in their laps:
1. Mark Cuban: Tech titan, hates patent trolls and high valuations without scale, loves D2C & AI, shot-clock deadlines.
2. Kevin O'Leary ("Mr. Wonderful"): The valuation hawk and cash flow king. Scrutinizes multiples, demands royalties, says "You're dead to me" or "Take it behind the barn and shoot it".
3. Lori Greiner: Queen of QVC, retail mastermind. Spots "Hero vs. Zero" instantly, demands utility patents and immediate impulse-buy appeal.
4. Daymond John: Branding genius and founder of FUBU. Evaluates founder hustle, hates excess inventory, prefers licensing.
5. Barbara Corcoran: Real estate queen, gut-instinct investor. Scrutinizes founder psychology and humility.

RULES:
- When a Shark questions the entrepreneur, generate 1 sharp, direct question tailored to the entrepreneur's exact submitted company name, ask amount, equity, sales, unit cost, and price.
- ALWAYS provide 4 distinct, strategic answer options (A, B, C, D) representing different founder negotiation strategies:
  * Option A: Bold / aggressive defense
  * Option B: Financial / margin / unit economics defense
  * Option C: IP / patent / future scale defense
  * Option D: Collaborative / negotiable concession
- Keep dialogues crisp, authentic, and in-character.
`;

export async function evaluateAndStartQuestions(pitch: PitchData): Promise<{
  viability: ViabilityMetrics;
  firstQuestion: SharkQuestion;
  sharkQuote: string;
  sharkBrawl?: { shark1: string; shark2: string; dialogue: string } | null;
}> {
  const impliedValuation = pitch.askEquity > 0
    ? Math.round(pitch.askAmount / (pitch.askEquity / 100))
    : 0;
  const grossMargin = pitch.retailPrice > 0
    ? Math.round(((pitch.retailPrice - pitch.cogs) / pitch.retailPrice) * 100)
    : 0;
  const multiple = pitch.annualSales > 0 ? (impliedValuation / pitch.annualSales).toFixed(1) : 'Infinite';

  const prompt = `
The entrepreneur just presented their pitch:
Company: "${pitch.businessName}"
Tagline: "${pitch.tagline}"
Pitch: "${pitch.pitchText}"
Ask: $${pitch.askAmount.toLocaleString()} for ${pitch.askEquity}% (Implied Valuation: $${impliedValuation.toLocaleString()})
Annual Sales: $${pitch.annualSales.toLocaleString()} (${multiple}x Multiple)
Unit Cost: $${pitch.cogs} | Retail Price: $${pitch.retailPrice} (${grossMargin}% Gross Margin)
Patents: "${pitch.patents}"

Generate the first interrogation round:
1. "viability": {
   "impliedValuation": ${impliedValuation},
   "grossMarginPercent": ${grossMargin},
   "profitPerUnit": ${(pitch.retailPrice - pitch.cogs).toFixed(2)},
   "overallScore": number (0 to 100),
   "valuationSanity": "Fair" | "Ambitious" | "Insane" | "Steal",
   "redFlags": [array of 2-3 blunt red flags],
   "greenFlags": [array of 2-3 genuine strengths],
   "tankVerdict": string (1-2 sentence overall summary)
}
2. "firstQuestion": {
   "id": "q1",
   "sharkId": "kevin", // or "mark"
   "question": "Kevin looks up from his black financial ledger and asks a tough, piercing question about the valuation/sales",
   "context": "Examining his notebook numbers...",
   "options": [
      { "id": "A", "text": "...", "strategy": "Growth Defense" },
      { "id": "B", "text": "...", "strategy": "Margin Defense" },
      { "id": "C", "text": "...", "strategy": "Proprietary Moat" },
      { "id": "D", "text": "...", "strategy": "Concession" }
   ],
   "questionNumber": 1,
   "totalQuestions": 5
}
3. "sharkQuote": "Short 1-line immediate reaction from the questioning shark",
4. "sharkBrawl": optional clash between Kevin and Mark about this opening question
`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.8,
        },
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
    } catch (err) {
      console.warn('Gemini evaluateAndStartQuestions fallback:', err);
    }
  }

  // Realistic Fallback
  const redFlags = [];
  const greenFlags = [];
  if (Number(multiple) > 6) redFlags.push(`Aggressive valuation at ${multiple}x sales demands unproven execution.`);
  if (grossMargin < 60) redFlags.push(`Gross margin of ${grossMargin}% is vulnerable to retail distributor cuts.`);
  if (!pitch.patents || pitch.patents.toLowerCase().includes('none')) redFlags.push('Lacks defensible patent moat against swift copycats.');

  if (grossMargin >= 65) greenFlags.push(`Strong ${grossMargin}% gross margins support healthy marketing budget.`);
  if (pitch.annualSales > 100000) greenFlags.push(`Real customer traction with $${pitch.annualSales.toLocaleString()} in sales.`);
  greenFlags.push('Clear consumer pain point addressed.');

  const viabilityScore = Math.min(95, Math.max(40, Math.round(
    (grossMargin >= 65 ? 30 : 15) +
    (pitch.annualSales > 100000 ? 35 : 15) +
    (Number(multiple) <= 6 ? 25 : 10)
  )));

  const sanity = Number(multiple) > 10 ? 'Insane' : Number(multiple) > 5 ? 'Ambitious' : 'Fair';

  return {
    viability: {
      impliedValuation,
      grossMarginPercent: grossMargin,
      profitPerUnit: Number((pitch.retailPrice - pitch.cogs).toFixed(2)),
      overallScore: viabilityScore,
      valuationSanity: sanity,
      redFlags: redFlags.length ? redFlags : ['Execution risk scaling manufacturing.'],
      greenFlags,
      tankVerdict: `Pitching ${pitch.businessName} at $${impliedValuation.toLocaleString()} implied valuation with ${grossMargin}% margins.`
    },
    firstQuestion: {
      id: 'q1',
      sharkId: 'kevin',
      question: `Look at my ledger: you're asking for $${pitch.askAmount.toLocaleString()} for ${pitch.askEquity}%, valuing your company at $${impliedValuation.toLocaleString()}! With $${pitch.annualSales.toLocaleString()} in sales, why on earth should I pay ${multiple} times revenue? How do you justify this valuation?`,
      context: 'Kevin taps his calculator and stares directly at you.',
      options: [
        {
          id: 'A',
          text: `Our sales are growing at 300% quarter-over-quarter. You're investing in where we are going, not trailing numbers.`,
          strategy: 'Growth Trajectory'
        },
        {
          id: 'B',
          text: `Our gross margin is ${grossMargin}%. We make $${(pitch.retailPrice - pitch.cogs).toFixed(2)} on every single unit sold, which drops straight to the bottom line.`,
          strategy: 'Unit Economics'
        },
        {
          id: 'C',
          text: `Our proprietary design and customer retention rate protect us from copycats, making this brand defensible.`,
          strategy: 'Brand Moat'
        },
        {
          id: 'D',
          text: `Kevin, the valuation is negotiable if you bring your financial discipline and strategic connections to the table.`,
          strategy: 'Negotiable Concession'
        }
      ],
      questionNumber: 1,
      totalQuestions: 5
    },
    sharkQuote: `Why should I pay ${multiple} times sales when money can go anywhere?`,
    sharkBrawl: {
      shark1: 'mark',
      shark2: 'kevin',
      dialogue: `Mark: "Kevin, stop terrorizing them over trailing sales before you even hear the customer acquisition model!" Kevin: "Mark, money has no feelings, only discipline!"`
    }
  };
}

export async function processAnswerAndGetNextQuestion(
  pitch: PitchData,
  answeredQuestion: SharkQuestion,
  userAnswerText: string,
  currentStatuses: Record<string, string>,
  currentScores: Record<string, number>,
  activeOffers: SharkOffer[]
): Promise<{
  sharkReaction: SharkTurnResponse;
  nextQuestion: SharkQuestion | null; // null if all 5 rounds complete
  newOffer?: SharkOffer | null;
  sharkBrawl?: { shark1: string; shark2: string; dialogue: string } | null;
}> {
  const currentQNum = answeredQuestion.questionNumber;
  const nextQNum = currentQNum + 1;

  // The order of Sharks questioning:
  // Q1: Kevin (Valuation & Multiples)
  // Q2: Mark Cuban (Tech moat, CAC, and Distribution)
  // Q3: Lori Greiner (Retail readiness, QVC, Patents)
  // Q4: Daymond John (Branding, Licensing, Inventory)
  // Q5: Barbara Corcoran (Founder grit, Instincts, Character)

  const sharkSequence: ('mark' | 'kevin' | 'lori' | 'daymond' | 'barbara')[] = [
    'kevin',
    'mark',
    'lori',
    'daymond',
    'barbara'
  ];

  const nextSharkId = nextQNum <= 5 ? sharkSequence[nextQNum - 1] : null;

  const prompt = `
The founder just answered ${answeredQuestion.sharkId}'s question:
Company: "${pitch.businessName}"
Question was: "${answeredQuestion.question}"
Founder answered: "${userAnswerText}"

Evaluate the answer:
1. "${answeredQuestion.sharkId}" reaction:
   - "dialogue": Direct, realistic reaction addressing the answer (do they buy it, are they skeptical, are they out, or impressed?)
   - "status": "QUESTIONING" | "CONTEMPLATING" | "MAKING_OFFER" | "OUT"
   - "interestScore": updated number 0-100 (raise if answer was sharp, lower if weak)
   - "offer": optional offer if interestScore > 80

2. Next Shark Question (if questionNumber ${nextQNum} <= 5, with shark "${nextSharkId}"):
   - "${nextSharkId}" asks their signature domain question about "${pitch.businessName}".
   - 4 response options (A, B, C, D) tailored to the business.

Return valid JSON:
{
  "sharkReaction": {
    "sharkId": "${answeredQuestion.sharkId}",
    "dialogue": "...",
    "status": "...",
    "interestScore": number,
    "offer": optional object
  },
  "nextQuestion": ${
    nextSharkId
      ? `{
    "id": "q${nextQNum}",
    "sharkId": "${nextSharkId}",
    "question": "...",
    "context": "Taking notes in binder...",
    "options": [
       { "id": "A", "text": "...", "strategy": "..." },
       { "id": "B", "text": "...", "strategy": "..." },
       { "id": "C", "text": "...", "strategy": "..." },
       { "id": "D", "text": "...", "strategy": "..." }
    ],
    "questionNumber": ${nextQNum},
    "totalQuestions": 5
  }`
      : 'null'
  },
  "sharkBrawl": {
    "shark1": "kevin | mark | lori | daymond | barbara",
    "shark2": "kevin | mark | lori | daymond | barbara",
    "dialogue": "Shark1: \"Heated argument quote\" | Shark2: \"Sharp counter-attack quote\"",
    "topic": "Debate topic (e.g. Valuation vs CAC, Royalties vs Retail)",
    "tensionLevel": "HEATED | EXPLOSIVE | CUTTHROAT"
  } // or null if no clash occurs
}
`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.85,
        },
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
    } catch (err) {
      console.warn('Gemini processAnswer fallback:', err);
    }
  }

  // Fallback next question generator
  return getFallbackTurn(pitch, answeredQuestion, userAnswerText, nextQNum, nextSharkId);
}

function getFallbackTurn(
  pitch: PitchData,
  answeredQuestion: SharkQuestion,
  userAnswerText: string,
  nextQNum: number,
  nextSharkId: ('mark' | 'kevin' | 'lori' | 'daymond' | 'barbara') | null
): {
  sharkReaction: SharkTurnResponse;
  nextQuestion: SharkQuestion | null;
  newOffer?: SharkOffer | null;
  sharkBrawl?: { shark1: string; shark2: string; dialogue: string } | null;
} {
  let reactionDialogue = '';
  let status: any = 'CONTEMPLATING';
  let interest = 65;

  if (answeredQuestion.sharkId === 'kevin') {
    if (userAnswerText.toLowerCase().includes('concession') || userAnswerText.toLowerCase().includes('negotiable')) {
      reactionDialogue = `Good. At least you have financial discipline. A founder who refuses to negotiate on valuation is dead to me. Let's see what the other sharks think.`;
      interest = 70;
    } else {
      reactionDialogue = `You're stubborn. I respect confidence, but the numbers don't lie. I'm keeping my eyes on your margin.`;
      interest = 60;
    }
  } else if (answeredQuestion.sharkId === 'mark') {
    reactionDialogue = `I like that you understand CAC. In direct-to-consumer, if you don't control your customer acquisition, Mark Zuckerberg owns your business.`;
    interest = 75;
  } else if (answeredQuestion.sharkId === 'lori') {
    reactionDialogue = `I hear you. But remember, retail buyers give you one chance. If this doesn't pop off the shelf in 3 seconds, you get clearanced out.`;
    interest = 72;
  } else {
    reactionDialogue = `I'm watching your body language while you answer. You don't get flustered easily.`;
    interest = 68;
  }

  // Offer possibility
  let offer: SharkOffer | null = null;
  if (nextQNum >= 4 && answeredQuestion.sharkId === 'kevin' && Math.random() > 0.5) {
    offer = {
      id: `offer_kevin_${Date.now()}`,
      sharkId: 'kevin',
      amount: pitch.askAmount,
      equity: 5,
      royalty: {
        amountPerUnit: Math.max(1, Math.round(pitch.retailPrice * 0.08 * 100) / 100),
        description: `$${Math.max(1, Math.round(pitch.retailPrice * 0.08 * 100) / 100)} per unit until investment is recouped, then $0.50 in perpetuity.`
      },
      explanation: "I'll give you all the money you asked for, but I want my cash back fast.",
      createdAt: Date.now()
    };
    status = 'MAKING_OFFER';
  }

  let nextQuestion: SharkQuestion | null = null;

  if (nextSharkId === 'mark') {
    nextQuestion = {
      id: 'q2',
      sharkId: 'mark',
      question: `Mark Cuban leans forward from his chair: "Here's what I care about—Customer Acquisition Cost (CAC). How much does it cost you to get a paying customer right now, and what stops Amazon or a big competitor from copying your product tomorrow?"`,
      context: 'Mark sets his notebook down and points directly at you.',
      options: [
        {
          id: 'A',
          text: `Our blended CAC is under $6 because 45% of our traffic comes organically through viral TikTok demonstrations.`,
          strategy: 'Organic CAC Defense'
        },
        {
          id: 'B',
          text: `We have proprietary manufacturing relationships and patents that give us an 18-month head start before any copycat can tool up.`,
          strategy: 'Defensive Lead Time'
        },
        {
          id: 'C',
          text: `Customers buy refills and repeat purchases every 60 days, giving us a high Customer Lifetime Value (LTV) of $120.`,
          strategy: 'High LTV / Retention'
        },
        {
          id: 'D',
          text: `That's why we need you, Mark. Your tech stack and direct-to-consumer expertise will lower our acquisition costs.`,
          strategy: 'Strategic Partner Appeal'
        }
      ],
      questionNumber: 2,
      totalQuestions: 5
    };
  } else if (nextSharkId === 'lori') {
    nextQuestion = {
      id: 'q3',
      sharkId: 'lori',
      question: `Lori Greiner holds up her pen: "I know a hero from a zero. Can this product be demonstrated in 10 seconds on television or retail end-caps? And do you own the utility patent, or can a factory in Asia replicate this overnight?"`,
      context: 'Lori inspects your product details in her notebook.',
      options: [
        {
          id: 'A',
          text: `It demonstrates instantly. The visual before-and-after difference stops shoppers in their tracks within 3 seconds.`,
          strategy: 'Instant Visual Demonstration'
        },
        {
          id: 'B',
          text: `We have an issued utility patent on the internal mechanism. We can legally block any copycats from US retail.`,
          strategy: 'Utility Patent Moat'
        },
        {
          id: 'C',
          text: `We can produce this for $${pitch.cogs} and package it for mass retail at Target and Bed Bath & Beyond right now.`,
          strategy: 'Retail Packaging Readiness'
        },
        {
          id: 'D',
          text: `Lori, with your QVC power, we could sell 50,000 units in a single 8-minute broadcast segment.`,
          strategy: 'QVC Volume Appeal'
        }
      ],
      questionNumber: 3,
      totalQuestions: 5
    };
  } else if (nextSharkId === 'daymond') {
    nextQuestion = {
      id: 'q4',
      sharkId: 'daymond',
      question: `Daymond John turns a page in his notebook: "I respect the sweat equity you've put in. But inventory is a killer. How much inventory do you have sitting in a warehouse, and would you be open to licensing this brand out to avoid manufacturing debt?"`,
      context: 'Daymond checks his notes on production and supply chain.',
      options: [
        {
          id: 'A',
          text: `We manufacture just-in-time in 60-day batches so we never tie up more than $30,000 in working capital.`,
          strategy: 'Lean Just-in-Time Inventory'
        },
        {
          id: 'B',
          text: `I would love a licensing deal! If you can license this to a major manufacturer for an 8% royalty, I'm all in.`,
          strategy: 'Licensing Partnership'
        },
        {
          id: 'C',
          text: `We have zero inventory backlog. Every batch we manufacture sells out on backorder within 3 weeks.`,
          strategy: 'High Velocity Sell-Through'
        },
        {
          id: 'D',
          text: `We want to build the brand equity ourselves first, but we need your guidance on retail distribution contracts.`,
          strategy: 'Brand Equity Focus'
        }
      ],
      questionNumber: 4,
      totalQuestions: 5
    };
  } else if (nextSharkId === 'barbara') {
    nextQuestion = {
      id: 'q5',
      sharkId: 'barbara',
      question: `Barbara Corcoran smiles and closes her notebook: "I invest in the jockey, not just the horse. You've answered the numbers well. But tell me: what was the hardest day in this business when you almost gave up, and why didn't you quit?"`,
      context: 'Barbara looks up from her book and studies your eyes.',
      options: [
        {
          id: 'A',
          text: `When our first manufacturing shipment was delayed by 3 months, I hand-delivered orders to 400 customers myself to keep our reputation.`,
          strategy: 'Founder Grit & Hustle'
        },
        {
          id: 'B',
          text: `When our initial distributor dropped us, I pivoted directly to online D2C and tripled our monthly revenue within 60 days.`,
          strategy: 'Rapid Adaptability'
        },
        {
          id: 'C',
          text: `I poured my entire life savings into this company because failure is simply not an option for me.`,
          strategy: 'All-In Commitment'
        },
        {
          id: 'D',
          text: `I love this product, but I'm humble enough to listen to someone like you who has built a billion-dollar empire.`,
          strategy: 'Coachability & Humility'
        }
      ],
      questionNumber: 5,
      totalQuestions: 5
    };
  }

  // Dynamic Shark Brawl showdown based on round
  let sharkBrawl: { shark1: string; shark2: string; dialogue: string; topic?: string; tensionLevel?: 'HEATED' | 'EXPLOSIVE' | 'CUTTHROAT' } | null = null;

  if (nextQNum === 2) {
    sharkBrawl = {
      shark1: 'kevin',
      shark2: 'mark',
      dialogue: 'Kevin: "Mark, you are living in Alice in Wonderland! This valuation is absurd!" | Mark: "Kevin, you have zero tech vision. You only understand draining founders with vampire royalties!"',
      topic: 'Valuation & Tech Moat vs Cash Flow',
      tensionLevel: 'EXPLOSIVE'
    };
  } else if (nextQNum === 3) {
    sharkBrawl = {
      shark1: 'lori',
      shark2: 'kevin',
      dialogue: 'Lori: "Kevin, stop suffocating the founder before they even get to retail shelves!" | Kevin: "Lori, retail is a graveyard! I want my money back on every unit while you pray for shelf space!"',
      topic: 'Retail Distribution vs Unit Royalties',
      tensionLevel: 'CUTTHROAT'
    };
  } else if (nextQNum === 4) {
    sharkBrawl = {
      shark1: 'daymond',
      shark2: 'mark',
      dialogue: 'Daymond: "Mark, not everything needs an algorithm. You don\'t understand culture and streetwear branding!" | Mark: "Daymond, if you don\'t own digital customer acquisition, you are just waiting to be cloned overnight!"',
      topic: 'Brand Authenticity vs Direct-To-Consumer Scale',
      tensionLevel: 'HEATED'
    };
  } else if (nextQNum === 5) {
    sharkBrawl = {
      shark1: 'barbara',
      shark2: 'kevin',
      dialogue: 'Barbara: "Kevin, you have ice in your veins. You don\'t recognize true founder grit when it\'s standing right in front of you!" | Kevin: "Barbara, cold hard cash doesn\'t care about your gut feelings or teary backstories!"',
      topic: 'Founder Grit vs Cold Financial Multiples',
      tensionLevel: 'EXPLOSIVE'
    };
  }

  return {
    sharkReaction: {
      sharkId: answeredQuestion.sharkId,
      dialogue: reactionDialogue,
      tone: 'inquisitive',
      status,
      interestScore: interest,
      offer
    },
    nextQuestion,
    newOffer: offer,
    sharkBrawl
  };
}

export async function generateDebriefWithGemini(
  pitch: PitchData,
  history: MessageLog[],
  outcome: { dealClosed: boolean; winningDeal?: SharkOffer }
): Promise<DebriefReport> {
  const impliedVal = pitch.askEquity > 0 ? Math.round(pitch.askAmount / (pitch.askEquity / 100)) : 0;
  const mult = pitch.annualSales > 0 ? (impliedVal / pitch.annualSales).toFixed(1) : 'Pre-revenue';

  const prompt = `
Generate a Shark Tank debrief scorecard for:
Company: "${pitch.businessName}"
Ask: $${pitch.askAmount.toLocaleString()} for ${pitch.askEquity}%
Outcome: ${outcome.dealClosed ? `Deal confirmed with ${outcome.winningDeal?.sharkId}` : 'No deal'}

Transcript:
${history.slice(-8).map((h) => `${h.sender}: ${h.text}`).join('\n')}

Return JSON:
{
  "grade": "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "D" | "F",
  "dealClosed": ${outcome.dealClosed},
  "valuationAssessment": "...",
  "sharkPraise": ["array of 2-3 specific praises"],
  "sharkCriticisms": ["array of 2-3 specific flaws"],
  "pitchDoctorTips": ["3 tactical changes for real investors"],
  "investorReadyScore": number (0 to 100)
}
`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
          ...parsed,
          dealClosed: outcome.dealClosed,
          winningDeal: outcome.winningDeal,
        };
      }
    } catch (e) {
      console.warn('Debrief fallback:', e);
    }
  }

  return {
    grade: outcome.dealClosed ? 'A-' : 'B',
    dealClosed: outcome.dealClosed,
    winningDeal: outcome.winningDeal,
    valuationAssessment: `At an implied valuation of $${impliedVal.toLocaleString()} (${mult}x revenue), your business pricing was ${Number(mult) > 6 ? 'stretched' : 'within early-stage venture norms'}.`,
    sharkPraise: [
      `Articulated ${pitch.businessName} value proposition crisply`,
      `Demonstrated real sales velocity of $${pitch.annualSales.toLocaleString()}`,
      `Handled tough Shark cross-examination without freezing`
    ],
    sharkCriticisms: [
      'Need stronger defensibility and retail distribution exclusivity',
      'Cost of goods leaves thin cushion if raw material costs fluctuate'
    ],
    pitchDoctorTips: [
      'Lead with your unit economics and payback period in the first 30 seconds',
      'Never negotiate against yourself when multiple sharks compete',
      'Calculate your walk-away valuation floor before entering the room'
    ],
    investorReadyScore: outcome.dealClosed ? 88 : 70
  };
}

// Multimodal Voice Audio Transcription fallback with Gemini
export async function transcribeAudioWithGemini(
  audioBase64: string,
  mimeType: string = 'audio/webm'
): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    try {
      const cleanMime = mimeType.split(';')[0].trim() || 'audio/webm';
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            inlineData: {
              data: audioBase64,
              mimeType: cleanMime,
            },
          },
          {
            text: 'Transcribe the spoken speech in this audio clearly into text. Return ONLY the transcribed words. Do not wrap in quotes or add extra introductory words. If silent, return an empty string.',
          },
        ],
        config: {
          temperature: 0.1,
        },
      });

      return response.text?.trim() || '';
    } catch (err) {
      console.warn('Gemini audio transcription error:', err);
    }
  }
  return '';
}
