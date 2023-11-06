import { useEffect, useRef, useState } from 'react'
import { auth } from '../utils/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

import type { FormEvent } from 'react'
import type { ConfirmationResult } from 'firebase/auth'

import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'


export function Login() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [result, setResult] = useState<ConfirmationResult | null>(null)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const verifier = useRef<RecaptchaVerifier | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (verifier.current) return

    verifier.current = new RecaptchaVerifier(auth(), 'recaptcha-container', {
      size: 'invisible',
    })
  }, [])

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true)
    e.preventDefault()
    try {
      if (!verifier?.current) {
        throw new Error('RecaptchaVerifier is not initialized')
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth(),
        phoneNumber,
        verifier.current,
      )
      setResult(confirmationResult)
      setIsSubmitting(false)
      setOtp('')
    } catch (error) {
      console.error(error)
      setIsSubmitting(false)

      if (error instanceof Error && error?.message) {
        setError(error.message)
      } else {
        setError('Something went wrong. Please try again later.')
      }
    }
  }

  const handleVerification = async (e: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true)
    e.preventDefault()

    if (otp === '' || result === null) return

    try {
      await result.confirm(otp)
    } catch (error) {
      console.error(error)
      setIsSubmitting(false)
      if (error instanceof Error && error?.message) {
        setError(error.message)
      } else {
        setError('Something went wrong. Please try again later.')
      }
    }
  }

  return (
    <main className="flex h-screen items-center justify-center">
      <div className="w-96 rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Log In</h1>
        {!result ? (
          <form onSubmit={handleSignIn}>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="mb-2 block font-medium">
                Phone Number
              </label>
              <PhoneInput
                country="SE"
                international
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(num) => {
                  if (num === undefined) return
                  setError('')
                  setPhoneNumber(num)
                }}
              />
            </div>
            {error && <p className="mb-4 text-red-500">{error}</p>}
            {!isSubmitting ? (
              <button
                type="submit"
                id="sign-in-button"
                className="w-full rounded-md bg-[#0076DB] px-4 py-2 text-white hover:bg-[#0059A6] focus:outline-none focus:ring-2 focus:ring-[#0059A6] focus:ring-offset-2"
              >
                Send Verification Code
              </button>
            ) : (
              <div className="btn btn-disabled w-full cursor-not-allowed">
                Submitting
                <span className="loading loading-dots loading-xs"></span>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleVerification}>
            <div className="mb-4">
              <label htmlFor="otp" className="mb-2 block font-medium">
                Verification Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                required
                onChange={(e) => {
                  setError('')
                  setOtp(e.target.value)
                }}
                className="w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-[#0059A6] focus:outline-none focus:ring-[#0059A6]"
              />
            </div>
            {error && <p className="mb-4 text-red-500">{error}</p>}
            {!isSubmitting ? (
              <button
                type="submit"
                className="w-full rounded-md bg-[#0076DB] px-4 py-2 text-white hover:bg-[#0059A6] focus:outline-none focus:ring-2 focus:ring-[#0059A6] focus:ring-offset-2"
              >
                Verify Code
              </button>
            ) : (
              <div className="btn btn-disabled w-full cursor-not-allowed">
                Submitting
                <span className="loading loading-dots loading-xs"></span>
              </div>
            )}
          </form>
        )}
        <div id="recaptcha-container" />
      </div>
    </main>
  )
}
