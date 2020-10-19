// Подключаем библиотеку для работы с Telegram API в переменную
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import ytdl from 'ytdl-core';
import dotenv from 'dotenv';

dotenv.config();

// Устанавливаем токен, который выдавал нам бот
const token = process.env.TOKEN;

const bot = new TelegramBot(token, { polling: true });

function deleteVideo(name) {
  setTimeout(() => {
    fs.unlink(`./${name}.mp4`, (err) => {
      if (err) throw err;
    });
  }, 1000 * 60 * 2);
}

bot.on('new_chat_members', (msg, match) => {
  const fromId = msg.from.id;
  bot.sendMessage(fromId, `Привет ${msg.from.username}`);
  bot.sendMessage(
    fromId,
    'Смотри, братиш\nПишешь /скачай <тут ссылка на твой видос> и радуешься жизни, но я не могу отправлять тебе видео больше 50мб((',
  );
});

async function videoDown(resp, fromId) {
  const video = ytdl(resp, {
    filter: (format) => format.container === 'mp4',
  });

  const videoInfo = await ytdl.getInfo(resp, {
    filter: (format) => format.container === 'mp4',
  });

  const pipe = video.pipe(
    fs.createWriteStream(`./${videoInfo.videoDetails.title}.mp4`),
  );

  const check = setInterval(async () => {
    if (pipe._writableState.finished === true) {
      if (pipe.bytesWritten < 52428800) {
        bot.sendMessage(fromId, 'Опа, я смог, кидаю видос');
        bot.sendVideo(fromId, `./${videoInfo.videoDetails.title}.mp4`);
        deleteVideo(videoInfo.videoDetails.title);
        clearInterval(check);
      } else {
        bot.sendMessage(
          fromId,
          'Прости, файл получился больше 50 Мб, мы не можем его отправить(\n Но вот тебе ссылка, которую ты можешь открыть через safari и скачать его',
        );
        bot.sendMessage(fromId, videoInfo.formats[0].url);
        deleteVideo(videoInfo.videoDetails.title);
        clearInterval(check);
      }
    }
  }, 100);
}

bot.onText(/\/скачай (.+)/, async (msg, match) => {
  const fromId = msg.from.id; // Получаем ID отправителя
  const resp = match[1]; // Получаем текст после /echo
  videoDown(resp, fromId);
  await bot.sendMessage(fromId, `Привет ${msg.from.username}`);
  bot.sendMessage(fromId, 'Скачиваю файл, погоди чуть-чуть...');
});

bot.onText(/\/help/, async (msg, match) => {
  const fromId = msg.from.id;
  bot.sendMessage(
    fromId,
    'Смотри, братиш\nПишешь /скачай <тут ссылка на твой видос> и радуешься жизни, но я не могу отправлять тебе видео больше 50мб((',
  );
});

bot.onText(/\/avtor/, async (msg, match) => {
  const fromId = msg.from.id;
  bot.sendPhoto(fromId, './vk.jpg');
  bot.sendPhoto(fromId, './inst.jpg');
  bot.sendMessage(fromId, 'vk.com/tixon337\n@tixon337');
});
