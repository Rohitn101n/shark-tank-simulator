import { SharkProfile, PitchData } from '../types/shark';

export const SHARKS: SharkProfile[] = [
  {
    id: 'mark',
    name: 'Mark Cuban',
    nickname: 'The Maverick',
    role: 'Tech Titan & Mavericks Owner',
    netWorth: '$5.4 Billion',
    color: '#64748b', // muted slate
    accentBg: 'rgba(100, 116, 139, 0.12)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
    specialty: ['Tech & AI', 'Direct-to-Consumer', 'Subscription & Scale', 'E-Commerce'],
    signatureStyle: 'High-energy, calls out BS instantly, hates patent trolls, uses 24-second shot clocks.',
    famousQuote: "You're selling vitamins, not aspirin. Work like there is someone working 24 hours a day to take it all away from you.",
    dealPetPeeve: 'Founders who come in asking for high valuations without proprietary tech, or who hesitate when given a fair deal.'
  },
  {
    id: 'kevin',
    name: "Kevin O'Leary",
    nickname: 'Mr. Wonderful',
    role: 'Venture Capitalist & Cash Flow King',
    netWorth: '$400 Million',
    color: '#71717a', // muted zinc
    accentBg: 'rgba(113, 113, 122, 0.12)',
    borderColor: 'rgba(113, 113, 122, 0.3)',
    specialty: ['Financial Structuring', 'Royalties & Cash Flow', 'Wine & Luxury', 'Cost of Goods Discipline'],
    signatureStyle: 'Zero emotion, demands royalties on every unit sold, offers tough love and zero mercy on valuation.',
    famousQuote: "You're dead to me. Take this idea behind the barn and shoot it. Money has only one purpose: to go out and make more money.",
    dealPetPeeve: 'Crazy high valuations with no sales, founders who cry, and people who refuse to give him a royalty stream.'
  },
  {
    id: 'lori',
    name: 'Lori Greiner',
    nickname: 'The Warm-Blooded Shark',
    role: 'Queen of QVC & Retail Powerhouse',
    netWorth: '$150 Million',
    color: '#78716c', // muted warm stone
    accentBg: 'rgba(120, 113, 108, 0.12)',
    borderColor: 'rgba(120, 113, 108, 0.3)',
    specialty: ['Retail Distribution', 'Packaging & Visuals', 'Utility Patents', 'QVC / Bed Bath & Beyond'],
    signatureStyle: 'Warm but lethal, spots "heroes vs zeroes" in seconds, demands instant decisions or she drops out.',
    famousQuote: "I know a hero from a zero. Can you make it for $2 and sell it for $19.99? I can put you on TV and sell out in 6 minutes.",
    dealPetPeeve: 'Products with no patent protection that will get knocked off overnight, or concepts that take more than 10 seconds to explain.'
  },
  {
    id: 'daymond',
    name: 'Daymond John',
    nickname: "The People's Shark",
    role: 'Branding Genius & FUBU Founder',
    netWorth: '$350 Million',
    color: '#52525b', // muted dark zinc
    accentBg: 'rgba(82, 82, 91, 0.12)',
    borderColor: 'rgba(82, 82, 91, 0.3)',
    specialty: ['Branding & Apparel', 'Licensing Deals', 'Social Proof', 'Distribution Partnerships'],
    signatureStyle: 'Street-smart, values the founder’s hustle and sweat equity, prefers licensing out manufacturing.',
    famousQuote: "You can't buy hustle. If you don't know your numbers, you don't know your business. Why should I work harder on your company than you?",
    dealPetPeeve: 'Entrepreneurs looking for a celebrity co-signer without putting in the legwork, or holding too much inventory.'
  },
  {
    id: 'barbara',
    name: 'Barbara Corcoran',
    nickname: 'The Real Estate Queen',
    role: 'Corcoran Group Founder & Instinct Investor',
    netWorth: '$100 Million',
    color: '#6b7280', // muted cool gray
    accentBg: 'rgba(107, 114, 128, 0.12)',
    borderColor: 'rgba(107, 114, 128, 0.3)',
    specialty: ['Founder Character', 'Food & Viral Goods', 'Real Estate & Services', 'Marketing Stunts'],
    signatureStyle: 'Unapologetically intuitive, judges the entrepreneur’s soul, famous for quirky exits ("For that reason, I\'m out").',
    famousQuote: "I invest in the jockey, not the horse. You're too smooth, you have an answer for everything, I don't trust you. For that reason, I'm out.",
    dealPetPeeve: 'Founders who are overly polished or defensive, and people who look at the other sharks while talking to her.'
  }
];

