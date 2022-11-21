import "./App.css";
import { useState, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import network from "./Network";

const serverUrl = "https://scandalous-faint-donut.glitch.me";

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
    setSelfName(name);
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
    </div>
  );
}

// A Player's position is moved using React-Spring
function Player({ position, color, name }) {
  const props = useSpring({
    transform: `translate3d(${position.x}px, ${position.y}px ,0)`,
    config: { mass: 1, tension: 30, friction: 10 },
  });
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
