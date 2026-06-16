import { useState } from 'react'
import './index.css'
import GameBoard from './components/GameBoard'
import MultiplayerRoom from './components/MultiplayerRoom'

function App() {
  const [inGame, setInGame] = useState(false)
  const [inMultiplayer, setInMultiplayer] = useState(false)

  if (inGame) {
    return <GameBoard onExit={() => setInGame(false)} />
  }

  if (inMultiplayer) {
    return <MultiplayerRoom onExit={() => setInMultiplayer(false)} />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-2xl max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold text-tunisian-blue mb-4" dir="rtl">
          رامي تونسي
        </h1>
        <h2 className="text-2xl text-tunisian-emerald font-semibold mb-8">
          Tunisian Rami
        </h2>
        
        <p className="text-gray-700 mb-8 leading-relaxed text-lg" dir="rtl">
          مرحباً بك في لعبة الرامي التونسي الأصيلة. العب مع أصدقائك أو ضد الكمبيوتر في بيئة مستوحاة من التراث التونسي الجميل.
        </p>

        <div className="flex gap-4 justify-center">
          <button 
            className="bg-tunisian-blue hover:bg-tunisian-light-blue text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg cursor-pointer"
            onClick={() => setInGame(true)}
          >
            العب الآن (Play Offline)
          </button>
          <button 
            className="bg-tunisian-emerald hover:bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg cursor-pointer"
            onClick={() => setInMultiplayer(true)}
          >
            لعب جماعي (Multiplayer)
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
