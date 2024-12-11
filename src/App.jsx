/* eslint-disable react/prop-types */
import { Fragment } from 'react'
import { useCallback } from 'react'
import { memo } from 'react'
import { useState } from 'react'
import { useEffect } from 'react'

const cinemaId = 30000
const aggregatorId = 20003
const sessionId = 21395

const fetchHall = async () => {
  const response = await fetch(
    `https://test.cinematrix.uz/api/theaterwidget?cinemaid=${cinemaId}&aggregatorid=${aggregatorId}&sessionid=${sessionId}`
  )
  const data = await response.json()

  return data
}

const book = async ({ seats, eventId, id }) => {
  const response = await fetch(`https://test.cinematrix.uz/api/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cinemaid: cinemaId,
      aggregatorid: aggregatorId,
      seanceid: id,
      releaseid: eventId,
      email: 'youremail@example.com',
      phone: '998909224674',
      return_url: window.location.href,
      ticket_url: window.location.href,
      goods: [],
      seats,
    }),
  })
  const data = await response.json()

  if (!response.ok) throw new Error(data.message)

  return data
}

function App() {
  const [hall, setHall] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingInfo, setBookingInfo] = useState(null)
  const step = 0.3

  useEffect(() => {
    fetchHall()
      .then(setHall)
      .finally(() => setLoading(false))
  }, [])

  const bookCallback = useCallback(async () => {
    if (!hall?.id || !hall.eventid) return
    setLoading(true)
    book({
      seats: selected,
      eventId: hall.eventid,
      id: hall.id,
    })
      .then(setBookingInfo)
      .finally(() => setLoading(false))
  }, [hall?.id, hall?.eventid, selected])

  if (!hall || loading) return <p>Loading...</p>

  return (
    <div className="container">
      {bookingInfo ? (
        <BookingInfo bookingInfo={bookingInfo} />
      ) : (
        <div className="hall_wrapper">
          <div className="zoom">
            <button key="zoom-in" onClick={() => setZoom(zoom + step)}>
              +
            </button>
            <button key="zoom-out" onClick={() => setZoom(zoom - step)}>
              -
            </button>
          </div>
          <button className="book-btn" onClick={bookCallback}>
            Book
          </button>
          <div
            style={{
              height: hall.hall_height,
              width: hall.hall_width,
              position: 'relative',
              transform: `scale(${zoom})`,
            }}
            className="hall"
          >
            <Hall hall={hall} selected={selected} setSelected={setSelected} />
          </div>
        </div>
      )}
    </div>
  )
}

const BookingInfo = ({ bookingInfo }) => {
  return (
    <div className="booking_info">
      <div>
        {bookingInfo.Payments.map((payment) => (
          <a href={payment.PayUrl} key={payment.Type}>
            <img src={payment.IconUrl} alt={payment.Type} />
          </a>
        ))}
      </div>
    </div>
  )
}

const Hall = memo(({ hall, selected, setSelected }) => {
  return (
    <>
      {hall.sectors.map((sector, index) => (
        <Fragment key={sector.title ?? index}>
          {sector.rows.map((row) => (
            <Fragment key={row.number}>
              {row.seats.map((seat) => (
                <Seat
                  key={seat.ticket_id}
                  row={row.number}
                  seat={seat}
                  selected={selected}
                  setSelected={setSelected}
                />
              ))}
            </Fragment>
          ))}
        </Fragment>
      ))}
    </>
  )
})

const Seat = ({ seat, selected, setSelected, row }) => {
  const isSelected = selected.some((s) => s.id === seat.ticket_id)

  return (
    <div
      className="seat"
      onClick={() => {
        if (!seat.is_available) return

        setSelected((prev) => {
          if (isSelected) {
            return prev.filter((s) => s.id !== seat.ticket_id)
          } else {
            return prev.concat({
              id: seat.ticket_id,
              seat: seat.number,
              price: seat.price,
              row,
            })
          }
        })
      }}
      style={{
        height: 10,
        width: 10,
        borderRadius: 9999,
        left: seat.x,
        top: seat.y,
        backgroundColor: !seat.is_available
          ? 'red'
          : isSelected
          ? 'blue'
          : 'transparent',
      }}
    >
      <span
        style={{
          fontSize: 6,
          color: isSelected || !seat.is_available ? 'white' : 'black',
          fontWeight: 'bold',
        }}
      >
        {seat.number}
      </span>
    </div>
  )
}

Hall.displayName = 'Hall'

export default App
