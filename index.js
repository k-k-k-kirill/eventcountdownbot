const { Telegraf } = require("telegraf");
const dotenv = require("dotenv");
const moment = require("moment");

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const commandPrefix = "slave_";

const interval = 24 * 60 * 60 * 1000;
const targetTime = "11:00:00";

const getDaysLeft = () => {
  const currentDate = moment();
  const targetDate = moment("2023-08-01", "YYYY-MM-DD");

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

bot.command(`${commandPrefix}start`, (ctx) => {
  sendStandardMessage(ctx);
  isBotStarted = true;

  setInterval(() => {
    const now = moment();
    const targetDate = moment(targetTime, "HH:mm:ss");
    if (now.isAfter(targetDate)) {
      targetDate.add(1, "day");
    }
    const delay = targetDate.diff(now);
    setTimeout(() => sendStandardMessage(ctx), delay);
  }, interval);
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
