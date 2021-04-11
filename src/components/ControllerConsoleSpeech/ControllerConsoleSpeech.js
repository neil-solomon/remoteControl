/**
 * https://blog.logrocket.com/using-the-react-speech-recognition-hook-for-voice-assistance/
 */

import React, { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import style from "./ControllerConsoleSpeech.module.css";
import { ReactComponent as MicrophoneIcon } from "../../icons/microphone.svg";

const ControllerConsoleSpeech = (props) => {
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("rgb(33, 33, 33)");
  const [messageSize, setMessageSize] = useState("1.25em");
  var displayCommandsWords_timeouts = [];

  useEffect(() => {
    return () => {
      for (const timeout of displayCommandsWords_timeouts) {
        clearTimeout(timeout);
      }
    };
  }, []);

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
    // console.log("transcript:", transcript);
    SpeechRecognition.stopListening();
    const { commands, commandsWords } = getCommands(transcript);
    props.handleDirectionCommands(commands);
    displayCommandsWords(commands, commandsWords);
    resetTranscript();
    setTimeout(() => resetTranscript(), 100); // sometimes this needs to be called multiple times to actually work
    setTimeout(() => resetTranscript(), 200);
  };

  const getCommands = (transcript) => {
    var commands = [];
    var commandDirection = null;
    var commandDuration = null;
    var commandsWords = [];
    var commandWordDirection = null;
    var commandWordDuration = null;

    for (const word of transcript.split(" ")) {
      switch (word.toLowerCase()) {
        case "forward":
        case "forwards":
        case "front":
        case "up":
        case "north":
          commandDirection = 1;
          commandDuration = null;
          commandWordDirection = word;
          commandWordDuration = null;
          break;
        case "backward":
        case "backwards":
        case "back":
        case "down":
        case "south":
          commandDirection = 2;
          commandDuration = null;
          commandWordDirection = word;
          commandWordDuration = null;
          break;
        case "left":
        case "east":
          commandDirection = 3;
          commandDuration = null;
          commandWordDirection = word;
          commandWordDuration = null;
          break;
        case "right":
        case "west":
          commandDirection = 4;
          commandDuration = null;
          commandWordDirection = word;
          commandWordDuration = null;
          break;
        case "one":
        case "won":
        case "1":
          commandDuration = 1;
          commandWordDuration = word;
          break;
        case "two":
        case "to":
        case "2":
          commandDuration = 2;
          commandWordDuration = word;

          break;
        case "three":
        case "tree":
        case "3":
          commandDuration = 3;
          commandWordDuration = word;

          break;
        case "four":
        case "for":
        case "4":
          commandDuration = 4;
          commandWordDuration = word;

          break;
        case "five":
        case "5":
          commandDuration = 5;
          commandWordDuration = word;

          break;
        case "six":
        case "sex":
        case "6":
          commandDuration = 6;
          commandWordDuration = word;

          break;
        case "seven":
        case "7":
          commandDuration = 7;
          commandWordDuration = word;

          break;
        case "eight":
        case "ate":
        case "8":
          commandDuration = 8;
          commandWordDuration = word;
          break;
        case "nine":
        case "9":
          commandDuration = 9;
          commandWordDuration = word;

          break;
        default:
          break;
      }

      if (commandDirection && commandDuration) {
        commands.push([commandDirection, commandDuration]);
        commandDirection = null;
        commandDuration = null;
        commandsWords.push([commandWordDirection, commandWordDuration]);
        commandWordDirection = null;
        commandWordDuration = null;
      }
    }

    // console.log("parsed commands:", commands);
    return { commands: commands, commandsWords: commandsWords };
  };

  const displayCommandsWords = (commands, commandsWords) => {
    /**
     * commandsWords is an array where each entry is a 2-element array of strings.
     * commands is an array where each entry is a 2-element array.
     * commands[i][0] is direction, commands[i][1] is duration.
     */
    // console.log(commandsWords);
    if (!(commandsWords instanceof Array)) {
      return;
    }

    if (commandsWords.length === 0) {
      setMessageColor("rgb(33, 33, 33)");
      setMessageSize("1.25em");
      displayCommandsWords_timeouts = new Array(5);

      displayCommandsWords_timeouts[0] = setTimeout(() => {
        setMessage("Say 'forward one'");
      }, 0);
      displayCommandsWords_timeouts[1] = setTimeout(() => {
        setMessage("Say 'back two'");
      }, 1000);
      displayCommandsWords_timeouts[2] = setTimeout(() => {
        setMessage("Say 'left three'");
      }, 2000);
      displayCommandsWords_timeouts[3] = setTimeout(() => {
        setMessage("Say 'right two'");
      }, 3000);
      displayCommandsWords_timeouts[4] = setTimeout(() => {
        setMessage("");
      }, 4000);

      return;
    }

    displayCommandsWords_timeouts = new Array(commands.length + 1);
    var durationCounter = 0;
    setMessageColor("rgb(76, 175, 80)");
    setMessageSize("1.5em");

    for (let i = 0; i < commands.length; i++) {
      if (!commands[i][1] || !commandsWords[i][0] || !commandsWords[i][1]) {
        continue;
      }

      displayCommandsWords_timeouts[i] = setTimeout(() => {
        setMessage(commandsWords[i][0] + " " + commandsWords[i][1]);
      }, durationCounter * 1000);

      durationCounter += commands[i][1];
    }

    displayCommandsWords_timeouts[
      displayCommandsWords_timeouts.length - 1
    ] = setTimeout(() => {
      setMessage("");
    }, durationCounter * 1000);
  };

  return (
    <div className={style.container}>
      <div
        className={style.message}
        style={{ color: messageColor, fontSize: messageSize }}
        key={message}
      >
        {message}
      </div>
      <button
        className="Button"
        style={{ fontSize: "1.25em" }}
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onTouchStart={startListening}
        onTouchEnd={stopListening}
        onTouchCancel={stopListening}
        id="speechButton"
        disabled={props.buttonDisabled}
      >
        <MicrophoneIcon className={style.icon} />{" "}
        <div className={style.speechText}>Hold For Speech</div>
      </button>
    </div>
  );
};

export default ControllerConsoleSpeech;
