const Card = require("../models/card/card.model");

class CardService {
  static async addCard(data) {
    try {
      const newCard = new Card(data);
      await newCard.save();
      return newCard;
    } catch (error) {
      return null
    }
  }

  static async getListCards(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const cards = await Card.find()
        .select("name image")
        .skip(skip)
        .limit(limit);
  
      const totalCards = await Card.countDocuments();
      const totalPages = Math.ceil(totalCards / limit);
  
      return {
        data: cards,
        paging: {
          total: totalCards,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      return null
    }
  }

  static async getAllCardsRandom() {
    try {
      const cards = await Card.aggregate([{ $sample: { size: await Card.countDocuments() } }])
        .project({ name: 1, image: 1 });
  
      return {
        data: cards
      };
    } catch (error) {
      return null;
    }
  }  
}

module.exports = CardService