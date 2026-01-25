import { useRef, useCallback, useEffect, useState } from 'react';
import '../../styles/dial.css';

interface WavelengthDialProps {
    /** Target position in degrees (0-180, where 0=left, 180=right) */
    targetPosition?: number;
    /** Whether to show the target pointer */
    showTarget?: boolean;
    /** Whether to animate revealing the target */
    revealTarget?: boolean;
    /** Current guess position in degrees */
    guessPosition: number;
    /** Callback when guess position changes */
    onGuessChange?: (position: number) => void;
    /** Whether the guess pointer is interactive */
    interactive?: boolean;
    /** Whether to show the guess pointer (for reveal) */
    showGuess?: boolean;
    /** Left label text */
    leftLabel?: string;
    /** Right label text */
    rightLabel?: string;
}

// Constants - upper semicircle
const CENTER_X = 200;
const CENTER_Y = 170;  // Near bottom of viewBox for upper arc
const RADIUS = 150;
const INNER_RADIUS = 50;

// Convert degrees (0=left, 180=right) to position on UPPER semicircle
function degreesToRadians(degrees: number): number {
    // Map 0-180 to PI-0 for upper semicircle (left to right)
    return ((180 - degrees) * Math.PI) / 180;
}

// Get point on arc (upper semicircle)
function getArcPoint(angleDeg: number, radius: number): { x: number; y: number } {
    const rad = degreesToRadians(angleDeg);
    return {
        x: CENTER_X + radius * Math.cos(rad),
        y: CENTER_Y - radius * Math.sin(rad),  // Minus for upper direction
    };
}

// Create arc path for upper semicircle
function createArcPath(startDeg: number, endDeg: number, outerR: number, innerR: number): string {
    const start1 = getArcPoint(startDeg, outerR);
    const end1 = getArcPoint(endDeg, outerR);
    const start2 = getArcPoint(endDeg, innerR);
    const end2 = getArcPoint(startDeg, innerR);

    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;

    return `
    M ${start1.x} ${start1.y}
    A ${outerR} ${outerR} 0 ${largeArc} 1 ${end1.x} ${end1.y}
    L ${start2.x} ${start2.y}
    A ${innerR} ${innerR} 0 ${largeArc} 0 ${end2.x} ${end2.y}
    Z
  `;
}

// Convert client coordinates to dial position
function calculatePosition(
    clientX: number,
    clientY: number,
    svgRef: React.RefObject<SVGSVGElement | null>
): number {
    if (!svgRef.current) return 90;

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 400 / rect.width;
    const scaleY = 200 / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const dx = x - CENTER_X;
    const dy = CENTER_Y - y;

    const angle = Math.atan2(dy, dx);
    let degrees = (angle * 180) / Math.PI;

    // Invert: left side (0) to right side (180)
    degrees = 180 - degrees;

    // Clamp to valid range
    degrees = Math.max(10, Math.min(170, degrees));

    return degrees;
}

