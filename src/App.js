import "./App.css";
import { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "react-spring";
import network from "./Network";
import { FiCamera, FiCameraOff, FiMic, FiMicOff, FiVideo, FiVideoOff } from 'react-icons/fi';
import { initSDK } from "./super-sdk"

const serverUrl = "https://scandalous-faint-donut.glitch.me";
const proxmityThreshold = 100;

function App() {
  const [boardOffset, setBoardOffset] = useState({ x: 0, y: 0 });
  const [selfPosition, setSelfPosition] = useState({ x: 250, y: 250 });
  const [selfName, setSelfName] = useState("");
  const [selfId, setSelfId] = useState(null);
  const [players, setPlayers] = useState({});

  const handleStateUpdate = (players) => {
    setPlayers(players);
  };

  const handleUpdatePosition = (x, y) => {
    setSelfPosition({ x, y });
    network.sendPosition({ x, y });
    // check for proximity
    for (let key in players) {
      const player = players[key];
      // not calculating distance with self
      if (selfId !== player.id) {
        const distance = calculateDistance(
          x,
          y,
          player.position.x,
          player.position.y
        );
        if (distance <= proxmityThreshold) {
          // Users are Close Enough
          console.log(
            `Subscribe to User:${player.name} as Distance b/w ME and User (< 100) => ${distance}`
          );
        } else {
          // Users are Far
          console.log(
            `Unsubscribe to User:${player.name} as Distance b/w ME and User (>100) => ${distance}`
          );
        }
      }
    }
  };

  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  };

  const getInitials = (name) => {
    const arr = name.split(" ");
    const len = arr.length;
    if (len > 1) {
      return arr[0][0] + arr[len - 1][0];
    } else {
      return arr[0][0];
    }
  };



  useEffect(() => {
    // On mount:
    // - randomly choose a color
    // - connect to network
    const rand = Math.random();
    const color = rand < 0.33 ? "red" : rand < 0.66 ? "blue" : "green";
    const name = getInitials(window.prompt("Enter User Name") || "App Builder");
    setSelfName(`${name}\nMe`);
    network.init(serverUrl, color, setSelfId, handleStateUpdate, name);

  }, []);

  // window resize handler
  const handleResize = () => {
    setBoardOffset(offset(document.querySelector(".board")));
  };
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="app">
      <div className="videoContainer"></div>
      <div
        className="board"
        onPointerDown={({ clientX, clientY }) => {
          handleUpdatePosition(
            clientX - boardOffset.x,
            clientY - boardOffset.y
          );
        }}
      >
        <div className="metaballs">
          {/* render all other players */}
          {Object.entries(players).map(([id, data]) => {
            if (id === selfId) return null;
            return (
              <Player
                key={`player${id}`}
                position={data.position}
                color={data.color}
                name={data.name}
              />
            );
          })}

          {/* render player separate from state updates for instant response */}
          <Player position={selfPosition} name={selfName} />
        </div>
      </div>
      <LocalUser />
    </div>
  );
}

const tracks = {
  localVideoTrack: null,
  localAudioTrack: null
};
// local user would always be shown 
function LocalUser() {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [tracks, setTracks] = useState(null)
  const localContainerRef = useRef();

  const initLocalTracks = async () => {
    const [audioTrack, videoTrack] = await initSDK();
    videoTrack.play(localContainerRef.current, { fit: "cover" });
    videoTrack.setEnabled = false;
    //tracks.localAudioTrack = audioTrack;
    // tracks.localVideoTrack = videoTrack;
    setTracks({ localVideoTrack: videoTrack, localAudioTrack: audioTrack })
    // not playing audio track for self
  }
  useEffect(() => {
    initLocalTracks()
  }, [])
  const handleMicToggle = () => {
    setMicOn(prevState => !prevState)
  }
  const handleCameraToggle = () => {
    setCameraOn(prevState => !prevState);
    tracks.localVideoTrack.setEnabled = false;
  }
  return (
    <div className="localContainer" >
      <div className="localVideoContainer" ref={localContainerRef}></div>
      <div className="localControls">
        <Controls tracks={tracks} />
      </div>
      <span>Local User (Me)</span>
    </div>
  )

}

function Controls(props) {
  const { tracks } = props;
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const handleMicToggle = () => {
    setMicOn(prevState => !prevState)
  }
  const handleCameraToggle = () => {

    console.log("tracks", tracks);
    setCameraOn(prevState => !prevState);
    cameraOn ? tracks.localVideoTrack.setEnabled = false : tracks.localVideoTrack.setEnabled = true


  }
  return (
    <>
      <i class="icon" onClick={handleMicToggle}>
        {micOn ? <FiMic /> : <FiMicOff color="red" />}
      </i>
      <i class="icon" onClick={handleCameraToggle}>
        {cameraOn ? <FiCamera /> : <FiCameraOff color="red" />}
      </i>
    </>

  )


}

// A Player's position is moved using React-Spring
function Player({ position, color, name }) {
  const props = useSpring({
    transform: `translate3d(${position.x}px, ${position.y}px ,0)`,
    config: { mass: 1, tension: 30, friction: 10 },
  });
  useEffect(() => {
    console.warn("moving");
  }, [position]);
  return (
    <animated.div className={`player`} style={props}>
      <animated.span className="text"> {name.toUpperCase()}</animated.span>
    </animated.div>
  );
}

// Calculates page offset of our gameboard
function offset(el) {
  var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { x: rect.left + scrollLeft, y: rect.top + scrollTop };
}

export default App;
