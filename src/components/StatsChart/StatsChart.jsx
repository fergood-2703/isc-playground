import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#8b5cf6", "#06b6d4", "#22c55e"];

export default function StatsChart({ data, title }) {
  return (
    <div className="chart-card">
      <h3>{title}</h3>

      <PieChart width={300} height={300}>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={70}
          outerRadius={100}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}