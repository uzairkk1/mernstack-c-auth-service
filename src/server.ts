import { Config } from './config'
import app from './app'

const startServer = () => {
  const PORT = Config.PORT
  try {
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

startServer()
