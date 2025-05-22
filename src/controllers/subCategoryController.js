const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');

// Yaratish va Categoryga biriktirish
exports.createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res
        .status(400)
        .json({ message: 'Name and categoryId are required' });
    }

    const subCategory = await SubCategory.create({
      name,
      category: categoryId,
    });

    await Category.findByIdAndUpdate(categoryId, {
      $push: { subcategories: subCategory._id },
    });

    res.status(201).json(subCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Barcha subcategorylar
exports.getSubCategories = async (req, res) => {
  try {
    const subcategories = await SubCategory.find().populate(
      'category',
      'title'
    );
    res.status(200).json(subcategories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SubCategory o‘chirish
exports.deleteSubCategory = async (req, res) => {
  try {
    const sub = await SubCategory.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'SubCategory not found' });

    await Category.findByIdAndUpdate(sub.category, {
      $pull: { subcategories: sub._id },
    });

    await sub.deleteOne();

    res.json({ message: 'SubCategory deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
