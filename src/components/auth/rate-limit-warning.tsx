import { InlineMessage } from './inline-message'

export interface RateLimitWarningProps {
  message?: string
  retryAfter?: number
  className?: string
}

const defaultMessage =
  'Too many requests. Please wait a few minutes before trying again.'

export function RateLimitWarning({
  message = defaultMessage,
  retryAfter,
  className,
}: RateLimitWarningProps) {
  const displayMessage =
    retryAfter
      ? `${message} You can try again in ${retryAfter} minutes.`
      : message

  return (
    <InlineMessage
      variant="error"
      message={displayMessage}
      className={className}
      id="rate-limit-warning"
    />
  )
}
