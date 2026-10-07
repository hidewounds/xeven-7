export function SocialIcon({ name }: { name: "instagram" | "x" | "linkedin" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
    >
      {name === "instagram" ? (
        <>
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle
            cx="12"
            cy="12"
            r="4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </>
      ) : name === "x" ? (
        <path
          fill="currentColor"
          d="M18.9 3H22l-6.8 7.8L23.2 21h-6.3L12 14.6 6.4 21H3.2l7.3-8.4L.8 3h6.4l4.4 5.8L18.9 3Zm-1.1 16.2h1.7L6.3 4.7H4.5l13.3 14.5Z"
        />
      ) : (
        <>
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M7.5 10v7M11.5 17v-7m0 3.2c0-4.3 5-4.1 5 0V17"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="7.5" cy="7" r="1" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
