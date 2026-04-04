// ── ARBOR Razorpay Helper ──
// Uses test mode: rzp_test_SZMKxhD3GugEU6

const RAZORPAY_KEY_ID = 'rzp_test_SZMKxhD3GugEU6';

/**
 * Load Razorpay checkout script dynamically
 */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay payment modal
 * @param {{ amount: number, name: string, desc: string, prefill?: object, onSuccess: fn, onFailure: fn }} opts
 */
export async function openRazorpay({ amount, name, desc, prefill = {}, onSuccess, onFailure }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onFailure?.('Failed to load Razorpay SDK');
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amount * 100, // Razorpay uses paise
    currency: 'INR',
    name: 'ARBOR',
    description: desc,
    image: 'https://i.imgur.com/n5tjHFD.png',
    prefill: {
      name: prefill.name || 'Worker',
      email: prefill.email || 'worker@arbor.com',
      contact: prefill.phone || '9999999999',
    },
    theme: { color: '#FF5200' },
    handler: function (response) {
      onSuccess?.({
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
      });
    },
    modal: {
      ondismiss: () => onFailure?.('Payment cancelled'),
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
