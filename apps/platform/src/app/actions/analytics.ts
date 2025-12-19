"use server";

import { db } from "@repo/database";

export async function getAnalyticsData() {
    // 1. Fetch raw events (last 7 days for charts, last 20 for feed)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalViews, uniqueVisitors, events, chartDataRaw] = await Promise.all([
        // Total Views (All time)
        db.analyticsEvent.count({ where: { type: "VIEW" } }),

        // Unique Visitors (All time approx, based on distinct customerId + anonymous)
        // Prisma distinct count is tricky, simpler proxy: count distinct customerId
        db.analyticsEvent.groupBy({
            by: ['customerId'],
            _count: { customerId: true },
            where: { customerId: { not: null } }
        }),

        // Recent Feed
        db.analyticsEvent.findMany({
            take: 20,
            orderBy: { createdAt: "desc" },
            include: { customer: true, template: true, journey: true },
        }),

        // Chart Data (Last 7 days)
        db.analyticsEvent.findMany({
            where: {
                type: "VIEW",
                createdAt: { gte: sevenDaysAgo }
            },
            select: { createdAt: true }
        })
    ]);

    // Process Chart Data: Group by Date
    const viewsByDay = chartDataRaw.reduce((acc, event) => {
        const date = event.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Fill in missing days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        chartData.push({
            date: dateStr,
            views: viewsByDay[dateStr] || 0
        });
    }

    return {
        summary: {
            totalViews,
            knownVisitors: uniqueVisitors.length, // Only counting known customers for now as a proxy
        },
        chartData,
        recentEvents: events.map(e => ({
            id: e.id,
            type: e.type,
            url: e.url,
            user: e.customer?.name || e.customer?.email || "Anonymous",
            details: e.journey ? `Journey: ${e.journey.name}` : e.template ? `Template: ${e.template.name}` : "Page View",
            time: e.createdAt
        }))
    };
}
