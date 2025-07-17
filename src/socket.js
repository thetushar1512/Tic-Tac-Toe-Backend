import { io } from "socket.io-client";

const socket = io("https://tic-tac-toe-actualbackend.onrender.com");

export default socket;
