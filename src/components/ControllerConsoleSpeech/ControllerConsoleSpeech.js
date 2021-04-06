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
    console.log("transcript:", transcript);
    SpeechRecognition.stopListening();
    getcommand(transcript);
    resetTranscript();
    setTimeout(() => resetTranscript(), 100);
  };

  const getcommand = (transcript) => {
    var direction = null;
    var distance = null;

    if (transcript.includes("forward")) {
      direction = "forward";
    } else if (transcript.includes("backward")) {
      direction = "backward";
    } else if (transcript.includes("left")) {
      direction = "left";
    } else if (transcript.includes("right")) {
      direction = "right";
    }

    if (transcript.includes("one")) {
      distance = 1;
    } else if (transcript.includes("two")) {
      distance = 2;
    } else if (transcript.includes("three")) {
      distance = 3;
    } else if (transcript.includes("four")) {
      distance = 4;
    } else if (transcript.includes("five")) {
      distance = 5;
    } else if (transcript.includes("six")) {
      distance = 6;
    } else if (transcript.includes("seven")) {
      distance = 7;
    } else if (transcript.includes("eight")) {
      distance = 8;
    } else if (transcript.includes("nine")) {
      distance = 9;
    }

    if (distance === null) {
      transcript = transcript.split(" ");
      for (let i = 0; i < transcript.length; i++) {
        console.log("!", transcript[i]);
        if (!isNaN(parseInt(transcript[i])) && parseInt(transcript[i]) !== 0) {
          distance = parseInt(transcript[i]);
        }
      }
    }

    console.log("command:", direction, distance);
  };

  return (
    <div className={style.container}>
      <button
        className="Button"
        style={{ fontSize: "1.25em" }}
        onMouseDown={startListening}
        onMouseUp={stopListening}
        id="speechButton"
      >
        <MicrophoneIcon className={style.icon} />{" "}
        <div className={style.speechText}>Hold To Use Speech</div>
      </button>
    </div>
  );
};

export default ControllerConsoleSpeech;
