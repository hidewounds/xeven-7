/* XLoader — the loading interface. A lone revolving X over the void,
   shown while a route chunk loads. CSS-only 1.1s spin, static under
   reduced motion (App never mounts the veil then). */

export default function XLoader() {
  return (
    <div className="xloader" role="status" aria-label="Loading">
      <div className="xloader-x" aria-hidden="true">
        X
      </div>
    </div>
  )
}
