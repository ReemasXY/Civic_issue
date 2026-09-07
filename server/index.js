import express from 'express'
import "dotenv/config";
import pool from './config/dbConnection.js';
import userAuth from "./routes/userAuth.js"
import cors from "cors"

const app= express();
const PORT = process.env.PORT

//allow the request from the following url only
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
// middleware
app.use(express.json())

app.use("/api/auth",userAuth)

app.listen(PORT,()=>
{
    console.log(`Running on the port ${PORT}`)
})