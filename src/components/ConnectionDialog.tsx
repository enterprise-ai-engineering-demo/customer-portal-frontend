import { useEffect, useRef, useState } from 'react'
import { Check, KeyRound, Server, X } from 'lucide-react'
import { usePortal } from '../state/PortalContext'
import { API_BASE_URL } from '../services/api'

export function ConnectionDialog({ onClose }: { onClose: () => void }) {
  const { token, setToken, demo, setDemo } = usePortal()
  const [draftToken, setDraftToken] = useState(token)
  const [draftDemo, setDraftDemo] = useState(demo)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    dialog.current?.showModal()
  }, [])

  return (
    <dialog ref={dialog} className="connection-dialog" onClose={onClose}>
      <div className="dialog-heading">
        <span className="eyebrow">WORKSPACE SETTINGS</span>
        <button
          className="icon-button"
          aria-label="Close settings"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <h2>Your data, connected.</h2>
      <p className="muted">
        Choose how this workspace connects to your customers.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setToken(draftToken.trim())
          setDemo(draftDemo)
          onClose()
        }}
      >
        <div className="mode-options">
          <label
            className={!draftDemo ? 'mode-option selected' : 'mode-option'}
          >
            <input
              type="radio"
              name="mode"
              checked={!draftDemo}
              onChange={() => setDraftDemo(false)}
            />
            <Server size={21} />
            <span>
              <strong>Live API</strong>
              <small>Connect to your backend</small>
            </span>
            {!draftDemo && <Check size={18} />}
          </label>
          <label className={draftDemo ? 'mode-option selected' : 'mode-option'}>
            <input
              type="radio"
              name="mode"
              checked={draftDemo}
              onChange={() => setDraftDemo(true)}
            />
            <span className="demo-symbol">N</span>
            <span>
              <strong>Demo workspace</strong>
              <small>Explore with sample data</small>
            </span>
            {draftDemo && <Check size={18} />}
          </label>
        </div>
        <label className="field-label">
          API endpoint
          <input value={API_BASE_URL} readOnly />
        </label>
        <p className="field-hint">
          Configured with VITE_API_BASE_URL at build time.
        </p>
        <label className="field-label" htmlFor="access-token">
          <span>
            <KeyRound size={15} />
            JWT access token
          </span>
        </label>
        <input
          id="access-token"
          type="password"
          autoComplete="off"
          placeholder="Paste your access token (without Bearer)"
          value={draftToken}
          onChange={(event) => setDraftToken(event.target.value)}
        />
        <p className="field-hint">
          Kept only in memory and cleared on refresh. Never sent in demo mode.
          Use a short-lived demo token; this is not a sign-in flow.
        </p>
        <div className="dialog-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button primary">
            Save connection
            <Check size={16} />
          </button>
        </div>
      </form>
    </dialog>
  )
}
