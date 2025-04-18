const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ثابت: عنوان محفظتك
const RECEIVER_ADDRESS = "TT9nRLf2ZjgN956HmF77vCiqg2g3Qbg2tj";

// صفحة الدفع (checkout)
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "oldmoney-checkout.html"));
});

// صفحة التحقق
app.get("/verify", async (req, res) => {
  const txid = req.query.txid;

  try {
    const response = await axios.get(`https://apilist.tronscanapi.com/api/transaction-info?hash=${txid}`);
    const data = response.data;

    if (
      data &&
      data.toAddress === RECEIVER_ADDRESS &&
      data.contractType === 31 &&
      data.confirmed === true &&
      data.tokenInfo.tokenAbbr === "USDT" &&
      Number(data.contractData.amount_str) >= 9990000 // 9.99 USDT (مضروب × 1,000,000)
    ) {
      // المعاملة ناجحة
      res.send(`
        <h2>✅ تم التحقق من الدفع بنجاح!</h2>
        <a href="/Old-Money-Guide.pdf" download>تحميل المنتج الآن</a>
      `);
    } else {
      res.send("<h3>❌ لم يتم العثور على معاملة صحيحة بهذه المعلومات.</h3>");
    }
  } catch (error) {
    res.send("<h3>🚫 حدث خطأ أثناء التحقق. تأكد من صحة TXID.</h3>");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
