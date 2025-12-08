import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  List, 
  ChevronRight, 
  GraduationCap, 
  ArrowLeft, 
  User, 
  Trash2, 
  Trophy,
  AlertCircle,
  Share2,
  Copy,
  Check,
  Sparkles,
  Eye,
  LogOut
} from 'lucide-react';

// --- Constants ---

// 定義顏色常數，以便透過索引 (0, 1, 2, 3) 來參照，節省網址空間
const THEME_COLORS = [
  'bg-rose-500', 
  'bg-indigo-500', 
  'bg-emerald-500', 
  'bg-orange-500'
];

// --- Types ---

type ViewType = 'home' | 'create' | 'records' | 'card';

interface Card {
  id: number;
  name: string;
  points: number;
  stamps: boolean[];
  createdAt: string;
  themeColor: string;
}

interface BaseProps {
  onNavigate: (view: ViewType) => void;
}

// --- Helper Functions for Sharing (Optimized) ---

// V2 壓縮版：將卡片資料編碼成極短的 Base64 字串
const encodeCardData = (card: Card): string => {
  const stampsBitmap = card.stamps.reduce((acc, val, i) => acc | (val ? (1 << i) : 0), 0);
  const colorIndex = THEME_COLORS.indexOf(card.themeColor);
  const data = [
    card.name,
    stampsBitmap,
    colorIndex >= 0 ? colorIndex : 0, 
    card.createdAt
  ];
  return btoa(encodeURIComponent(JSON.stringify(data)));
};

// V2 解碼版
const decodeCardData = (encoded: string): Partial<Card> | null => {
  try {
    const json = decodeURIComponent(atob(encoded));
    const data = JSON.parse(json);
    
    if (Array.isArray(data)) {
      const [name, stampsBitmap, colorIndex, createdAt] = data;
      const stamps = Array(30).fill(false).map((_, i) => !!((stampsBitmap >> i) & 1));
      const points = stamps.filter(Boolean).length;
      const themeColor = THEME_COLORS[colorIndex] || THEME_COLORS[0];

      return { name, points, stamps, themeColor, createdAt, id: 0 };
    } else {
      // Legacy support for older V1 format if needed, or structured object
      return {
        name: data.n,
        points: data.p,
        stamps: data.s,
        themeColor: data.t,
        createdAt: data.d,
        id: 0
      };
    }
  } catch (e) {
    console.error("Failed to decode card data", e);
    return null;
  }
};

// --- Components ---

