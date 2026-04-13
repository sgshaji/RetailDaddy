import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SalesChart({ data, dataKey, fill, type = 'bar', label = 'Value' }) {
  const tooltipFormatter = (value) => [`₹${Number(value).toLocaleString('en-IN')}`, label];
  const tooltipStyle = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' };

  return (
    <ResponsiveContainer width="100%" height={220}>
      {type === 'bar' ? (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#999" />
          <YAxis tick={{ fontSize: 12 }} stroke="#999" />
          <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
          <Bar dataKey={dataKey} fill={fill} radius={[8, 8, 0, 0]} />
        </BarChart>
      ) : (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#999" />
          <YAxis tick={{ fontSize: 12 }} stroke="#999" />
          <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
          <Line type="monotone" dataKey={dataKey} stroke={fill} strokeWidth={3} dot={{ fill, r: 4 }} />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}
