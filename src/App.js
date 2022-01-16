import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { message } from "antd";
import "antd/dist/antd.min.css";

import SignUp from "./containers/SignUp";
import SignIn from "./containers/SignIn";
import ChatBox from "./containers/Chat";
import FriendList from "./containers/FriendList";

const restoreSession = (key, default_value) => {
  const stored = localStorage.getItem(key)
  if (!stored) {
    return default_value
  }
  return JSON.parse(stored)
}

const App = () => {

  const [session, setSession] = useState(restoreSession("localSession", {
    page: 0,
    token: ""
  }))
  const [timeoutId, setTimeoutId] = useState(null)
  const [currentTarget, setCurrentTarget] = useState(null)

  useEffect(() => {
    localStorage.setItem("localSession", JSON.stringify({ ...session }))
    if (timeoutId)
      clearTimeout(timeoutId)
    setTimeoutId(setTimeout(() => {
      localStorage.removeItem("localSession")
      setTimeoutId(null)
    }, 60 * 60 * 1000))
  }, [session])

  const handleSession = (key, value) => {
    let newSession = ({ ...session })
    newSession[key] = value
    setSession({ ...newSession })
  }

  const [status, setStatus] = useState({})
  useEffect(() => {
    displayStatus(status)
  }, [status])

  const displayStatus = (s) => {
    if (s.msg) {
      const { type, msg } = s;
      const content = {
        content: msg,
        duration: 3,
      };

      switch (type) {
        case "success":
          message.success(content);
          break;
        case "info":
          message.info(content);
          break;
        case "warning":
          message.warning(content);
          break;
        case "danger":
        default:
          message.error(content);
          break;
      }
    }
  }

  let currentPage
  if (session.token) {
    currentPage =
    <Grid container spacing={2}>
      <Grid item xs={2}>
        <FriendList
          token={session.token}
          setCurrentTarget={setCurrentTarget}
          setStatus={setStatus}
        />
      </Grid>
      <Grid item xs={10}>
        <ChatBox
          token={session.token}
          currentTarget={currentTarget}
          setStatus={setStatus}
        />
      </Grid>
    </Grid>
  } else {
    switch (session.page) {
      case 0:
        currentPage = 
        <SignIn
          handleSession={handleSession}
          setStatus={setStatus}
        />
        break;
      case 1:
        currentPage = 
        <SignUp
          handleSession={handleSession}
          setStatus={setStatus}
        />
        break;
      default:
        break;
    }
  }

  return (
    <>
      {currentPage}
    </>    
  );
}

export default App;