// 1. HomeView
interface HomeViewProps extends BaseProps {
  cardCount: number;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, cardCount }) => {
  return (
    <div className="flex flex-col h-full bg-[#f8f5f2] max-w-2xl mx-auto w-full shadow-2xl min-h-screen">
      <div className="bg-white p-10 rounded-b-[40px] shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-yellow-100 rounded-full opacity-50 blur-xl"></div>
        <div className="absolute top-[40px] left-[-20px] w-32 h-32 bg-rose-100 rounded-full opacity-50 blur-xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-gray-800 tracking-tight mb-3">
            Student Rewards <span className="text-rose-500">.</span>
          </h1>
          <p className="text-gray-500 text-xl font-medium">家教學生集點簿</p>
        </div>
      </div>

      <div className="flex-1 px-8 flex flex-col gap-6 overflow-y-auto pb-10">
        <button 
          onClick={() => onNavigate('create')}
          className="group w-full bg-white p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all border border-gray-100 flex justify-between items-center cursor-pointer"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
              <Plus size={32} strokeWidth={3} />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-800">新增學生</h2>
              <p className="text-gray-400 text-lg mt-1">建立新的集點卡</p>
            </div>
          </div>
          <ChevronRight className="text-gray-300" size={32} />
        </button>

        <button 
          onClick={() => onNavigate('records')}
          className="group w-full bg-white p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all border border-gray-100 flex justify-between items-center cursor-pointer"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
              <List size={32} strokeWidth={3} />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-800">學生列表</h2>
              <p className="text-gray-400 text-lg mt-1">查看 {cardCount} 位學生的進度</p>
            </div>
          </div>
          <ChevronRight className="text-gray-300" size={32} />
        </button>

        <div className="mt-auto mb-10 flex justify-center opacity-10">
            <GraduationCap size={150} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
};

// 2. CreateView
interface CreateViewProps extends BaseProps {
  onCreate: (e: React.FormEvent) => void;
  newCardName: string;
  setNewCardName: (name: string) => void;
}

const CreateView: React.FC<CreateViewProps> = ({ 
  onNavigate, 
  onCreate, 
  newCardName, 
  setNewCardName 
}) => {
  return (
    <div className="flex flex-col h-full bg-[#f8f5f2] max-w-2xl mx-auto w-full shadow-2xl min-h-screen">
      <div className="p-6 flex items-center">
        <button onClick={() => onNavigate('home')} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft size={28} className="text-gray-600" />
        </button>
      </div>

      <div className="flex-1 px-8 flex flex-col items-center pt-10">
        <div className="w-full">
          <div className="bg-white p-10 rounded-[40px] shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-rose-500"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">新增學生卡片</h2>
            
            <form onSubmit={onCreate} className="flex flex-col gap-8">
              <div>
                <label className="block text-lg font-bold text-gray-500 mb-4 uppercase tracking-wider">學生姓名</label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={28} />
                  <input
                    type="text"
                    value={newCardName}
                    onChange={(e) => setNewCardName(e.target.value)}
                    placeholder="請輸入姓名"
                    className="w-full text-2xl py-6 pl-16 pr-6 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-500 focus:outline-none transition-all placeholder:text-gray-300 font-bold text-gray-800"
                    autoFocus
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={!newCardName.trim()}
                className="w-full bg-rose-500 text-white py-6 rounded-2xl font-bold text-2xl shadow-lg shadow-rose-200 hover:bg-rose-600 hover:shadow-rose-300 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-[0.98] mt-4"
              >
                建立集點卡
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. RecordsView
interface RecordsViewProps extends BaseProps {
  cards: Card[];
  onRequestDelete: (card: Card) => void;
  onSelect: (cardId: number) => void;
}

const RecordsView: React.FC<RecordsViewProps> = ({ 
  onNavigate, 
  cards, 
  onRequestDelete, 
  onSelect 
}) => {
  return (
    <div className="flex flex-col h-full bg-[#f8f5f2] max-w-2xl mx-auto w-full shadow-2xl min-h-screen">
      <div className="p-6 pb-4 flex items-center justify-between sticky top-0 bg-[#f8f5f2]/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('home')} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
            <ArrowLeft size={28} className="text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">學生列表</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 pb-20 no-scrollbar">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
               <User size={40} className="opacity-30" />
            </div>
            <p className="text-xl">目前還沒有學生資料</p>
            <button onClick={() => onNavigate('create')} className="mt-8 px-8 py-4 bg-white text-rose-500 font-bold rounded-full text-lg shadow-sm border border-rose-100 hover:shadow-md transition-all">
              新增一位學生
            </button>
          </div>
        ) : (
          cards.map(card => (
            <div 
              key={card.id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center group relative overflow-hidden cursor-pointer hover:shadow-lg transition-all"
              onClick={() => onSelect(card.id)}
            >
              <div className="flex items-center gap-6 flex-1">
                <div className={`w-16 h-16 ${card.themeColor || 'bg-rose-500'} rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-md shrink-0`}>
                  {card.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-gray-800 mb-2">{card.name}</h3>
                  <div className="flex items-center gap-3">
                     <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${card.themeColor || 'bg-rose-500'}`} style={{ width: `${(card.points / 30) * 100}%` }}></div>
                     </div>
                     <p className="text-sm text-gray-400 font-bold">{card.points}/30</p>
                  </div>
                </div>
              </div>
              
              {/* 右側操作區 */}
              <div className="flex items-center gap-4 pl-4 border-l border-gray-100 z-20 relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    onRequestDelete(card);
                  }}
                  className="w-14 h-14 flex items-center justify-center rounded-full text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors active:scale-95"
                  title="刪除"
                  type="button"
                >
                  <Trash2 size={28} />
                </button>
                <ChevronRight className="text-gray-300" size={28} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 4. DeleteConfirmModal
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cardName?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  cardName 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-center text-gray-800 mb-2">確定要刪除嗎？</h3>
        <p className="text-center text-gray-500 mb-6">
          您即將刪除 <span className="font-bold text-gray-800">「{cardName}」</span> 的集點卡。<br/>
          此動作無法復原，資料將會消失。
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
          >
            取消
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-colors"
          >
            確認刪除
          </button>
        </div>
      </div>
    </div>
  );
};

// 5. ShareModal (Enhanced with Simulation Mode)
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  onSimulate: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareUrl, onSimulate }) => {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // 偵測是否為 Blob URL (預覽環境)
  const isPreviewEnvironment = typeof window !== 'undefined' && window.location.protocol === 'blob:';

  useEffect(() => {
    if (isOpen) setCopied(false);
  }, [isOpen]);

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl)
          .then(() => setCopied(true))
          .catch(() => fallbackCopy());
    } else {
        fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    if (inputRef.current) {
        inputRef.current.select();
        try {
            document.execCommand('copy');
            setCopied(true);
        } catch (err) {
            console.error('Copy failed', err);
        }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        
        {/* 標題與圖示 */}
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
          <Share2 size={28} />
        </div>
        <h3 className="text-xl font-bold text-center text-gray-800 mb-2">分享給學生</h3>
        
        {/* 預覽環境警告 */}
        {isPreviewEnvironment && (
           <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 text-sm text-orange-800 flex gap-2 items-start">
             <AlertCircle size={16} className="mt-0.5 shrink-0" />
             <div>
               <strong>注意：預覽模式無法分享連結</strong>
               <p className="opacity-80 mt-1 text-xs">您目前的網址是暫時的 (Blob)，無法傳送給他人。請使用下方的「模擬預覽」功能測試。</p>
             </div>
           </div>
        )}

        {!isPreviewEnvironment && (
            <p className="text-center text-gray-500 mb-6 text-sm">
            請複製下方連結傳送給學生。<br/>
            <span className="text-xs text-orange-400 mt-1 block">注意：此為當下狀態快照，更新點數後需重新分享。</span>
            </p>
        )}
        
        {/* 連結複製區 (如果在預覽環境則隱藏或 disable) */}
        <textarea
          ref={inputRef}
          value={isPreviewEnvironment ? "請使用下方按鈕進行模擬預覽" : shareUrl}
          readOnly
          onClick={(e) => !isPreviewEnvironment && e.currentTarget.select()}
          className={`w-full p-3 rounded-xl border mb-4 break-all text-xs font-mono h-24 overflow-y-auto resize-none focus:outline-none transition-colors
            ${isPreviewEnvironment ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-gray-50 text-gray-500 border-gray-200 focus:border-blue-500'}
          `}
        />

        {/* 按鈕區 */}
        <div className="flex flex-col gap-3">
            {/* 模擬按鈕 */}
            <button 
                onClick={onSimulate}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
                <Eye size={20} /> 在此裝置模擬預覽
            </button>

            <div className="flex gap-3">
                <button 
                    onClick={onClose}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                    關閉
                </button>
                <button 
                    onClick={handleCopy}
                    disabled={isPreviewEnvironment}
                    className={`flex-1 py-3 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    copied 
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200' 
                        : isPreviewEnvironment 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200'
                    }`}
                >
                    {copied ? (
                    <>
                        <Check size={20} /> 已複製
                    </>
                    ) : (
                    <>
                        <Copy size={20} /> 複製連結
                    </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// 6. StudentReadOnlyView (Updated with Exit Button)
interface StudentReadOnlyViewProps {
  card: Partial<Card>;
  onExitPreview?: () => void;
}

const StudentReadOnlyView: React.FC<StudentReadOnlyViewProps> = ({ card, onExitPreview }) => {
  const themeColor = card.themeColor || 'bg-rose-500';
  const textColor = themeColor.replace('bg-', 'text-');
  const points = card.points || 0;
  const stamps = card.stamps || Array(30).fill(false);

  return (
    <div className="flex flex-col h-full bg-[#f8f5f2] max-w-2xl mx-auto w-full shadow-2xl min-h-screen relative">
       {/* 頂部標題 */}
       <div className="p-6 pb-2 text-center">
         <h1 className="text-xl font-bold text-gray-400 uppercase tracking-widest">Student Rewards</h1>
         <p className="text-gray-800 font-bold text-lg mt-1">集點卡預覽模式</p>
       </div>

      {/* 擬真卡片區域 */}
      <div className="flex-1 overflow-y-auto px-6 pb-10 pt-4 flex flex-col items-center no-scrollbar">
        <div className="w-full bg-[#fffdf9] rounded-[32px] overflow-hidden shadow-2xl relative transform transition-transform hover:scale-[1.01] duration-500">
          <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ddd 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className={`relative p-10 pb-12 ${themeColor} text-white`}>
             <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-black tracking-wide mb-3 drop-shadow-md">{card.name}</h1>
                  <p className="text-white/80 text-base font-medium tracking-wider uppercase">Student Card</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                  <span className="font-bold text-3xl">{points}</span>
                  <span className="text-sm ml-2 opacity-80">PTS</span>
                </div>
             </div>
             <div className="absolute bottom-[-24px] left-0 w-full h-12 bg-[#fffdf9] rounded-t-[50%]"></div>
          </div>

          <div className="p-8 pt-4 relative z-10">
            <div className="grid grid-cols-5 gap-4">
              {stamps.map((isStamped, index) => (
                <div
                  key={index}
                  className={`
                    aspect-square rounded-full flex items-center justify-center relative transition-all duration-300
                    ${isStamped 
                      ? 'bg-transparent' 
                      : 'bg-gray-100/50 border-2 border-dashed border-gray-300'}
                  `}
                >
                  {!isStamped && (
                    <span className="text-gray-300 text-sm font-bold">{index + 1}</span>
                  )}
                  
                  {isStamped && (
                    <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-500">
                        <svg width="80%" height="80%" viewBox="0 0 40 40" className={`${textColor} opacity-90 drop-shadow-sm rotate-[-10deg]`}>
                           <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 2" />
                           <path d="M10 20 L16 26 L30 12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 pt-2 text-center">
             <p className="text-gray-400 text-sm tracking-widest uppercase border-t border-gray-200 pt-6">
               Keep up the good work!
             </p>
             {points >= 30 && (
               <div className="mt-6 bg-yellow-100 text-yellow-800 p-4 rounded-2xl text-lg font-bold animate-bounce flex items-center justify-center gap-2">
                  <Trophy size={24} className="text-yellow-700" />
                  🎉 太棒了！集點完成！
               </div>
             )}
          </div>
        </div>

        {/* 學生視角提示 */}
        <div className="mt-8 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 max-w-sm">
           <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
             <Sparkles size={20} />
           </div>
           <div>
             <h3 className="font-bold text-gray-800">這是您的目前進度</h3>
             <p className="text-sm text-gray-400">請繼續加油，向老師爭取更多獎勵！</p>
           </div>
        </div>
      </div>

      {/* 退出預覽按鈕 (僅在模擬模式顯示) */}
      {onExitPreview && (
          <div className="fixed bottom-6 right-6 z-50">
            <button 
                onClick={onExitPreview}
                className="bg-gray-800 hover:bg-black text-white px-6 py-4 rounded-full shadow-2xl font-bold flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
            >
                <LogOut size={20} />
                退出預覽
            </button>
          </div>
      )}
    </div>
  );
};

// 7. CardDetailView (Modified with Share)
interface CardDetailViewProps extends BaseProps {
  activeCard: Card | undefined;
  onRequestDelete: (card: Card) => void;
  onToggleStamp: (cardId: number, index: number) => void;
  onShare: (card: Card) => void;
}

const CardDetailView: React.FC<CardDetailViewProps> = ({ 
  activeCard, 
  onNavigate, 
  onRequestDelete, 
  onToggleStamp,
  onShare
}) => {
  if (!activeCard) return null;
  const themeColor = activeCard.themeColor || 'bg-rose-500';
  const textColor = themeColor.replace('bg-', 'text-');

  return (
    <div className="flex flex-col h-full bg-[#2a2a2a] max-w-2xl mx-auto w-full shadow-2xl min-h-screen">
      {/* 頂部工具列 */}
      <div className="p-6 flex justify-between items-center z-20">
        <button onClick={() => onNavigate('records')} className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white border border-white/10">
          <ArrowLeft size={28} />
        </button>
        
        <div className="text-white/80 font-medium text-lg">學生集點卡</div>

        <div className="flex gap-3">
            <button 
                onClick={() => onShare(activeCard)}
                className="w-14 h-14 bg-blue-500/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-blue-600/90 transition-colors text-white border border-white/10 shadow-lg"
                title="分享給學生"
            >
                <Share2 size={24} />
            </button>
            <button 
                onClick={() => onRequestDelete(activeCard)}
                className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors text-white border border-white/10 group"
            >
                <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
            </button>
        </div>
      </div>

      {/* 擬真卡片區域 */}
      <div className="flex-1 overflow-y-auto px-6 pb-10 flex flex-col items-center no-scrollbar">
        <div className="w-full bg-[#fffdf9] rounded-[32px] overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ddd 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className={`relative p-10 pb-12 ${themeColor} text-white`}>
             <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-black tracking-wide mb-3 drop-shadow-md">{activeCard.name}</h1>
                  <p className="text-white/80 text-base font-medium tracking-wider uppercase">Student Card</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                  <span className="font-bold text-3xl">{activeCard.points}</span>
                  <span className="text-sm ml-2 opacity-80">PTS</span>
                </div>
             </div>
             <div className="absolute bottom-[-24px] left-0 w-full h-12 bg-[#fffdf9] rounded-t-[50%]"></div>
          </div>

          <div className="p-8 pt-4 relative z-10">
            <div className="grid grid-cols-5 gap-4">
              {activeCard.stamps.map((isStamped, index) => (
                <button
                  key={index}
                  onClick={() => onToggleStamp(activeCard.id, index)}
                  className={`
                    aspect-square rounded-full flex items-center justify-center relative transition-all duration-300
                    ${isStamped 
                      ? 'bg-transparent scale-100' 
                      : 'bg-gray-100/50 hover:bg-gray-100 border-2 border-dashed border-gray-300 active:scale-95'}
                  `}
                >
                  {!isStamped && (
                    <span className="text-gray-300 text-sm font-bold">{index + 1}</span>
                  )}
                  
                  <div 
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isStamped ? 'opacity-100 scale-100 rotate-[-10deg]' : 'opacity-0 scale-150 rotate-12'}`}
                  >
                    <svg width="80%" height="80%" viewBox="0 0 40 40" className={`${textColor} opacity-90 drop-shadow-sm`}>
                       <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 2" />
                       <path d="M10 20 L16 26 L30 12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 pt-2 text-center">
             <p className="text-gray-400 text-sm tracking-widest uppercase border-t border-gray-200 pt-6">
               Keep up the good work!
             </p>
             {activeCard.points >= 30 && (
               <div className="mt-6 bg-yellow-100 text-yellow-800 p-4 rounded-2xl text-lg font-bold animate-bounce flex items-center justify-center gap-2">
                  <Trophy size={24} className="text-yellow-700" />
                  🎉 太棒了！集點完成！
               </div>
             )}
          </div>
        </div>
        
        <p className="text-gray-500 text-base mt-8 flex items-center gap-2 opacity-60">
           <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-serif">i</span>
           點擊圓圈即可蓋章
        </p>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [cards, setCards] = useState<Card[]>([]);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [newCardName, setNewCardName] = useState<string>('');
  
  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  // Read-only mode state (Simulation or Real)
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);
  const [isSimulation, setIsSimulation] = useState(false); // New: Track if it's a simulation
  const [readOnlyCard, setReadOnlyCard] = useState<Partial<Card> | null>(null);

  // Check for shared URL on mount
  useEffect(() => {
    // 使用 new URL 來安全解析，避免 origin 拼接問題
    try {
        const url = new URL(window.location.href);
        const sharedData = url.searchParams.get('s');
        
        if (sharedData) {
          const decoded = decodeCardData(sharedData);
          if (decoded) {
            setIsReadOnlyMode(true);
            setReadOnlyCard(decoded);
            return; // Skip loading local storage if in read-only mode
          }
        }
    } catch (e) {
        console.error("URL 解析失敗", e);
    }

    // Normal load
    try {
      const savedCards = localStorage.getItem('loyaltyCards');
      if (savedCards) {
        setCards(JSON.parse(savedCards));
      }
    } catch (error) {
      console.error("讀取資料失敗", error);
    }
  }, []);

  // Save to local storage (Only if not in read-only mode)
  useEffect(() => {
    if (!isReadOnlyMode) {
      localStorage.setItem('loyaltyCards', JSON.stringify(cards));
    }
  }, [cards, isReadOnlyMode]);

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;

    const newCard: Card = {
      id: Date.now(),
      name: newCardName,
      points: 0,
      stamps: Array(30).fill(false),
      createdAt: new Date().toLocaleDateString('zh-TW'),
      themeColor: ['bg-rose-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-orange-500'][Math.floor(Math.random() * 4)] 
    };

    const updatedCards = [newCard, ...cards];
    setCards(updatedCards);
    setNewCardName('');
    setActiveCardId(newCard.id);
    setCurrentView('card');
  };

  const requestDelete = (card: Card) => {
    setCardToDelete(card);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!cardToDelete) return;
    
    const updatedCards = cards.filter(card => card.id !== cardToDelete.id);
    setCards(updatedCards);
    
    if (activeCardId === cardToDelete.id) {
      setCurrentView('records');
      setActiveCardId(null);
    }
    
    setDeleteModalOpen(false);
    setCardToDelete(null);
  };

  const handleSelectCard = (cardId: number) => {
    setActiveCardId(cardId);
    setCurrentView('card');
  };

  const toggleStamp = (cardId: number, index: number) => {
    const updatedCards = cards.map(card => {
      if (card.id === cardId) {
        const newStamps = [...card.stamps];
        newStamps[index] = !newStamps[index];
        const newPoints = newStamps.filter(Boolean).length;
        return { ...card, stamps: newStamps, points: newPoints };
      }
      return card;
    });
    setCards(updatedCards);
  };

  // 處理分享連結生成
  const handleShare = (card: Card) => {
    const encoded = encodeCardData(card);
    try {
        const currentUrl = new URL(window.location.href);
        currentUrl.search = '';
        currentUrl.searchParams.set('s', encoded);
        setShareUrl(currentUrl.toString());
        setShareModalOpen(true);
    } catch (e) {
        setShareUrl(`請手動複製: ?s=${encoded}`);
        setShareModalOpen(true);
    }
  };

  // 處理「模擬預覽」功能 (新功能)
  const handleSimulate = () => {
    const activeCard = cards.find(c => c.id === activeCardId);
    if (activeCard) {
        setReadOnlyCard(activeCard);
        setIsReadOnlyMode(true);
        setIsSimulation(true);
        setShareModalOpen(false);
    }
  };

  // 處理「退出預覽」功能 (新功能)
  const handleExitSimulation = () => {
    setIsReadOnlyMode(false);
    setIsSimulation(false);
    setReadOnlyCard(null);
  };

  // Render Logic
  
  if (isReadOnlyMode && readOnlyCard) {
    return (
        <StudentReadOnlyView 
            card={readOnlyCard} 
            onExitPreview={isSimulation ? handleExitSimulation : undefined}
        />
    );
  }

  const activeCard = cards.find(c => c.id === activeCardId);

  return (
    <div className="w-full min-h-screen bg-[#222]">
      {currentView === 'home' && (
        <HomeView 
          onNavigate={setCurrentView} 
          cardCount={cards.length} 
        />
      )}
      
      {currentView === 'create' && (
        <CreateView 
          onNavigate={setCurrentView} 
          onCreate={handleCreateCard}
          newCardName={newCardName}
          setNewCardName={setNewCardName}
        />
      )}
      
      {currentView === 'records' && (
        <RecordsView 
          onNavigate={setCurrentView} 
          cards={cards} 
          onRequestDelete={requestDelete}
          onSelect={handleSelectCard}
        />
      )}
      
      {currentView === 'card' && (
        <CardDetailView 
          activeCard={activeCard} 
          onNavigate={setCurrentView}
          onRequestDelete={requestDelete}
          onToggleStamp={toggleStamp}
          onShare={handleShare}
        />
      )}

      <DeleteConfirmModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        cardName={cardToDelete?.name}
      />

      <ShareModal 
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={shareUrl}
        onSimulate={handleSimulate}
      />
    </div>
  );
}