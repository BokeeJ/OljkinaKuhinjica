import React from 'react';
import PoslednjiRecepti from './PoslednjiRecepti';


function Pocetna() {
    return (

        <div className="w-full h-full flex flex-col items-center justify-center">

            {/* Hero sekcija */}
            <div className="relative w-full h-[90vh]">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                // style={{ backgroundImage: `url(/kolac.webp)` }}
                />


                <div className="relative z-20 flex items-center justify-center h-full px-4 text-center">
                    <h1 className="text-white text-2xl lg:text-4xl font-bold max-w-2xl leading-relaxed">
                        “Daj čoveku kolač, zasladićeš mu dan. Nauči ga da pravi kolače i zasladićeš mu ceo život.”
                    </h1>
                </div>
            </div>

            {/* Sekcija sa receptima */}
            <section className="w-full max-w-6xl px-4 py-10 mt-[-40px] z-30 relative bg-white/90 backdrop-blur-md rounded-xl shadow-xl text-black">
                <h2 className="text-3xl font-bold text-center text-orange-500 mb-8">Poslednji recepti</h2>
                <PoslednjiRecepti />
            </section>

        </div>

    );
}

export default Pocetna;
