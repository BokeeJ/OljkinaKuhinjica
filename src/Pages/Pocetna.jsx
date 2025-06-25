import React from 'react'
import PoslednjiRecepti from './PoslednjiRecepti'
function Pocetna() {
    return (
        <div className='w-full h-full '>
            <div className=' w-full h-[300px] flex items-center justify-center text-center'>
                <h1 className='lg:text-2xl text-l  text-orange-500 font-stretch-50%'>“Daj čoveku kolač, zasladićeš mu dan. Nauči ga da pravi kolače i zasladićeš mu ceo život.“
                    <br />
                    <span className='text-orange-700 font-bold'> - Olivera Andrić</span>
                </h1>
            </div>
            <PoslednjiRecepti />
        </div>
    )
}

export default Pocetna