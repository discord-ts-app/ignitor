import { Message } from 'discord.js'
import Bot from '@discord-ts-app/core'

class Guard {
	public async protect(bot: Bot, message: Message) {}
}

export default new Guard()
