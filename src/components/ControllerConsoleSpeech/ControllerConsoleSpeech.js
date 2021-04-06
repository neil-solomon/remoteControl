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
    const commands = getCommands(transcript);
    props.handleDirectionCommands(commands);
    resetTranscript();
    setTimeout(() => resetTranscript(), 100); // sometimes this needs to be called twice to actually work
  };

  const getCommands = (transcript) => {
    var commands = [];
    var commandDirection = null;
    var commandDuration = null;

    for (const word of transcript.split(" ")) {
      switch (word.toLowerCase()) {
        case "forward":
        case "forwards":
        case "front":
        case "up":
        case "north":
          commandDirection = 1;
          commandDuration = null;
          break;
        case "backward":
        case "backwards":
        case "back":
        case "down":
        case "south":
          commandDirection = 2;
          commandDuration = null;
          break;
        case "left":
        case "east":
          commandDirection = 3;
          commandDuration = null;
          break;
        case "right":
        case "west":
          commandDirection = 4;
          commandDuration = null;
          break;
        case "one":
        case "won":
        case "1":
          commandDuration = 1;
          break;
        case "two":
        case "to":
        case "2":
          commandDuration = 2;
          break;
        case "three":
        case "tree":
        case "3":
          commandDuration = 3;
          break;
        case "four":
        case "for":
        case "4":
          commandDuration = 4;
          break;
        case "five":
        case "5":
          commandDuration = 5;
          break;
        case "six":
        case "sex":
        case "6":
          commandDuration = 6;
          break;
        case "seven":
        case "7":
          commandDuration = 7;
          break;
        case "eight":
        case "ate":
        case "8":
          commandDuration = 8;
          break;
        case "nine":
        case "9":
          commandDuration = 9;
          break;
        default:
          break;
      }

      if (commandDirection && commandDuration) {
        commands.push([commandDirection, commandDuration]);
        commandDirection = null;
        commandDuration = null;
      }
    }

    console.log("parsed commands:", commands);
    return commands;
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
