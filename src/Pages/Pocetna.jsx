import React from 'react';
import PoslednjiRecepti from './PoslednjiRecepti';
import { TextGenerateEffectDemo } from "../Components/ui/TextGenerateEffectDemo";
import Savet from '../Pages/Savet';



function Pocetna() {

    return (

        <div className="w-full h-full flex flex-col items-center justify-center">

            {/* Hero sekcija */}
            <div className="relative w-full h-[50vh]">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                // style={{ backgroundImage: `url(/kolac.webp)` }}
                />


                <div className="relative z-20 flex items-center justify-center h-full px-4 text-center">
                    <h1 className="text-white text-2xl lg:text-4xl font-bold max-w-2xl leading-relaxed">

                        <TextGenerateEffectDemo />
                    </h1>
                </div>
            </div>

            {/* Sekcija sa receptima */}
            <section className="w-full max-w-6xl px-4 py-10 mt-[-40px] z-30 relative  backdrop-blur-md rounded-xl shadow-xl text-black">
                <h2 className="text-3xl font-bold text-center text-white mb-8">Poslednji recepti</h2>
                <PoslednjiRecepti />
            </section>
            <Savet />
        </div>

    );
}

export default Pocetna;
