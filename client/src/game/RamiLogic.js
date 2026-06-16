export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const JOKER = 'JOKER';

export function createDeck() {
  const deck = [];
  // Two standard 52-card decks
  for (let i = 0; i < 2; i++) {
    for (const suit of SUITS) {
      for (const value of VALUES) {
        deck.push({ id: `card-${i}-${suit}-${value}`, suit, value, isJoker: false });
      }
    }
  }
  // 4 Jokers
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `joker-${i}`, suit: null, value: JOKER, isJoker: true });
  }
  return deck;
}

export function shuffleDeck(deck) {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

export function dealCards(numPlayers = 2) {
  let deck = shuffleDeck(createDeck());
  const hands = Array(numPlayers).fill([]).map(() => []);
  
  // Deal 14 cards to each player, 15 to the first player
  for (let i = 0; i < 14; i++) {
    for (let p = 0; p < numPlayers; p++) {
      hands[p].push(deck.pop());
    }
  }
  
  // The first player gets an extra card to start the discard pile (or play immediately)
  hands[0].push(deck.pop());
  
  const drawPile = deck;
  const discardPile = [];
  
  return { hands, drawPile, discardPile };
}

// Helper to get card rank value (for runs)
const valueMap = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, 
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};

export function isValidSet(cards) {
  if (cards.length < 3 || cards.length > 4) return false;
  
  const normalCards = cards.filter(c => !c.isJoker);
  if (normalCards.length === 0) return true; // All jokers (rare but technically valid if allowed)
  
  const targetValue = normalCards[0].value;
  const suits = new Set();
  
  for (const card of normalCards) {
    if (card.value !== targetValue) return false; // Different values
    if (suits.has(card.suit)) return false; // Duplicate suits in a set
    suits.add(card.suit);
  }
  return true;
}

export function isValidRun(cards) {
  if (cards.length < 3) return false;
  
  const normalCards = cards.filter(c => !c.isJoker);
  if (normalCards.length === 0) return true;
  
  const targetSuit = normalCards[0].suit;
  for (const card of normalCards) {
    if (card.suit !== targetSuit) return false;
  }
  
  // Sort normal cards to verify the sequence
  // We need to check if gaps can be filled by jokers
  const sortedNormal = [...normalCards].sort((a, b) => valueMap[a.value] - valueMap[b.value]);
  let expectedNext = valueMap[sortedNormal[0].value];
  let jokersAvailable = cards.length - normalCards.length;
  
  for (let i = 0; i < sortedNormal.length; i++) {
    const currentVal = valueMap[sortedNormal[i].value];
    if (currentVal !== expectedNext) {
      const gap = currentVal - expectedNext;
      if (gap <= jokersAvailable && gap > 0) {
        jokersAvailable -= gap;
        expectedNext = currentVal + 1;
      } else {
        // Special case: A can be high (after K). This basic logic assumes A is low.
        return false;
      }
    } else {
      expectedNext++;
    }
  }
  return true;
}

export function isValidMeld(cards) {
  return isValidSet(cards) || isValidRun(cards);
}

export function calculateHandScore(cards) {
  let score = 0;
  for (const card of cards) {
    if (card.isJoker) score += 50; // High penalty for holding Jokers
    else if (['J', 'Q', 'K'].includes(card.value)) score += 10;
    else if (card.value === 'A') score += 1; // Or 11 depending on specific house rules, usually 1 or 11
    else score += parseInt(card.value);
  }
  return score;
}

function getCombinations(array, size) {
  const result = [];
  function combine(start, currentCombo) {
    if (currentCombo.length === size) {
      result.push([...currentCombo]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      currentCombo.push(array[i]);
      combine(i + 1, currentCombo);
      currentCombo.pop();
    }
  }
  combine(0, []);
  return result;
}

export function findBestMelds(hand) {
  let remainingHand = [...hand];
  const meldsFound = [];
  let foundMeld = true;

  // We loop until no more melds of size 3 or 4 can be found
  while (foundMeld) {
    foundMeld = false;
    // Check size 4 first, then size 3 to maximize cards melded
    for (const size of [4, 3]) {
      if (remainingHand.length < size) continue;
      const combos = getCombinations(remainingHand, size);
      for (const combo of combos) {
        if (isValidMeld(combo)) {
          meldsFound.push(combo);
          // Remove from remaining hand
          remainingHand = remainingHand.filter(c => !combo.find(mc => mc.id === c.id));
          foundMeld = true;
          break; // restart while loop with new hand
        }
      }
      if (foundMeld) break; 
    }
  }

  return { melds: meldsFound, remainingHand };
}

export function getBestDiscard(hand) {
  if (hand.length === 0) return null;
  // Sort descending by value, but put Jokers at the end
  const sorted = [...hand].sort((a, b) => {
    if (a.isJoker && b.isJoker) return 0;
    if (a.isJoker) return 1;
    if (b.isJoker) return -1;
    const valA = ['J','Q','K'].includes(a.value) ? 10 : (a.value === 'A' ? 1 : parseInt(a.value));
    const valB = ['J','Q','K'].includes(b.value) ? 10 : (b.value === 'A' ? 1 : parseInt(b.value));
    return valB - valA;
  });
  return sorted[0];
}
