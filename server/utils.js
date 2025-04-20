// Helper function to handle failed attempts
export async function incrementFailedAttempt(attempt, res, message) {
    attempt.count += 1;
  
    if (attempt.count >= 3) {
      // Block the IP for 15 minutes
      attempt.blockedUntil = Date.now() + 15 * 60 * 1000;
    }
  
    await attempt.save();
    return res.status(201).json({ message });
  }


export  const totalPerItem = (product, quantity)=>{
  const {
    price,
    discount = 0,
    bulkDiscount = 0,
    bulkDiscountminQuantity = 0,
  } = product;

  // Initialize total price based on quantity and price
  let totalPrice = price * quantity;

  // Check if bulk discount is applicable
  if (bulkDiscountminQuantity > 0 && quantity >= bulkDiscountminQuantity) {
    const bulkQuantity = Math.floor(quantity / bulkDiscountminQuantity);
    const remainingQuantity = quantity % bulkDiscountminQuantity;

    // Apply bulk pricing for eligible items and standard pricing for the rest
    totalPrice = bulkQuantity * bulkDiscount + remainingQuantity * price;
  }

  // Apply percentage discount (if any)
  if (discount > 0) {
    totalPrice -= totalPrice * (discount / 100);
  }

  return totalPrice;
};