export function WavelengthDial({
    targetPosition = 90,
    showTarget = false,
    revealTarget = false,
    guessPosition,
    onGuessChange,
    interactive = false,
    showGuess = false,
    leftLabel,
    rightLabel,
}: WavelengthDialProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isRevealing, setIsRevealing] = useState(false);

    // Handle reveal animation
    useEffect(() => {
        if (revealTarget && showTarget) {
            setIsRevealing(true);
            const timer = setTimeout(() => setIsRevealing(false), 600);
            return () => clearTimeout(timer);
        }
    }, [revealTarget, showTarget]);

    // Pointer handlers
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (!interactive) return;
        e.preventDefault();
        setIsDragging(true);
        const position = calculatePosition(e.clientX, e.clientY, svgRef);
        onGuessChange?.(position);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, [interactive, onGuessChange]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDragging || !interactive) return;
        e.preventDefault();
        const position = calculatePosition(e.clientX, e.clientY, svgRef);
        onGuessChange?.(position);
    }, [isDragging, interactive, onGuessChange]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (!interactive) return;
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }, [interactive]);

    // Render pointer
    const renderPointer = (position: number, type: 'target' | 'guess') => {
        const outerPoint = getArcPoint(position, RADIUS + 5);
        const innerPoint = getArcPoint(position, INNER_RADIUS - 5);
        const handlePoint = getArcPoint(position, RADIUS + 25);

        const isTarget = type === 'target';
        const className = isTarget
            ? `target-pointer ${!showTarget ? 'hidden' : ''} ${isRevealing ? 'revealing' : ''}`
            : `guess-pointer ${isDragging ? 'dragging' : ''}`;

        return (
            <g className={className}>
                <line
                    x1={innerPoint.x}
                    y1={innerPoint.y}
                    x2={outerPoint.x}
                    y2={outerPoint.y}
                />
                <circle cx={innerPoint.x} cy={innerPoint.y} r={8} />
                {!isTarget && interactive && (
                    <circle
                        className="handle"
                        cx={handlePoint.x}
                        cy={handlePoint.y}
                        r={18}
                    />
                )}
            </g>
        );
    };

    // Render score zones centered on target
    const renderScoreZones = () => {
        if (!showTarget && !revealTarget) return null;

        const zones = [
            { points: 2, width: 24, color: '#ff4500' },
            { points: 3, width: 16, color: '#ff8c00' },
            { points: 4, width: 8, color: '#ffd700' },
        ];

        return zones.map((zone) => {
            const startDeg = Math.max(0, targetPosition - zone.width);
            const endDeg = Math.min(180, targetPosition + zone.width);

            return (
                <path
                    key={zone.points}
                    className={`dial-zone zone-${zone.points}`}
                    d={createArcPath(startDeg, endDeg, RADIUS - 3, INNER_RADIUS + 3)}
                    style={{
                        fill: zone.color,
                        opacity: isRevealing ? 0.9 : 0.75,
                    }}
                />
            );
        });
    };

    // Render tick marks
    const renderTicks = () => {
        const ticks = [];
        for (let i = 0; i <= 180; i += 10) {
            const isMajor = i % 30 === 0;
            const outerR = RADIUS + (isMajor ? 10 : 5);
            const innerR = RADIUS;
            const p1 = getArcPoint(i, outerR);
            const p2 = getArcPoint(i, innerR);

            ticks.push(
                <line
                    key={i}
                    className={`dial-tick ${isMajor ? 'major' : ''}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                />
            );
        }
        return ticks;
    };

    return (
        <div className="dial-container">
            <svg
                ref={svgRef}
                className="dial-svg"
                viewBox="0 0 400 200"
                preserveAspectRatio="xMidYMax meet"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                {/* Background arc */}
                <path
                    className="dial-base"
                    d={createArcPath(0, 180, RADIUS, INNER_RADIUS)}
                />

                {/* Tick marks */}
                {renderTicks()}

                {/* Score zones (only when target is shown) */}
                {renderScoreZones()}

                {/* Target pointer */}
                {renderPointer(targetPosition, 'target')}

                {/* Guess pointer (interactive or when showGuess is true) */}
                {(interactive || showGuess) && renderPointer(guessPosition, 'guess')}

                {/* Touch area overlay for better interaction */}
                {interactive && (
                    <path
                        className="dial-touch-area"
                        d={createArcPath(0, 180, RADIUS + 40, 0)}
                    />
                )}

                {/* Labels */}
                {leftLabel && (
                    <text
                        className="dial-label left"
                        x={15}
                        y={CENTER_Y + 5}
                    >
                        {leftLabel}
                    </text>
                )}
                {rightLabel && (
                    <text
                        className="dial-label right"
                        x={385}
                        y={CENTER_Y + 5}
                    >
                        {rightLabel}
                    </text>
                )}
            </svg>
        </div>
    );
}

export default WavelengthDial;
