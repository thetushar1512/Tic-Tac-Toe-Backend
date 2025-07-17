import React, { useState, useEffect } from 'react';
import "./body.css";
import socket from './socket';

const Body = () => {
  const [buttons, setButtons] = useState(Array(9).fill("empty"));
  const [currentTurn, setCurrentTurn] = useState("circle");
  const [winner, setWinner] = useState(null);
  const [roomId, setRoomId] = useState("");
  const gameover = new Audio("./gameover.mp3");
  const draw = new Audio("./draw.mp3");

  const joinRoom = () => {
    const roomCode = prompt("Enter Room Code:");
    setRoomId(roomCode);
    socket.emit("joinroom", roomCode);
  };

  useEffect(() => {
    socket.on("start-game", () => {
      alert("Both players joined! Game starting.");
    });

    socket.on("room-full", () => {
      alert("Room is already full.");
    });

    socket.on("receive-move", ({ index, symbol }) => {
      setButtons(prev => {
        const newButtons = [...prev];
        if (newButtons[index] === "empty") {
          newButtons[index] = symbol;
        }
        const result = checkWinner(newButtons);
        if (result) setWinner(result);
        return newButtons;
      });
      setCurrentTurn(prev => (prev === "circle" ? "cross" : "circle"));
    });
    return () => {
      socket.off("start-game");
      socket.off("room-full");
      socket.off("receive-move");
    };
  }, []);

  const circleSvg = (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const crossSvg = (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M19 5L5 19M5 5L19 19"
        stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // this row give us possiblities of winning via horizantal line
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // this row give us possiblities of winning via vertical line
    [0, 4, 8], [2, 4, 6]             // this row give us possiblities of winning via diagonal line
  ];

  const checkWinner = (cells) => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (cells[a] !== "empty" && cells[a] === cells[b] && cells[a] === cells[c]) {
        return cells[a];
      }
    }
    if (!cells.includes("empty")) return "draw";
    return null;
  };

  const handleClick = (index) => {
    if(!roomId){
      alert("PLZ Join a Room First!!");
      return;
    }
    
    if (winner || buttons[index] !== "empty") return;
    const clicksound = new Audio("./click.wav");
    clicksound.play();

    setButtons(prev => {
      const newButtons = [...prev];
      newButtons[index] = currentTurn;

      const result = checkWinner(newButtons);
      if (result) setWinner(result);

      return newButtons;
    });

    socket.emit("make-move", {
      roomId,
      index,
      symbol: currentTurn
    });

    setCurrentTurn(prev => (prev === "circle" ? "cross" : "circle"));
  };

  const renderIcon = (value) => {
    if (value === "circle") return circleSvg;
    if (value === "cross") return crossSvg;
    return null;
  };

  useEffect(() => {
    if (winner === "circle") { 
      gameover.play();
      alert("Player 1 wins!");
      alert("Reload to start Game again!");}
    else if (winner === "cross") {
      gameover.play();
      alert(" Player 2 wins!");
      alert("Reload to start Game again!");}
    else if (winner === "draw") {
      draw.play();
      alert("It's a Draw!");
      alert("Reload to start Game again!");}
  }, [winner]);

  return (
   <div className='containerforjoinbtn'>
<div className='forjoinbtn'>
  <button className='join-btn' onClick={joinRoom}>
    Click here to Join Room
  </button>
  </div>
<div className='Main'>
  <div className='mainbody'>
    {buttons.map((value, index) => (
      <button
        key={index}
        className='btn'
        onClick={() => handleClick(index)}
        disabled={value !== "empty" || winner}
      >
        {renderIcon(value)}
      </button>
    ))}
  </div>
</div>
</div>
  );
};
export default Body;