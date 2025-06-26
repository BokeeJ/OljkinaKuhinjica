import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";

function YouTubeMusic() {
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [userHasClicked, setUserHasClicked] = useState(false);

    const handlePlay = () => {
        setUserHasClicked(true);
        setIsPlaying(true);
    };
    const handlePause = () => {
        setIsPlaying(false);
    };
    const togglePlayPause = () => {
        if (isPlaying) {
            handlePause();
        } else {
            handlePlay();
        }
    };

    return (
        <div className="fixed bottom-5 right-5  flex flex-col items-center">
            {/* {!userHasClicked && (
                <div className="bg-gray-100 rounded p-3 text-center text-sm text-gray-600">

                </div>
            )} */}
            <button
                onClick={togglePlayPause}
                className={`bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 shadow-lg mt-2 `}
            >
                {isPlaying ? "Pauza" : "Kuvaj uz 🎵 "}
            </button>
            <div className="hidden">
                <ReactPlayer
                    ref={playerRef}
                    url="https://www.youtube.com/watch?v=KiaOV3h1IwE"
                    playing={isPlaying}
                    controls={false}
                />
            </div>
        </div>
    );
}

export default YouTubeMusic;
