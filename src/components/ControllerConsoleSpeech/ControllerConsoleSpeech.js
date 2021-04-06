/**
 * https://blog.logrocket.com/using-the-react-speech-recognition-hook-for-voice-assistance/
 */

import React, { useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import style from "./ControllerConsoleSpeech.module.css";
import { ReactComponent as MicrophoneIcon } from "../../icons/microphone.svg";

const ControllerConsoleSpeech = (props) => {
  const { transcript, resetTranscript } = useSpeechRecognition();
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    console.log("The browser does not supper Speech Recognition");
    return null;
  }

  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
    });
  };

  const stopListening = () => {
    console.log(transcript);
    SpeechRecognition.stopListening();
    resetTranscript();
  };

  return (
    <div className={style.container}>
      <button
        className="Button"
        style={{ fontSize: "1.25em" }}
        onMouseDown={startListening}
        onMouseUp={stopListening}
      >
        <MicrophoneIcon className={style.icon} />{" "}
        <div className={style.speechText}>Hold To Use Speech</div>
      </button>
    </div>
  );
};

export default ControllerConsoleSpeech;
