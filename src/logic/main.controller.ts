import { LoggerInstance } from 'winston';
import { Provider } from 'nconf';
import { ExampleBot } from './bots/example-bot';
import { BotManager } from './botmanager.logic';
import { BotRestartSettings } from '../models/BotRestartSettings';

export class MainController {

    private logger: LoggerInstance;

    public startProgram(winstonLogger: LoggerInstance, conf: Provider) {
        this.logger = winstonLogger;

        let botTokens: string[] = conf.get('botTokens');
        if (botTokens.length === 0) {
            this.logger.error('No bot tokens are set for this program. Shutting down bot.');
            
            return;
        }

        // leave defaults
        let restartSettings: BotRestartSettings = new BotRestartSettings();
        
        this.logger.info(botTokens[0]);

        let exampleBot: ExampleBot = new ExampleBot('Example Bot', botTokens[0], winstonLogger, conf);
        let exampleBotManager: BotManager<ExampleBot> = new BotManager<ExampleBot>(exampleBot, restartSettings, winstonLogger);

        exampleBotManager.startBot();
    }
}
