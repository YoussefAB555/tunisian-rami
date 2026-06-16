import React from 'react';
import { Play, Users } from 'lucide-react';

const Card = ({ card, onClick, selected }) => {
  if (!card) {
    // Render back of card
    return (
      <div className="w-20 h-32 md:w-24 md:h-36 rounded-xl card-back shadow-lg m-1 transform hover:-translate-y-2 transition-transform cursor-pointer border-2 border-white"></div>
    );
  }

  const { suit, value, isJoker } = card;
  const isRed = suit === 'hearts' || suit === 'diamonds';
  
  const getSuitSymbol = (suit) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  return (
    <div 
      onClick={() => onClick && onClick(card)}
      className={`relative w-20 h-32 md:w-24 md:h-36 bg-white rounded-xl shadow-lg m-1 cursor-pointer select-none transition-all duration-200 
      ${selected ? '-translate-y-4 ring-4 ring-tunisian-emerald shadow-2xl' : 'hover:-translate-y-2'}
      ${isRed ? 'text-red-600' : 'text-gray-900'} flex flex-col justify-between p-2`}
    >
      {isJoker ? (
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-xl font-bold tracking-widest rotate-90 text-tunisian-blue">JOKER</span>
          <div className="text-4xl">🎭</div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-start leading-none">
            <span className="text-lg md:text-xl font-bold">{value}</span>
            <span className="text-xl md:text-2xl">{getSuitSymbol(suit)}</span>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
             <span className="text-5xl md:text-6xl">{getSuitSymbol(suit)}</span>
          </div>
          
          <div className="flex flex-col items-end leading-none rotate-180">
            <span className="text-lg md:text-xl font-bold">{value}</span>
            <span className="text-xl md:text-2xl">{getSuitSymbol(suit)}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default Card;