export const PRESET_PITCHES: PitchData[] = [
  {
    businessName: 'SmileyClean Scrub',
    tagline: 'The temperature-responsive smiley sponge that changes texture in warm and cold water',
    pitchText: 'Sharks, traditional kitchen sponges are breeding grounds for bacteria and scratch delicate non-stick pans. SmileyClean is made of proprietary FlexFoam: rock-firm in cold water for scrubbing burnt grease, and soft and compressible in warm water for gentle glassware. Plus, the ergonomic smiley face lets you clean both sides of spoons and forks at once! We sold $400k last year online, but we need a Shark to get us into Walmart and Target.',
    askAmount: 200000,
    askEquity: 10,
    annualSales: 400000,
    cogs: 0.65,
    retailPrice: 3.99,
    patents: 'Utility patent granted on dual-texture polymer matrix',
    category: 'Household & Consumer Goods'
  },
  {
    businessName: 'NeuroRest AI Pillow',
    tagline: 'Smart orthopedic pillow with micro-actuators that eliminates snoring without waking you up',
    pitchText: 'Over 90 million Americans snore, causing sleep apnea and divorce court arguments. NeuroRest uses acoustic binaural sensors and internal soft air-chambers. The second it detects a snore frequency, it subtly elevates your head by 8 degrees, opening your airway silently. In our beta test with 1,200 couples, snoring stopped in 88% of cases on night one.',
    askAmount: 500000,
    askEquity: 8,
    annualSales: 850000,
    cogs: 42.00,
    retailPrice: 199.00,
    patents: 'Two provisional patents on real-time micro-inflation algorithm',
    category: 'Health, Wellness & AI Tech'
  },
  {
    businessName: 'ChillSnap Cold Brew Press',
    tagline: 'Patent-pending acoustic vacuum press that makes smooth cold brew in 45 seconds instead of 18 hours',
    pitchText: 'Cold brew is a $3 Billion market, but making it at home takes 18 to 24 hours of messy soaking. ChillSnap uses rapid acoustic sonic cavitation to extract coffee flavor oils in just 45 seconds with zero bitterness and 60% less acid. It fits in your bag, runs on USB-C, and tastes like artisanal café brew.',
    askAmount: 350000,
    askEquity: 12,
    annualSales: 180000,
    cogs: 14.50,
    retailPrice: 69.99,
    patents: 'Patent pending on acoustic pressure extraction chamber',
    category: 'Kitchen, Food & Beverage'
  },
  {
    businessName: 'BarkPack Ergonomic Dog Carrier',
    tagline: 'Veterinarian-approved spinal support canine backpack for hiking and public transit',
    pitchText: 'Millennials treat dogs like their children. But when small to medium dogs get tired on a hike or need to ride the subway, carrying them is awkward and damages their hips. BarkPack distributes 90% of weight to the human hips while holding the dog in a natural ergonomic seated posture with cooling mesh.',
    askAmount: 150000,
    askEquity: 15,
    annualSales: 320000,
    cogs: 18.00,
    retailPrice: 89.00,
    patents: 'Design patent granted, utility patent published',
    category: 'Pets & Outdoor Lifestyle'
  }
];
