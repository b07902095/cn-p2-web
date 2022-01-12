import axios from "axios";

const baseURL = process.env.REACT_APP_BASE_URL || "http://140.112.29.204:5000"
const instance = axios.create({
  baseURL: baseURL,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
})

const get_friends = async (req) => {
  const { data } = await instance.post("/get/friends", req)
  return data
}

export {
  get_friends,
}