import Grid from '@mui/material/Grid';

import ChatBox from "./containers/Chat";
import FriendList from "./containers/FriendList";

function App() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={2}>
        <FriendList />
      </Grid>
      <Grid item xs={10}>
        <ChatBox />
      </Grid>
    </Grid>
    
  );
}

export default App;
