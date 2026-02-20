"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  X, Sparkles, Loader2, ArrowRight, ArrowLeft, Watch, 
  User, Users, Briefcase, Coffee, Shirt, Sun, Snowflake, 
  Moon, Activity, Shield, Zap, Minus, Timer, Tent, Gem, RefreshCcw 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface StyleQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StyleQuiz({ isOpen, onClose }: StyleQuizProps) {
  const [step, setStep] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcText, setCalcText] = useState("Decoding your vibe...");
  const [recommendedWatches, setRecommendedWatches] = useState<any[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);

  const [answers, setAnswers] = useState({
    category: "", age: "", occasion: "", wardrobe: "", skinTone: "", wrist: "", personality: ""
  });

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setAnswers({ category: "", age: "", occasion: "", wardrobe: "", skinTone: "", wrist: "", personality: "" });
      setRecommendedWatches([]);
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; }
  }, [isOpen]);

  const handleAnswer = (key: string, value: string) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    if (step < 7) setStep(step + 1);
    else calculateResults(newAnswers);
  };

  const handleBack = () => {
    if (step > 0 && step < 8) setStep(step - 1);
  };

  const getWardrobeOptions = () => {
      if (answers.category === "women") {
          return [
              { id: "modest", title: "Abaya & Modest", desc: "Elegant, flowing, graceful.", icon: Tent },
              { id: "traditional", title: "Eastern Grace", desc: "Shalwar Kameez, Dupattas.", icon: Sparkles },
              { id: "western", title: "Western Chic", desc: "Trousers, Blouses, Dresses.", icon: Shirt }
          ];
      }
      return [
          { id: "traditional", title: "Eastern / Traditional", desc: "Shalwar Kameez, Waistcoats.", icon: Sparkles },
          { id: "corporate", title: "Sharp Corporate", desc: "Suits, Formal Shirts.", icon: Briefcase },
          { id: "casual", title: "Smart Casual", desc: "Jeans, Polos, T-Shirts.", icon: Shirt }
      ];
  };

  const calculateResults = async (finalAnswers: any) => {
    setIsCalculating(true);
    setStep(8); 

    setTimeout(() => setCalcText("Accessing Masterpiece Vault..."), 800);
    setTimeout(() => setCalcText("Aligning aesthetics..."), 1600);
    setTimeout(() => setCalcText("Securing your match..."), 2400);

    const { data: products } = await supabase.from('products').select('*').eq('category', finalAnswers.category);

    if (!products || products.length === 0) {
      setIsCalculating(false);
      setStep(9);
      return;
    }

    const scoredProducts = products.map((p) => {
      let score = 0;
      const specs = p.specs || {};
      const strapColor = (specs.strap_color || "").toLowerCase();
      const dialColor = (specs.dial_color || "").toLowerCase();
      const strapType = (specs.strap_type || "").toLowerCase();
      const price = Number(p.price) || 0;
      
      score += (Number(p.priority) || 0) * 0.5;
      if (seenIds.includes(p.id)) score -= 1000;

      if (finalAnswers.skinTone === "warm" && (strapColor.includes("gold") || strapColor.includes("brown"))) score += 15;
      if (finalAnswers.skinTone === "cool" && (strapColor.includes("silver") || strapColor.includes("steel"))) score += 15;
      if (finalAnswers.skinTone === "deep" && (strapColor.includes("black") || strapColor.includes("two"))) score += 15;

      if (finalAnswers.occasion === "wedding" && (strapType.includes("chain") || strapColor.includes("gold"))) score += 10;
      if (finalAnswers.occasion === "office" && (strapType.includes("leather") || strapType.includes("steel"))) score += 10;
      if (finalAnswers.occasion === "casual" && (strapType.includes("rubber") || strapColor.includes("black"))) score += 10;

      if (finalAnswers.wardrobe === "traditional" && (strapType.includes("leather") || strapColor.includes("gold"))) score += 10;
      if (finalAnswers.wardrobe === "corporate" && (strapType.includes("steel") || strapColor.includes("silver"))) score += 10;
      if (finalAnswers.wardrobe === "modest" && (strapType.includes("ceramic") || strapColor.includes("rose") || strapColor.includes("silver"))) score += 12;
      
      if (finalAnswers.wrist === "slim" && (strapType.includes("leather") || strapType.includes("mesh"))) score += 10; 
      if (finalAnswers.wrist === "broad" && (strapType.includes("chain") || strapType.includes("metal"))) score += 10; 

      if (finalAnswers.personality === "flashy" && strapColor.includes("gold")) score += 15;
      if (finalAnswers.personality === "minimal" && (dialColor.includes("white") || dialColor.includes("black"))) score += 15;
      if (finalAnswers.personality === "sporty" && strapType.includes("rubber")) score += 15;

      if (finalAnswers.age === "mature" && strapType.includes("leather")) score += 5;
      if (finalAnswers.age === "young" && (price < 3000 || strapType.includes("rubber"))) score += 5;

      return { ...p, matchScore: score };
    });

    scoredProducts.sort((a, b) => b.matchScore - a.matchScore);
    const topPicks = scoredProducts.slice(0, 2);
    
    localStorage.setItem('aura_style_profile', JSON.stringify({
        vibe: finalAnswers.personality, color: finalAnswers.skinTone, category: finalAnswers.category
    }));

    setTimeout(() => {
      setRecommendedWatches(topPicks);
      setSeenIds(prev => [...prev, ...topPicks.map(w => w.id)]); 
      setIsCalculating(false);
      setStep(9); 
    }, 3200); 
  };

  if (!isOpen) return null;

  const progressPercent = step > 0 && step < 8 ? (step / 7) * 100 : 0;

  const OptionCard = ({ opt, answerKey }: { opt: any, answerKey: string }) => (
    <button 
      onClick={() => handleAnswer(answerKey, opt.id)} 
      className="w-full p-3 md:p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-aura-gold hover:from-aura-gold/10 hover:to-transparent active:scale-[0.98] transition-all flex items-center gap-4 text-left group"
    >
      {opt.icon && (
        <div className="w-12 h-12 rounded-full bg-aura-gold/20 flex items-center justify-center border border-aura-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.3)] flex-shrink-0 group-hover:bg-aura-gold group-hover:text-black transition-colors">
            <opt.icon className={opt.iconClass || "text-aura-gold group-hover:text-black transition-colors"} size={20} />
        </div>
      )}
      {opt.color && (
        <div className={`w-12 h-12 rounded-full border-2 ${opt.border} ${opt.color} shadow-[inset_0_-4px_8px_rgba(0,0,0,0.5)] flex-shrink-0`}></div>
      )}
      <div className="flex-1">
          <h3 className="text-white font-serif font-bold text-base md:text-lg leading-tight mb-0.5">{opt.title}</h3>
          <p className="text-gray-400 text-[11px] md:text-xs leading-tight">{opt.desc}</p>
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] text-white overflow-hidden w-full h-full flex flex-col animate-in fade-in duration-500">
      
      {/* --- LIVE 3D AMBIENT BACKGROUND --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-aura-gold/20 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#2a251a] rounded-full blur-[150px] animate-[pulse_12s_ease-in-out_infinite_alternate]"></div>
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-yellow-900/20 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite]"></div>
      </div>

      {/* HEADER */}
      <div className="w-full flex justify-between items-center p-4 border-b border-white/10 bg-black/50 backdrop-blur-xl relative z-50">
        <div className="flex items-center gap-2">
            <Sparkles className="text-aura-gold animate-pulse" size={18} />
            <span className="font-serif font-bold text-white tracking-widest uppercase text-sm md:text-base">The Stylist</span>
        </div>
        <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-300">
          <X size={20} />
        </button>
      </div>

      {/* SEGMENTED PROGRESS BAR */}
      {step > 0 && step < 8 && (
        <div className="w-full bg-black/50 backdrop-blur-md pt-4 pb-2 relative z-50 flex justify-center gap-1.5 md:gap-3 px-4">
          {[1,2,3,4,5,6,7].map(num => (
            <div key={num} className={`h-1.5 flex-1 max-w-[40px] rounded-full transition-all duration-700 ${step >= num ? 'bg-aura-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'bg-white/10'}`} />
          ))}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center p-4 pb-12 relative z-10 scroll-smooth">
        
        {/* DYNAMIC FILLING WATCH (Visible on Mobile & Desktop!) */}
        {step > 0 && step < 8 && (
            <div className="flex flex-col items-center justify-center mb-6 mt-2 animate-in zoom-in duration-500">
                <div className="relative w-16 h-16 md:w-20 md:h-20">
                    {/* Empty Watch Outline */}
                    <Watch size={64} className="text-white/10 absolute inset-0 w-full h-full" strokeWidth={1} />
                    {/* Filled Gold Watch (Fills from bottom to top using clip-path) */}
                    <Watch 
                        size={64} 
                        className="text-aura-gold absolute inset-0 w-full h-full transition-all duration-1000 ease-out drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]" 
                        strokeWidth={2} 
                        style={{ clipPath: `inset(${100 - progressPercent}% 0 0 0)` }} 
                    />
                </div>
                <span className="text-[10px] text-aura-gold font-bold tracking-widest uppercase mt-1">Match: {Math.round(progressPercent)}%</span>
            </div>
        )}

        <div className="max-w-md w-full mx-auto">

          {/* --- STEP 0: INTRO --- */}
          {step === 0 && (
            <div className="text-center animate-in zoom-in-95 duration-700 mt-10">
              <div className="w-24 h-24 bg-gradient-to-br from-aura-gold/20 to-transparent rounded-full flex items-center justify-center mx-auto mb-6 border border-aura-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                 <Watch className="text-aura-gold" size={40} />
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
                Discover Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-aura-gold to-yellow-500 italic">Signature Aura</span>
              </h1>
              <p className="text-sm text-gray-400 mb-10 max-w-sm mx-auto leading-relaxed">
                Step inside the styling vault. Answer 7 rapid visual questions, and our intelligence engine will isolate the exact masterpiece built for your wrist.
              </p>
              <button onClick={() => setStep(1)} className="w-full px-10 py-4 bg-gradient-to-r from-aura-gold to-yellow-600 text-black rounded-xl font-black tracking-widest text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95">
                BEGIN PROFILING <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Shared Header Logic for Steps 1-7 */}
          {step > 0 && step < 8 && (
             <div className="w-full mb-6">
                 {/* DEDICATED BACK BUTTON */}
                 <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-aura-gold transition-colors text-[10px] font-bold uppercase tracking-widest mb-4 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 active:scale-95">
                    <ArrowLeft size={12} /> Go Back
                 </button>
             </div>
          )}

          {/* --- STEP 1: CATEGORY --- */}
          {step === 1 && (
            <div className="animate-in slide-in-from-right fade-in duration-300 w-full">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white text-center mb-6">Who is the timepiece for?</h2>
              <div className="flex flex-col gap-3">
                {[
                  { id: "men", title: "A Gentleman", desc: "Bold, Classic & Sharp.", icon: User },
                  { id: "women", title: "A Lady", desc: "Elegant, Delicate & Chic.", icon: Gem },
                  { id: "couple", title: "A Couple", desc: "Matching Sets & Bonds.", icon: Users }
                ].map(opt => <OptionCard key={opt.id} opt={opt} answerKey="category" />)}
              </div>
            </div>
          )}

          {/* --- STEP 2: AGE --- */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right fade-in duration-300 w-full">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white text-center mb-6">What is your age group?</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "young", title: "18 - 24", desc: "Trendy & Bold" },
                  { id: "mid", title: "25 - 34", desc: "Modern Pro" },
                  { id: "mature", title: "35 - 44", desc: "Established" },
                  { id: "classic", title: "45+", desc: "Classic Elegance" }
                ].map(opt => (
                  <button key={opt.id} onClick={() => handleAnswer('age', opt.id)} className="p-4 border border-white/20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 shadow-lg active:scale-95 text-center transition-all hover:border-aura-gold hover:from-aura-gold/10">
                    <h3 className="text-lg font-serif font-bold text-white mb-1">{opt.title}</h3>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --- STEP 3: OCCASION --- */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right fade-in duration-300 w-full">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white text-center mb-6">Primary environment?</h2>
              <div className="flex flex-col gap-3">
                {[
                  { id: "office", title: "Corporate & Office", desc: "Professional, reliable daily wear.", icon: Briefcase },
                  { id: "wedding", title: "Weddings & Events", desc: "Luxury, eye-catching pieces.", icon: Sparkles },
                  { id: "casual", title: "Casual & Weekends", desc: "Relaxed, comfortable, stylish.", icon: Coffee }
                ].map(opt => <OptionCard key={opt.id} opt={opt} answerKey="occasion" />)}
              </div>
            </div>
          )}

          {/* --- STEP 4: WARDROBE (DYNAMIC) --- */}
          {step === 4 && (
            <div className="animate-in slide-in-from-right fade-in duration-300 w-full">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white text-center mb-6">Your signature style?</h2>
              <div className="flex flex-col gap-3">
                {getWardrobeOptions().map(opt => <OptionCard key={opt.id} opt={opt} answerKey="wardrobe" />)}
              </div>
            </div>
          )}

          {/* --- STEP 5: SKIN TONE --- */}
          {step === 5 && (
            <div className="animate-in slide-in-from-right fade-in duration-300 w-full">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white text-center mb-6">Skin complexion?</h2>
              <div className="flex flex-col gap-3">
                {[
                  { id: "warm", title: "Warm & Tanned", desc: "Olive/Brown undertones. Gold suits best.", color: "bg-amber-600", border: "border-amber-400" },
                  { id: "cool", title: "Cool & Fair", desc: "Fair/Pinkish undertones. Silver suits best.", color: "bg-slate-200", border: "border-white" },
                  { id: "deep", title: "Deep & Bold", desc: "Rich skin. Black/Two-Tone rules.", color: "bg-gray-800", border: "border-gray-500" }
                ].map(opt => <OptionCard key={opt.id} opt={opt} answerKey="skinTone" />)}
              </div>
            </div>
          )}

          {/* --- STEP 6: WRIST --- */}
          {step === 6 && (
            <div className="animate-in slide-in-from-right fade-in duration-300 w-full">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white text-center mb-6">Wrist silhouette?</h2>
              <div className="flex flex-col gap-3">
                {[
                  { id: "slim", title: "Slender / Slim", desc: "Massive dials look too big.", icon: Activity },
                  { id: "broad", title: "Broad / Standard", desc: "Can handle heavy presence.", icon: Shield }
                ].map(opt => <OptionCard key={opt.id} opt={opt} answerKey="wrist" />)}
              </div>
            </div>
          )}

          {/* --- STEP 7: PERSONALITY --- */}
          {step === 7 && (
            <div className="animate-in slide-in-from-right fade-in duration-300 w-full">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white text-center mb-6">Your true Aura?</h2>
              <div className="flex flex-col gap-3">
                {[
                  { id: "minimal", title: "Understated Elegance", desc: "Quiet luxury. Clean simple dials.", icon: Minus },
                  { id: "flashy", title: "Statement Maker", desc: "Eye-catching. Bring the bling.", icon: Zap },
                  { id: "sporty", title: "Active & Edgy", desc: "Chronographs. Bold details.", icon: Timer }
                ].map(opt => <OptionCard key={opt.id} opt={opt} answerKey="personality" />)}
              </div>
            </div>
          )}

          {/* --- STEP 8: CALCULATING --- */}
          {step === 8 && (
            <div className="text-center flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-2 border-white/5 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-aura-gold rounded-full border-t-transparent animate-spin shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Watch className="text-aura-gold animate-pulse" size={32} />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">{calcText}</h3>
              <p className="text-gray-400 text-sm">Running parameters against inventory algorithms...</p>
            </div>
          )}

          {/* --- STEP 9: RESULTS --- */}
          {step === 9 && (
            <div className="animate-in zoom-in-95 duration-700 w-full mt-4">
              <div className="text-center mb-8">
                <span className="inline-block bg-aura-gold/20 text-aura-gold border border-aura-gold/50 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-3 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                  Data Aligned
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">The Perfect Match</h2>
                <p className="text-xs md:text-sm text-gray-400 max-w-sm mx-auto">Scientifically calculated based on your {answers.wardrobe} aesthetic and {answers.skinTone} complexion.</p>
              </div>

              {recommendedWatches.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {recommendedWatches.map((watch, index) => (
                    <div key={watch.id} className={`bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md border rounded-2xl overflow-hidden flex flex-col ${index === 0 ? 'border-aura-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-white/10'}`}>
                      
                      <div className="relative h-56 w-full bg-black/40 flex items-center justify-center p-6">
                        {index === 0 && <div className="absolute top-3 left-3 bg-aura-gold text-black text-[9px] font-bold px-3 py-1.5 rounded-lg z-10 uppercase tracking-widest shadow-md flex items-center gap-1"><Sparkles size={10}/> #1 Pick</div>}
                        {watch.main_image && <Image src={watch.main_image} alt={watch.name} fill className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] p-4" unoptimized />}
                      </div>
                      
                      <div className="p-5 flex flex-col justify-between">
                        <div>
                            <h4 className="font-serif font-bold text-xl text-white mb-2 leading-tight">{watch.name}</h4>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="bg-black/50 border border-white/10 text-gray-300 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">{watch.specs?.dial_color || 'Premium'} Dial</span>
                                <span className="bg-black/50 border border-white/10 text-gray-300 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">{watch.specs?.strap_type || 'Classic'}</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                                Mathematically selected. This {watch.specs?.strap_color || ''} tone perfectly synchronizes with your profile.
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-white/10 pt-4">
                          <div>
                              <p className="text-[10px] text-gray-500 line-through">Rs {watch.original_price}</p>
                              <p className="text-xl font-bold text-aura-gold">Rs {watch.price}</p>
                          </div>
                          <Link href={`/product/${watch.id}`} onClick={onClose} className={`text-xs font-bold px-6 py-3 rounded-xl transition-all ${index === 0 ? 'bg-aura-gold text-black hover:bg-white shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                            VIEW SPECS
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-gray-400 text-sm mb-6">We couldn't find an exact mathematical match for your specific parameters, but the Masterpiece collection awaits.</p>
                  <Link href={`/${answers.category || 'men'}`} onClick={onClose} className="inline-block bg-aura-gold text-black text-xs px-8 py-4 rounded-xl font-bold tracking-widest hover:bg-white transition-colors">BROWSE VAULT</Link>
                </div>
              )}
              
              <div className="text-center mt-8">
                <button onClick={() => setStep(0)} className="text-gray-500 text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors border-b border-transparent hover:border-white pb-1 flex items-center justify-center gap-2 mx-auto">
                  <RefreshCcw size={12}/> Re-calibrate Profile
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}