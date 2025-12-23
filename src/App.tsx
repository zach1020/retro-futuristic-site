import { WindowManagerProvider } from './context/WindowManagerContext'
import { ThemeProvider } from './context/ThemeContext'
import { TimeProvider } from './context/TimeContext'
import { Desktop } from './components/layout/Desktop'
import './index.css'

function App() {
  return (
    <WindowManagerProvider>
      <ThemeProvider>
        <TimeProvider>
          <Desktop />
        </TimeProvider>
      </ThemeProvider>
    </WindowManagerProvider>
  )
}

export default App
