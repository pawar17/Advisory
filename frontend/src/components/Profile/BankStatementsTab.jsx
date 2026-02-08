import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { bankStatementService } from '../../services/api';
import toast from 'react-hot-toast';

const CHART_COLORS = ['#E0BBE4', '#FFD6E8', '#D1F2EB', '#FEF9E7', '#93C5FD', '#FDE68A', '#A7F3D0', '#FBCFE8'];

function spendingToChartData(spendingByCategory) {
  if (!spendingByCategory || typeof spendingByCategory !== 'object') return [];
  return Object.entries(spendingByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round(Math.abs(Number(value))),
  })).filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
}

export default function BankStatementsTab() {
  const [statements, setStatements] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchStatements = async () => {
    try {
      const { data } = await bankStatementService.list();
      setStatements(data.statements || []);
    } catch (_) {
      setStatements([]);
    }
  };

  const handleDelete = async (statementId) => {
    if (!confirm('Delete this statement? Its transactions will be removed from analysis.')) return;
    try {
      await bankStatementService.delete(statementId);
      toast.success('Statement deleted');
      await fetchStatements();
      await fetchAnalysis();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const fetchAnalysis = async () => {
    try {
      const { data } = await bankStatementService.spendingAnalysis();
      setAnalysis(data);
    } catch (_) {
      setAnalysis(null);
    }
  };

  useEffect(() => {
    fetchStatements();
    fetchAnalysis();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please select a PDF file');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await bankStatementService.upload(formData);
      toast.success(`Processed ${data.transactionCount} transactions`);
      fetchStatements();
      fetchAnalysis();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-heading text-xl uppercase tracking-tighter border-b-2 border-brand-black pb-2">
        Bank Statements
      </h3>
      <div className="editorial-card p-6">
        <p className="text-xs text-gray-600 mb-4">
          Upload a bank statement PDF. We extract transactions, categorize expenses, and use your spending to suggest daily savings.
        </p>
        <label className="block">
          <span className="sr-only">Choose PDF</span>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-2 file:border-brand-black file:font-mono file:text-xs"
          />
        </label>
        {uploading && <p className="text-xs text-gray-500 mt-2">Processing…</p>}
      </div>

      {statements.length > 0 && (
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">Uploaded</h4>
          <ul className="space-y-2">
            {statements.map((s) => (
              <li key={s._id} className="editorial-card p-3 flex justify-between items-center gap-2">
                <span className="font-mono text-sm truncate flex-1 min-w-0">{s.filename}</span>
                <span className="text-[10px] text-gray-500 shrink-0">{s.transaction_count} transactions</span>
                <button
                  type="button"
                  onClick={() => handleDelete(s._id)}
                  className="text-[10px] font-mono uppercase text-red-600 hover:underline shrink-0"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="editorial-card p-6 space-y-3">
        <h4 className="font-heading text-sm uppercase">Daily savings suggestion</h4>
        {analysis?.hasStatementData ? (
          <>
            <p className="text-[10px] uppercase text-gray-500">
              Based on {analysis.transactionCount} transactions from your statements
            </p>
            <p className="text-sm">
              Save <strong>${Number(analysis.suggestion?.daily_savings_amount ?? 0).toFixed(2)}</strong> per day to reach your goal.
            </p>
            {analysis.suggestion?.tip && (
              <p className="text-xs text-gray-600">{analysis.suggestion.tip}</p>
            )}
            {analysis.suggestion?.top_cut_category && analysis.suggestion.top_cut_category !== 'other' && (
              <p className="text-[10px] uppercase text-gray-500">
                Consider reducing: {analysis.suggestion.top_cut_category}
              </p>
            )}
            {Object.keys(analysis.spendingByCategory || {}).length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-[10px] font-mono uppercase text-gray-500 mb-1">Spending by category</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.spendingByCategory).map(([cat, total]) => (
                    <span key={cat} className="px-2 py-1 bg-brand-lavender/30 rounded text-[10px] font-mono uppercase">
                      {cat}: ${Number(total).toFixed(0)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              {analysis?.suggestion ? (
                <>Save <strong>${Number(analysis.suggestion.daily_savings_amount || 0).toFixed(2)}</strong> per day (based on your goal only).</>
              ) : (
                'Set a savings goal in the Goals tab, then upload a bank statement PDF to get a personalized daily amount and tips.'
              )}
            </p>
            <p className="text-xs text-gray-500">Upload a statement above to see spending by category and AI suggestions.</p>
          </>
        )}
      </div>

      {analysis?.hasStatementData && (() => {
        const chartData = spendingToChartData(analysis.spendingByCategory);
        const totalExpenses = chartData.reduce((sum, d) => sum + d.value, 0);
        if (chartData.length === 0) return null;
        return (
          <div className="space-y-6">
            <h4 className="font-heading text-sm uppercase tracking-tighter border-b-2 border-brand-black pb-2">
              Spending visualizations
            </h4>
            <p className="text-xs text-gray-600">
              Total expenses from statement: <strong>${totalExpenses.toLocaleString()}</strong> across {chartData.length} categories
            </p>

            <div className="editorial-card p-4">
              <p className="text-[10px] font-mono uppercase text-gray-500 mb-3">By category (pie)</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={false}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="#1A1A1A" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Spent']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 mt-3 pt-3 border-t border-gray-200">
                {chartData.map((d, index) => (
                  <div key={d.name} className="flex items-center gap-2 min-w-0">
                    <span
                      className="shrink-0 w-2.5 h-2.5 rounded-full border border-brand-black/20"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-[10px] font-mono truncate" title={`${d.name} $${d.value.toLocaleString()}`}>
                      {d.name} ${d.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="editorial-card p-4">
              <p className="text-[10px] font-mono uppercase text-gray-500 mb-3">By category (bar)</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Spent']} />
                  <Bar dataKey="value" fill="#E0BBE4" stroke="#1A1A1A" strokeWidth={1} radius={[4, 4, 0, 0]} name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
