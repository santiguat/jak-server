module.exports = (io) => {
  const chat = io.of('/private');

  chat.on('connection', socket => {
    console.log('hello');
  });
};
