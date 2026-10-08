import { PitchData, SharkOffer } from '../types/shark';

export function generateFinalSharkOffers(
  pitch: PitchData,
  statuses: Record<string, string>,
  scores: Record<string, number>
): SharkOffer[] {
  const offers: SharkOffer[] = [];
  const baseAmount = pitch.askAmount;
  const baseEquity = pitch.askEquity;

  // Kevin O'Leary Deal (Royalty King)
  if (statuses['kevin'] !== 'OUT') {
    const unitRoyalty = Math.max(1, Math.round(pitch.retailPrice * 0.08 * 100) / 100);
    offers.push({
      id: `final_offer_kevin_${Date.now()}`,
      sharkId: 'kevin',
      amount: baseAmount,
      equity: Math.max(5, Math.round(baseEquity * 0.7)),
      royalty: {
        amountPerUnit: unitRoyalty,
        threshold: baseAmount * 1.5,
        inPerpetuityAmount: Math.max(0.25, Math.round(unitRoyalty * 0.25 * 100) / 100),
        description: `$${unitRoyalty} per unit until $${Math.round(baseAmount * 1.5).toLocaleString()} is recouped, then $${Math.max(0.25, Math.round(unitRoyalty * 0.25 * 100) / 100)} in perpetuity.`,
      },
      explanation: "I give you 100% of the cash you asked for, and you keep most of your equity. My money goes out, works hard, and comes back.",
      createdAt: Date.now(),
    });
  }

  // Mark Cuban Deal (Tech & Pure Equity)
  if (statuses['mark'] !== 'OUT') {
    const markEquity = Math.max(12, Math.round(baseEquity * 1.3));
    offers.push({
      id: `final_offer_mark_${Date.now()}`,
      sharkId: 'mark',
      amount: baseAmount,
      equity: markEquity,
      shotClockSeconds: 24,
      explanation: `I will give you $${baseAmount.toLocaleString()} for ${markEquity}% equity. Zero royalties bleeding your cash flow. We plug your business into my D2C tech infrastructure.`,
      createdAt: Date.now(),
    });
  }

  // Lori Greiner Deal (QVC & Retail Power)
  if (statuses['lori'] !== 'OUT') {
    const loriEquity = Math.max(15, Math.round(baseEquity * 1.4));
    offers.push({
      id: `final_offer_lori_${Date.now()}`,
      sharkId: 'lori',
      amount: baseAmount,
      equity: loriEquity,
      contingencies: ['QVC television premiere within 60 days', 'End-cap retail placement in Target/Bed Bath & Beyond'],
      explanation: `I know this is a hero product. I will put you on TV next month and get you on retail shelves nationwide.`,
      createdAt: Date.now(),
    });
  }

  // Daymond John Deal (Branding & Licensing)
  if (statuses['daymond'] !== 'OUT') {
    const daymondEquity = Math.max(15, Math.round(baseEquity * 1.5));
    offers.push({
      id: `final_offer_daymond_${Date.now()}`,
      sharkId: 'daymond',
      amount: baseAmount,
      equity: daymondEquity,
      contingencies: ['License out manufacturing to tier-1 supply partner'],
      explanation: `I'm going to take the manufacturing burden off your shoulders by licensing this out so you don't burn cash on inventory.`,
      createdAt: Date.now(),
    });
  }

  // Barbara Corcoran Deal (Scrappy Marketing & Mentorship)
  if (statuses['barbara'] !== 'OUT') {
    const barbaraEquity = Math.max(12, Math.round(baseEquity * 1.25));
    offers.push({
      id: `final_offer_barbara_${Date.now()}`,
      sharkId: 'barbara',
      amount: baseAmount,
      equity: barbaraEquity,
      explanation: `I invest in the jockey. You have grit. I will personally mentor you every Friday and engineer viral PR campaigns for you.`,
      createdAt: Date.now(),
    });
  }

  // Guarantee at least 2 offers if too many went out
  if (offers.length < 2) {
    if (!offers.find((o) => o.sharkId === 'mark')) {
      offers.push({
        id: `final_offer_mark_alt_${Date.now()}`,
        sharkId: 'mark',
        amount: baseAmount,
        equity: Math.max(15, Math.round(baseEquity * 1.4)),
        explanation: `I was skeptical on your multiple, but I love the grit. I'll give you your asking cash for ${Math.max(15, Math.round(baseEquity * 1.4))}%.`,
        createdAt: Date.now(),
      });
    }
    if (!offers.find((o) => o.sharkId === 'kevin')) {
      offers.push({
        id: `final_offer_kevin_alt_${Date.now()}`,
        sharkId: 'kevin',
        amount: baseAmount,
        equity: 6,
        royalty: {
          amountPerUnit: Math.max(1, Math.round(pitch.retailPrice * 0.08 * 100) / 100),
          description: `$${Math.max(1, Math.round(pitch.retailPrice * 0.08 * 100) / 100)}/unit until recouped, then $0.50 in perpetuity.`,
        },
        explanation: "Fine, you convinced me. Here is my royalty offer—take it or leave it.",
        createdAt: Date.now(),
      });
    }
  }

  return offers;
}
