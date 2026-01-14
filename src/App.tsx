import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WindowManagerProvider } from './context/WindowManagerContext'
import { ThemeProvider } from './context/ThemeContext'
import { TimeProvider } from './context/TimeContext'
import { Desktop } from './components/layout/Desktop'
import { BlogPostPage } from './pages/BlogPostPage'
import './index.css'

function App() {
  return (
    <Router>
      <WindowManagerProvider>
        <ThemeProvider>
          <TimeProvider>
            <Routes>
              <Route path="/" element={<Desktop />} />
              <Route path="/blog/:id" element={<BlogPostPage />} />
            </Routes>
          </TimeProvider>
        </ThemeProvider>
      </WindowManagerProvider>
    </Router>
  )
}

export default App
