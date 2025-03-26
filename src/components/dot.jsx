

export default function Dot({ x, release, setVisibleRelease, typeColor, type }) {
    return (
        <div className={`dot`} onClick={type === 'now' ? null : () => setVisibleRelease(release)} style={{left: x, backgroundColor: typeColor}}></div>
    )
}