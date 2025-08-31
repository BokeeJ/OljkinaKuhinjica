import React from 'react'
import { motion } from 'framer-motion'
function Savet() {
    const fadeInAnimationVariants = {
        initial: {
            opacity: 0,
            y: 100

        },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.1,
                duration: 3
            }
        }
    }
    return (
        <div className='lg:flex flex-col lg:flex-row lg:p-5'>
            <div>
                <img
                    src="/oljka12.webp"
                    alt="Timski rad"
                    loading='lazy'
                    className='h-[80%] w-full  p-2 rounded-4xl object-cover'
                />
            </div>
            <motion.div
                variants={fadeInAnimationVariants}
                initial='initial'
                whileInView='animate'
                viewport={{
                    once: true,
                }} className='lg:w-[50%]  p-5 m-2'>
                <h2 className="text-3xl font-bold text-orange-300 mb-4 m-2">Zašto baš Oljkini recepti?</h2>
                <p className="text-gray-100 text-lg leading-relaxed text-justify">
                    Oljka nije kuvar – ona je mama, supruga, prijatelj... koja sa mnogo ljubavi kuva za svoje najmilije.
                    Svaki recept na ovom sajtu nastao je u pravoj kuhinji, za prave ljude – bez komplikacija i skupih sastojaka.
                    <br /><br />
                    Ako tražiš proverene domaće recepte, uz jednostavne korake i siguran rezultat, ovde si na pravom mestu.
                </p>
                <h2 className="text-3xl font-bold text-orange-300 mb-4 m-2">Ne moraš da budeš profesionalni kuvar da bi oduševio svoju porodicu.</h2>
                <p className=' text-gray-100 text-lg leading-relaxed text-justify'>

                    Moji recepti su tu da ti pokažu koliko lako možeš da spremiš nešto ukusno, domaće i provereno. Bez stresa, bez lutanja – samo ljubav, jednostavni koraci i miris koji okuplja porodicu za stolom.

                    Ako želiš da ti svako "mmm!" iz kuhinje podigne raspoloženje – tu su recepti da ti pomognu.
                </p>

            </motion.div>
        </div>
    )
}

export default Savet