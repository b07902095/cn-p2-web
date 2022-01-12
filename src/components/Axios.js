import axios from "axios";

const baseURL = process.env.REACT_APP_BASE_URL || "http://140.112.29.204:5000"
const instance = axios.create({
  baseURL: baseURL,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
})

const sign_up = async (req) => {
  const { data } = await instance.post("/put/account", req)
  return data
}

const sign_in = async (req) => {
  const { data } = await instance.post("/get/account", req)
  return data
}

const get_friends = async (req) => {
  const { data } = await instance.post("/get/friends", req)
  return data
}

const get_messages = async (req) => {
  const { data } = await instance.post("/get/messages", req)
  return data
}

const put_messages = async (req) => {
  const { data } = await instance.post("/put/messages", req)
  return data
}

export {
  sign_up,
  sign_in,
  get_friends,
  get_messages,
  put_messages,
}