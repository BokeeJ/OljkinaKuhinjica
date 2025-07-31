import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { API_BASE_URL } from '../config';
function ReceptDetalji() {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(
                `${API_BASE_URL}/api/recipes/${id}`
            );
            console.log('📥 Učitani recept:', res.data);
            setRecipe(res.data);
            const slike = res.data.gallery.map((item) => ({
                src: item.url,
                type: item.type === 'video' ? 'video' : 'image',
            }));
            setGallery(slike);
        };
        fetchData();
    }, [id]);

    if (!recipe)
        return <div className='p-6 text-center'>Učitavam...</div>;

    return (
        <>
            <div className='min-h-screen p-4 sm:p-6 bg-gradient-to-b flex justify-center'>
                <div className='bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-3xl'>
                    {recipe.coverImage && (
                        <img
                            src={recipe.coverImage.url}
                            alt={recipe.title}
                            className='w-full h-48 sm:h-64 object-cover rounded-xl'
                        />
                    )}

                    <h1 className='text-2xl sm:text-3xl font-bold mt-4 text-gray-800 '>
                        {recipe.title}
                    </h1>

                    <div className='mt-4 space-y-3 text-gray-700 text-base break-words'>
                        <div>
                            <h5 className='font-semibold text-orange-300'>Sastojci:</h5>
                            <p className='text-gray-600 whitespace-pre-line'>
                                {recipe.ingredients.map((sastojak, index) => (

                                    <li key={index}>{sastojak}</li>

                                ))}
                            </p>
                        </div>

                        <div className='flex flex-col sm:flex-row sm:gap-6'></div>

                        <div>
                            <h5 className='font-semibold text-orange-300'>Uputstvo za pripremu:</h5>
                            <p className='whitespace-pre-line text-sm'>
                                {recipe.instructions}
                            </p>
                        </div>
                        <div>
                            <h5 className='font-semibold text-orange-300'>Vreme spremanja:</h5>
                            <p className='italic text-sm text-gray-500'>
                                {recipe.preparationTime} min
                            </p>
                        </div>
                        <div>
                            <h5 className='font-semibold text-orange-300 '>Napomena:
                                <p className='text-black'>
                                    {recipe.note || 'Nema napomene.'}
                                </p>
                            </h5>
                        </div>

                        <p className='text-gray-400 text-xs mt-2'>
                            Dodato:{' '}
                            {new Date(recipe.createdAt).toLocaleString('sr-RS')}
                        </p>
                    </div>

                    {gallery.length > 0 && (
                        <div className='mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3'>
                            {gallery.map((item, idx) => (
                                item.type === 'video' ? (
                                    <video
                                        key={idx}
                                        controls
                                        className='w-full h-32 object-cover rounded-md'
                                    >
                                        <source src={item.src} type="video/mp4" />
                                        Vaš pretraživač ne podržava video tag.
                                    </video>
                                ) : (
                                    <img
                                        key={idx}
                                        src={item.src}
                                        alt={`Slika ${idx + 1}`}
                                        className='w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-80 transition'
                                        onClick={() => {
                                            setCurrentIndex(idx);
                                            setIsOpen(true);
                                        }}
                                    />
                                )
                            ))}
                        </div>
                    )}

                    <Link
                        to='/SviRecepti'
                        className='bg-emerald-500 hover:bg-emerald-600 text-white rounded-full mt-6 inline-block px-4 py-2 text-sm'>
                        ← Nazad na listu
                    </Link>
                </div>
            </div>

            {isOpen && (
                <Lightbox
                    open={isOpen}
                    close={() => setIsOpen(false)}
                    index={currentIndex}
                    slides={gallery}
                />
            )}
        </>
    );
}

export default ReceptDetalji;
