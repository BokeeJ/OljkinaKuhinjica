import React from 'react'
//icons
import { RxHamburgerMenu } from "react-icons/rx";
import { FaSearch } from 'react-icons/fa';
function NavBar() {
    return (
        <div className='w-full h-[100px] lg:h-[150px] flex flex-col justify-center items-center'>
            <div className='flex justify-between items-center gap-5 lg:w-[60%] md:w-[70%] w-[80%]'>
                <nav>
                    <ul className='lg:flex gap-5 m-5 hidden'>
                        <li>Svi recepti</li>
                        <li>Slano</li>
                        <li>Slatko</li>
                    </ul>
                    <RxHamburgerMenu className='text-2xl lg:hidden' />
                </nav>
                {/* logo */}
                <div>
                    <img className='lg:w-[200px] lg:h-[200px] w-[140px] h-[140px] rounded-full' src="/1.svg" alt="logo" />
                </div>
                <nav>
                    <FaSearch className='text-2xl lg:hidden' />
                    <ul className='lg:flex hidden gap-3 m-5'>
                        <li>O meni</li>
                        <li>Kontakt</li>
                        <li>Saradnja</li>
                    </ul>
                </nav>
            </div>
            <hr className='border border-black w-[80%]' />
        </div>
    )
}

export default NavBar