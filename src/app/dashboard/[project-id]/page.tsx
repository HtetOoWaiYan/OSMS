import { getAnalyticsData } from "@/lib/data/analytics";
import { StatsCard } from "@/components/dashboard/analytics/stats-card";
import { OverviewChart } from "@/components/dashboard/analytics/overview-chart";
import { OrderStatusChart } from "@/components/dashboard/analytics/order-status-chart";
import { PopularItemsChart } from "@/components/dashboard/analytics/popular-items-chart";
import { LowStockItemsList } from "@/components/dashboard/analytics/low-stock-items-list";
import { PaymentMethodChart } from "@/components/dashboard/analytics/payment-method-chart";
import { MoneyBreakdownChart } from "@/components/dashboard/analytics/money-breakdown-chart";
import { refreshAnalytics } from "@/lib/actions/analytics";
import { Button } from "@/components/ui/button";
import { RefreshCw, DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";

export default async function AnalyticsPage({
  params,
}: {
  params: { "project-id": string };
}) {
  const { 'project-id': projectId } = await params;
  const {
    revenueAndOrders,
    orderStatusDistribution,
    popularItems,
    lowStockItems,
    revenueByPaymentMethod,
    summaryMetrics,
    moneyBreakdown,
  } = await getAnalyticsData(projectId);

  const overviewData = revenueAndOrders.reduce((acc, cur) => {
    const date = new Date(cur.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.revenue += cur.total_amount;
      existing.orders += 1;
    } else {
      acc.push({ date, revenue: cur.total_amount, orders: 1 });
    }
    return acc;
  }, [] as { date: string; revenue: number; orders: number }[]);

  return (
    <div className="space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Analytics" description="Get a complete overview of your project's performance.">
        <form action={async () => {
          'use server'
          await refreshAnalytics(projectId)
        }}>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </form>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Revenue"
          value={`${summaryMetrics.total_revenue.toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Orders"
          value={summaryMetrics.total_orders}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Customers"
          value={summaryMetrics.total_customers}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Capital"
          value={`${summaryMetrics.total_capital.toFixed(2)}`}
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Profit Margin"
          value={`${summaryMetrics.profit_margin.toFixed(2)}%`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        <OverviewChart data={overviewData} />
        <MoneyBreakdownChart data={moneyBreakdown} />
        <PaymentMethodChart data={revenueByPaymentMethod} />
        <OrderStatusChart data={orderStatusDistribution} />
        <PopularItemsChart data={popularItems} />
        <LowStockItemsList data={lowStockItems} />
      </div>
    </div>
  );
}
