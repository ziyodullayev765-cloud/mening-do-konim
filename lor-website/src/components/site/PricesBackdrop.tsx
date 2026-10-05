/**
 * Decorative background used only behind the "Prices" section: slowly drifting
 * teal/lilac blobs plus faint caduceus line art.
 * Purely visual — hidden from assistive tech, motion stops with reduced motion.
 */
export function PricesBackdrop() {
  return (
    <div aria-hidden className="prices-wash pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[linear-gradient(135deg,#f1fbfc_0%,#f6f7fd_55%,#f3f0fb_100%)]">
      {/* Drifting blurred blobs */}
      <span className="prices-blob left-[-12%] top-[-10%] size-[26rem] bg-[radial-gradient(circle_at_40%_40%,#9fe3ea_0%,#b9b3ef_55%,transparent_72%)] [animation-duration:22s]" />
      <span className="prices-blob right-[-14%] bottom-[-14%] size-[30rem] bg-[radial-gradient(circle_at_55%_45%,#8fdde6_0%,#c3bcf3_55%,transparent_72%)] [animation-delay:-8s] [animation-duration:26s]" />
      <span className="prices-blob bottom-[-18%] left-[8%] size-[20rem] bg-[radial-gradient(circle_at_50%_50%,#c6c0f5_0%,#a8e6ec_50%,transparent_72%)] [animation-delay:-14s] [animation-duration:30s]" />
      <span className="prices-blob right-[6%] top-[-16%] size-[16rem] bg-[radial-gradient(circle_at_50%_50%,#cfc9f7_0%,transparent_70%)] [animation-delay:-4s] [animation-duration:24s]" />

      {/* Fine contour lines, left */}
      <svg className="prices-lines absolute left-0 top-0 h-full w-[45%] text-[#1e9db2] opacity-[0.10]" viewBox="0 0 400 600" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="0.8">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M-20 ${120 + i * 38} C 80 ${60 + i * 40}, 160 ${220 + i * 30}, 260 ${150 + i * 36} S 380 ${260 + i * 30}, 440 ${200 + i * 34}`} />
        ))}
      </svg>

      {/* Medical line art, right */}
      <svg
        className="prices-art absolute right-[-6rem] top-1/2 h-[min(30rem,105%)] -translate-y-1/2 text-ink opacity-[0.11] sm:right-[-4rem] xl:right-[-1%]"
        viewBox="0 0 520 520"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Diamond frame lines */}
        <path d="M60 260 L260 40 L470 250 L260 470 Z" strokeWidth="1" />
        <path d="M30 200 L250 20 M300 500 L500 300 M90 420 L20 300" strokeWidth="0.8" />
        {/* Caduceus */}
        <circle cx="200" cy="72" r="13" />
        <path d="M200 85 V470" />
        <path d="M197 120 C150 92 108 98 76 128 C112 124 140 132 160 146 C130 146 108 156 92 176 C126 168 160 168 196 150" />
        <path d="M203 120 C250 92 292 98 324 128 C288 124 260 132 240 146 C270 146 292 156 308 176 C274 168 240 168 204 150" />
        <path d="M200 175 C245 190 245 225 200 240 C155 255 155 290 200 305 C245 320 245 355 200 370 C160 383 160 410 196 425" />
        <path d="M200 175 C155 190 155 225 200 240 C245 255 245 290 200 305 C155 320 155 355 200 370 C240 383 240 410 204 425" />
        <path d="M200 175 C214 168 228 170 232 160" />
      </svg>
    </div>
  );
}
