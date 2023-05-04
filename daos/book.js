const mongoose = require('mongoose');

const Book = require('../models/book');
const author = require('../models/author')

module.exports = {};

module.exports.getSearch = async (searchTerm) => {
  return await Book.find({ 
    $text: { $search: searchTerm }}).lean()
}

module.exports.getAuthorStats = (authorInfo) => {
  if(authorInfo){
    return Book.aggregate([
      {
        $group: {
          _id: '$authorId', // authorId: savedAuthors[1]._id,
          averagePageCount: { $avg: '$pageCount' }, // averagePageCount: 211 + 1/3,
          numBooks: { $count: {} }, // numBooks: 3,
          titles: { $push: '$title' }, // titles: [testBooks[2].title, testBooks[3].title, testBooks[4].title]
        }},
        { $project: { authorId: '$_id', _id: 0, averagePageCount: 1, numBooks: 1, titles: 1 } },
        { $lookup: {
          from: 'authors',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author'
        }},
        { $unwind: "$author"},
    ])
  }
  return Book.aggregate([
    {
      $group: {
        _id: '$authorId', // authorId: savedAuthors[1]._id,
        averagePageCount: { $avg: '$pageCount' }, // averagePageCount: 211 + 1/3,
        numBooks: { $count: {} }, // numBooks: 3,
        titles: { $push: '$title' }, // titles: [testBooks[2].title, testBooks[3].title, testBooks[4].title]
      }},
      { $project: { _id: 0, authorId: '$_id', averagePageCount: 1, numBooks: 1, titles: 1 } },
  ])
}

module.exports.getAll = async (page, perPage, authorId) => {
  if (authorId){
    return await Book.find({ authorId: authorId }).lean()
  }
  return Book.find().limit(perPage).skip(perPage*page).lean();
}

module.exports.getById = (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return null;
  }
  return Book.findOne({ _id: bookId }).lean();
}

module.exports.deleteById = async (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.deleteOne({ _id: bookId });
  return true;
}

module.exports.updateById = async (bookId, newObj) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.updateOne({ _id: bookId }, newObj);
  return true;
}

module.exports.create = async (bookData) => {
  try {
    const created = await Book.create(bookData);
    return created;
  } catch (e) {
    if (e.message.includes('validation failed')) {
      throw new BadDataError(e.message);
    }
    throw e;
  }
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;