function calculerGain(investissement) {
  const total = investissement * 10;
  const reinvest = total / 3;
  const reserve = reinvest * 0.1;
  const gain = (total - reinvest) + (reserve / 10);
  return {
    gain: gain.toFixed(2),
    reserve: (reserve - reserve / 10).toFixed(2),
    total: total.toFixed(2)
  };
}
