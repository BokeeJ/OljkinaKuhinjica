import React from 'react'
//react icons
import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
function SocialNetwork() {
    return (
        <div>
            <div className="flex justify-center items-center gap-4 mt-4">
                <a href="https://www.instagram.com/oljkinakucnaradionica/?hl=sr" target="_blank" rel="noopener noreferrer">
                    <FaInstagram className="text-2xl text-pink-500 hover:text-pink-700 transition-colors" />
                </a>
                <a href="https://www.facebook.com/oljka.rs" target="_blank" rel="noopener noreferrer">
                    <FaFacebook className="text-2xl text-blue-600 hover:text-blue-800 transition-colors" />
                </a>
                <a href="https://www.youtube.com/c/Oljkinakucnaradionica" target="_blank" rel="noopener noreferrer">
                    <FaYoutube className="text-2xl text-red-600 hover:text-red-800 transition-colors" />
                </a>
            </div>
        </div>
    )
}

export default SocialNetwork