const Message = require('../models/Message');

module.exports = async function messages(ctx, next) {
  if (!ctx.user) return next();
  const msgs = await Message.find({}, null, {
    $sort: {date: 'desc'},
    $limit: 20,
  }).populate('user', 'displayName');

  const messages = [];

  msgs.forEach((msg) => {
    messages.push({
      id: msg._id,
      date: msg.date,
      text: msg.text,
      user: msg.user.displayName,
    });
  });
  if (messages) {
    ctx.body = {messages};
  }
  return [];
};
