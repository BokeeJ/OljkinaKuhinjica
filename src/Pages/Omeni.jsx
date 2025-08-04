import React from "react";

function OMeni() {
    return (
        <div className=" p-6 flex flex-col lg:flex-row items-center justify-center rounded-xl max-w-5xl mx-auto my-10 text-white">
            {/* Leva strana - slika */}
            <div className="lg:w-1/2 w-full flex justify-center p-4">
                <img
                    src="/kuhinja.webp"
                    alt="Hrana i kuhinja"
                    className="rounded-2xl shadow-xl object-cover w-full h-[300px] lg:h-[400px]"
                />
            </div>

            {/* Desna strana - tekst */}
            <div className="lg:w-1/2 w-full p-4 text-gray-100 space-y-4">
                <h2 className="text-3xl font-bold text-orange-600">O meni</h2>
                <p className="text-lg">
                    Veliki pozdrav! Preporučujem da probate moje recepte.
                    Može da bude i zabavno, ali će sigurno biti korisno.
                </p>

                <p>
                    Moje ime je <span className="font-bold">Olivera Andrić</span>. Rođena sam 09.08.1967. godine u Lazarevcu.
                    U ovom divnom gradu, punom istorije, živela sam 48 godina. U Januaru 2016. godine, preselila sam se u Beč.
                    Trenutno živim svoj san.
                </p>
                <blockquote className="border-l-4 border-orange-500 pl-4 italic text-gray-100">
                    “Sve što ti se dešava u životu, dešava se za tvoje najveće dobro.”
                </blockquote>
                <p>
                    Obožavam narodne poslovice (svih naroda sveta) i često ih u razgovoru koristim. Evo jedne, shodno ovoj prilici:
                </p>
                <blockquote className="border-l-4 border-orange-500 pl-4 italic text-gray-100">
                    “Daj čoveku kolač, zasladićeš mu dan. Nauči ga da pravi kolače i zasladićeš mu ceo život.”
                </blockquote>
            </div>
        </div>
    );
}

export default OMeni;
