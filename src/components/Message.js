import React, { useState, useEffect } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import { deepOrange } from "@material-ui/core/colors";

import { get_messages_file, del_messages } from "./Axios";

const useStyles = makeStyles((theme) =>
  createStyles({
    messageRow: {
      display: "flex"
    },
    messageRowRight: {
      display: "flex",
      justifyContent: "flex-end"
    },
    messageBlue: {
      position: "relative",
      marginLeft: "20px",
      marginBottom: "20px",
      padding: "15px",
      backgroundColor: "#A8DDFD",
      width: "90%",
      //height: "50px",
      textAlign: "left",
      font: "400 .9em 'Open Sans', sans-serif",
      border: "1px solid #97C6E3",
      borderRadius: "10px",
      "&:after": {
        content: "''",
        position: "absolute",
        width: "0",
        height: "0",
        borderTop: "15px solid #A8DDFD",
        borderLeft: "15px solid transparent",
        borderRight: "15px solid transparent",
        top: "0",
        left: "-15px"
      },
      "&:before": {
        content: "''",
        position: "absolute",
        width: "0",
        height: "0",
        borderTop: "17px solid #97C6E3",
        borderLeft: "16px solid transparent",
        borderRight: "16px solid transparent",
        top: "-1px",
        left: "-17px"
      }
    },
    messageOrange: {
      position: "relative",
      marginRight: "20px",
      marginBottom: "20px",
      padding: "15px",
      backgroundColor: "#f8e896",
      width: "30%",
      //height: "50px",
      textAlign: "left",
      font: "400 .9em 'Open Sans', sans-serif",
      border: "1px solid #dfd087",
      borderRadius: "10px",
      "&:after": {
        content: "''",
        position: "absolute",
        width: "0",
        height: "0",
        borderTop: "15px solid #f8e896",
        borderLeft: "15px solid transparent",
        borderRight: "15px solid transparent",
        top: "0",
        right: "-15px"
      },
      "&:before": {
        content: "''",
        position: "absolute",
        width: "0",
        height: "0",
        borderTop: "17px solid #dfd087",
        borderLeft: "16px solid transparent",
        borderRight: "16px solid transparent",
        top: "-1px",
        right: "-17px"
      }
    },
    messageContent: {
      padding: 0,
      margin: 0
    },
    messageTimeStampRight: {
      position: "absolute",
      fontSize: ".85em",
      fontWeight: "300",
      marginTop: "10px",
      bottom: "1px",
      right: "5px"
    },
    orange: {
      color: theme.palette.getContrastText(deepOrange[500]),
      backgroundColor: deepOrange[500],
      width: theme.spacing(4),
      height: theme.spacing(4)
    },
    avatarNothing: {
      color: "transparent",
      backgroundColor: "transparent",
      width: theme.spacing(4),
      height: theme.spacing(4),
    },
    displayName: {
      marginLeft: "20px"
    }
  })
);

export const MessageLeft = (props) => {
  const message = props.message ? props.message : "no message";
  const timestamp = props.timestamp ? props.timestamp : "";
  const photoURL = props.photoURL ? props.photoURL : "dummy.js";
  const displayName = props.displayName ? props.displayName : "None";
  const contenType = props.contenType
  const classes = useStyles();

  const [renderURL, setRenderURL] = useState("")

  const handleDownload = async () => {
    let token = props.token
    let target = props.target
    let id = props.id
    try {
      const res = await get_messages_file({ token, target, id })
      try {
        const url = window.URL.createObjectURL(new File([res.data], message))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", message)
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
      } catch (err) {
        props.setStatus({ type: "warning", msg: "Network error!" })
      }
    } catch (err) {
      props.setStatus({ type: "danger", msg: err })
    }
  }

  const handleShowImage = async () => {
    if (contenType === "Image") {
      let token = props.token
      let target = props.target
      let id = props.id
      try {
        const res = await get_messages_file({ token, target, id })
        try {
          const url = window.URL.createObjectURL(new File([res.data], message))
          setRenderURL(url)
        } catch (err) {
          setRenderURL("")
        }
      } catch (err) {
        setRenderURL("")
      }
    } else {
      setRenderURL("")
    }
  }

  useEffect(() => {
    handleShowImage()
  }, [])

  return (
    <>
      <div className={classes.messageRow}>
        <Avatar
          alt={displayName}
          className={classes.orange}
          src={photoURL}
        ></Avatar>
        <div>
          <div className={classes.displayName}>{displayName}</div>
          <div className={classes.messageBlue}>
            <div>
              {
                contenType === "Image" ?
                <img
                  src={renderURL}
                  width="40px"
                ></img>:
                <></>
              }
              {
                contenType === "Generic" ?
                <p
                  className={classes.messageContent}
                >{message}</p> :
                <p
                  className={classes.messageContent}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    handleDownload()
                  }}
                >{message}</p>
              }
            </div>
            <div className={classes.messageTimeStampRight}>{timestamp}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export const MessageRight = (props) => {
  const classes = useStyles();
  const message = props.message ? props.message : "no message";
  const timestamp = props.timestamp ? props.timestamp : "";
  const contenType = props.contenType

  const [renderURL, setRenderURL] = useState("")

  const handleDelMes = async () => {
    let token = props.token
    let target = props.target
    let id = props.id
    try {
      const { status } = await del_messages({ token, target, id })
      if (status === "ok") {
        await props.chat.splice(props.delIdx, 1)
        props.setStatus({ type: "success", msg: "Successfully unsend" })
      } else {
        props.setStatus({ type: "warning", msg: "Network error!" })
      }
    } catch (err) {
      props.setStatus({ type: "danger", msg: err })
    }
  }

  const handleShowImage = async () => {
    if (contenType === "Image") {
      let token = props.token
      let target = props.target
      let id = props.id
      try {
        const res = await get_messages_file({ token, target, id })
        try {
          const url = window.URL.createObjectURL(new File([res.data], message))
          setRenderURL(url)
        } catch (err) {
          setRenderURL("")
        }
      } catch (err) {
        setRenderURL("")
      }
    } else {
      setRenderURL("")
    }
  }

  useEffect(() => {
    handleShowImage()
  }, [])

  useEffect(() => {
    handleShowImage()
  }, [props.message])

  return (
    <div className={classes.messageRowRight}>
      <div className={classes.messageOrange}>
        {
          contenType === "Image" ?
          <img
            src={renderURL}
            width="40px"
          ></img>:
          <></>
        }
        <p
          className={classes.messageContent}
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            handleDelMes()
          }}
        >{message}</p>
        <div className={classes.messageTimeStampRight}>{timestamp}</div>
      </div>
    </div>
  );
};
