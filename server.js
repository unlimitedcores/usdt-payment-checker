
const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// إعداد public
app.use(express.static(path.join(__dirname, 'public')));

// إعداد الصفحة verify.html
app.get('/verify', async (req, res) => {
  const txid = req.query.txid;
  const expectedAmount = 9.99;
  const toAddress = 'TT9nRLf2ZjgN956HmF77vCiqg2g3Qbg2tj'; // محفظتك

  if (!txid) {
    return res.json({ success: false, message: 'Transaction ID is required.' });
  }

  try {
    const response = await axios.get(`https://api.trongrid.io/v1/transactions/${txid}`);

    const tx = response.data.data[0];

    if (!tx) {
      return res.json({ success: false, message: 'Transaction not found.' });
    }

    // تحقق من المبلغ والعنوان
    const amountInUSDT = tx.raw_data.contract[0].parameter.value.amount / 1e6;
    const receiver = tx.raw_data.contract[0].parameter.value.to_address;
    const hexToBase58 = require('tron-convert').Hex.toBase58;

    const decodedReceiver = hexToBase58(receiver);

    if (decodedReceiver !== toAddress) {
      return res.json({ success: false, message: 'Transaction not sent to correct address.' });
    }

    if (amountInUSDT < expectedAmount) {
      return res.json({ success: false, message: 'Amount is less than 9.99 USDT.' });
    }

    return res.json({ success: true, download: 'https://yourdomain.com/download/Old_Money_Style_Guide.pdf' });
  } catch (err) {
    console.error(err.message);
    return res.json({ success: false, message: 'Error verifying transaction.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
