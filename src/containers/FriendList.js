import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Box from '@mui/material/Box';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';

import { put_friends, get_friends } from "../components/Axios";

const FriendList = (props) => {

  const [friend, setFriend] = useState([])
  const [text, setText] = useState("")

  const handleRefreshTarget = (name) => {
    props.setCurrentTarget(name)
  }

  function renderRow(props) {
    const { index, style } = props;

    return (
      <ListItem style={style} key={index} component="div" onClick={(e) => {
        handleRefreshTarget(friend[index])
      }}>
        <ListItemButton>
          <ListItemText
            style={{ textAlign: "center" }}
            primary={`${friend[index]}`}
          />
        </ListItemButton>
      </ListItem>
    );
  }

  const handleFetch = async () => {
    let token = props.token
    try {
      const { status, payload } = await get_friends({ token })
      if (status === "ok") {
        setFriend(payload)
      } else {
        props.setStatus({ type: "warning", msg: "Network error!" })
      }
    } catch (err) {
      props.setStatus({ type: "danger", msg: err })
    }
  }

  const handleSubmit = async () => {
    let token = props.token
    let target = text
    if (!target.length) {
      props.setStatus({ type: "error", msg: "Text field cannot be empty!" })
    } else {
      try {
        const { status } = await put_friends({ token, target })
        if (status === "ok") {
          props.setStatus({ type: "success", msg: "Successfully added" })
          handleFetch()
        } else if (status === "dup") {
          props.setStatus({ type: "warning", msg: "Already friend!" })
        } else if (status === "not_found") {
          props.setStatus({ type: "warning", msg: "Username not found!" })
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

  useEffect(() => {
    handleFetch()
  }, [])  

  return (
    <>
      <Box sx={{ height: 40 }}></Box>
      <Box
        sx={{ width: '100%', height: 600, maxWidth: 360 }}
      >
        <FixedSizeList
          height={400}
          width={360}
          itemSize={46}
          itemCount={friend.length}
          overscanCount={5}
        >
          {renderRow}
        </FixedSizeList>
      </Box>
      <Box
        sx={{ width: '100%', height: 600, maxWidth: 360 }}
        style={{ textAlign: "center" }}
      >
        <TextField
          id="standard-text"
          label="Username"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit()
            }
          }}
        />
        <div style={{ height: "10px" }}></div>
        <Button
          variant="contained"
          endIcon={<AddIcon />}
          onClick={(e) => {
            handleSubmit()
          }}
        >
          Add Friend
        </Button>
      </Box>
    </>
  );
}

export default FriendList;