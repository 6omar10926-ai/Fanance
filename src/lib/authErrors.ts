const messages: Record<string, string> = {
  'auth/invalid-email': 'صيغة البريد الإلكتروني غير صحيحة',
  'auth/user-disabled': 'تم تعطيل هذا الحساب',
  'auth/user-not-found': 'لا يوجد حساب بهذا البريد الإلكتروني',
  'auth/wrong-password': 'كلمة المرور غير صحيحة',
  'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'auth/email-already-in-use': 'هذا البريد الإلكتروني مستخدم بالفعل',
  'auth/weak-password': 'كلمة المرور ضعيفة، استخدم 6 أحرف على الأقل',
  'auth/too-many-requests': 'محاولات كثيرة، حاول مرة أخرى بعد قليل',
  'auth/network-request-failed': 'تعذر الاتصال بالخادم، تحقق من الإنترنت',
  'auth/configuration-not-found': 'إعدادات تسجيل الدخول غير مكتملة بعد',
}

export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code
  if (code && messages[code]) return messages[code]
  return 'حدث خطأ غير متوقع، حاول مرة أخرى'
}

const pinMessages: Record<string, string> = {
  'auth/wrong-password': 'الرمز غير صحيح',
  'auth/invalid-credential': 'الرمز غير صحيح',
  'auth/user-not-found': 'الرمز غير صحيح',
  'auth/email-already-in-use': 'هذا الرمز غير متاح، جرّب رمزاً آخر',
  'auth/too-many-requests': 'محاولات كثيرة، حاول مرة أخرى بعد قليل',
  'auth/network-request-failed': 'تعذر الاتصال بالخادم، تحقق من الإنترنت',
  'auth/configuration-not-found': 'إعدادات تسجيل الدخول غير مكتملة بعد',
}

export function pinErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code
  if (code && pinMessages[code]) return pinMessages[code]
  return 'حدث خطأ غير متوقع، حاول مرة أخرى'
}
