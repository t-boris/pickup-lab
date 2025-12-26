import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Workaround for browser translation (Google Translate, etc.) conflicting with React DOM
// When translation modifies text nodes, React loses track of them and throws errors.
// This patches DOM methods to gracefully handle moved/modified nodes.
if (typeof Node !== 'undefined') {
  const originalRemoveChild = Node.prototype.removeChild
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      // Silently handle - node was moved by browser translation
      return child
    }
    return originalRemoveChild.call(this, child) as T
  }

  const originalInsertBefore = Node.prototype.insertBefore
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      // Silently handle - reference node was moved by browser translation
      return newNode
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
