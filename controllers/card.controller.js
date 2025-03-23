const CardService = require("../services/cardService");

const getAllCards = async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;

    // ✅ Validate page & limit
    if (isNaN(page) || page < 1) {
      return next({ status: 400, message: "Page must be a positive number" });
    }
    if (isNaN(limit) || limit < 1) {
      return next({ status: 400, message: "Limit must be a positive number" });
    }

    const cards = await CardService.getListCards(page, limit);
    if (!cards) {
      return next({ status: 404, message: "Cards not found" });
    }
    return res.status(200).json({
      code: 200,
      message: "Cards fetched successfully",
      data: cards.data,
      paging: cards.paging
    })
  } catch (error) {
    console.error("❌ Error getting cards list:", error);
    next({ status: 500, message: "Internal server error" });
  }
};

const addCard = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return next({ status: 400, message: "Missing name" });
    }
    const newCard = await CardService.addCard({
      name,
      image: `/card/${name?.toLowerCase().replace(" ", "-")}.png`
    });
    if (!newCard) {
      return next({ status: 404, message: "Cards not found" });
    }
    return res.status(200).json({
      code: 200,
      message: "Cards fetched successfully",
      data: newCard
    })
  } catch (error) {
    console.error("❌ Error getting cards list:", error);
    next({ status: 500, message: "Internal server error" });
  }
};

const getAllCardsRandom = async (req, res, next) => {
  try {
    const cards = await CardService.getAllCardsRandom();

    if (!cards) {
      return next({ status: 404, message: "No cards found" });
    }

    return res.status(200).json({
      code: 200,
      message: "All cards fetched randomly",
      data: cards.data,
    });
  } catch (error) {
    console.error("❌ Error getting all cards randomly:", error);
    next({ status: 500, message: "Internal server error" });
  }
};

module.exports = {
  getAllCards,
  addCard,
  getAllCardsRandom
};