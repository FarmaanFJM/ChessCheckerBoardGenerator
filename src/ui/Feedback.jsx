import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Icon from './Icon';

// Replaces window.alert / confirm / prompt (prompt does not exist in Electron).
// Dialogs follow preset.confirm-dialog, toasts follow preset.notification.

const FeedbackContext = createContext(null);
export const useFeedback = () => useContext(FeedbackContext);

let nextId = 1;

function Dialog({ dialog, onClose }) {
  const { title, body, confirmLabel, destructive, icon, input } = dialog;
  const [value, setValue] = useState(input?.value ?? '');
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Destructive dialogs start on Cancel, prompts on the field, others on Confirm.
    const target = input ? inputRef.current : destructive ? cancelRef.current : confirmRef.current;
    target?.focus();
    input && inputRef.current?.select();
  }, []);

  const submit = () => onClose(input ? value.trim() : true);
  const cancel = () => onClose(input ? null : false);

  return (
    <div className="sm-backdrop" onMouseDown={(e) => e.target === e.currentTarget && cancel()}>
      <form
        className="sm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        onKeyDown={(e) => e.key === 'Escape' && cancel()}
      >
        <h2 className="sm-dialog__title" id="dlg-title">{title}</h2>
        {(body || input) && (
          <div className="sm-dialog__body">
            {body && <p>{body}</p>}
            {input && (
              <div className="sm-dialog__field">
                <label className="sm-dialog__label" htmlFor="dlg-input">{input.label}</label>
                <input
                  id="dlg-input"
                  ref={inputRef}
                  className="sm-input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
        <div className="sm-dialog__foot">
          {dialog.cancelLabel !== null && (
            <button type="button" ref={cancelRef} className="sm-btn" onClick={cancel}>
              {dialog.cancelLabel || 'Cancel'}
            </button>
          )}
          <button
            type="submit"
            ref={confirmRef}
            className={`sm-btn ${destructive ? 'sm-btn--danger' : 'sm-btn--primary'}`}
            disabled={input && !value.trim()}
          >
            {icon && <Icon name={icon} />}
            {confirmLabel || 'OK'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Toasts({ toasts, dismiss }) {
  const ICONS = { success: 'check', error: 'x' };
  return (
    <ul className="sm-toast-region" aria-live="polite">
      {toasts.map((t, i) => (
        <li
          key={t.id}
          className="sm-toast sm-toast--compact"
          data-type={t.type}
          data-depth={toasts.length - 1 - i}
          role={t.type === 'error' ? 'alert' : 'status'}
        >
          {ICONS[t.type] && <Icon name={ICONS[t.type]} className="sm-toast__icon" />}
          <div className="sm-toast__body"><span className="sm-toast__message">{t.message}</span></div>
          {t.action && (
            <button className="sm-toast__action" onClick={() => { t.action.run(); dismiss(t.id); }}>
              {t.action.label}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export function FeedbackProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [toasts, setToasts] = useState([]);
  const resolver = useRef(null);

  const open = useCallback((config) => new Promise((resolve) => {
    resolver.current = resolve;
    setDialog(config);
  }), []);

  const close = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setDialog(null);
  };

  const dismiss = useCallback((id) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const toast = useCallback((message, { type = 'neutral', action, duration } = {}) => {
    const id = nextId++;
    setToasts((all) => [...all.slice(-2), { id, message, type, action }]);
    setTimeout(() => dismiss(id), duration ?? (action ? 8000 : 4000));
  }, [dismiss]);

  const api = {
    toast,
    confirm: (config) => open(config),
    prompt: (config) => open(config),
  };

  return (
    <FeedbackContext.Provider value={api}>
      {children}
      {dialog && <Dialog dialog={dialog} onClose={close} />}
      <Toasts toasts={toasts} dismiss={dismiss} />
    </FeedbackContext.Provider>
  );
}
