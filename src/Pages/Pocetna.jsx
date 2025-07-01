import React from 'react';
import PoslednjiRecepti from './PoslednjiRecepti';

function Pocetna() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative z-0 bg-white">

            {/* 👇 Sekcija sa pozadinskom slikom i zakrivljenim krajem */}
            <div
                className="w-full h-[800px] relative"
                style={{
                    clipPath: 'ellipse(130% 100% at 50% 100%)',
                    WebkitClipPath: 'ellipse(130% 100% at 50% 100%)',

                }}
            >
                <div
                    className="absolute inset-0 bg-no-repeat bg-cover bg-center h-full"
                    style={{
                        backgroundImage: `url(/kolac.webp)`
                    }}
                />

                {/* 👇 Overlay gradient (senka na vrhu) */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/90 to-orange-300/30 z-10"></div>

                {/* 👇 Tekst unutar slike */}
                <div className="w-full h-full flex items-center justify-center text-center relative z-20">
                    <h1 className="lg:text-2xl text-lg text-white font-bold drop-shadow-xl max-w-[80%]">
                        “Daj čoveku kolač, zasladićeš mu dan. Nauči ga da pravi kolače i zasladićeš mu ceo život.”
                    </h1>
                </div>
            </div>

            {/* 👇 Ostatak stranice */}
            <div className="z-20 w-full">
                <PoslednjiRecepti />
            </div>
        </div>
    );
}

export default Pocetna;
