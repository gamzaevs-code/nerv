'use client';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
export default function ActivityChart({ data }: { data: { day: string; actions: number }[] }) { return <div className="glass-card" style={{ height: 260 }}><ResponsiveContainer><BarChart data={data}><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="actions" fill="#00E5FF" /></BarChart></ResponsiveContainer></div>; }
