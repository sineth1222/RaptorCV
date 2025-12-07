// HeroImageFlip.jsx (Flip Animation Fix)

import React from 'react';
import { assets } from '../../assets/assets';

const HeroImageFlip = () => {
    // State සහ Effect කොටස් නොවෙනස්ව තබා ඇත.
    const [isFlipped, setIsFlipped] = React.useState(false);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setIsFlipped(prev => !prev);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const imageOne = assets.proffetional;
    const imageTwo = assets.minimalimage || assets.proffetional;
    const fallbackImage = assets.mordern;


    return (
        <div className="flex items-center justify-center mt-0 mb-4 md:hidden z-10"> 
            
            <div className="p-3 bg-white shadow-2xl rounded-xl py-10 w-full sm:max-w-sm">

                {/* 💡 1. Inner Flip Container - 3D effect එක */}
                {/* 🛑 ගැටලුව විසඳීම: Flip Container එකට Width සහ Height සකසයි. */}
                <div className="relative w-full flex justify-center" style={{ 
                    perspective: '1000px', 
                    margin: 'auto',
                    // Image එකට සරිලන උසක් සහ පළලක් මෙතනින් සකසයි.
                    width: '240px', // max-w-60 (240px) image පළලට ගැලපේ
                    height: '350px', // ආසන්න උසක් සකසයි.
                }}>

                    <div className={`w-full h-full transition-transform duration-1000 ease-in-out`}
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}>

                        {/* 2. Front Side: Image One */}
                        {/* inset-0 සහ absolute මගින් Flip Container එකේ උස/පළල උරුම වේ */}
                        <div className={`absolute inset-0 backface-hidden flex justify-center`}
                            style={{
                                backfaceVisibility: 'hidden',
                            }}>
                            <img
                                src={imageOne}
                                alt="Professional resume preview"
                                // w-full H-full: මව් div එකේ (240x350) ප්‍රමාණයට ගැලපේ
                                className="w-full h-full rounded-lg object-contain shadow-xl shadow-emerald-900"
                                onError={(e) => { e.target.onerror = null; e.target.src=fallbackImage}}
                            />
                        </div>

                        {/* 3. Back Side: Image Two (Flipped to start) */}
                        <div className={`absolute inset-0 backface-hidden flex justify-center`}
                            style={{
                                transform: 'rotateY(180deg)',
                                backfaceVisibility: 'hidden',
                            }}>
                            <img
                                src={imageTwo} 
                                alt="Creative resume preview"
                                // w-full H-full: මව් div එකේ (240x350) ප්‍රමාණයට ගැලපේ
                                className="w-full h-full rounded-lg object-contain shadow-xl shadow-emerald-900"
                                onError={(e) => { e.target.onerror = null; e.target.src=fallbackImage}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroImageFlip;