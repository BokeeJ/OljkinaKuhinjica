import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import { FaFacebook } from 'react-icons/fa';
import { FaYoutube } from 'react-icons/fa';
function Footer() {
    return (
        <div className='flex lg:flex-row flex-col w-full h-full items-center lg:justify-around justify-center p-5 '>
            <div>
                <img src="/logoOljka.png" alt="Logo" loading='lazy' className='w-[250px] h-[250px]' />
            </div>
            <div className='flex flex-col justify-center items-center'>

                <h2 className='text-orange-300 font-extrabold text-2xl mb-5'>
                    Recepti
                </h2>
                <ul className='text-gray-100 flex flex-col font-sans gap-2'>
                    <Link className='hover:text-orange-300 transition-all' to={'/sviRecepti'}>Svi recepti</Link>
                    <Link className='hover:text-orange-300 transition-all' to={'/popularni'}>Najpopularniji</Link>
                    <Link className='hover:text-orange-300 transition-all' to={'/favorites'}>Omiljeni</Link>
                </ul>
            </div>
            <div className='flex flex-col gap-2 justify-center items-center mt-5 lg:mb-10'>

                <div className='mt-3'>

                    <h2 className='text-orange-300 font-extrabold text-2xl lg:mb-5'>
                        Pratite Oljku
                    </h2>
                    <a
                        href='https://www.instagram.com/oljkinakucnaradionica/?hl=sr'
                        className='flex gap-2 text-gray-100 ml-5 mt-5 hover:text-orange-300 transition-all'
                        target='_blank'
                        rel='noopener noreferrer'>
                        Instagram
                        <FaInstagram className=' lg:text-2xl text-xl hover:text-pink-700 transition-colors' />

                    </a>
                </div>
                <div>
                    <a
                        href='https://www.facebook.com/oljka.rs'
                        className='flex gap-2 text-gray-100 hover:text-orange-300 transition-all'
                        target='_blank'
                        rel='noopener noreferrer'>
                        Facebook
                        <FaFacebook className='lg:text-2xl text-xl hover:text-blue-800 transition-colors' />

                    </a>
                </div>
                <div>
                    <a
                        href='https://www.youtube.com/c/Oljkinakucnaradionica'
                        className='flex gap-2 text-gray-100 hover:text-orange-300 transition-all'
                        target='_blank'
                        rel='noopener noreferrer'>
                        Youtube
                        <FaYoutube className='lg:text-2xl text-xl hover:text-red-800 transition-colors' />

                    </a>
                </div>
            </div>

        </div>
    );
}

export default Footer;
