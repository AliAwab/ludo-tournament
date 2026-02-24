// ── Animated Background Bubbles ─────────────────────────────────────────────
const BUBBLES = [
    { size: 28, left: 5, color: 'var(--red)', duration: 14, delay: 0, type: 'token' },
    { size: 24, left: 12, color: 'var(--blue)', duration: 18, delay: 2, type: 'dice' },
    { size: 35, left: 20, color: 'var(--green)', duration: 12, delay: 5, type: 'threads' },
    { size: 22, left: 30, color: 'var(--yellow)', duration: 16, delay: 1, type: 'token' },
    { size: 30, left: 40, color: 'var(--red)', duration: 20, delay: 3, type: 'dice' },
    { size: 14, left: 50, color: 'var(--blue)', duration: 15, delay: 7, type: 'token' },
    { size: 30, left: 60, color: 'var(--green)', duration: 13, delay: 4, type: 'threads' },
    { size: 20, left: 70, color: 'var(--yellow)', duration: 17, delay: 6, type: 'token' },
    { size: 38, left: 80, color: 'var(--purple)', duration: 11, delay: 1.5, type: 'token' },
    { size: 28, left: 90, color: 'var(--red)', duration: 19, delay: 8, type: 'dice' },
    { size: 25, left: 8, color: 'var(--purple)', duration: 22, delay: 9, type: 'threads' },
    { size: 32, left: 17, color: 'var(--blue)', duration: 16, delay: 11, type: 'token' },
    { size: 19, left: 25, color: 'var(--yellow)', duration: 14, delay: 3.5, type: 'threads' },
    { size: 45, left: 35, color: 'var(--green)', duration: 25, delay: 0.5, type: 'token' },
    { size: 26, left: 45, color: 'var(--red)', duration: 12, delay: 6.5, type: 'dice' },
    { size: 27, left: 55, color: 'var(--purple)', duration: 18, delay: 2.5, type: 'threads' },
    { size: 36, left: 65, color: 'var(--blue)', duration: 21, delay: 10, type: 'token' },
    { size: 28, left: 75, color: 'var(--yellow)', duration: 13, delay: 4.5, type: 'dice' },
    { size: 29, left: 85, color: 'var(--red)', duration: 16, delay: 7.5, type: 'threads' },
    { size: 23, left: 95, color: 'var(--green)', duration: 20, delay: 12, type: 'token' },
];

export default function FloatingBubbles() {
    return (
        <div className="bubbles-wrap" aria-hidden="true">
            {BUBBLES.map((b, i) => (
                <div
                    key={i}
                    className="bubble"
                    style={{
                        width: b.size, height: b.size, left: `${b.left}%`,
                        animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s`,
                        background: b.type === 'token' ? b.color : 'transparent',
                        color: b.color,
                        fontSize: b.type === 'dice' ? `${b.size * 0.8}px` : undefined
                    }}
                >
                    {b.type === 'dice' && '🎲'}
                    {b.type === 'threads' && (
                        <svg viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                            <rect width="192" height="192" rx="44" fill="black" />
                            <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.216 44.905 97.5619 44.745C97.4484 44.744 97.3355 44.744 97.222 44.744C66.136 44.744 45.4184 68.1203 45.4184 94.484C45.4184 123.361 65.6596 148.452 97.4372 148.452C118.847 148.452 135.21 138.825 141.026 122.997C141.603 121.427 141.012 119.682 139.58 118.816C138.147 117.949 136.262 118.2 135.084 119.418C130.686 123.971 120.306 132.8 97.4372 132.8C75.2533 132.8 61.07 115.845 61.07 96.1895C61.07 94.757 61.1685 93.3598 61.3551 92.0076C63.2687 97.108 67.761 101.446 74.072 104.532C80.2526 107.554 87.8383 109.115 95.843 109.115C118.816 109.115 133.01 98.4048 133.01 80.8931C133.01 64.9126 121.737 56.4011 97.222 56.4011C97.3355 56.4011 97.4484 56.4021 97.563 56.4032C114.735 56.5163 123.511 67.5401 123.921 86.8166C121.246 86.1309 118.156 85.6429 114.659 85.3424C109.303 84.8824 103.149 84.6644 96.6575 84.6644C73.4542 84.6644 58.053 88.5802 58.053 100.864C58.053 107.039 62.4842 111.411 69.102 111.411C77.019 111.411 85.122 107.13 90.573 101.378C93.4255 98.3687 95.558 94.6704 96.868 90.627C107.838 91.0784 117.801 92.5152 125.795 95.5322C130.669 97.3712 134.425 99.8517 136.786 102.837C137.669 103.953 139.317 104.184 140.528 103.364C141.739 102.544 142.124 100.957 141.406 99.6874C139.311 95.9868 135.253 92.4042 129.589 89.261C132.899 88.9419 136.212 88.8052 139.467 88.8052C140.407 88.8052 141.139 88.6346 141.537 88.9883ZM93.565 89.3093C92.483 93.3364 90.177 96.6369 87.266 98.924C83.844 101.611 79.526 102.895 75.254 102.895C72.883 102.895 70.824 102.132 69.349 100.783C67.923 99.4796 67.227 97.8037 67.227 95.9171C67.227 92.0518 72.84 89.0494 81.332 88.1691C84.346 87.8566 87.726 87.6976 91.353 87.6976C92.179 87.6976 92.909 87.708 93.633 87.7289C93.611 88.2541 93.589 88.7801 93.565 89.3093Z" fill="white" />
                        </svg>
                    )}
                </div>
            ))}
        </div>
    );
}
