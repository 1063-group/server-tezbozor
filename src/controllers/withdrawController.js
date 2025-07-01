const Withdraw = require('../models/Withdraw');
const Shop = require('../models/Shop');
const Product = require('../models/Products');

exports.createWithdraw = async (req, res) => {
  try {
    const { shopId, amount } = req.body;
    const user = req.user;

    if (!shopId || !amount) {
      return res.status(400).json({ message: 'shopId and amount required' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    // Hisoblash: umumiy daromad (income)
    const products = await Product.find({ shop: shopId });
    let totalIncome = 0;

    products.forEach(p => {
      totalIncome += p.price?.income ?? 0;
    });

    // Withdraw tarixidan jami yechilgan pul
    const previousWithdraws = await Withdraw.find({ shop: shopId, status: 'approved' });
    const withdrawnTotal = previousWithdraws.reduce((sum, w) => sum + w.amount, 0);

    const availableBalance = totalIncome - withdrawnTotal;

    if (amount > availableBalance) {
      return res.status(400).json({ message: `Available balance is ${availableBalance}. Cannot withdraw ${amount}` });
    }

    const newWithdraw = await Withdraw.create({
      shop: shopId,
      amount,
      requestedBy: user._id,
    });

    res.status(201).json({ success: true, withdraw: newWithdraw });
  } catch (err) {
    console.error('❌ Withdraw error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getWithdrawsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const withdraws = await Withdraw.find({ shop: shopId }).sort({ date: -1 });

    res.json({ success: true, withdraws });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
