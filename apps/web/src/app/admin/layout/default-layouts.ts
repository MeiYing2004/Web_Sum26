export const DEFAULT_LAYOUTS: Record<string, { type: string; floors: Array<{ label?: string; rows: string[][] }> }> = {
  'bus-29': {
    type: 'seat_29',
    floors: [{ label: 'Tầng 1', rows: [
      ['A01', 'A02', '', 'A03', 'A04'],
      ['A05', 'A06', '', 'A07', 'A08'],
      ['A09', 'A10', '', 'A11', 'A12'],
      ['A13', 'A14', '', 'A15', 'A16'],
      ['A17', 'A18', '', 'A19', 'A20'],
      ['A21', 'A22', '', 'A23', 'A24'],
      ['A25', 'A26', 'A27', 'A28', 'A29'],
    ]}],
  },
  'bus-22': {
    type: 'limousine',
    floors: [{ label: 'Limousine', rows: [
      ['L01', 'L02', '', 'L03', 'L04'],
      ['L05', 'L06', '', 'L07', 'L08'],
      ['L09', 'L10', '', 'L11', 'L12'],
      ['L13', 'L14', '', 'L15', 'L16'],
      ['L17', 'L18', 'L19', 'L20', 'L21', 'L22'],
    ]}],
  },
  'bus-34': {
    type: 'bed_34',
    floors: [{ label: 'Giường nằm', rows: Array.from({ length: 17 }, (_, i) => [`B${String(i * 2 + 1).padStart(2, '0')}`, `B${String(i * 2 + 2).padStart(2, '0')}`]) }],
  },
};
