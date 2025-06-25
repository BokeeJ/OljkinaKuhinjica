import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";

function YouTubeMusic() {
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        setIsPlaying((p) => !p);
    };

    return (
        <div className="fixed bottom-5 right-5 flex items-center">
            <button
                onClick={togglePlay}
                className="bg-orange-300  hover:bg-orange-600 text-white rounded-full p-3 shadow-lg"
            >
                {isPlaying ? "Pause 🎵" : "Kuvaj uz pesmu 🎵"}
            </button>
            <div className="hidden">
                <ReactPlayer
                    ref={playerRef}
                    url="https://www.youtube.com/watch?v=KiaOV3h1IwE"
                    playing={isPlaying}
                    loop={true}
                    volume={0.5}
                />
            </div>
        </div>
    );
}

export default YouTubeMusic;
