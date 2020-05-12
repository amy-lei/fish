import React, { Component } from "react";
import Home from "./Home.js";
import Header from "../modules/Header";
import WaitingRoom from "./WaitingRoom.js";
import PlayRoom from "./PlayRoom.js";
import TestDrag from "./TestDrag.js";

import "../../utilities.css";
import { post } from "../../utilities";
import { hasCard, isValidAsk, isValidDeclare, canObject, removeHalfSuit } from "../../game-utilities";
import { socket } from "../../client-socket";
import { card_svgs } from "../card_svgs.js";

class JoinGame extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
}
