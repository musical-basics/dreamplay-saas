"use client";

import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { getAnalyticsData } from "../actions/analytics";
import { RefreshCw, Users, Eye, Activity } from "lucide-react";

// Types for our data
type AnalyticsState = {
    summary: { totalViews: number; knownVisitors: number };
    chartData: { date: string; views: number }[];
    recentEvents: { id: string; type: string; url: string; user: string; details: string; time: Date }[];
};

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsState | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getAnalyticsData();
            setData(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading && !data) return <div className="p-8">Loading analytics...</div>;
    if (!data) return <div className="p-8">Failed to load analytics.</div>;

    return (
        <div className="flex h-screen flex-col bg-slate-50">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-6">
                <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 rounded-md bg-white border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="overflow-y-auto p-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                <Eye className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Views</p>
                                <p className="text-2xl font-bold text-slate-900">{data.summary.totalViews}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-green-100 p-3 text-green-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Known Visitors</p>
                                <p className="text-2xl font-bold text-slate-900">{data.summary.knownVisitors}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Recent Events</p>
                                <p className="text-2xl font-bold text-slate-900">{data.recentEvents.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Chart */}
                    <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
                        <h3 className="mb-6 text-lg font-semibold text-slate-900">Views (Last 7 Days)</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(val) => val.slice(5)} // Show MM-DD
                                    />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="views" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Live Feed */}
                    <div className="rounded-lg bg-white shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900">Live Feed</h3>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                            {data.recentEvents.map((event) => (
                                <div key={event.id} className="p-4 hover:bg-slate-50">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {event.user} <span className="text-slate-500 font-normal">viewed</span> {event.url}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {event.details}
                                            </p>
                                        </div>
                                        <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                                            {new Date(event.time).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {data.recentEvents.length === 0 && (
                                <div className="p-8 text-center text-sm text-slate-500">
                                    No events recorded yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
