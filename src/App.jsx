/* eslint-disable react/prop-types */
import { Fragment } from 'react'
import { memo } from 'react'
import { useState } from 'react'
import { useEffect } from 'react'

const fetchHall = async () => {
  const response = await fetch(
    'https://test.cinematrix.uz/api/theaterwidget?cinemaid=30000&aggregatorid=20003&sessionid=21395'
  )
  const data = await response.json()

  return data
}

function App() {
  const [hall, setHall] = useState(null)
  const [zoom, setZoom] = useState(1)
  const step = 0.3

  useEffect(() => {
    fetchHall().then(setHall)
  }, [])

  if (!hall) return <p>Loading...</p>

  return (
    <div className="container">
      <div className="hall_wrapper">
        <div className="zoom">
          <button key="zoom-in" onClick={() => setZoom(zoom + step)}>
            +
          </button>
          <button key="zoom-out" onClick={() => setZoom(zoom - step)}>
            -
          </button>
        </div>
        <div
          style={{
            height: hall.hall_height,
            width: hall.hall_width,
            position: 'relative',
            transform: `scale(${zoom})`,
          }}
          className="hall"
        >
          <Hall hall={hall} />
        </div>
      </div>
    </div>
  )
}

const Hall = memo(({ hall }) => {
  return (
    <>
      {hall.sectors.map((sector, index) => (
        <Fragment key={sector.title ?? index}>
          {sector.rows.map((row) => (
            <Fragment key={row.number}>
              {row.seats.map((seat) => (
                <Seat key={seat.id} seat={seat} />
              ))}
            </Fragment>
          ))}
        </Fragment>
      ))}
    </>
  )
})

const Seat = ({ seat }) => {
  const [selected, setSelected] = useState(false)
  return (
    <div
      className="seat"
      onClick={() => setSelected(!selected)}
      style={{
        height: seat.r,
        width: seat.r,
        borderRadius: seat.r,
        left: seat.x,
        top: seat.y,
        backgroundColor: selected ? 'red' : 'transparent',
      }}
    >
      <span
        style={{
          fontSize: seat.r / 1.7,
        }}
      >
        {seat.number}
      </span>
    </div>
  )
}

Hall.displayName = 'Hall'

export default App
