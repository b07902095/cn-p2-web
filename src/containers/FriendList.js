import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';

import { get_friends } from "../components/Axios";

const FriendList = (props) => {

  const [friend, setFriend] = useState([])

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

  useEffect(() => {
    handleFetch()
  }, [])  

  return (
    <>
      <Box sx={{ height: 40 }}></Box>
      <Box
        sx={{ width: '100%', height: 600, maxWidth: 360, bgcolor: 'background.paper' }}
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
    </>
  );
}

export default FriendList;