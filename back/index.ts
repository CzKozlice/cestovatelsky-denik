import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import path from 'path'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.listen(3000, () => {
  console.log('Server běží na http://localhost:3000')
})
