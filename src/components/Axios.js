import axios from "axios";

const baseURL = process.env.REACT_APP_BASE_URL || "http://localhost:5000"
// const baseURL = process.env.REACT_APP_BASE_URL || "http://140.112.29.204:5000"
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

const put_friends = async (req) => {
  const { data } = await instance.post("/put/friends", req)
  return data
}

const del_friends = async (req) => {
  const { data } = await instance.post("/del/friends", req)
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

const put_messages_file = async (formData) => {
  const { data } = await instance.post("/put/messages/file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    }
  })
  return data
}

const get_messages_file = async (req) => {
  return await instance.post(
    "/get/messages/file",
    req,
    { responseType: "blob" }
  )
}

const del_messages = async (req) => {
  const { data } = await instance.post("/del/messages", req)
  return data
}

export {
  sign_up,
  sign_in,
  put_friends,
  del_friends,
  get_friends,
  get_messages,
  put_messages,
  put_messages_file,
  get_messages_file,
  del_messages,
}