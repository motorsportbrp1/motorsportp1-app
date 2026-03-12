"use client";

import React, { useEffect, useRef, useState } from "react";
import { OpenF1Location, OpenF1Driver } from "@/services/openf1";

interface LiveTrackMapProps {
    sessionKey: number;
    drivers: Map<number, OpenF1Driver>;
    locations: Map<number, OpenF1Location>;
}

export default function LiveTrackMap({ sessionKey, drivers, locations }: LiveTrackMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Track bounds (Min/Max X and Y) discovered over time to autoscale the map
    const [bounds, setBounds] = useState({ minX: -10000, maxX: 10000, minY: -10000, maxY: 10000 });
    const [pathHistory, setPathHistory] = useState<Map<number, { x: number, y: number }[]>>(new Map());

    // Update bounds dynamically based on received locations so the track scales correctly
    useEffect(() => {
        let { minX, maxX, minY, maxY } = bounds;
        let boundsChanged = false;

        const newPathHistory = new Map(pathHistory);

        locations.forEach((loc, driverNum) => {
            // Update Bounds
            if (loc.x < minX) { minX = loc.x; boundsChanged = true; }
            if (loc.x > maxX) { maxX = loc.x; boundsChanged = true; }
            if (loc.y < minY) { minY = loc.y; boundsChanged = true; }
            if (loc.y > maxY) { maxY = loc.y; boundsChanged = true; }

            // Store path history to draw fading tails
            const history = newPathHistory.get(driverNum) || [];
            history.push({ x: loc.x, y: loc.y });
            if (history.length > 5) history.shift(); // Keep only last 5 positions for a tail
            newPathHistory.set(driverNum, history);
        });

        if (boundsChanged) {
            setBounds({ minX, maxX, minY, maxY });
        }
        setPathHistory(newPathHistory);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locations]);

    // Draw the map on the Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Resize Canvas internally to match Display Size
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }

        const width = canvas.width;
        const height = canvas.height;

        // Clear previous frame
        ctx.clearRect(0, 0, width, height);

        // Helper function to map raw F1 X/Y to canvas coordinates
        const mapCoord = (x: number, y: number) => {
            const padding = 20;
            const trackWidth = bounds.maxX - bounds.minX;
            const trackHeight = bounds.maxY - bounds.minY;

            // Preserve aspect ratio
            const scaleX = (width - padding * 2) / (trackWidth || 1);
            const scaleY = (height - padding * 2) / (trackHeight || 1);
            const scale = Math.min(scaleX, scaleY);

            // Center the track
            const offsetX = (width - trackWidth * scale) / 2;
            const offsetY = (height - trackHeight * scale) / 2;

            // F1 coordinates can be inverted or strange, we map them carefully
            const mappedX = (x - bounds.minX) * scale + offsetX;
            // Y is usually inverted in 2D graphs vs Canvas
            const mappedY = height - ((y - bounds.minY) * scale + offsetY);

            return { cx: mappedX, cy: mappedY };
        };

        // Draw Drivers
        locations.forEach((loc, driverNum) => {
            const driver = drivers.get(driverNum);
            if (!driver) return;

            const color = driver.team_colour ? `#${driver.team_colour}` : "#ffffff";
            const { cx, cy } = mapCoord(loc.x, loc.y);

            // Draw fading tail
            const history = pathHistory.get(driverNum);
            if (history && history.length > 1) {
                ctx.beginPath();
                const start = mapCoord(history[0].x, history[0].y);
                ctx.moveTo(start.cx, start.cy);
                for (let i = 1; i < history.length; i++) {
                    const pt = mapCoord(history[i].x, history[i].y);
                    ctx.lineTo(pt.cx, pt.cy);
                }
                ctx.strokeStyle = color + "80"; // 50% opacity
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Draw Driver Dot
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();

            // Draw outer border to dot
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // Draw Driver Number Label
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 10px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            // Offset label slightly
            ctx.fillText(driver.name_acronym, cx, cy - 12);
        });

    }, [locations, bounds, pathHistory, drivers]);

    return (
        <div className="w-full h-full relative min-h-[400px]">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "1rem" }}
            />
            {/* Overlay legend or static info could go here */}
            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                <p className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live Positions
                </p>
            </div>
        </div>
    );
}
