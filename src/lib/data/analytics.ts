import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

export const getAnalyticsData = async (projectId: string) => {
  const serviceClient = createServiceRoleClient();

  const getOrders = unstable_cache(
    async () => {
      const { data, error } = await serviceClient
        .from("orders")
        .select("created_at, total_amount, status, payment_method, customer_id, id")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    [`analytics-orders-${projectId}`],
    { tags: [`analytics-${projectId}`] }
  );

  const getOrderItems = unstable_cache(
    async () => {
        const { data, error } = await serviceClient
            .from('order_items')
            .select('*, orders!inner(project_id)')
            .eq('orders.project_id', projectId)

        if (error) throw error;
        return data;
    },
    [`analytics-order-items-${projectId}`],
    { tags: [`analytics-${projectId}`] }
  );

  const getItemPrices = unstable_cache(
    async () => {
        const { data, error } = await serviceClient
            .from('item_prices')
            .select('*')

        if (error) throw error;
        return data;
    },
    [`analytics-item-prices-${projectId}`],
    { tags: [`analytics-${projectId}`] }
  );

  const getPopularItems = unstable_cache(
    async () => {
      const { data, error } = await serviceClient
        .from("popular_items")
        .select("name, total_sold")
        .eq("project_id", projectId)
        .order("total_sold", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    [`analytics-popular-items-${projectId}`],
    { tags: [`analytics-${projectId}`] }
  );

  const getLowStockItems = unstable_cache(
    async () => {
      const { data, error } = await serviceClient
        .from("items")
        .select("name, stock_quantity, min_stock_level")
        .eq("project_id", projectId)
        .lte("stock_quantity", 5) // Example: items with stock <= 5
        .order("stock_quantity", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },
    [`analytics-low-stock-${projectId}`],
    { tags: [`analytics-${projectId}`] }
  );

  const [orders, popularItems, lowStockItems, orderItems, itemPrices] = await Promise.all([
    getOrders(),
    getPopularItems(),
    getLowStockItems(),
    getOrderItems(),
    getItemPrices(),
  ]);

  // Manual processing
  const revenueAndOrders = orders.map(o => ({ created_at: o.created_at, total_amount: o.total_amount }));

  const orderStatusDistribution = orders.filter(order => order.status).reduce((acc, order) => {
    const status = order.status!;
    const existing = acc.find(item => item.status === status);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ status, count: 1 });
    }
    return acc;
  }, [] as { status: string; count: number }[]);

  const revenueByPaymentMethod = orders
    .filter(o => o.status === 'paid' || o.status === 'done')
    .reduce((acc, order) => {
      const method = order.payment_method;
      const existing = acc.find(item => item.payment_method === method);
      if (existing) {
        existing.total_amount += order.total_amount;
      } else {
        acc.push({ payment_method: method, total_amount: order.total_amount });
      }
      return acc;
    }, [] as { payment_method: string; total_amount: number }[]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

  const totalCapital = orderItems.reduce((acc, orderItem) => {
    if (!orderItem.created_at) {
      return acc;
    }
    const orderItemDate = new Date(orderItem.created_at);
    const price = itemPrices.find(p => {
      if (!p.effective_from) {
        return false;
      }
      const effectiveFrom = new Date(p.effective_from);
      const effectiveUntil = p.effective_until ? new Date(p.effective_until) : null;
      
      return p.item_id === orderItem.item_id && 
             effectiveFrom <= orderItemDate && 
             (!effectiveUntil || effectiveUntil > orderItemDate);
    });
    
    return acc + (price ? price.base_price * orderItem.quantity : 0);
  }, 0);

  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCapital) / totalRevenue) * 100 : 0;

  const summaryMetrics = {
    total_revenue: totalRevenue,
    total_orders: orders.length,
    total_customers: new Set(orders.map(o => o.customer_id)).size,
    total_capital: totalCapital,
    profit_margin: profitMargin,
  };

  const moneyBreakdown = {
    revenue: totalRevenue,
    capital: totalCapital,
    profit: totalRevenue - totalCapital,
  }

  return {
    revenueAndOrders,
    orderStatusDistribution,
    popularItems,
    lowStockItems,
    revenueByPaymentMethod,
    summaryMetrics,
    moneyBreakdown,
  };
};
