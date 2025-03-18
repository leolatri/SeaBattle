import "./App.css";
import CreateField from "./classes/Play";
import React from "react";
import { useRef, useEffect, useState} from "react";
import sultan from "./imgs/sultan.png"
import hurem from "./imgs/hurem.png"
import pasha from "./imgs/pasha.svg"
import music from "./music/music.mp3"


function App(){
  const audioRef = useRef(null); 
  const [isPlaying, setIsPlaying] = useState(false); 


  const playMusic = () => {
      if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true); 
      }
  };

  const pauseMusic = () => {
      if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false); 
      }
  };

  const toggleMusic = () => {
      if (isPlaying) {
          pauseMusic();
      } else {
          playMusic();
      }
  };
  return(
    <main>
      <header>
        <h1>ВЕЛИКОЛЕПНЫЙ  <br/><span>БОЙ</span></h1>
        <button id="music" onClick={toggleMusic}>
                    {isPlaying ? '🔊' : '🔇'}
                </button>
        <audio src={music} ref={audioRef} loop></audio>
      </header>
      <img src={hurem} alt="hurem" id="hurem-img"></img>
      <img src={sultan} alt="sultan" id="sultan-img"></img>

      <div className="main_field">
        <CreateField player={"ХЮРЕМ"} personField={true} fieldComp={true}/>
      </div>
      <img src={pasha} alt="pasha" id="pasha-img"></img>

    </main>
  )
}
export default App;