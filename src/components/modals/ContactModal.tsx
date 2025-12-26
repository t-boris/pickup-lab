/**
 * ContactModal Component
 *
 * Modal for sending feedback or messages via EmailJS.
 */

import { useState } from 'react'
import emailjs from '@emailjs/browser'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUIStore } from '@/store'

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_2fccy0j'
const EMAILJS_TEMPLATE_ID = 'template_zklxu74'
const EMAILJS_PUBLIC_KEY = 'NQFIxCX6cEQTkgGxl'

// Icons
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z"/>
    <path d="M22 2 11 13"/>
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <path d="m9 11 3 3L22 4"/>
  </svg>
)

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" x2="12" y1="8" y2="12"/>
    <line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
)

const LoaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)

type Status = 'idle' | 'sending' | 'success' | 'error'

export const ContactModal: React.FC = () => {
  const { contactModalOpen, setContactModalOpen } = useUIStore()

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!email.trim()) {
      setErrorMessage('Please enter your email address')
      setStatus('error')
      return
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address')
      setStatus('error')
      return
    }

    if (!message.trim()) {
      setErrorMessage('Please enter a message')
      setStatus('error')
      return
    }

    setStatus('sending')
    setErrorMessage('')

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_email: email,
          message: message,
          to_email: 'boris@sirius-sound.com',
          reply_to: email,
        },
        EMAILJS_PUBLIC_KEY
      )

      setStatus('success')
      setEmail('')
      setMessage('')

      // Auto close after success
      setTimeout(() => {
        setContactModalOpen(false)
        setStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('EmailJS error:', error)
      setStatus('error')
      setErrorMessage('Failed to send message. Please try again or email directly to boris@sirius-sound.com')
    }
  }

  const handleClose = (open: boolean) => {
    if (status !== 'sending') {
      setContactModalOpen(open)
      if (!open) {
        // Reset form after closing
        setTimeout(() => {
          setEmail('')
          setMessage('')
          setStatus('idle')
          setErrorMessage('')
        }, 300)
      }
    }
  }

  return (
    <Dialog open={contactModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MailIcon />
            Contact Author
          </DialogTitle>
          <DialogDescription>
            Send a message or feedback about Pickup Physics Lab.
          </DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <CheckIcon />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Message Sent!</h3>
            <p className="text-muted-foreground">Thank you for your feedback.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Your Email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === 'error') setStatus('idle')
                }}
                placeholder="your.email@example.com"
                disabled={status === 'sending'}
              />
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  if (status === 'error') setStatus('idle')
                }}
                placeholder="Your message, feedback, or questions..."
                rows={4}
                disabled={status === 'sending'}
              />
            </div>

            {/* Error Message */}
            {status === 'error' && errorMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <AlertIcon />
                <p className="text-sm text-destructive">{errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={status === 'sending'}
              className="w-full"
            >
              {status === 'sending' ? (
                <>
                  <LoaderIcon />
                  <span className="ml-2">Sending...</span>
                </>
              ) : (
                <>
                  <SendIcon />
                  <span className="ml-2">Send Message</span>
                </>
              )}
            </Button>

            {/* Alternative Contact */}
            <p className="text-center text-xs text-muted-foreground">
              Or email directly:{' '}
              <a
                href="mailto:boris@sirius-sound.com"
                className="underline hover:text-foreground"
              >
                boris@sirius-sound.com
              </a>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
