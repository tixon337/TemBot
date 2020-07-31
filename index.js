// Подключаем библиотеку для работы с Telegram API в переменную
import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import ytdl from "ytdl-core";
import dotenv from "dotenv";
dotenv.config();

// Устанавливаем токен, который выдавал нам бот
let token = process.env.TOKEN;
// Включить опрос сервера. Бот должен обращаться к серверу Telegram, чтобы получать актуальную информацию
// Подробнее: https://core.telegram.org/bots/api#getupdates
let bot = new TelegramBot(token, { polling: true });

bot.on("new_chat_members", function (msg, match) {
  let fromId = msg.from.id;
  console.log(msg.from);
  bot.sendMessage(fromId, `Привет ${msg.from.username}`);
  bot.sendMessage(
    fromId,
    "Смотри, братиш\nПишешь /скачай <тут ссылка на твой видос> и радуешься жизни, но я не могу отправлять тебе видео больше 50мб(("
  );
});
// Написать мне ... (/echo Hello World! - пришлет сообщение с этим приветствием, то есть "Hello World!")
bot.onText(/\/скачай (.+)/, async function (msg, match) {
  let fromId = msg.from.id; // Получаем ID отправителя
  console.log(msg.from);
  let resp = match[1]; // Получаем текст после /echo
  let video = ytdl(resp, {
    filter: (format) => format.container === "mp4",
  });
  let videoInfo = await ytdl.getInfo(resp, {
    filter: (format) => format.container === "mp4",
  });
  // console.log(video);

  if (msg.from.username == "y_rostova") {
    await bot.sendMessage(fromId, "Привет любимая Ясечка");
    bot.sendMessage(fromId, "Скачиваю файл, погоди чуть-чуть...");
  } else {
    await bot.sendMessage(fromId, `Привет ${msg.from.username}`);
    bot.sendMessage(fromId, "Скачиваю файл, погоди чуть-чуть...");
  }
  console.log("Download started");
  console.log("filename: " + videoInfo.videoDetails.title + ".mp4");
  // bot.sendMessage(fromId, "filename: " + videoInfo.videoDetails.title + ".mp4");
  let pipe = video.pipe(
    fs.createWriteStream(`./${videoInfo.videoDetails.title}.mp4`)
  );
  // console.log(pipe);
  let check = setInterval(async () => {
    if (pipe._writableState.finished == true) {
      if (pipe.bytesWritten < 52428800) {
        bot.sendMessage(fromId, "Опа, я смог, кидаю видос");
        bot.sendVideo(fromId, `./${videoInfo.videoDetails.title}.mp4`);
        deleteVideo(videoInfo.videoDetails.title);
        clearInterval(check);
      } else {
        bot.sendMessage(
          fromId,
          "Прости, файл получился больше 50 Мб, мы не можем его отправить("
        );
        deleteVideo(videoInfo.videoDetails.title);
        clearInterval(check);
      }
    }
  }, 100);
});

function deleteVideo(name) {
  setTimeout(() => {
    fs.unlink(`./${name}.mp4`, (err) => {
      if (err) throw err;
      console.log(`./${name}.mp4 was deleted`);
    });
  }, 1000 * 60 * 2);
}

bot.onText(/\/help/, async function (msg, match) {
  let fromId = msg.from.id;
  console.log(msg.from);
  bot.sendMessage(
    fromId,
    "Смотри, братиш\nПишешь /скачай <тут ссылка на твой видос> и радуешься жизни, но я не могу отправлять тебе видео больше 50мб(("
  );
});

// bot.on("message", function (msg) {
//   let fromId = msg.from.id;
// });
// bot.on("polling_error", (err) => console.log(err));
// // Простая команда без параметров
// bot.on('message', function (msg) {
//     var chatId = msg.chat.id; // Берем ID чата (не отправителя)
//     // Фотография может быть: путь к файлу, поток (stream) или параметр file_id
//     var photo = 'cats.png'; // в папке с ботом должен быть файл "cats.png"
//     bot.sendPhoto(chatId, photo, { caption: 'Милые котята' });
