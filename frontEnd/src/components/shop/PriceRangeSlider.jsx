import styles from './PriceRangeSlider.module.css'

export default function PriceRangeSlider({ min, max, value, onChange, rangeMax = 15000 }) {
  const handleMinChange = (e) => {
    const newMin = Math.min(Number(e.target.value), value[1] - 500)
    onChange([newMin, value[1]])
  }

  const handleMaxChange = (e) => {
    const newMax = Math.max(Number(e.target.value), value[0] + 500)
    onChange([value[0], newMax])
  }

  const leftPercent = (value[0] / rangeMax) * 100
  const rightPercent = 100 - (value[1] / rangeMax) * 100

  return (
    <div className={styles.slider}>
      <div className={styles.track}>
        <div
          className={styles.range}
          style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={rangeMax}
        value={value[0]}
        onChange={handleMinChange}
        className={styles.thumb}
      />
      <input
        type="range"
        min={min}
        max={rangeMax}
        value={value[1]}
        onChange={handleMaxChange}
        className={styles.thumb}
      />
      <div className={styles.labels}>
        <span>LKR {value[0].toLocaleString()}</span>
        <span>LKR {value[1].toLocaleString()}</span>
      </div>
    </div>
  )
}
