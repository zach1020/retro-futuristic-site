import { WindowManagerProvider } from './context/WindowManagerContext'
import { ThemeProvider } from './context/ThemeContext'
import { Desktop } from './components/layout/Desktop'
import './index.css'

function App() {
  return (
    <WindowManagerProvider>
      <ThemeProvider>
        <Desktop />
      </ThemeProvider>
    </WindowManagerProvider>
  )
}

export default App
