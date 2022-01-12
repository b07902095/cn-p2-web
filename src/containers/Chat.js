import React, { useState, useEffect } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";

import { MessageLeft, MessageRight } from "../components/Message";
import { TextInput } from "../components/TextInput";

import { get_messages } from "../components/Axios";

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      width: "80vw",
      height: "80vh",
      maxWidth: "500px",
      maxHeight: "90%",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      position: "relative"
    },
    paper2: {
      width: "80vw",
      maxWidth: "500px",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      position: "relative"
    },
    container: {
      width: "100vw",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    messagesBody: {
      width: "calc( 100% - 20px )",
      margin: 10,
      overflowY: "scroll",
      height: "calc( 100% - 80px )",
    }
  })
);

const ChatBox = (props) => {
  const classes = useStyles();

  const [chat, setChat] = useState([])

  const handleFetch = async () => {
    const processTimestamp = (timestamp) => {
      let date = new Date(timestamp)
      return (date.getMonth()+1) + "/" +
              date.getDate() + " " + 
              date.getHours().toString().padStart(2, "0") + ":" +
              date.getMinutes().toString().padStart(2, "0")
    }

    let token = props.token
    let target = props.currentTarget
    if (token && target) {
      try {
        const { status, payload } = await get_messages({ token, target })
        if (status === "ok") {
          for (let i = 0; i < payload.length; i++) {
            payload[i].timestamp = processTimestamp(payload[i].timestamp)
          }
          setChat(payload)
        } else {
          props.setStatus({ type: "warning", msg: "Network error!" })
        }
      } catch (err) {
        props.setStatus({ type: "danger", msg: err })
      }
    }
  }

  useEffect(() => {
    setChat([])
    handleFetch()
  }, [props.currentTarget])

  const refreshChat = () => {
    handleFetch()
  }

  return (
    <div className={classes.container}>
      <Paper className={classes.paper}>
        <h4>
          {props.currentTarget}
        </h4>
        <Paper id="style-1" className={classes.messagesBody}>
          {
            chat.map((val, _) => (
              val.sender_name === props.currentTarget ?
              <MessageLeft
                message={val.content}
                timestamp={val.timestamp}
                photoURL=""
                displayName={val.sender_name}
                avatarDisp={false}
              /> :
              <MessageRight
                message={val.content}
                timestamp={val.timestamp}
                photoURL=""
                displayName={val.sender_name}
                avatarDisp={false}
            />
            ))
          }
        </Paper>
        <TextInput
          token={props.token}
          currentTarget={props.currentTarget}
          setStatus={props.setStatus}
          refreshChat={refreshChat}
        />
      </Paper>
    </div>
  );
}

export default ChatBox;