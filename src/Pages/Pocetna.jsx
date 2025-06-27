import React from 'react';
import PoslednjiRecepti from './PoslednjiRecepti';

function Pocetna() {
    return (
        <div
            className='w-full h-full relative flex flex-col items-center justify-center z-0'
            style={{
                backgroundImage: `url(/kuhinja1.webp)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',

            }}
        >
            {/* 👇 Overlay gradient (senka na vrhu) */}
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-orange-300 z-10"></div>

            <div className="w-full h-[300px] flex items-center justify-center text-center">
                <h1 className="lg:text-2xl text-lg text-white font-bold drop-shadow-lg">
                    “Daj čoveku kolač, zasladićeš mu dan. Nauči ga da pravi kolače i zasladićeš mu ceo život.”
                </h1>
            </div>

            <div className="z-20">
                <PoslednjiRecepti />
            </div>
        </div>
    );
}

export default Pocetna;
