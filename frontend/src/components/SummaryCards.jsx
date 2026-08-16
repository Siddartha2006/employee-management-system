import React from 'react';
import { Users, Laptop, ShieldCheck, Layers, DollarSign } from 'lucide-react';

export default function SummaryCards({ employees = [] }) {
  const totalEmployees = employees.length;

  const itEmployees = employees.filter(
    (e) => (e.department || '').toUpperCase() === 'IT'
  ).length;

  const qaEmployees = employees.filter(
    (e) => (e.department || '').toUpperCase() === 'QA'
  ).length;

  const otherEmployees = totalEmployees - (itEmployees + qaEmployees);

  const totalPayroll = employees.reduce((acc, curr) => acc + (Number(curr.salary) || 0), 0);
  const avgSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cards = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      subtext: `Avg: ${formatCurrency(avgSalary)}/yr`,
      icon: Users,
      color: 'sky',
      iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      title: 'IT Department',
      value: itEmployees,
      subtext: `${totalEmployees ? Math.round((itEmployees / totalEmployees) * 100) : 0}% of workforce`,
      icon: Laptop,
      color: 'indigo',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'QA Department',
      value: qaEmployees,
      subtext: `${totalEmployees ? Math.round((qaEmployees / totalEmployees) * 100) : 0}% of workforce`,
      icon: ShieldCheck,
      color: 'emerald',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Other Departments',
      value: otherEmployees,
      subtext: `Payroll: ${formatCurrency(totalPayroll)}`,
      icon: Layers,
      color: 'amber',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center border ${card.iconBg}`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
