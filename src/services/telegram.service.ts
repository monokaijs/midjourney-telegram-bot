import TelegramBot from "node-telegram-bot-api";

class TelegramService {
  bot: TelegramBot;
  constructor() {
  }
  register(polling = false) {
    const telegramToken = process.env.TELEGRAM_KEY as string;
    this.bot = new TelegramBot(telegramToken, {polling});
    return this.bot;
  }
}

const telegramService = new TelegramService();

export default telegramService;
