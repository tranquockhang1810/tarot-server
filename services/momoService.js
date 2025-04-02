const axios = require('axios');
const crypto = require('crypto');
const momoConfig = require('../config/momo');

class MomoService {
  static async createPayment(bill, redirectUrl) {
    const orderId = `${bill._id}`;
    const requestId = `REQ${Date.now()}`;

    const rawData = `accessKey=${momoConfig.accessKey}&amount=${bill.totalPrice}&extraData=&ipnUrl=${momoConfig.notifyUrl}&orderId=${orderId}&orderInfo=Payment for Tarot App package&partnerCode=${momoConfig.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;

    const signature = crypto.createHmac('sha256', momoConfig.secretKey).update(rawData).digest('hex');

    console.log("Generated Signature:", signature);

    const payload = {
      partnerCode: momoConfig.partnerCode,
      accessKey: momoConfig.accessKey,
      requestId,
      amount: bill.totalPrice,
      orderId,
      orderInfo: "Payment for Tarot App package",
      redirectUrl,
      ipnUrl: momoConfig.notifyUrl,
      extraData: "",
      requestType: "captureWallet",
      signature,
      lang: "vi",
    };

    try {
      const response = await axios.post(momoConfig.endpoint, payload);
      return response.data;
    } catch (error) {
      console.error("MoMo API error:", error.response?.data || error.message);
      throw new Error("MoMo API error: " + (error.response?.data?.message || error.message));
    }
  }
}

module.exports = MomoService;
