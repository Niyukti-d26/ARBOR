// ── ARBOR AI Fraud Detector (Mock) ──
// In production, this would call an ML model endpoint

/**
 * Returns a fraud assessment for a given claim
 * @param {object} claim - { type, workerId, zone, timestamp, amount }
 * @param {string} fraudType - null | 'gps_spoofing' | 'duplicate' | 'coordinated'
 * @returns {{ fraudScore: number, confidence: number, reason: string | null }}
 */
export function fraudDetector(claim, fraudType = null) {
  // Simulate AI processing delay visually (actual delay is done in UI)
  
  if (fraudType === 'gps_spoofing') {
    return {
      fraudScore: 0.92,
      confidence: 97,
      reason: 'GPS Spoofing — Worker location (Andheri, Mumbai) does not match claimed zone (Bellandur, Bengaluru). Distance: 1,392 km.',
      fraudLabel: 'GPS Spoofing',
    };
  }

  if (fraudType === 'duplicate') {
    return {
      fraudScore: 0.88,
      confidence: 94,
      reason: 'Duplicate Claim — Same trigger (Heavy Rainfall) claimed twice within 47 minutes. Previous claim: CLM-2481.',
      fraudLabel: 'Duplicate Claim',
    };
  }

  if (fraudType === 'coordinated') {
    return {
      fraudScore: 0.95,
      confidence: 99,
      reason: 'Coordinated Fraud Pattern — 14 workers in the same zone filed claims for the same trigger within 90 seconds. Statistical anomaly: p < 0.001.',
      fraudLabel: 'Coordinated Ring',
    };
  }

  // Normal claim — low fraud risk
  // Occasionally trigger the edge case (low confidence) for demo purposes
  const roll = Math.random();
  if (roll < 0.05) {
    // Edge case: low confidence
    return {
      fraudScore: 0.45 + Math.random() * 0.2,
      confidence: 60 + Math.floor(Math.random() * 20),
      reason: null,
      fraudLabel: null,
      isEdgeCase: true,
    };
  }

  return {
    fraudScore: 0.05 + Math.random() * 0.15,
    confidence: 88 + Math.floor(Math.random() * 10),
    reason: null,
    fraudLabel: null,
  };
}
