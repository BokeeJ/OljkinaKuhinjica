import React from 'react'
import SearchInput from './SearchInput.jsx'
import SocialNetwork from './SocialNetwork.jsx'

function Header() {
    return (
        <div className='bg-red-100 w-full h-full flex items-center justify-around'>
            <div>
                <SearchInput />
            </div>
            <div className='p-2'>
                <SocialNetwork />
            </div>
        </div>
    )
}

export default Header