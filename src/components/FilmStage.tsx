/* FilmStage: the burst model playing sharp — near-native 16:9 stage,
   mono chrome (sheet no, loop length), zero controls, zero decoration.
   The video element owns clarity; the world field keeps the ambience. */

export default function FilmStage() {
  return (
    <figure className="stage" aria-label="XEVEN burst model — 8M-stick turntable loop">
      <video
        className="stage-film"
        src="/assets/burst.mp4"
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
      />
      <figcaption className="stage-chrome" aria-hidden="true">
        <span>SHEET X-002 · 8M STICKS</span>
        <span>TURNTABLE · 8S LOOP</span>
      </figcaption>
    </figure>
  )
}
