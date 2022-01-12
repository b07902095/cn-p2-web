import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList } from 'react-window';

import { get_friends } from "../components/Axios";

const FriendList = () => {

  const [friend, setFriend] = useState([])

  function renderRow(props) {
    const { index, style } = props;
  
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText
            style={{ paddingLeft: "40px" }}
            primary={`${friend[index]}`}
          />
        </ListItemButton>
      </ListItem>
    );
  }

  const handleFetch = async () => {
    try {
      const { status, payload } = await get_friends()
      console.log(status, payload)
      if (status === "ok") {
        setFriend(payload)
      } else {
        console.warn("Fetching error")
      }
    } catch (err) {
      console.warn(err)
    }

  }

  useEffect(() => {
    handleFetch()
  }, [])  

  return (
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
  );
}

export default FriendList;