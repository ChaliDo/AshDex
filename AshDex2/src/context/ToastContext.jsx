import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);

let nextToastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const timerRefs = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timer = timerRefs.current.get(id);

    if (timer) {
      window.clearTimeout(timer.timeoutId);
      timerRefs.current.delete(id);
    }

    setToasts((currentToasts) =>
      currentToasts.map((toast) =>
        toast.id === id
          ? {
              ...toast,
              closing: true,
            }
          : toast
      )
    );

    window.setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter(
          (toast) => toast.id !== id
        )
      );
    }, 220);
  }, []);

  const startTimer = useCallback(
    (id, duration) => {
      const startedAt = Date.now();

      const timeoutId = window.setTimeout(
        () => {
          removeToast(id);
        },
        duration
      );

      timerRefs.current.set(id, {
        timeoutId,
        startedAt,
        remaining: duration,
      });
    },
    [removeToast]
  );

  const pauseToast = useCallback((id) => {
    const timer =
      timerRefs.current.get(id);

    if (!timer) {
      return;
    }

    window.clearTimeout(timer.timeoutId);

    const elapsed =
      Date.now() - timer.startedAt;

    const remaining = Math.max(
      timer.remaining - elapsed,
      0
    );

    timerRefs.current.set(id, {
      ...timer,
      timeoutId: null,
      remaining,
    });

    setToasts((currentToasts) =>
      currentToasts.map((toast) =>
        toast.id === id
          ? {
              ...toast,
              paused: true,
            }
          : toast
      )
    );
  }, []);

  const resumeToast = useCallback(
    (id) => {
      const timer =
        timerRefs.current.get(id);

      if (!timer || timer.remaining <= 0) {
        return;
      }

      const startedAt = Date.now();

      const timeoutId = window.setTimeout(
        () => {
          removeToast(id);
        },
        timer.remaining
      );

      timerRefs.current.set(id, {
        ...timer,
        timeoutId,
        startedAt,
      });

      setToasts((currentToasts) =>
        currentToasts.map((toast) =>
          toast.id === id
            ? {
                ...toast,
                paused: false,
              }
            : toast
        )
      );
    },
    [removeToast]
  );

  const showToast = useCallback(
    ({
      title,
      message = "",
      type = "success",
      duration = 3000,
    }) => {
      const id = ++nextToastId;

      const toast = {
        id,
        title,
        message,
        type,
        duration,
        paused: false,
        closing: false,
      };

      setToasts((currentToasts) => [
        ...currentToasts,
        toast,
      ]);

      startTimer(id, duration);

      return id;
    },
    [startTimer]
  );

  const value = useMemo(
    () => ({
      showToast,
      removeToast,
    }),
    [showToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <ToastViewport
        toasts={toasts}
        onRemove={removeToast}
        onPause={pauseToast}
        onResume={resumeToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider."
    );
  }

  return context;
}

function ToastViewport({
  toasts,
  onRemove,
  onPause,
  onResume,
}) {
  return (
    <div
      className="toast-viewport"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <article
          key={toast.id}
          className={[
            "toast-card",
            `toast-card-${toast.type}`,
            toast.closing
              ? "toast-card-closing"
              : "",
            toast.paused
              ? "toast-card-paused"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onMouseEnter={() =>
            onPause(toast.id)
          }
          onMouseLeave={() =>
            onResume(toast.id)
          }
          onFocus={() =>
            onPause(toast.id)
          }
          onBlur={() =>
            onResume(toast.id)
          }
        >
          <span
            className={`toast-icon toast-icon-${toast.type}`}
            aria-hidden="true"
          >
            {getToastIcon(toast.type)}
          </span>

          <div className="toast-copy">
            <strong>{toast.title}</strong>

            {toast.message && (
              <p>{toast.message}</p>
            )}
          </div>

          <button
            type="button"
            className="toast-close-button"
            onClick={() =>
              onRemove(toast.id)
            }
            aria-label="Close notification"
          >
            ×
          </button>

          <div
            className={`toast-progress toast-progress-${toast.type}`}
            style={{
              "--toast-duration":
                `${toast.duration}ms`,
            }}
          />
        </article>
      ))}
    </div>
  );
}

function getToastIcon(type) {
  if (type === "error") {
    return "!";
  }

  if (type === "info") {
    return "i";
  }

  if (type === "warning") {
    return "⏳";
  }

  return "✓";
}