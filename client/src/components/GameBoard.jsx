import React, { useState, useEffect } from 'react';
import Card from './Card';
import { dealCards, isValidMeld, findBestMelds, getBestDiscard } from '../game/RamiLogic';

const GameBoard = ({ onExit }) => {
  const [playerHand, setPlayerHand] = useState([]);
  const [aiHand, setAiHand] = useState([]);
  const [drawPile, setDrawPile] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [tableMelds, setTableMelds] = useState([]);
  
  const [selectedCards, setSelectedCards] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'

  // Initialize Game
  useEffect(() => {
    const { hands, drawPile, discardPile } = dealCards(2);
    setPlayerHand(hands[0]); // P1 (Human) gets 15 cards initially and starts
    setAiHand(hands[1]);     // P2 (AI) gets 14 cards
    setDrawPile(drawPile);
    setDiscardPile(discardPile);
    setHasDrawn(true); // Player 1 starts with 15 cards, which is equivalent to having already drawn.
  }, []);

  const handleCardClick = (card) => {
    if (!isPlayerTurn) return;
    
    // Toggle selection
    if (selectedCards.find(c => c.id === card.id)) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleDraw = () => {
    if (!isPlayerTurn || hasDrawn) return;
    if (drawPile.length === 0) {
      // Reshuffle discard pile into draw pile in a real game, skipped for brevity here
      return;
    }
    
    const newDrawPile = [...drawPile];
    const card = newDrawPile.pop();
    setDrawPile(newDrawPile);
    setPlayerHand([...playerHand, card]);
    setHasDrawn(true);
  };

  const handleDrawFromDiscard = () => {
    if (!isPlayerTurn || hasDrawn || discardPile.length === 0) return;
    const newDiscard = [...discardPile];
    const card = newDiscard.pop();
    setDiscardPile(newDiscard);
    setPlayerHand([...playerHand, card]);
    setHasDrawn(true);
  };

  const handleMeld = () => {
    if (!isPlayerTurn || !hasDrawn || selectedCards.length < 3) return;
    
    if (isValidMeld(selectedCards)) {
      // Remove selected cards from hand
      const newHand = playerHand.filter(c => !selectedCards.find(sc => sc.id === c.id));
      setPlayerHand(newHand);
      setTableMelds([...tableMelds, selectedCards]);
      setSelectedCards([]);
      
      // Check Win Condition
      if (newHand.length === 0) {
        setGameStatus('won');
      }
    } else {
      alert("تركيبة غير صالحة (Invalid Meld)");
    }
  };

  const handleDiscard = () => {
    if (!isPlayerTurn || !hasDrawn || selectedCards.length !== 1) {
      alert("اختر ورقة واحدة للرمي (Select exactly one card to discard)");
      return;
    }
    
    const cardToDiscard = selectedCards[0];
    const newHand = playerHand.filter(c => c.id !== cardToDiscard.id);
    
    setPlayerHand(newHand);
    setDiscardPile([...discardPile, cardToDiscard]);
    setSelectedCards([]);
    setHasDrawn(false);
    setIsPlayerTurn(false);
    
    if (newHand.length === 0) {
      setGameStatus('won');
    }
  };

  // Smart AI Turn
  useEffect(() => {
    if (!isPlayerTurn && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        let newHand = [...aiHand];
        let newDrawPile = [...drawPile];
        let newDiscardPile = [...discardPile];
        let newTableMelds = [...tableMelds];
        
        // 1. Draw Phase
        let drewFromDiscard = false;
        if (newDiscardPile.length > 0) {
          const topDiscard = newDiscardPile[newDiscardPile.length - 1];
          // Check if topDiscard forms a meld with current hand
          const testHand = [...newHand, topDiscard];
          const bestMelds = findBestMelds(testHand);
          
          // If a meld is found involving the topDiscard, take it
          const usedDiscard = bestMelds.melds.some(meld => meld.find(c => c.id === topDiscard.id));
          if (usedDiscard) {
            newHand.push(newDiscardPile.pop());
            drewFromDiscard = true;
          }
        }
        
        // If didn't draw from discard, draw from stock
        if (!drewFromDiscard && newDrawPile.length > 0) {
          newHand.push(newDrawPile.pop());
        }
        
        // 2. Meld Phase
        const { melds, remainingHand } = findBestMelds(newHand);
        if (melds.length > 0) {
          newTableMelds = [...newTableMelds, ...melds];
          newHand = remainingHand;
        }
        
        // 3. Discard Phase
        let discardCard = null;
        if (newHand.length > 0) {
          discardCard = getBestDiscard(newHand);
          if (!discardCard) discardCard = newHand[0]; // fallback
          
          newHand = newHand.filter(c => c.id !== discardCard.id);
          newDiscardPile.push(discardCard);
        }
        
        // Update state
        setDrawPile(newDrawPile);
        setAiHand(newHand);
        setDiscardPile(newDiscardPile);
        setTableMelds(newTableMelds);
        
        if (newHand.length === 0) {
          setGameStatus('lost'); // Player lost
        } else {
          setIsPlayerTurn(true);
        }
      }, 1500); // simulate thinking
      
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameStatus, drawPile, aiHand, discardPile, tableMelds]);


  if (gameStatus === 'won') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-12 text-center rounded-2xl">
          <h1 className="text-4xl text-tunisian-emerald font-bold mb-4" dir="rtl">مبروك! لقد فزت</h1>
          <button onClick={onExit} className="mt-4 px-6 py-2 bg-tunisian-blue text-white rounded-lg">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  if (gameStatus === 'lost') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-12 text-center rounded-2xl">
          <h1 className="text-4xl text-red-600 font-bold mb-4" dir="rtl">حظ أوفر، لقد خسرت</h1>
          <button onClick={onExit} className="mt-4 px-6 py-2 bg-tunisian-blue text-white rounded-lg">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      {/* Top Bar / AI Info */}
      <div className="flex justify-between items-center mb-8 glass-panel p-4 rounded-xl">
        <button onClick={onExit} className="text-tunisian-red font-bold">إنهاء اللعبة (Exit)</button>
        <div className="text-lg font-bold" dir="rtl">
          أوراق الخصم: {aiHand.length}
        </div>
      </div>

      {/* Center Table Area */}
      <div className="flex-1 flex flex-col md:flex-row gap-8 justify-center items-center">
        {/* Draw & Discard Piles */}
        <div className="flex gap-4 p-6 glass-panel rounded-2xl">
          <div className="text-center">
            <h3 className="mb-2 font-bold text-tunisian-blue" dir="rtl">السحب</h3>
            <div onClick={handleDraw}>
              {drawPile.length > 0 ? <Card card={null} /> : <div className="w-20 h-32 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center">0</div>}
            </div>
            <span className="text-sm text-gray-600">{drawPile.length}</span>
          </div>
          
          <div className="text-center">
            <h3 className="mb-2 font-bold text-tunisian-emerald" dir="rtl">الرمي</h3>
            <div onClick={handleDrawFromDiscard}>
               {discardPile.length > 0 ? (
                 <Card card={discardPile[discardPile.length - 1]} />
               ) : (
                 <div className="w-20 h-32 md:w-24 md:h-36 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center">فارغ</div>
               )}
            </div>
            <span className="text-sm text-gray-600">{discardPile.length}</span>
          </div>
        </div>

        {/* Melds Area */}
        <div className="flex-1 min-h-[200px] glass-panel rounded-2xl p-4 overflow-y-auto">
          <h3 className="text-center font-bold text-tunisian-blue mb-4" dir="rtl">التركيبات (Melds)</h3>
          <div className="flex flex-wrap gap-6 justify-center">
            {tableMelds.map((meld, i) => (
              <div key={i} className="flex -space-x-12">
                {meld.map((card, j) => (
                  <Card key={card.id} card={card} />
                ))}
              </div>
            ))}
            {tableMelds.length === 0 && <p className="text-gray-500 m-auto" dir="rtl">لا توجد تركيبات بعد</p>}
          </div>
        </div>
      </div>

      {/* Player Action Bar */}
      <div className="mt-8 flex gap-4 justify-center">
        <button 
          onClick={handleMeld}
          disabled={!isPlayerTurn || !hasDrawn || selectedCards.length < 3}
          className="bg-tunisian-emerald text-white px-6 py-2 rounded-lg font-bold shadow-lg disabled:opacity-50"
        >
          إنزال أوراق (Meld)
        </button>
        <button 
          onClick={handleDiscard}
          disabled={!isPlayerTurn || !hasDrawn || selectedCards.length !== 1}
          className="bg-tunisian-blue text-white px-6 py-2 rounded-lg font-bold shadow-lg disabled:opacity-50"
        >
          رمي (Discard)
        </button>
      </div>

      {/* Player Hand */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-tunisian-blue" dir="rtl">أوراقك ({playerHand.length})</h3>
          <span className="text-sm font-semibold bg-white px-3 py-1 rounded-full shadow" dir="rtl">
            {isPlayerTurn ? (hasDrawn ? 'دورك: العب أو ارمي' : 'دورك: اسحب ورقة') : 'انتظر دور الخصم...'}
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-2 bg-white/50 p-4 rounded-xl shadow-inner min-h-[160px]">
          {playerHand.map(card => (
            <Card 
              key={card.id} 
              card={card} 
              selected={selectedCards.some(c => c.id === card.id)}
              onClick={handleCardClick} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
