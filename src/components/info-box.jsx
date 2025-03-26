export default function InfoBox({ x, text, show }) {
    return (
        <>
            <div className={`solid-line ${show ? 'line-show' : ''}`} style={{left: x}}></div>
            <div className={`info-box ${show ? 'line-show' : ''}`} style={{ 
                    left: x + 10,  // Small offset from the line
                    transform: "translateX(0%) translateY(-70%)" // Remove centering effect
                }}>
                <p>{text}</p>
            </div>
        </>
        
    );
}