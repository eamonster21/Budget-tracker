import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialCategories = [
  { name: 'Entertainment', budget: 200, emoji: '🎭', color: '#74b1b2' },
  { name: 'Food (Dine Out)', budget: 400, emoji: '🍽️', color: '#db686b' },
  { name: 'Transport', budget: 80, emoji: '🚗', color: '#bd96c2' },
  { name: 'Groceries', budget: 50, emoji: '🛒', color: '#f2ca73' },
  { name: 'Food (Dabao / Home Delivery)', budget: 240, emoji: '🥡', color: '#a47b6a' },
];

const dateFilterOptions = [
  { value: 'custom', label: 'Custom Date Range' },
  { value: 'mtd', label: 'Month to Date' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3Months', label: 'Last 3 Months' },
  { value: 'last6Months', label: 'Last 6 Months' },
  { value: 'lastYear', label: 'Last Year' },
];

const BudgetTracker = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', date: new Date().toISOString().split('T')[0], paidBy: 'Eamon' });
  const [dateFilter, setDateFilter] = useState('custom');
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  useEffect(() => {
    updateDateRange(dateFilter);
  }, [dateFilter]);

  const addExpense = () => {
    if (newExpense.category && newExpense.amount && newExpense.date && newExpense.paidBy) {
      setExpenses([...expenses, { ...newExpense, amount: parseFloat(newExpense.amount) }]);
      setNewExpense({ category: '', amount: '', date: new Date().toISOString().split('T')[0], paidBy: 'Eamon' });
    }
  };

  const updateDateRange = (filter) => {
    const today = new Date();
    let from, to;
    switch (filter) {
      case 'mtd': from = new Date(today.getFullYear(), today.getMonth(), 1); to = today; break;
      case 'lastMonth': from = new Date(today.getFullYear(), today.getMonth() - 1, 1); to = new Date(today.getFullYear(), today.getMonth(), 0); break;
      case 'last3Months': from = new Date(today.getFullYear(), today.getMonth() - 3, 1); to = today; break;
      case 'last6Months': from = new Date(today.getFullYear(), today.getMonth() - 6, 1); to = today; break;
      case 'lastYear': from = new Date(today.getFullYear() - 1, today.getMonth(), 1); to = today; break;
      default: return;
    }
    setDateRange({ from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] });
  };

  const filterExpenses = () => expenses.filter(expense => {
    if (!dateRange.from || !dateRange.to) return true;
    const expenseDate = new Date(expense.date);
    return expenseDate >= new Date(dateRange.from) && expenseDate <= new Date(dateRange.to);
  });

  const getBudgetData = () => categories.map(category => {
    const spent = filterExpenses().filter(e => e.category === category.name).reduce((sum, e) => sum + e.amount, 0);
    return { ...category, spent, percentage: (spent / category.budget) * 100 };
  });

  const renderForm = (type, data, setData, onSubmit) => (
    <div className="grid grid-cols-2 gap-4">
      {Object.keys(data).map(key => (
        <div key={key}>
          <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
          {key === 'category' ? (
            <Select value={data[key]} onValueChange={(value) => setData({...data, [key]: value})}>
              <SelectTrigger><SelectValue placeholder={`Select ${key}`} /></SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.name} value={cat.name}>{cat.emoji} {cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : key === 'paidBy' ? (
            <Select value={data[key]} onValueChange={(value) => setData({...data, [key]: value})}>
              <SelectTrigger><SelectValue placeholder="Select payer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Eamon">Eamon</SelectItem>
                <SelectItem value="Siang Nee">Siang Nee</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={key}
              type={key === 'amount' ? 'number' : key === 'date' ? 'date' : 'text'}
              value={data[key]}
              onChange={(e) => setData({...data, [key]: e.target.value})}
            />
          )}
        </div>
      ))}
      <Button onClick={onSubmit} className="mt-4 col-span-2">{type === 'expense' ? 'Add Expense' : 'Add Category'}</Button>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">P&L Tracker</h1>
      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="expenses">
          <Card>
            <CardHeader><CardTitle>Add Expense</CardTitle></CardHeader>
            <CardContent>{renderForm('expense', newExpense, setNewExpense, addExpense)}</CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Expense List</CardTitle>
              <div className="flex gap-4 items-center">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger><SelectValue placeholder="Select date filter" /></SelectTrigger>
                  <SelectContent>
                    {dateFilterOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {dateFilter === 'custom' && (
                  <>
                    <Input type="date" value={dateRange.from || ''} onChange={(e) => setDateRange({...dateRange, from: e.target.value})} />
                    <Input type="date" value={dateRange.to || ''} onChange={(e) => setDateRange({...dateRange, to: e.target.value})} />
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Category</th>
                    <th className="text-right">Amount (SGD)</th>
                    <th className="text-center">Date</th>
                    <th className="text-left">Paid By</th>
                  </tr>
                </thead>
                <tbody>
                  {filterExpenses().map((expense, index) => (
                    <tr key={index}>
                      <td className="text-left">{expense.category}</td>
                      <td className="text-right">{expense.amount.toFixed(2)}</td>
                      <td className="text-center">{expense.date}</td>
                      <td className="text-left">{expense.paidBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Categories Stat</CardTitle>
              <div className="flex gap-4 items-center">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger><SelectValue placeholder="Select date filter" /></SelectTrigger>
                  <SelectContent>
                    {dateFilterOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {dateFilter === 'custom' && (
                  <>
                    <Input type="date" value={dateRange.from || ''} onChange={(e) => setDateRange({...dateRange, from: e.target.value})} />
                    <Input type="date" value={dateRange.to || ''} onChange={(e) => setDateRange({...dateRange, to: e.target.value})} />
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {getBudgetData().map(category => (
                <div key={category.name} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span>{category.emoji} {category.name}</span>
                    <span>{category.percentage.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-sm mt-1">
                    ${category.spent.toFixed(2)} / ${category.budget.toFixed(2)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>Monthly Budget</CardTitle></CardHeader>
            <CardContent>
              {categories.map((category, index) => (
                <div key={category.name} className="mb-4">
                  <Label htmlFor={`budget-${category.name}`}>{category.emoji} {category.name}</Label>
                  <div className="flex items-center">
                    <Input
                      id={`budget-${category.name}`}
                      type="number"
                      value={category.budget}
                      onChange={(e) => {
                        const updatedCategories = [...categories];
                        updatedCategories[index].budget = parseFloat(e.target.value);
                        setCategories(updatedCategories);
                      }}
                      className="mr-2"
                    />
                    <span>SGD</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader><CardTitle>Add New Category</CardTitle></CardHeader>
            <CardContent>
              {renderForm('category', { name: '', budget: '', emoji: '', color: '' }, setCategories, () => {
                if (newCategory.name && newCategory.budget && newCategory.emoji && newCategory.color) {
                  setCategories([...categories, { ...newCategory, budget: parseFloat(newCategory.budget) }]);
                  setNewCategory({ name: '', budget: '', emoji: '', color: '' });
                }
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetTracker;
