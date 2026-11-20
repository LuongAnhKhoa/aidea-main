const vietnamMobilePhonePattern = /^(032|033|034|035|036|037|038|039|052|055|056|058|059|070|076|077|078|079|081|082|083|084|085|086|087|088|089|09[0-9])\d{7}$/;

export function normalizeVietnameseMobilePhone(value) {
  let normalized = value.trim().replace(/[\s().-]/g, '');

  if (normalized.startsWith('+84')) {
    normalized = `0${normalized.slice(3)}`;
  } else if (normalized.startsWith('84')) {
    normalized = `0${normalized.slice(2)}`;
  }

  return vietnamMobilePhonePattern.test(normalized) ? normalized : null;
}
