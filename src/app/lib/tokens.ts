export const C = {
  bg: '#F8F5F0', card: '#FFFFFF', title: '#2E2A26', textSec: '#8A817A',
  textTer: '#A89F96', border: '#E9E2D9', primary: '#8C421B', mid1: '#A47148',
  mid2: '#D4A276', barFill: '#7A9E7E', barEmpty: '#ECE7E1',
  info: '#3D6B94', infoBg: '#EEF3F8', infoBorder: '#9DB8D2',
  success: '#2F5E34', successBg: '#EDF7EE', successAccent: '#7A9E7E', successBorder: '#90C594',
  warning: '#FFAF03', warningBg: '#FFF8E5', warningBorder: '#F5CC6A',
  error: '#B23A2F', errorBg: '#FFF4F3', errorBorder: '#C95A50',
  pending: '#9A7B63', pendingBg: '#F4EFE9',
  navActive: '#8C421B', navInactive: '#B8AEA5',
  sidebar: '#2E2A26',
};

export const font = "'Inter', sans-serif";

export const gradeColor = (g: number) => g > 9 ? C.success : g < 6 ? C.error : C.title;

export const chartTooltip = { borderRadius: '10px', border: `1px solid ${C.border}`, fontFamily: font, fontSize: '12px', color: C.title };

export type EssayLevel = 'excellent' | 'correct' | 'partial' | 'incorrect';

export const essayLevel = (score: number): EssayLevel =>
  score >= 80 ? 'excellent' : score >= 60 ? 'correct' : score >= 40 ? 'partial' : 'incorrect';

const essayStyles: Record<EssayLevel, { color: string; bg: string; border: string; label: string }> = {
  excellent: { color: C.info, bg: C.infoBg, border: C.infoBorder, label: 'excelente' },
  correct: { color: C.success, bg: C.successBg, border: C.successBorder, label: 'correta' },
  partial: { color: C.warning, bg: C.warningBg, border: C.warningBorder, label: 'parcial' },
  incorrect: { color: C.error, bg: C.errorBg, border: C.errorBorder, label: 'incorreta' },
};

export const essayStyle = (score: number) => essayStyles[essayLevel(score)];
