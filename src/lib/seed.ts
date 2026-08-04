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
    { id: 'i1', name: 'محفظة الأسهم السعودية', type: 'أسهم', platform: 'الراجحي المالية', amountInvested: 15000, currentValue: 17250, date: daysAgoISO(200), payout: 400, payoutFreq: 'ربع سنوي', notes: 'تداول تاسي' },
    { id: 'i2', name: 'صندوق مؤشر عالمي', type: 'صناديق استثمار', platform: 'دراية المالية', amountInvested: 10000, currentValue: 11100, date: daysAgoISO(150), endDate: daysAgoISO(-215) },
    { id: 'i3', name: 'ذهب عيار 24', type: 'ذهب ومعادن', platform: 'محلي', amountInvested: 5000, currentValue: 5450, date: daysAgoISO(300) },
    { id: 'i4', name: 'وديعة ثابتة', type: 'ودائع بنكية', platform: 'مصرف الإنماء', amountInvested: 20000, currentValue: 20600, date: daysAgoISO(365), endDate: daysAgoISO(-5) },
  ],
  incomes: [
    { id: 'n1', date: daysAgoISO(3), source: 'الراتب الأساسي', frequency: 'شهري', amount: 12000, payDay: 27 },
    { id: 'n2', date: daysAgoISO(3), source: 'عمل حر', frequency: 'شهري', amount: 1500, payDay: 5 },
    { id: 'n3', date: daysAgoISO(90), source: 'مكافأة سنوية', frequency: 'سنوي', amount: 8000 },
    { id: 'n4', date: daysAgoISO(-20), source: 'صفقة بيع سيارة', frequency: 'مرة واحدة', amount: 35000 },
  ],
  payments: [
    { id: 'p1', name: 'إيجار الشقة', amount: 2500, dueDate: daysAgoISO(-5), status: 'مستحق', recurring: true, category: 'سكن' },
    { id: 'p2', name: 'فاتورة الإنترنت', amount: 150, dueDate: daysAgoISO(-2), status: 'مستحق', recurring: true, category: 'فواتير' },
    { id: 'p3', name: 'قسط السيارة', amount: 1200, dueDate: daysAgoISO(10), status: 'متأخر', recurring: true, category: 'تمويل' },
    { id: 'p4', name: 'اشتراك الصالة الرياضية', amount: 200, dueDate: daysAgoISO(15), status: 'مدفوع', recurring: true, category: 'صحة' },
  ],
  goals: [
    {
      id: 'g1',
      title: 'دخل العقار',
      source: 'عقار',
      targetAmount: 10000,
      startDate: daysAgoISO(40),
      deadline: daysAgoISO(-50),
      contributions: [
        { id: 'g1c1', date: daysAgoISO(35), amount: 3000, note: 'إيجار الشهر الأول' },
        { id: 'g1c2', date: daysAgoISO(5), amount: 3000, note: 'إيجار الشهر الثاني' },
      ],
    },
    {
      id: 'g2',
      title: 'تحدي العمل الحر',
      source: 'عمل حر',
      targetAmount: 6000,
      startDate: daysAgoISO(20),
      deadline: daysAgoISO(-10),
      contributions: [
        { id: 'g2c1', date: daysAgoISO(12), amount: 2500, note: 'مشروع تصميم' },
        { id: 'g2c2', date: daysAgoISO(3), amount: 3500, note: 'مشروع موقع' },
      ],
    },
  ],
  debts: [
    { id: 'd1', direction: 'لي', person: 'خالد', amount: 2000, date: daysAgoISO(25), dueDate: daysAgoISO(-15), notes: 'سلفة', payments: [] },
    {
      id: 'd2',
      direction: 'لي',
      person: 'محمد',
      amount: 500,
      date: daysAgoISO(10),
      payments: [{ id: 'd2p1', date: daysAgoISO(2), amount: 200, note: 'دفعة أولى' }],
    },
    {
      id: 'd3',
      direction: 'عليّ',
      person: 'بنك التمويل',
      amount: 12000,
      date: daysAgoISO(70),
      dueDate: daysAgoISO(-290),
      installment: 1000,
      notes: 'قرض شخصي',
      payments: [
        { id: 'd3p1', date: daysAgoISO(40), amount: 1000, note: 'قسط الشهر' },
        { id: 'd3p2', date: daysAgoISO(10), amount: 1000, note: 'قسط الشهر' },
      ],
    },
    {
      id: 'd4',
      direction: 'عليّ',
      person: 'سالم',
      amount: 800,
      date: daysAgoISO(60),
      payments: [{ id: 'd4p1', date: daysAgoISO(30), amount: 800, note: 'سداد كامل' }],
    },
  ],
}
