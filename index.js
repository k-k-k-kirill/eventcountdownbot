const { Telegraf } = require("telegraf");
const dotenv = require("dotenv");
const moment = require("moment");
const cron = require("node-cron");

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const commandPrefix = "slave_";
const targetDate = moment("2023-08-01", "YYYY-MM-DD");

let chatId;
let timer;

const getDaysLeft = () => {
  const currentDate = moment();

  return targetDate.diff(currentDate, "days");
};

const sendStandardMessage = (ctx) => {
  const daysLeft = getDaysLeft();
  let message = `До отпуска осталось ${daysLeft} дней. Держитесь!`;

  if (daysLeft <= 0) {
    message = `Отпуск блеать!`;
  }

  bot.telegram.sendMessage(ctx.chat.id, message);
};

const sendAngryReplyMessage = (ctx) => {
  const daysLeft = getDaysLeft();
  let message = `Да заебали блядь! До отпуска осталось ${daysLeft} дней. Хуле не ясно?!`;

  if (daysLeft <= 0) {
    message = `Отпуск блеать! Иди купайся!`;
  }

  ctx.reply(message);
};

const sendStandardMessageToChat = async (chatId) => {
  const daysLeft = getDaysLeft();
  let message = `До отпуска осталось ${daysLeft} дней. Держитесь!`;

  if (daysLeft <= 0) {
    message = `Отпуск блеать!`;
  }

  bot.telegram.sendMessage(chatId, message);
};

bot.command(`${commandPrefix}start`, (ctx) => {
  chatId = ctx.chat.id;
  sendStandardMessage(ctx);

  if (timer) {
    timer.stop();
  }

  timer = cron.schedule("0 13 * * *", () => sendStandardMessageToChat(chatId));
});

bot.on("text", (ctx) => {
  const message = ctx.message;

  if (message.reply_to_message && message.reply_to_message.from.is_bot) {
    sendAngryReplyMessage(ctx);
  } else if (message.text.includes(`@${ctx.botInfo.username}`)) {
    sendAngryReplyMessage(ctx);
  }
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
