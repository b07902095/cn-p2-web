import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import SendIcon from '@material-ui/icons/Send';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@material-ui/core/Button';

import { put_messages, put_messages_file } from "./Axios";

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
        marginRight: theme.spacing(1),
    },
    button2: {
      margin: theme.spacing(1),
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
  },
  })
);


export const TextInput = (props) => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false)
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);

  const handleSubmit = async () => {

    setLoading(true)

    if (!files.length) {
      let token = props.token
      let target = props.currentTarget
      let message = text
      let type = "Generic"

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
        }
      }
    } else {
      let token = props.token
      let target = props.currentTarget
      let message = files[0].name
      let type = files[0].type.includes("image") ? "Image" : "File"
      let formData = new FormData()
      formData.append("token", token)
      formData.append("target", target)
      formData.append("message", message)
      formData.append("type", type)
      formData.append("attachment", files[0])

      if (files[0].size > 32 * 1024 * 1024) {
        props.setStatus({ type: "warning", msg: "File exceeds 32MB!" })
      } else {
        try {
          const { status } = await put_messages_file(formData)
          if (status === "ok") {
            props.refreshChat()
          } else {
            props.setStatus({ type: "warning", msg: "Network error!" })
          }
        } catch (err) {
          props.setStatus({ type: "danger", msg: err })
        }
      }
    }

    setText("")
    setLoading(false)
  }

  return (
    <>
      {
        files.length ?
        (
          files[0].name.length < 30 ?
          files[0].name :
          files[0].name.substring(0, 30) + " ..."
        ) + " (" + (files[0].type.length ? files[0].type : "unknown") + ") " :
        ""
      }
      <form
        className={classes.wrapForm}
        noValidate
        autoComplete="off"
        onSubmit={(e) => {e.preventDefault()}}
      >
        <Button
          component="label"
          variant="contained"
          className={classes.button2}
        >
          <AttachFileIcon />
          <input
            type="file"
            hidden
            onChange={(e) => setFiles(e.target.files)}
          />
        </Button>
        <TextField
          id="standard-text"
          label="Message"
          value={text}
          className={classes.wrapText}
          onChange={(e) => {
            setFiles([])
            setText(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit()
            }
          }}
        />
        <LoadingButton
          variant="contained"
          color="primary"
          className={classes.button}
          loading={loading}
          onClick={(e) => {
            handleSubmit()
          }}
        >
          <SendIcon />
        </LoadingButton>
      </form>
    </>
  )
}



