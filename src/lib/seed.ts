import type { FinanceData } from '../types'

function daysAgoISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export const seedData: FinanceData = {
  expenses: [
    { id: 'e1', date: daysAgoISO(2), category: 'طعام وشراب', description: 'بقالة الأسبوع', amount: 320 },
    { id: 'e2', date: daysAgoISO(4), category: 'مواصلات', description: 'وقود السيارة', amount: 180 },
    { id: 'e3', date: daysAgoISO(6), category: 'فواتير', description: 'فاتورة الكهرباء', amount: 450 },
    { id: 'e4', date: daysAgoISO(9), category: 'ترفيه', description: 'اشتراك نتفلكس', amount: 60 },
    { id: 'e5', date: daysAgoISO(12), category: 'سكن', description: 'إيجار الشقة', amount: 2500 },
    { id: 'e6', date: daysAgoISO(15), category: 'صحة', description: 'زيارة طبيب', amount: 200 },
    { id: 'e7', date: daysAgoISO(20), category: 'تسوق', description: 'ملابس', amount: 350 },
  ],
  investments: [
    { id: 'i1', name: 'محفظة الأسهم السعودية', type: 'أسهم', amountInvested: 15000, currentValue: 17250, date: daysAgoISO(200), notes: 'تداول تاسي' },
    { id: 'i2', name: 'صندوق مؤشر عالمي', type: 'صناديق استثمار', amountInvested: 10000, currentValue: 11100, date: daysAgoISO(150) },
    { id: 'i3', name: 'ذهب عيار 24', type: 'ذهب ومعادن', amountInvested: 5000, currentValue: 5450, date: daysAgoISO(300) },
    { id: 'i4', name: 'وديعة ثابتة', type: 'ودائع بنكية', amountInvested: 20000, currentValue: 20600, date: daysAgoISO(365) },
  ],
  incomes: [
    { id: 'n1', date: daysAgoISO(3), source: 'الراتب الأساسي', frequency: 'شهري', amount: 12000 },
    { id: 'n2', date: daysAgoISO(3), source: 'عمل حر', frequency: 'شهري', amount: 1500 },
    { id: 'n3', date: daysAgoISO(90), source: 'مكافأة سنوية', frequency: 'سنوي', amount: 8000 },
  ],
  payments: [
    { id: 'p1', name: 'إيجار الشقة', amount: 2500, dueDate: daysAgoISO(-5), status: 'مستحق', recurring: true, category: 'سكن' },
    { id: 'p2', name: 'فاتورة الإنترنت', amount: 150, dueDate: daysAgoISO(-2), status: 'مستحق', recurring: true, category: 'فواتير' },
    { id: 'p3', name: 'قسط السيارة', amount: 1200, dueDate: daysAgoISO(10), status: 'متأخر', recurring: true, category: 'تمويل' },
    { id: 'p4', name: 'اشتراك الصالة الرياضية', amount: 200, dueDate: daysAgoISO(15), status: 'مدفوع', recurring: true, category: 'صحة' },
  ],
}
