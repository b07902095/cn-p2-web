import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import SendIcon from '@material-ui/icons/Send';
import Button from '@material-ui/core/Button';

import { put_messages } from "./Axios";

const useStyles = makeStyles((theme) =>
  createStyles({
    wrapForm : {
        display: "flex",
        justifyContent: "center",
        width: "95%",
        margin: `${theme.spacing(0)} auto`
    },
    wrapText  : {
        width: "100%"
    },
    button: {
        margin: theme.spacing(1),
        marginLeft: theme.spacing(1),
    },
  })
);


export const TextInput = (props) => {
  const classes = useStyles();

  const [text, setText] = useState("");

  const handleSubmit = async () => {
    let token = props.token
    let target = props.currentTarget
    let message = text
    let type = "Generic"

    console.log(target, message)

    if (!target || !target.length) {
      props.setStatus({ type: "warning", msg: "Please select a person first!" })
    } else if (!message || !message.length) {
      props.setStatus({ type: "warning", msg: "Text field cannot be empty!" })
    } else {
      try {
        const { status } = await put_messages({ token, target, message, type })
        if (status === "ok") {
          props.refreshChat()
        } else {
          props.setStatus({ type: "warning", msg: "Network error!" })
        }
      } catch (err) {
        props.setStatus({ type: "danger", msg: err })
      } finally {
        setText("")
      }
    }
  }

  return (
    <>
      <form
        className={classes.wrapForm}
        noValidate
        autoComplete="off"
        onSubmit={(e) => {e.preventDefault()}}
      >
        <TextField
          id="standard-text"
          label="Message"
          value={text}
          className={classes.wrapText}
          onChange={(e) => {
            setText(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit()
            }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={(e) => {
            handleSubmit()
          }}
        >
          <SendIcon />
        </Button>
      </form>
    </>
  )
}



